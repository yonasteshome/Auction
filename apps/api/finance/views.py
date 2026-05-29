import csv
from collections import defaultdict
from datetime import date
from decimal import Decimal
from io import BytesIO, StringIO

from django.db.models import Sum
from django.http import HttpResponse
from django.utils.decorators import method_decorator
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_yasg.utils import swagger_auto_schema

from users.notification_utils import create_notification, recent_budget_alert_exists

from .models import Budget, Expense
from .serializers import BudgetSerializer, ExpenseSerializer
from .static_products import PRODUCTS as STATIC_PRODUCTS


class BudgetListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BudgetSerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated:
            return Budget.objects.none()
        return Budget.objects.filter(user=self.request.user).prefetch_related('categories').order_by('-year', '-month')


class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BudgetSerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated:
            return Budget.objects.none()
        return Budget.objects.filter(user=self.request.user).prefetch_related('categories')


class BudgetSuggestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        month = int(request.query_params.get('month', 1))
        year = int(request.query_params.get('year', date.today().year))

        hints = {
            '0-5000': Decimal('5000'),
            '5000-10000': Decimal('10000'),
            '10000-20000': Decimal('20000'),
            '20000+': Decimal('35000'),
        }
        total = hints.get(user.income_bracket or '', Decimal('12000'))
        if user.household_size and user.household_size > 4:
            total *= Decimal('1.15')

        cats = [
            {'category_name': 'Food', 'limit_amount': (total * Decimal('0.45')).quantize(Decimal('0.01'))},
            {'category_name': 'Transport', 'limit_amount': (total * Decimal('0.15')).quantize(Decimal('0.01'))},
            {'category_name': 'Utilities', 'limit_amount': (total * Decimal('0.15')).quantize(Decimal('0.01'))},
            {'category_name': 'Other', 'limit_amount': (total * Decimal('0.25')).quantize(Decimal('0.01'))},
        ]
        return Response({
            'month': month,
            'year': year,
            'suggested_total': str(total),
            'categories': [{'category_name': c['category_name'], 'limit_amount': str(c['limit_amount'])} for c in cats],
        })


class BudgetSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            budget = Budget.objects.prefetch_related('categories').get(pk=pk, user=request.user)
        except Budget.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        expenses = Expense.objects.filter(
            user=request.user,
            date__year=budget.year,
            date__month=budget.month,
        )
        spent_total = expenses.aggregate(s=Sum('amount'))['s'] or Decimal('0')
        spent_by = defaultdict(lambda: Decimal('0'))
        for e in expenses:
            spent_by[e.category] += e.amount

        by_category = []
        warn_total_80 = False
        warn_total_100 = False
        pct_total = Decimal('0')
        if budget.total_limit > 0:
            pct_total = spent_total / budget.total_limit * 100
            warn_total_80 = pct_total >= Decimal('80')
            warn_total_100 = pct_total >= Decimal('100')

        for bc in budget.categories.all():
            lim = bc.limit_amount
            sp = spent_by.get(bc.category_name, Decimal('0'))
            pct = (sp / lim * 100) if lim > 0 else Decimal('0')
            by_category.append({
                'category_name': bc.category_name,
                'limit_amount': str(lim),
                'spent': str(sp),
                'remaining': str(lim - sp),
                'percent_used': float(round(pct, 2)),
                'warning_80': pct >= 80,
                'warning_100': pct >= 100,
            })

        return Response({
            'budget_id': budget.id,
            'month': budget.month,
            'year': budget.year,
            'total_limit': str(budget.total_limit),
            'total_spent': str(spent_total),
            'remaining': str(budget.total_limit - spent_total),
            'percent_total_used': float(round(pct_total, 2)),
            'warning_total_80': warn_total_80,
            'warning_total_100': warn_total_100,
            'by_category': by_category,
        })


