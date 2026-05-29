import math
from decimal import Decimal

from django.conf import settings
from django.db.models import Avg, Q, Sum, Count
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status, filters
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser

from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny, IsAuthenticated, SAFE_METHODS
from rest_framework.response import Response
from rest_framework.views import APIView
import logging

from users.models import AuditLog, Notification, User, Vendor

from .pagination import StandardResultsSetPagination


def _vendor_admin_bucket(vendor: Vendor) -> str:
    rejection_reason = (vendor.verification_rejection_reason or '').strip()
    if vendor.verification_status == 'suspended':
        return 'suspended'
    if vendor.is_verified or vendor.verification_status == 'verified':
        return 'verified'
    if vendor.verification_status == 'rejected' or rejection_reason:
        return 'rejected'
    if vendor.verification_status in ('requested', 'pending'):
        return 'pending'
    return 'unrequested'


def _build_vendor_report_summary(vendor_ids):
    if not vendor_ids:
        return {}

    rows = AuditLog.objects.filter(
        action='vendor_report',
        resource='vendor',
        resource_id__in=vendor_ids,
    ).order_by('resource_id', '-created_at', '-id')

    summary = {}
    for row in rows:
        bucket = summary.setdefault(
            row.resource_id,
            {
                'report_count': 0,
                'latest_report_reason': '',
                'latest_reported_at': None,
            },
        )
        bucket['report_count'] += 1
        if not bucket['latest_report_reason']:
            bucket['latest_report_reason'] = (row.detail or {}).get('reason', '') or ''
            bucket['latest_reported_at'] = row.created_at

    return summary

from core_api.permissions import IsAdminRole
from market.models import VendorPrice, Item
from users.models import AuditLog, Notification, User, Vendor

from django.db import transaction as db_transaction
from django.utils import timezone

from .models import Transaction, VendorReview
from .serializers import (
    PurchaseBulkCreateSerializer,
    PurchaseCreateSerializer,
    PurchaseStatusUpdateSerializer,
    TransactionSerializer,
    VendorPriceSerializer,
    VendorPublicSerializer,
    VendorRegisterSerializer,
    VendorReviewSerializer,
)
from .pagination import StandardResultsSetPagination


def _haversine_km(lat1, lon1, lat2, lon2):
    if None in (lat1, lon1, lat2, lon2):
        return None
    r = 6371.0
    p1, p2 = math.radians(float(lat1)), math.radians(float(lat2))
    dp = math.radians(float(lat2) - float(lat1))
    dl = math.radians(float(lon2) - float(lon1))
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return round(2 * r * math.asin(math.sqrt(a)), 2)


class VendorRegisterView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = VendorRegisterSerializer


class VendorDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = Vendor.objects.all()
    serializer_class = VendorPublicSerializer
    lookup_field = 'pk'


class VendorListingListCreateView(generics.ListCreateAPIView):
    serializer_class = VendorPriceSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    pagination_class = StandardResultsSetPagination

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_vendor(self):
        if getattr(self, 'swagger_fake_view', False):
            return Vendor.objects.first() or Vendor()
        vendor_id = self.kwargs.get('vendor_id')
        vendor = get_object_or_404(Vendor, pk=vendor_id)

        if self.request.method in SAFE_METHODS:
            return vendor
        
        if not self.request or not self.request.user or not self.request.user.is_authenticated:
            return vendor
            
        is_admin = IsAdminRole().has_permission(self.request, self)
        if vendor.owner_id != self.request.user.id and not is_admin:
            self.permission_denied(self.request)
        return vendor

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return VendorPrice.objects.none()
        v = self.get_vendor()
        qs = VendorPrice.objects.filter(vendor=v).select_related('item', 'vendor').prefetch_related('images')

        # Apply query param filters (category, search q, price range, sort)
        params = self.request.query_params
        q = params.get('q')
        category = params.get('category')
        min_price = params.get('minPrice') or params.get('min_price')
        max_price = params.get('maxPrice') or params.get('max_price')
        sort_by = params.get('sortBy')

        if q:
            qs = qs.filter(
                Q(item__name__icontains=q) | Q(item__description__icontains=q)
            )

        if category and category.lower() != 'all':
            qs = qs.filter(item__category__iexact=category)

        try:
            if min_price is not None:
                qs = qs.filter(price__gte=Decimal(min_price))
        except Exception:
            pass

        try:
            if max_price is not None:
                qs = qs.filter(price__lte=Decimal(max_price))
        except Exception:
            pass

        # Sorting
        if sort_by == 'price':
            qs = qs.order_by('price', '-date', '-id')
        elif sort_by == 'newest':
            qs = qs.order_by('-date', '-id')
        else:
            # default ordering (most recent)
            qs = qs.order_by('-date', '-id')

        return qs

    def list(self, request, *args, **kwargs):
        """Return paginated listings plus a categories list.

        Categories prefer vendor-specific item categories. If the vendor has
        no categories, fall back to all categories in the Item table.
        """
        # Get the normal paginated response
        response = super().list(request, *args, **kwargs)

        # Compute vendor categories (unfiltered by query params)
        try:
            vendor = self.get_vendor()
            vendor_cats_qs = VendorPrice.objects.filter(vendor=vendor).values_list('item__category', flat=True).distinct()
            vendor_cats = [c for c in vendor_cats_qs if c]
        except Exception:
            vendor_cats = []

        if not vendor_cats:
            # Fallback to system-wide categories from Item model
            try:
                system_cats_qs = Item.objects.values_list('category', flat=True).distinct()
                system_cats = [c for c in system_cats_qs if c]
            except Exception:
                system_cats = []
            categories = sorted(set(system_cats))
        else:
            categories = sorted(set(vendor_cats))

        # Attach categories to the response data
        try:
            if isinstance(response.data, dict):
                response.data['categories'] = categories
        except Exception:
            pass

        return response

    def perform_create(self, serializer):
        v = self.get_vendor()
        serializer.save(vendor=v)


