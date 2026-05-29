import logging
from calendar import monthrange
from datetime import date
from decimal import Decimal

from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.db import transaction as db_transaction
from django.utils import timezone
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import generics, status
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from core_api.permissions import IsAdminRole
from finance.models import Budget, Expense
from finance.serializers import ExpenseSerializer

from .models import AuditLog, Notification, User, Vendor, PayoutRequest, debit_vendor_wallet
from .serializers import (
    AdminUserBriefSerializer,
    AdminUserUpdateSerializer,
    CustomTokenObtainPairSerializer,
    NotificationSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserPreferencesSerializer,
    UserProfileSerializer,
    VendorWalletEntrySerializer,
    PasswordChangeSerializer,
    PayoutRequestSerializer,
    PayoutCreateSerializer,
)

logger = logging.getLogger(__name__)


class EmailTokenObtainPairView(TokenObtainPairView):
    """JWT token view that accepts 'email' (or 'username') and 'password'."""
    serializer_class = CustomTokenObtainPairSerializer

    @swagger_auto_schema(
        operation_summary='Obtain JWT access & refresh tokens',
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['email', 'password'],
            properties={
                'email': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format=openapi.FORMAT_EMAIL,
                    description='User email (mapped to username for JWT).',
                ),
                'password': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format=openapi.FORMAT_PASSWORD,
                ),
            },
        ),
        responses={200: 'Token pair (access, refresh)'},
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class RegisterView(generics.CreateAPIView):
    """POST /api/users/register/ — browsable API + schema show RegisterSerializer body."""

    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            UserProfileSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