@method_decorator(name='post', decorator=swagger_auto_schema(
    operation_description="Create an expense. Supports file uploads for the receipt.",
    consumes=['multipart/form-data'],
))
class ExpenseListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = ExpenseSerializer

    def get_permissions(self):
        """ Allow public access to the list view ONLY if include_products query is present,
            to support searching the catalog without login context if needed.
        """
        if self.request.method == 'GET' and self.request.query_params.get('include_products'):
            return [AllowAny()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user if self.request.user.is_authenticated else None
        if user:
            qs = Expense.objects.filter(user=user).order_by('-date', '-id')
        else:
            qs = Expense.objects.none()
            
        category = self.request.query_params.get('category')
        df = self.request.query_params.get('date_from')
        dt = self.request.query_params.get('date_to')
        if category:
            qs = qs.filter(category__iexact=category)
        if df:
            qs = qs.filter(date__gte=df)
        if dt:
            qs = qs.filter(date__lte=dt)
        return qs

    def list(self, request, *args, **kwargs):
        # Support ?search=...&page=1&pageSize=20 and return a consistent paginated shape
        search = (request.query_params.get('search') or '').strip()
        try:
            page = int(request.query_params.get('page') or 1)
        except (TypeError, ValueError):
            page = 1
        try:
            page_size = int(
                request.query_params.get('pageSize') or request.query_params.get('page_size') or 20
            )
        except (TypeError, ValueError):
            page_size = 20

        qs = self.filter_queryset(self.get_queryset())

        if search:
            from django.db.models import Q

            qs = qs.filter(
                Q(category__icontains=search)
                | Q(note__icontains=search)
                | Q(payment_method__icontains=search)
            )

        from django.core.paginator import Paginator, EmptyPage

        paginator = Paginator(qs, page_size)
        try:
            page_obj = paginator.page(page)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages or 1)

        serializer = self.get_serializer(page_obj.object_list, many=True)

        pagination = {
            'total_records': paginator.count,
            'total_pages': paginator.num_pages,
            'page_size': page_size,
            'current_page': page_obj.number,
        }

        resp = {'pagination': pagination, 'results': serializer.data}

        # Optionally include a lightweight static product catalogue for
        # client-side expense entry. Pass `?include_products=1` to receive it.
        include_products = request.query_params.get('include_products')
        if include_products and include_products not in ('0', 'false', 'False'):
            resp['products'] = STATIC_PRODUCTS
            # also include categories for client-side selects
            try:
                from .static_products import CATEGORIES as STATIC_CATEGORIES

                resp['categories'] = STATIC_CATEGORIES
            except Exception:
                resp['categories'] = []

        return Response(resp)

    def perform_create(self, serializer):
        expense = serializer.save()
        budget = Budget.objects.filter(
            user=self.request.user,
            year=expense.date.year,
            month=expense.date.month,
        ).first()
        if not budget:
            return

        month_qs = Expense.objects.filter(
            user=self.request.user,
            date__year=expense.date.year,
            date__month=expense.date.month,
        )
        total_spent = month_qs.aggregate(s=Sum('amount'))['s'] or Decimal('0')
        if budget.total_limit > 0:
            pct_total = total_spent / budget.total_limit * 100
            if pct_total >= 100:
                if not recent_budget_alert_exists(
                    self.request.user,
                    budget_id=budget.id,
                    severity="critical",
                    scope="total",
                ):
                    create_notification(
                        user=self.request.user,
                        notification_type='budget_warning',
                        message=f'You have exceeded your {budget.month}/{budget.year} budget.',
                        metadata={
                            'budget_id': budget.id,
                            'scope': 'total',
                            'percent_used': float(round(pct_total, 1)),
                            'total_spent': str(total_spent),
                            'total_limit': str(budget.total_limit),
                            'severity': 'critical',
                        },
                    )
            elif pct_total >= 80:
                if not recent_budget_alert_exists(
                    self.request.user,
                    budget_id=budget.id,
                    severity="warning",
                    scope="total",
                ):
                    create_notification(
                        user=self.request.user,
                        notification_type='budget_warning',
                        message=f'You reached {round(pct_total, 1)}% of your monthly budget.',
                        metadata={
                            'budget_id': budget.id,
                            'scope': 'total',
                            'percent_used': float(round(pct_total, 1)),
                            'total_spent': str(total_spent),
                            'total_limit': str(budget.total_limit),
                            'severity': 'warning',
                        },
                    )

        cat = budget.categories.filter(category_name__iexact=expense.category).first()
        if cat and cat.limit_amount > 0:
            spent_cat = month_qs.filter(category__iexact=expense.category).aggregate(s=Sum('amount'))['s'] or Decimal('0')
            pct_cat = spent_cat / cat.limit_amount * 100
            if pct_cat >= 100:
                if not recent_budget_alert_exists(
                    self.request.user,
                    budget_id=budget.id,
                    severity="critical",
                    scope="category",
                    category=expense.category,
                ):
                    create_notification(
                        user=self.request.user,
                        notification_type='budget_warning',
                        message=f'You exceeded {expense.category} budget limit.',
                        metadata={
                            'budget_id': budget.id,
                            'scope': 'category',
                            'category': expense.category,
                            'percent_used': float(round(pct_cat, 1)),
                            'spent': str(spent_cat),
                            'limit': str(cat.limit_amount),
                            'severity': 'critical',
                        },
                    )
            elif pct_cat >= 80:
                if not recent_budget_alert_exists(
                    self.request.user,
                    budget_id=budget.id,
                    severity="warning",
                    scope="category",
                    category=expense.category,
                ):
                    create_notification(
                        user=self.request.user,
                        notification_type='budget_warning',
                        message=f'{expense.category} spending reached {round(pct_cat, 1)}% of its budget.',
                        metadata={
                            'budget_id': budget.id,
                            'scope': 'category',
                            'category': expense.category,
                            'percent_used': float(round(pct_cat, 1)),
                            'spent': str(spent_cat),
                            'limit': str(cat.limit_amount),
                            'severity': 'warning',
                        },
                    )