class VendorListingUpdateView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VendorPriceSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    http_method_names = ['get', 'patch', 'delete', 'head', 'options']

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return VendorPrice.objects.none()

        qs = VendorPrice.objects.select_related('vendor', 'item').prefetch_related('images')

        # Public reads — return all listings so the product page can fetch any listing by pk
        if self.request.method in SAFE_METHODS:
            return qs

        # Mutations — restrict to the authenticated owner (or admin)
        user = getattr(self.request, 'user', None)
        if not user or not user.is_authenticated:
            return VendorPrice.objects.none()
        if IsAdminRole().has_permission(self.request, self):
            return qs
        return qs.filter(vendor__owner=user)


class RecommendationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        item_id = request.query_params.get('item_id')
        if not item_id:
            return Response({'detail': 'item_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        city = request.query_params.get('city')
        lat = request.query_params.get('latitude')
        lon = request.query_params.get('longitude')
        limit = int(request.query_params.get('limit', '20'))

        vps = VendorPrice.objects.filter(
            item_id=item_id,
            vendor__is_verified=True,
        ).select_related('vendor', 'item').order_by('vendor_id', '-date', '-id')

        if city:
            vps = vps.filter(vendor__city__iexact=city)

        seen = set()
        rows = []
        for vp in vps:
            if vp.vendor_id in seen:
                continue
            seen.add(vp.vendor_id)
            rows.append(vp)

        from market.models import PriceSubmission
        avg_rec = PriceSubmission.objects.filter(
            status='approved', item_id=item_id,
        )
        if city:
            avg_rec = avg_rec.filter(city__iexact=city)
        market_avg = avg_rec.aggregate(a=Avg('price_value'))['a']

        out = []
        user_lat = float(lat) if lat else None
        user_lon = float(lon) if lon else None
        for vp in rows:
            v = vp.vendor
            dist = None
            if user_lat is not None and user_lon is not None and v.latitude and v.longitude:
                dist = _haversine_km(user_lat, user_lon, v.latitude, v.longitude)
            vs_market = None
            if market_avg and market_avg > 0:
                vs_market = float((vp.price - market_avg) / market_avg * 100)
            out.append({
                'vendor_id': str(v.id),
                'shop_name': v.shop_name,
                'city': v.city,
                'rating_avg': str(v.rating_avg),
                'rating_count': v.rating_count,
                'listing_id': vp.id,
                'price': str(vp.price),
                'item_id': vp.item_id,
                'item_name': vp.item.name,
                'unit': vp.item.unit,
                'distance_km': dist,
                'percent_vs_market_avg': round(vs_market, 2) if vs_market is not None else None,
            })
        out.sort(key=lambda x: (Decimal(x['price']), x['distance_km'] or 1e9))
        return Response(out[:limit])


class VendorCategoriesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, vendor_id):
        # Return vendor-specific categories; fallback to system-wide categories
        try:
            vendor = get_object_or_404(Vendor, pk=vendor_id)
        except Exception:
            return Response({'categories': []})

        try:
            vendor_cats_qs = VendorPrice.objects.filter(vendor=vendor).values_list('item__category', flat=True).distinct()
            vendor_cats = [c for c in vendor_cats_qs if c]
        except Exception:
            vendor_cats = []

        if vendor_cats:
            categories = sorted(set(vendor_cats))
        else:
            try:
                system_cats_qs = Item.objects.values_list('category', flat=True).distinct()
                system_cats = [c for c in system_cats_qs if c]
            except Exception:
                system_cats = []
            categories = sorted(set(system_cats))

        return Response({'categories': categories})


class PurchaseListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'vendor__shop_name']
    search_fields = ['reference', 'vendor__shop_name']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PurchaseCreateSerializer
        return TransactionSerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated:
            return Transaction.objects.none()
        return Transaction.objects.filter(user=self.request.user).select_related('vendor').order_by('-created_at')

    def create(self, request, *args, **kwargs):
        # If request contains an 'items' list, use the bulk serializer
        if 'items' in request.data:
            ser = PurchaseBulkCreateSerializer(data=request.data, context={'request': request})
            ser.is_valid(raise_exception=True)
            transactions = ser.save()
            data = TransactionSerializer([tx for tx, _ in transactions], many=True).data
            return Response(data, status=status.HTTP_201_CREATED)

        # Fallback: single-item checkout
        ser = PurchaseCreateSerializer(data=request.data, context={'request': request})
        ser.is_valid(raise_exception=True)
        tx = ser.save()
        return Response(TransactionSerializer(tx).data, status=status.HTTP_201_CREATED)