class PasswordResetRequestView(APIView):
    """POST /api/users/password/reset/request/ — email link for Week 3 forgot-password flow."""

    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary='Request password reset email',
        request_body=PasswordResetRequestSerializer,
        responses={200: 'Generic success (avoids email enumeration)'},
    )
    def post(self, request, *args, **kwargs):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].strip().lower()
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user:
            token = PasswordResetTokenGenerator().make_token(user)
            uid = urlsafe_base64_encode(force_bytes(str(user.pk)))
            base = settings.FRONTEND_URL.rstrip('/')
            path = settings.PASSWORD_RESET_FRONTEND_PATH
            if not path.startswith('/'):
                path = '/' + path
            reset_link = f'{base}{path}?uid={uid}&token={token}'
            subject = 'Reset your MarketSight password'
            body = (
                'You asked to reset your MarketSight password.\n\n'
                f'Open this link in your browser (valid for a limited time):\n{reset_link}\n\n'
                'If you did not request this, you can ignore this email.'
            )
            try:
                send_mail(
                    subject,
                    body,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
            except Exception:
                logger.exception('Password reset email failed for %s', user.email)
                if settings.DEBUG:
                    logger.info('Password reset link (dev fallback): %s', reset_link)
        msg = (
            'If an account exists for this email, password reset instructions have been sent.'
        )
        return Response({'detail': msg}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """POST /api/users/password/reset/confirm/ — complete reset from Week 3 reset-password page."""

    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary='Confirm password reset with uid + token',
        request_body=PasswordResetConfirmSerializer,
        responses={200: 'Password updated', 400: 'Invalid or expired token'},
    )
    def post(self, request, *args, **kwargs):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        uid_b64 = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        try:
            uid = force_str(urlsafe_base64_decode(uid_b64))
            user = User.objects.get(pk=uid, is_active=True)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response(
                {'detail': 'Invalid or expired reset link.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not PasswordResetTokenGenerator().check_token(user, token):
            return Response(
                {'detail': 'Invalid or expired reset link.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.set_password(new_password)
        user.save(update_fields=['password'])
        return Response({'detail': 'Password has been reset.'}, status=status.HTTP_200_OK)


class PasswordChangeView(APIView):
    """POST /api/users/password/change/ — update password for logged-in user."""
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary='Change user password',
        request_body=PasswordChangeSerializer,
        responses={
            200: 'Password updated successfully',
            400: 'Validation error (e.g. incorrect old password)'
        }
    )
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save(update_fields=['password'])
        return Response({'detail': 'Password has been updated successfully.'}, status=status.HTTP_200_OK)


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/users/me/ — browsable API uses UserProfileSerializer."""

    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


class VendorWalletView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        vendor = Vendor.objects.filter(owner=request.user).first()
        if not vendor:
            return Response(
                {
                    'wallet': {
                        'balance': '0.00',
                        'currency': 'ETB',
                        'updated_at': None,
                    },
                    'entries': [],
                }
            )

        wallet = getattr(vendor, 'wallet', None)
        if wallet is None:
            wallet_data = {
                'balance': '0.00',
                'currency': 'ETB',
                'updated_at': None,
            }
            entries = []
        else:
            wallet_data = {
                'balance': str(wallet.balance),
                'currency': wallet.currency,
                'updated_at': wallet.updated_at,
            }
            entries = VendorWalletEntrySerializer(
                wallet.entries.order_by('-created_at', '-id')[:50],
                many=True,
            ).data

        return Response({'wallet': wallet_data, 'entries': entries})


class VendorPayoutListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        vendor = Vendor.objects.filter(owner=request.user).first()
        if not vendor:
            return Response({'payouts': []})
        qs = vendor.payouts.order_by('-requested_at')
        ser = PayoutRequestSerializer(qs, many=True)
        return Response({'payouts': ser.data})

    def post(self, request):
        vendor = Vendor.objects.filter(owner=request.user).first()
        if not vendor:
            return Response({'detail': 'Vendor not found.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = PayoutCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        amount = serializer.validated_data['amount']
        currency = serializer.validated_data.get('currency') or 'ETB'

        try:
            with db_transaction.atomic():
                payout = PayoutRequest.objects.create(
                    vendor=vendor,
                    amount=amount,
                    currency=currency,
                    status='paid',
                    processed_at=timezone.now(),
                    transaction_reference=f'payout-{vendor.id}-{timezone.now().timestamp()}',
                )
                debit_vendor_wallet(
                    vendor=vendor,
                    amount=amount,
                    transaction_reference=payout.transaction_reference,
                    source='payout',
                    note=f'Immediate vendor withdrawal {payout.id}',
                )
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        AuditLog.objects.create(
            actor=request.user,
            action='payout_processed',
            resource='payout',
            resource_id=str(payout.id),
            detail={'amount': str(amount), 'status': 'paid'},
        )
        Notification.objects.create(
            user=request.user,
            type='payout_paid',
            message=f'Your withdrawal of {amount} {currency} was processed successfully.',
        )
        return Response(PayoutRequestSerializer(payout).data, status=status.HTTP_201_CREATED)


class AdminPayoutListView(generics.ListAPIView):
    permission_classes = [IsAdminRole]
    serializer_class = PayoutRequestSerializer

    def get_queryset(self):
        qs = PayoutRequest.objects.all().order_by('-requested_at')
        status_q = self.request.query_params.get('status')
        if status_q:
            qs = qs.filter(status=status_q)
        return qs


class AdminPayoutActionView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        action = (request.data.get('action') or '').lower()
        note = request.data.get('note', '')
        pr = get_object_or_404(PayoutRequest, pk=pk)

        if action == 'approve':
            pr.status = 'approved'
            pr.admin_note = note or pr.admin_note
            pr.processed_at = timezone.now()
            pr.save(update_fields=['status', 'admin_note', 'processed_at'])
            AuditLog.objects.create(actor=request.user, action='payout_approved', resource='payout', resource_id=str(pr.id), detail={'note': note})
            return Response(PayoutRequestSerializer(pr).data)

        if action == 'reject':
            pr.status = 'rejected'
            pr.admin_note = note or pr.admin_note
            pr.processed_at = timezone.now()
            pr.save(update_fields=['status', 'admin_note', 'processed_at'])
            AuditLog.objects.create(actor=request.user, action='payout_rejected', resource='payout', resource_id=str(pr.id), detail={'note': note})
            return Response(PayoutRequestSerializer(pr).data)

        if action == 'mark_paid':
            # perform wallet debit and mark paid
            try:
                tx_ref = f'payout-{pr.id}'
                debit_vendor_wallet(vendor=pr.vendor, amount=pr.amount, transaction_reference=tx_ref, source='payout', note=f'Payout {pr.id}')
            except ValueError as e:
                return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            pr.status = 'paid'
            pr.transaction_reference = tx_ref
            pr.processed_at = timezone.now()
            pr.save(update_fields=['status', 'transaction_reference', 'processed_at'])
            AuditLog.objects.create(actor=request.user, action='payout_marked_paid', resource='payout', resource_id=str(pr.id), detail={'note': note})
            return Response(PayoutRequestSerializer(pr).data)

        return Response({'detail': 'Unknown action.'}, status=status.HTTP_400_BAD_REQUEST)


class UserDashboardView(APIView):
    """GET /api/users/me/dashboard/ — dashboard summary built from live backend data."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = date.today()

        budgets = list(
            Budget.objects.filter(user=user).prefetch_related('categories').order_by('-year', '-month')
        )
        expenses = list(Expense.objects.filter(user=user).order_by('-date', '-id'))
        notifications = list(user.notifications.order_by('-created_at'))

        month_expenses = [
            expense
            for expense in expenses
            if expense.date.year == today.year and expense.date.month == today.month
        ]
        days_in_month = monthrange(today.year, today.month)[1]
        monthly_trend = []
        expense_amount_by_day: dict[int, Decimal] = {}
        for expense in month_expenses:
            expense_amount_by_day[expense.date.day] = expense_amount_by_day.get(expense.date.day, Decimal('0')) + expense.amount
        for day in range(1, days_in_month + 1):
            monthly_trend.append(
                {
                    'day': day,
                    'label': f'{day}',
                    'amount': str(expense_amount_by_day.get(day, Decimal('0'))),
                }
            )
        monthly_spent = sum((expense.amount for expense in month_expenses), Decimal('0'))
        daily_average = monthly_spent / Decimal(max(1, today.day))

        current_budget = next(
            (
                budget
                for budget in budgets
                if budget.year == today.year and budget.month == today.month
            ),
            budgets[0] if budgets else None,
        )

        category_spending = []
        current_budget_payload = None
        budget_limit = Decimal('0')
        remaining_budget = Decimal('0')
        percent_used = 0.0

        if current_budget:
            spent_by_category: dict[str, Decimal] = {}
            for expense in month_expenses:
                spent_by_category[expense.category] = spent_by_category.get(expense.category, Decimal('0')) + expense.amount

            for category in current_budget.categories.all():
                spent = spent_by_category.get(category.category_name, Decimal('0'))
                remaining = category.limit_amount - spent
                category_percent = float(round((spent / category.limit_amount * 100), 2)) if category.limit_amount > 0 else 0.0
                category_spending.append(
                    {
                        'category_name': category.category_name,
                        'limit_amount': str(category.limit_amount),
                        'spent': str(spent),
                        'remaining': str(remaining),
                        'percent_used': category_percent,
                        'warning_80': category_percent >= 80,
                        'warning_100': category_percent >= 100,
                    }
                )

            budget_limit = current_budget.total_limit
            remaining_budget = budget_limit - monthly_spent
            percent_used = float(round((monthly_spent / budget_limit * 100), 2)) if budget_limit > 0 else 0.0
            current_budget_payload = {
                'id': current_budget.id,
                'month': current_budget.month,
                'year': current_budget.year,
                'total_limit': str(budget_limit),
                'total_spent': str(monthly_spent),
                'remaining': str(remaining_budget),
                'percent_total_used': percent_used,
                'warning_total_80': percent_used >= 80,
                'warning_total_100': percent_used >= 100,
                'by_category': category_spending,
            }

        overview = {
            'monthly_spent': str(monthly_spent),
            'budget_limit': str(budget_limit),
            'remaining': str(remaining_budget),
            'percent_used': percent_used,
            'daily_average': str(daily_average),
            'expense_count': len(expenses),
            'budget_count': len(budgets),
            'unread_notifications': sum(1 for notification in notifications if not notification.is_read),
        }

        recent_expenses = ExpenseSerializer(expenses[:5], many=True, context={'request': request}).data
        recent_notifications = [
            {
                'id': notification.id,
                'type': notification.type,
                'message': notification.message,
                'metadata': notification.metadata,
                'is_read': notification.is_read,
                'is_archived': notification.is_archived,
                'created_at': notification.created_at,
            }
            for notification in notifications[:5]
        ]

        return Response(
            {
                'user': UserProfileSerializer(user, context={'request': request}).data,
                'overview': overview,
                'current_budget': current_budget_payload,
                'category_spending': category_spending,
                'monthly_trend': monthly_trend,
                'recent_expenses': recent_expenses,
                'notifications': recent_notifications,
            }
        )


class UserPreferencesView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/users/preferences/ — notification and onboarding flags."""

    permission_classes = [IsAuthenticated]
    serializer_class = UserPreferencesSerializer

    def get_object(self):
        return self.request.user


class LogoutView(APIView):
    """
    POST /api/auth/logout/ — client should discard access/refresh tokens.
    (Server-side invalidation would require a token blacklist; not enabled here.)
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response(
            {'detail': 'Tokens should be removed on the client. Session not stored server-side.'},
            status=status.HTTP_200_OK,
        )


class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsAdminRole]
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = AdminUserBriefSerializer

    def list(self, request, *args, **kwargs):
        # Support ?search=...&page=1&pageSize=20 and return a consistent paginated shape
        search = (request.query_params.get('search') or '').strip()
        try:
            page = int(request.query_params.get('page') or 1)
        except (TypeError, ValueError):
            page = 1
        try:
            page_size = int(request.query_params.get('pageSize') or request.query_params.get('page_size') or 20)
        except (TypeError, ValueError):
            page_size = 20

        qs = self.filter_queryset(self.get_queryset())

        if search:
            from django.db.models import Q

            qs = qs.filter(Q(full_name__icontains=search) | Q(email__icontains=search))

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

        return Response({'pagination': pagination, 'results': serializer.data})


class AdminUserStatsView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        total_users = User.objects.count()
        active_shoppers = User.objects.filter(role='user', is_active=True).count()
        active_vendors = User.objects.filter(role='vendor', is_active=True).count()
        suspended_users = User.objects.filter(is_active=False).count()

        return Response(
            {
                'total_users': total_users,
                'active_shoppers': active_shoppers,
                'active_vendors': active_vendors,
                'suspended_users': suspended_users,
            }
        )


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdminRole]
    queryset = User.objects.all()
    lookup_field = 'pk'

    def get_serializer_class(self):
        if self.request.method in ('PATCH', 'PUT'):
            return AdminUserUpdateSerializer
        return AdminUserBriefSerializer

    def perform_update(self, serializer):
        user = serializer.save()
        AuditLog.objects.create(
            actor=self.request.user,
            action='admin_user_update',
            resource='user',
            resource_id=str(user.id),
            detail={'is_active': user.is_active},
        )


class AdminUserSuspendView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)

        if user.pk == request.user.pk:
            return Response(
                {'detail': 'You cannot suspend your own admin account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reason = (request.data.get('reason') or 'Suspended by administrator.').strip()
        user.is_active = False
        user.save(update_fields=['is_active'])

        Notification.objects.create(
            user=user,
            type='user_suspended',
            message=f'Your account has been suspended. Reason: {reason}',
        )

        AuditLog.objects.create(
            actor=request.user,
            action='admin_user_suspend',
            resource='user',
            resource_id=str(user.id),
            detail={'reason': reason},
        )

        return Response({'detail': 'User account suspended.'}, status=status.HTTP_200_OK)


class AdminUserRestoreView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)

        reason = (request.data.get('reason') or 'Restored by administrator.').strip()
        user.is_active = True
        user.save(update_fields=['is_active'])

        Notification.objects.create(
            user=user,
            type='user_restored',
            message=f'Your account has been restored. Note: {reason}',
        )

        AuditLog.objects.create(
            actor=request.user,
            action='admin_user_restore',
            resource='user',
            resource_id=str(user.id),
            detail={'reason': reason},
        )

        return Response({'detail': 'User account restored.'}, status=status.HTTP_200_OK)


class NotificationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated:
            return Notification.objects.none()
        
        queryset = self.request.user.notifications.all()
        
        # Filtering
        n_type = self.request.query_params.get('type')
        if n_type:
            queryset = queryset.filter(type=n_type)
            
        status = self.request.query_params.get('status')
        if status == 'unread':
            queryset = queryset.filter(is_read=False)
        elif status == 'read':
            queryset = queryset.filter(is_read=True)
            
        archived = self.request.query_params.get('archived')
        if archived == 'true':
            queryset = queryset.filter(is_archived=True)
        elif archived == 'false':
            queryset = queryset.filter(is_archived=False)
            
        return queryset.order_by('-created_at')


class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    lookup_field = 'pk'

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated:
            return Notification.objects.none()
        return self.request.user.notifications.all()


from rest_framework.views import APIView
from rest_framework.response import Response

class NotificationBulkUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        action = request.data.get('action')
        notification_ids = request.data.get('ids', [])
        
        if not action or not notification_ids:
            return Response({"error": "action and ids are required"}, status=400)
            
        queryset = request.user.notifications.filter(id__in=notification_ids)
        
        if action == 'mark_read':
            queryset.update(is_read=True)
        elif action == 'archive':
            queryset.update(is_archived=True)
        elif action == 'delete':
            queryset.delete()
        else:
            return Response({"error": "invalid action"}, status=400)
            
        return Response({"status": "success"})