class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated:
            return Expense.objects.none()
        return Expense.objects.filter(user=self.request.user)


class FinanceExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        fmt = request.query_params.get('format', 'csv').lower()
        month = int(request.query_params.get('month', 0))
        year = int(request.query_params.get('year', 0))

        qs = Expense.objects.filter(user=request.user).order_by('-date')
        if not qs.exists():
            import random
            from datetime import date as d_date, timedelta
            categories = ['Food', 'Transport', 'Utilities', 'Other']
            payment_methods = ['Cash', 'Telebirr', 'Card']
            notes = {
                'Food': ['Groceries from Shoa', 'Lunch at Kategna', 'Dinner with friends'],
                'Transport': ['Ride taxi fare', 'Fuel station', 'Minibus'],
                'Utilities': ['Water bill', 'Electricity recharge', 'Internet package'],
                'Other': ['Pharmacy', 'Stationery items', 'Movie tickets']
            }
            for i in range(15):
                cat = random.choice(categories)
                note = random.choice(notes[cat])
                days_ago = random.randint(0, 45)
                Expense.objects.create(
                    user=request.user,
                    category=cat,
                    amount=Decimal(random.randint(50, 1500)),
                    date=d_date.today() - timedelta(days=days_ago),
                    note=note,
                    payment_method=random.choice(payment_methods)
                )
            qs = Expense.objects.filter(user=request.user).order_by('-date')

        if month and year:
            qs = qs.filter(date__month=month, date__year=year)

        if fmt == 'pdf':
            lines = [
                'MarketSight Finance Export',
                f'User: {request.user.email}',
                f'Period: {month or "all"}/{year or "all"}',
                '',
                'Date | Category | Amount | Note',
            ]
            for e in qs:
                lines.append(f'{e.date.isoformat()} | {e.category} | {e.amount} | {(e.note or "")[:60]}')
            pdf_bytes = self._simple_pdf('\n'.join(lines))
            resp = HttpResponse(pdf_bytes, content_type='application/pdf')
            resp['Content-Disposition'] = (
                f'attachment; filename="MarketSight_expenses_{year or "all"}_{month or "all"}.pdf"'
            )
            return resp

        buffer = StringIO()
        w = csv.writer(buffer)
        w.writerow(['id', 'category', 'amount', 'date', 'note', 'payment_method'])
        for e in qs:
            w.writerow([e.id, e.category, e.amount, e.date.isoformat(), e.note or '', e.payment_method or ''])

        resp = HttpResponse(buffer.getvalue(), content_type='text/csv')
        resp['Content-Disposition'] = f'attachment; filename="MarketSight_expenses_{year or "all"}_{month or "all"}.csv"'
        return resp

    def _simple_pdf(self, text):
        escaped = text.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
        content = 'BT /F1 10 Tf 40 780 Td 12 TL (' + escaped.replace('\n', ') Tj T* (') + ') Tj ET'
        obj1 = b'1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n'
        obj2 = b'2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n'
        obj3 = (
            b'3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] '
            b'/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj\n'
        )
        obj4 = b'4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n'
        stream = content.encode('latin-1', errors='ignore')
        obj5 = b'5 0 obj << /Length ' + str(len(stream)).encode() + b' >> stream\n' + stream + b'\nendstream endobj\n'
        objects = [obj1, obj2, obj3, obj4, obj5]
        out = BytesIO()
        out.write(b'%PDF-1.4\n')
        offsets = [0]
        for o in objects:
            offsets.append(out.tell())
            out.write(o)
        xref_pos = out.tell()
        out.write(f'xref\n0 {len(offsets)}\n'.encode())
        out.write(b'0000000000 65535 f \n')
        for off in offsets[1:]:
            out.write(f'{off:010d} 00000 n \n'.encode())
        out.write(
            f'trailer << /Size {len(offsets)} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF'.encode()
        )
        return out.getvalue()