class VendorSalesListView(generics.ListAPIView):
    """Vendor-facing sales list (orders placed to this vendor)."""

    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'payment_method']
    search_fields = ['reference', 'user__full_name', 'user__email']

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated:
            return Transaction.objects.none()
        return (
            Transaction.objects
            .filter(vendor__owner=self.request.user)
            .select_related('vendor', 'user', 'vendor_price')
            .order_by('-created_at')
        )


class VendorSalesDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer
    lookup_field = 'pk'

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated:
            return Transaction.objects.none()
        return (
            Transaction.objects
            .filter(vendor__owner=self.request.user)
            .select_related('vendor', 'user', 'vendor_price')
        )


class PurchaseKPISummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if getattr(self, 'swagger_fake_view', False) or not request.user.is_authenticated:
            return Response({})
            
        qs = Transaction.objects.filter(user=request.user)
        
        total_revenue = qs.aggregate(total=Sum('amount'))['total'] or 0
        average_order_value = qs.aggregate(avg=Avg('amount'))['avg'] or 0
        pending_orders = qs.filter(status='pending').count()
        
        top_vendors = list(
            qs.values('vendor__shop_name')
            .annotate(amount=Sum('amount'), orders=Count('id'))
            .order_by('-amount')[:2]
        )
        top_vendors_formatted = [
            {
                'name': v['vendor__shop_name'],
                'amount': v['amount'],
                'orders': v['orders']
            }
            for v in top_vendors
        ]
        
        return Response({
            'total_revenue': total_revenue,
            'pending_orders': pending_orders,
            'average_order_value': average_order_value,
            'top_vendors': top_vendors_formatted
        })


class PurchaseDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer
    lookup_field = 'pk'

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated:
            return Transaction.objects.none()
        return Transaction.objects.filter(user=self.request.user)


class PurchaseStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        tx = get_object_or_404(Transaction, pk=pk)
        is_admin = IsAdminRole().has_permission(request, self)
        if tx.vendor.owner_id != request.user.id and not is_admin:
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = PurchaseStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data['status']
        tx.status = new_status
        tx.save(update_fields=['status', 'updated_at'])
        Notification.objects.create(
            user=tx.user,
            type='delivery_update',
            message=f'Order {tx.reference} status changed to {new_status}.',
        )
        AuditLog.objects.create(
            actor=request.user,
            action='purchase_status_update',
            resource='transaction',
            resource_id=str(tx.id),
            detail={'status': new_status},
        )
        return Response(TransactionSerializer(tx).data)


class PaymentWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logger = logging.getLogger(__name__)
        # Log incoming webhook for diagnostics (trim long bodies)
        try:
            raw_body = request.body.decode('utf-8')
        except Exception:
            raw_body = str(request.body)
        logger.info('Payment webhook received: headers=%s body=%s', dict(request.headers), raw_body[:4000])

        # Accept secret from several possible header names, payload keys, or query param
        header_names = [
            'X-WEBHOOK-SECRET', 'X-WEBHOOK-TOKEN', 'X-CHAPA-SIGNATURE', 'X-CHAPA-SECRET', 'X-SIGNATURE',
            'X-HOOK-SECRET', 'X-HOOK-TOKEN', 'Authorization',
        ]

        secret = ''
        for hn in header_names:
            val = request.headers.get(hn)
            if val:
                # Support 'Authorization: Bearer <token>'
                if hn.lower() == 'authorization' and val.lower().startswith('bearer '):
                    secret = val.split(None, 1)[1].strip()
                else:
                    secret = val.strip()
                break

        # fallback to payload or query param
        if not secret:
            secret = (
                request.data.get('secret', '')
                or request.data.get('webhook_secret', '')
                or request.query_params.get('secret', '')
            )

        expected = getattr(settings, 'PAYMENT_WEBHOOK_SECRET', '')

        # If an expected secret is configured, verify either a direct token match
        # OR an HMAC signature header commonly used by gateway providers (Chapa).
        def _is_hmac_match(expected_key: str, header_val: str, body_bytes: bytes) -> bool:
            try:
                import hmac, hashlib, base64

                # compute raw HMAC digest
                hm = hmac.new(expected_key.encode('utf-8'), body_bytes, hashlib.sha256)
                hex_digest = hm.hexdigest()
                b64_digest = base64.b64encode(hm.digest()).decode('utf-8')

                # common header formats: hex, base64, or prefixed 'sha256='
                candidates = {hex_digest, b64_digest, f"sha256={hex_digest}", f"sha256={b64_digest}"}
                # some gateways URL-encode or wrap values; compare lower-cased trimmed
                hv = header_val.strip()
                if hv in candidates:
                    return True
                if hv.lower().startswith('sha256=') and hv.split('=', 1)[1] in candidates:
                    return True
                return False
            except Exception:
                return False

        signature_headers = [
            'Chapa-Signature', 'X-Chapa-Signature', 'Signature', 'X-Signature',
            'X-Hook-Signature', 'X-Hook-Secret', 'X-Webhook-Signature',
        ]

        verified = False
        # Check if any signature header or secret is present
        signature_header_present = any(request.headers.get(sh) for sh in signature_headers) or bool(secret)
        
        if expected and signature_header_present:
            # direct token match
            if secret and secret == expected:
                verified = True

            # check signature headers
            if not verified:
                body_bytes = request.body if hasattr(request, 'body') else raw_body.encode('utf-8')
                for sh in signature_headers:
                    hv = request.headers.get(sh)
                    if hv:
                        if _is_hmac_match(expected, hv, body_bytes):
                            verified = True
                            break

        if expected and signature_header_present and not verified:
            # Log header names present to help identify how the gateway sends the secret
            try:
                logger.warning(
                    'Invalid webhook signature: expected present but none matched. headers=%s payload_keys=%s',
                    list(request.headers.keys()),
                    list(request.data.keys()) if isinstance(request.data, dict) else [],
                )
            except Exception:
                pass
            return Response({'detail': 'Invalid webhook signature.'}, status=status.HTTP_403_FORBIDDEN)
        elif expected and not signature_header_present:
            # No signature provided, but secret is configured
            logger.warning(
                'Webhook received without signature header, but PAYMENT_WEBHOOK_SECRET is configured. '
                'This is allowed but not recommended for security. headers=%s',
                list(request.headers.keys()),
            )
        data = request.data.get('data', request.data)
        reference = (
            request.data.get('reference')
            or request.data.get('tx_ref')
            or request.data.get('trx_ref')
            or data.get('reference')
            or data.get('tx_ref')
            or data.get('trx_ref')
        )
        result = str(
            request.data.get('status')
            or data.get('status')
            or ''
        ).lower()
        gateway_ref = (
            request.data.get('gateway_reference')
            or request.data.get('chapa_reference')
            or request.data.get('ref_id')
            or data.get('gateway_reference')
            or data.get('chapa_reference')
            or data.get('reference')
            or data.get('ref_id')
            or ''
        )
        if not reference:
            return Response({'detail': 'reference is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Support combined references (e.g. "ref1-ref2-ref3" for bulk checkout)
        individual_refs = [r for r in reference.split('-') if len(r) == 32]  # uuid hex = 32 chars
        if not individual_refs:
            individual_refs = [reference]

        transactions = list(
            Transaction.objects.filter(
                Q(reference__in=individual_refs) | Q(payment_reference=reference)
            )
        )
        try:
            logging.getLogger(__name__).info(
                'Webhook matched transactions: reference=%s individual_refs=%s matched_ids=%s',
                reference,
                individual_refs,
                [str(t.id) for t in transactions],
            )
        except Exception:
            pass
        if not transactions:
            return Response({'detail': 'Transaction not found.'}, status=status.HTTP_404_NOT_FOUND)

        from finance.models import Expense
        import datetime

        with db_transaction.atomic():
            for tx in transactions:
                if result in ('success', 'paid'):
                    tx.status = 'paid'
                    tx.paid_at = timezone.now()

                    # Try to find an existing pending Expense created at checkout
                    try:
                        existing = Expense.objects.filter(
                            user=tx.user,
                            note__contains=str(tx.reference),
                        ).first()
                        if existing:
                            existing.amount = tx.amount
                            existing.vendor = tx.vendor
                            existing.payment_method = tx.payment_method
                            existing.date = datetime.date.today()
                            existing.note = f'Auto-recorded from Chapa payment. Order ref: {tx.reference}'
                            existing.save()
                        else:
                            Expense.objects.create(
                                user=tx.user,
                                category='Shopping',
                                item=tx.vendor_price.item if tx.vendor_price else None,
                                amount=tx.amount,
                                vendor=tx.vendor,
                                payment_method=tx.payment_method,
                                date=datetime.date.today(),
                                note=f'Auto-recorded from Chapa payment. Order ref: {tx.reference}',
                            )
                    except Exception:
                        pass  # Expense recording is best-effort; don't fail the webhook

                    try:
                        credit_vendor_wallet(
                            vendor=tx.vendor,
                            amount=tx.amount,
                            transaction_reference=tx.reference,
                            source='chapa',
                            note=f'Credit from paid order {tx.reference}',
                        )
                    except Exception:
                        pass

                elif result in ('failed', 'cancelled'):
                    tx.status = result

                tx.payment_reference = gateway_ref or tx.payment_reference
                try:
                    logging.getLogger(__name__).info(
                        'Updating Transaction from webhook: tx_id=%s ref=%s gateway_ref=%s result=%s',
                        tx.id,
                        tx.reference,
                        gateway_ref,
                        result,
                    )
                except Exception:
                    pass
                tx.webhook_payload = request.data
                tx.save(update_fields=[
                    'status', 'paid_at', 'payment_reference', 'webhook_payload', 'updated_at'
                ])

                Notification.objects.create(
                    user=tx.user,
                    type='payment_confirmation',
                    message=f'Payment update for order {tx.reference}: {tx.status}.',
                )
                AuditLog.objects.create(
                    actor=None,
                    action='payment_webhook',
                    resource='transaction',
                    resource_id=str(tx.id),
                    detail={'status': tx.status, 'reference': tx.reference},
                )

        return Response(
            {'detail': 'Webhook processed.', 'status': transactions[0].status, 'count': len(transactions)},
            status=status.HTTP_200_OK,
        )

    def get(self, request):
        """Support GET requests (some gateways or callbacks use query params).
        This mirrors the POST handling but reads from query params.
        """
        logger = logging.getLogger(__name__)
        logger.info('Payment webhook GET received: headers=%s query=%s', dict(request.headers), dict(request.query_params))

        # Reuse similar signature verification as POST but reading from query params
        header_names = [
            'X-WEBHOOK-SECRET', 'X-WEBHOOK-TOKEN', 'X-CHAPA-SIGNATURE', 'X-CHAPA-SECRET', 'X-SIGNATURE',
            'X-HOOK-SECRET', 'X-HOOK-TOKEN', 'Authorization',
        ]

        secret = ''
        for hn in header_names:
            val = request.headers.get(hn)
            if val:
                if hn.lower() == 'authorization' and val.lower().startswith('bearer '):
                    secret = val.split(None, 1)[1].strip()
                else:
                    secret = val.strip()
                break

        if not secret:
            secret = (request.query_params.get('secret', '') or request.query_params.get('webhook_secret', ''))

        expected = getattr(settings, 'PAYMENT_WEBHOOK_SECRET', '')
        verified = False
        signature_headers = [
            'Chapa-Signature', 'X-Chapa-Signature', 'Signature', 'X-Signature',
            'X-Hook-Signature', 'X-Hook-Secret', 'X-Webhook-Signature',
        ]
        
        # Check if any signature header or secret is present
        signature_header_present = any(request.headers.get(sh) for sh in signature_headers) or bool(secret)
        
        if expected and signature_header_present:
            if secret and secret == expected:
                verified = True
            if not verified:
                # attempt HMAC verify using query string bytes
                import hmac, hashlib, base64
                body_bytes = request.get_raw_uri().encode('utf-8') if hasattr(request, 'get_raw_uri') else str(request.query_params).encode('utf-8')
                for sh in signature_headers:
                    hv = request.headers.get(sh)
                    if not hv:
                        continue
                    try:
                        hm = hmac.new(expected.encode('utf-8'), body_bytes, hashlib.sha256)
                        hex_digest = hm.hexdigest()
                        b64_digest = base64.b64encode(hm.digest()).decode('utf-8')
                        if hv.strip() in {hex_digest, b64_digest, f'sha256={hex_digest}', f'sha256={b64_digest}'}:
                            verified = True
                            break
                    except Exception:
                        continue

        if expected and signature_header_present and not verified:
            logger.warning('Invalid webhook signature on GET. headers=%s query_keys=%s', list(request.headers.keys()), list(request.query_params.keys()))
            return Response({'detail': 'Invalid webhook signature.'}, status=status.HTTP_403_FORBIDDEN)
        elif expected and not signature_header_present:
            logger.warning('Webhook GET received without signature header, but PAYMENT_WEBHOOK_SECRET is configured. headers=%s', list(request.headers.keys()))

        data = dict(request.query_params)
        reference = (
            request.query_params.get('reference')
            or request.query_params.get('tx_ref')
            or request.query_params.get('trx_ref')
            or data.get('reference')
            or data.get('tx_ref')
            or data.get('trx_ref')
        )
        result = str(
            request.query_params.get('status')
            or data.get('status')
            or ''
        ).lower()
        gateway_ref = (
            request.query_params.get('gateway_reference')
            or request.query_params.get('chapa_reference')
            or request.query_params.get('ref_id')
            or data.get('gateway_reference')
            or data.get('chapa_reference')
            or data.get('reference')
            or data.get('ref_id')
            or ''
        )

        if not reference:
            return Response({'detail': 'reference is required.'}, status=status.HTTP_400_BAD_REQUEST)

        individual_refs = [r for r in reference.split('-') if len(r) == 32]
        if not individual_refs:
            individual_refs = [reference]

        transactions = list(
            Transaction.objects.filter(
                Q(reference__in=individual_refs) | Q(payment_reference=reference)
            )
        )
        try:
            logging.getLogger(__name__).info(
                'Webhook(GET) matched transactions: reference=%s individual_refs=%s matched_ids=%s',
                reference,
                individual_refs,
                [str(t.id) for t in transactions],
            )
        except Exception:
            pass

        if not transactions:
            return Response({'detail': 'Transaction not found.'}, status=status.HTTP_404_NOT_FOUND)

        from finance.models import Expense
        import datetime

        with db_transaction.atomic():
            for tx in transactions:
                if result in ('success', 'paid'):
                    tx.status = 'paid'
                    tx.paid_at = timezone.now()
                    try:
                        existing = Expense.objects.filter(
                            user=tx.user,
                            note__contains=str(tx.reference),
                        ).first()
                        if existing:
                            existing.amount = tx.amount
                            existing.vendor = tx.vendor
                            existing.payment_method = tx.payment_method
                            existing.date = datetime.date.today()
                            existing.note = f'Auto-recorded from Chapa payment. Order ref: {tx.reference}'
                            existing.save()
                        else:
                            Expense.objects.create(
                                user=tx.user,
                                category='Shopping',
                                item=tx.vendor_price.item if tx.vendor_price else None,
                                amount=tx.amount,
                                vendor=tx.vendor,
                                payment_method=tx.payment_method,
                                date=datetime.date.today(),
                                note=f'Auto-recorded from Chapa payment. Order ref: {tx.reference}',
                            )
                    except Exception:
                        pass

                    try:
                        credit_vendor_wallet(
                            vendor=tx.vendor,
                            amount=tx.amount,
                            transaction_reference=tx.reference,
                            source='chapa',
                            note=f'Credit from paid order {tx.reference}',
                        )
                    except Exception:
                        pass
                elif result in ('failed', 'cancelled'):
                    tx.status = result

                tx.payment_reference = gateway_ref or tx.payment_reference
                try:
                    logging.getLogger(__name__).info(
                        'Updating Transaction from webhook(GET): tx_id=%s ref=%s gateway_ref=%s result=%s',
                        tx.id,
                        tx.reference,
                        gateway_ref,
                        result,
                    )
                except Exception:
                    pass
                tx.webhook_payload = dict(request.query_params)
                tx.save(update_fields=[
                    'status', 'paid_at', 'payment_reference', 'webhook_payload', 'updated_at'
                ])

                Notification.objects.create(
                    user=tx.user,
                    type='payment_confirmation',
                    message=f'Payment update for order {tx.reference}: {tx.status}.',
                )
                AuditLog.objects.create(
                    actor=None,
                    action='payment_webhook_get',
                    resource='transaction',
                    resource_id=str(tx.id),
                    detail={'status': tx.status, 'reference': tx.reference},
                )

        return Response(
            {'detail': 'Webhook processed.', 'status': transactions[0].status, 'count': len(transactions)},
            status=status.HTTP_200_OK,
        )


class VendorReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = VendorReviewSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_vendor(self):
        if getattr(self, 'swagger_fake_view', False):
            return Vendor.objects.first() or Vendor()
        vendor_id = self.kwargs.get('vendor_id')
        return get_object_or_404(Vendor, pk=vendor_id)

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return VendorReview.objects.none()
        vendor_id = self.kwargs.get('vendor_id')
        return VendorReview.objects.filter(vendor_id=vendor_id).select_related('user')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset()).order_by('-created_at')

        try:
            page = int(request.query_params.get('page') or 1)
        except (TypeError, ValueError):
            page = 1
        try:
            page_size = int(request.query_params.get('page_size') or request.query_params.get('pageSize') or 10)
        except (TypeError, ValueError):
            page_size = 10

        from django.core.paginator import EmptyPage, Paginator
        paginator = Paginator(queryset, page_size)
        try:
            page_obj = paginator.page(page)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages or 1)

        serializer = self.get_serializer(page_obj.object_list, many=True)

        reviews = serializer.data
        total_reviews = queryset.count()
        average_rating = float(queryset.aggregate(avg=Avg('rating'))['avg'] or 0)
        distribution = {str(star): queryset.filter(rating=star).count() for star in range(1, 6)}

        return Response({
            'pagination': {
                'total_records': paginator.count,
                'total_pages': paginator.num_pages,
                'page_size': paginator.per_page,
                'current_page': page_obj.number,
            },
            'reviews': reviews,
            'averageRating': average_rating,
            'totalReviews': total_reviews,
            'distribution': distribution,
        })

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['vendor'] = self.get_vendor()
        return ctx

    def perform_create(self, serializer):
        # Save the review
        review = serializer.save()

        # Recalculate average rating and count for the vendor
        try:
            vendor = review.vendor
            agg = VendorReview.objects.filter(vendor=vendor).aggregate(avg=Avg('rating'))
            count = VendorReview.objects.filter(vendor=vendor).count()
            Vendor.objects.filter(pk=vendor.pk).update(
                rating_avg=Decimal(str(round(float(agg['avg'] or 0), 2))),
                rating_count=count,
            )
        except Exception:
            pass

        # Optional: notify Next.js to revalidate cached pages/tags if configured.
        # Configure `NEXT_REVALIDATE_URL` and optional `NEXT_REVALIDATE_SECRET` in Django settings.
        try:
            revalidate_url = getattr(settings, 'NEXT_REVALIDATE_URL', None)
            revalidate_secret = getattr(settings, 'NEXT_REVALIDATE_SECRET', None)
            if revalidate_url:
                payload = {
                    'vendor_id': str(review.vendor_id),
                    'tags': [f"vendor:{review.vendor_id}", f"vendor:{review.vendor_id}:reviews"],
                    'paths': [f"/vendors/{review.vendor_id}"]
                }
                if revalidate_secret:
                    payload['secret'] = revalidate_secret

                try:
                    import json
                    from urllib.request import Request, urlopen
                    req = Request(revalidate_url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
                    # fire-and-forget; do not block on the response
                    urlopen(req, timeout=2)
                except Exception:
                    # Swallow network errors — revalidation is best-effort
                    pass
        except Exception:
            pass


class VendorReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = VendorReviewSerializer
    queryset = VendorReview.objects.all()

    def get_queryset(self):
        # Restrict to the owner
        return VendorReview.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        review = self.get_object()
        if (timezone.now() - review.created_at).total_seconds() > 86400:
            raise serializers.ValidationError("Reviews can only be edited within 24 hours of creation.")
            
        updated_review = serializer.save()
        
        # Recalculate average rating for the vendor
        vendor = updated_review.vendor
        agg = VendorReview.objects.filter(vendor=vendor).aggregate(avg=Avg('rating'))
        count = VendorReview.objects.filter(vendor=vendor).count()
        Vendor.objects.filter(pk=vendor.pk).update(
            rating_avg=Decimal(str(round(float(agg['avg'] or 0), 2))),
            rating_count=count,
        )

    def perform_destroy(self, instance):
        if (timezone.now() - instance.created_at).total_seconds() > 86400:
            raise serializers.ValidationError("Reviews can only be deleted within 24 hours of creation.")
            
        vendor = instance.vendor
        instance.delete()
        
        # Recalculate average rating for the vendor
        agg = VendorReview.objects.filter(vendor=vendor).aggregate(avg=Avg('rating'))
        count = VendorReview.objects.filter(vendor=vendor).count()
        Vendor.objects.filter(pk=vendor.pk).update(
            rating_avg=Decimal(str(round(float(agg['avg'] or 0), 2))),
            rating_count=count,
        )


class AdminVendorListView(generics.ListAPIView):
    permission_classes = [IsAdminRole]
    serializer_class = VendorPublicSerializer
    pagination_class = StandardResultsSetPagination

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['report_summary'] = getattr(self, '_report_summary', {})
        return ctx

    def get_queryset(self):
        qs = Vendor.objects.select_related('owner').order_by('-joined_at')
        search = (self.request.query_params.get('search') or self.request.query_params.get('q') or '').strip()
        status_filter = (self.request.query_params.get('status') or 'all').strip().lower()

        if search:
            qs = qs.filter(
                Q(shop_name__icontains=search)
                | Q(city__icontains=search)
                | Q(address__icontains=search)
                | Q(contact_phone__icontains=search)
                | Q(tin_number__icontains=search)
                | Q(owner__full_name__icontains=search)
                | Q(owner__email__icontains=search)
            )

        if status_filter == 'verified':
            qs = qs.filter(Q(is_verified=True) | Q(verification_status='verified'))
        elif status_filter == 'pending':
            qs = qs.filter(verification_status__in=['requested', 'pending'])
        elif status_filter == 'rejected':
            qs = qs.filter(Q(verification_status='rejected') | (Q(verification_rejection_reason__isnull=False) & ~Q(verification_rejection_reason='')))
        elif status_filter == 'suspended':
            qs = qs.filter(verification_status='suspended')

        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        page_ids = [str(v.id) for v in page] if page is not None else []
        self._report_summary = _build_vendor_report_summary(page_ids)
        serializer = self.get_serializer(page, many=True)
        paginated = self.get_paginated_response(serializer.data)

        all_vendors = list(Vendor.objects.all())
        status_counts = {
            'verified': 0,
            'pending': 0,
            'rejected': 0,
            'suspended': 0,
            'unrequested': 0,
        }
        for vendor in all_vendors:
            status_counts[_vendor_admin_bucket(vendor)] += 1

        stats = {
            'total': len(all_vendors),
            'verified': status_counts['verified'],
            'pending': status_counts['pending'],
            'rejected': status_counts['rejected'],
            'suspended': status_counts['suspended'],
            'unrequested': status_counts['unrequested'],
            'status_breakdown': status_counts,
        }

        payload = paginated.data
        payload['stats'] = stats
        payload['active_status'] = (request.query_params.get('status') or 'all').lower()
        payload['search'] = (request.query_params.get('search') or request.query_params.get('q') or '').strip()
        return Response(payload)


class AdminVendorVerifyView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        v = get_object_or_404(Vendor, pk=pk)
        v.is_verified = True
        v.verification_status = 'verified'
        v.save(update_fields=['is_verified', 'verification_status'])
        
        Notification.objects.create(
            user=v.owner,
            type='vendor_verified',
            message='Your business account has been verified! You can now start listing products.',
        )
        
        AuditLog.objects.create(
            actor=request.user,
            action='vendor_verify',
            resource='vendor',
            resource_id=str(v.id),
        )
        return Response(VendorPublicSerializer(v).data)


class AdminVendorRejectView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        v = get_object_or_404(Vendor, pk=pk)
        
        v.is_verified = False
        v.verification_status = 'rejected'
        reason = request.data.get('reason', 'Provided documents were insufficient or invalid.')
        v.verification_rejection_reason = reason
        v.save(update_fields=['is_verified', 'verification_status', 'verification_rejection_reason'])
        
        Notification.objects.create(
            user=v.owner,
            type='vendor_rejected',
            message=f'Your verification request was rejected. Reason: {reason}',
        )
        
        AuditLog.objects.create(
            actor=request.user,
            action='vendor_reject',
            resource='vendor',
            resource_id=str(pk),
            detail={'reason': reason},
        )
        return Response({'detail': 'Vendor verification rejected.'}, status=status.HTTP_200_OK)


class AdminVendorSuspendView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        v = get_object_or_404(Vendor, pk=pk)

        reason = request.data.get('reason', 'Suspended by administrator.')
        v.is_verified = False
        v.verification_status = 'suspended'
        v.verification_rejection_reason = reason
        v.save(update_fields=['is_verified', 'verification_status', 'verification_rejection_reason'])

        Notification.objects.create(
            user=v.owner,
            type='vendor_suspended',
            message=f'Your vendor account has been suspended. Reason: {reason}',
        )

        AuditLog.objects.create(
            actor=request.user,
            action='vendor_suspend',
            resource='vendor',
            resource_id=str(pk),
            detail={'reason': reason},
        )
        return Response({'detail': 'Vendor account suspended.'}, status=status.HTTP_200_OK)


class AdminVendorRestoreView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        v = get_object_or_404(Vendor, pk=pk)

        reason = request.data.get('reason', 'Restored after admin review.')
        v.is_verified = True
        v.verification_status = 'verified'
        v.verification_rejection_reason = ''
        v.save(update_fields=['is_verified', 'verification_status', 'verification_rejection_reason'])

        Notification.objects.create(
            user=v.owner,
            type='vendor_restored',
            message=f'Your vendor account has been restored after review. Note: {reason}',
        )

        AuditLog.objects.create(
            actor=request.user,
            action='vendor_restore',
            resource='vendor',
            resource_id=str(pk),
            detail={'reason': reason},
        )
        return Response({'detail': 'Vendor account restored and verified.'}, status=status.HTTP_200_OK)