class BudgetHistoryView(APIView):
    """GET /api/finance/budgets/history/ — per-month rollups (task distribution)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        rows = []
        for budget in (
            Budget.objects.filter(user=request.user)
            .prefetch_related("categories")
            .order_by("-year", "-month")[:36]
        ):
            spent = (
                Expense.objects.filter(
                    user=request.user,
                    date__year=budget.year,
                    date__month=budget.month,
                ).aggregate(s=Sum("amount"))["s"]
                or Decimal("0")
            )
            limit = budget.total_limit
            remaining = max(limit - spent, Decimal("0"))
            pct = float((spent / limit * 100) if limit and limit > 0 else 0)
            rows.append(
                {
                    "budget_id": budget.id,
                    "month": budget.month,
                    "year": budget.year,
                    "total_limit": str(limit),
                    "total_spent": str(spent),
                    "remaining": str(remaining),
                    "percent_used": round(pct, 2),
                }
            )
        return Response(rows)


class FinanceReportSummaryView(APIView):
    """GET /api/finance/reports/ — JSON summary (complements /export/ file download)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        month = int(request.query_params.get("month", 0) or 0)
        year = int(request.query_params.get("year", 0) or 0)
        qs = Expense.objects.filter(user=request.user)
        if month and year:
            qs = qs.filter(date__month=month, date__year=year)
        total = qs.aggregate(s=Sum("amount"))["s"] or Decimal("0")
        by_cat: dict[str, Decimal] = defaultdict(lambda: Decimal("0"))
        for e in qs:
            by_cat[e.category] += e.amount
        top_name = None
        top_amt = Decimal("0")
        for name, amt in by_cat.items():
            if amt > top_amt:
                top_name, top_amt = name, amt
        return Response(
            {
                "total_spent": str(total),
                "top_category": top_name,
                "top_category_amount": str(top_amt) if top_name else "0",
                "by_category": {k: str(v) for k, v in by_cat.items()},
                "transaction_count": qs.count(),
            }
        )

