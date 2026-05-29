from rest_framework import generics
from rest_framework.permissions import AllowAny
from users.models import Vendor
from .serializers import MarketVendorListCardSerializer
from .pagination import CustomMarketPagination
from users.vendor_serializers import VendorLocationSerializer

class VendorListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = MarketVendorListCardSerializer
    pagination_class = CustomMarketPagination
    search_fields = ('shop_name', 'city')
    filterset_fields = ('city', 'is_verified')

    def get_queryset(self):
        from django.db.models import Q, Min
        qs = Vendor.objects.filter(is_verified=True).select_related('owner')
        
        region = self.request.query_params.get('region')
        if region and region.lower() != 'all':
            qs = qs.filter(city__iexact=region)
            
        category = self.request.query_params.get('category')
        if category and category.lower() != 'all':
            qs = qs.filter(vendorprice__item__category__icontains=category)
            
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(
                Q(shop_name__icontains=q) |
                Q(vendorprice__item__name__icontains=q)
            )

        qs = qs.distinct()

        sort_by = self.request.query_params.get('sortBy', 'value')
        
        if sort_by == 'price' and q:
            qs = qs.annotate(searched_price=Min('vendorprice__price', filter=Q(vendorprice__item__name__icontains=q)))
            qs = qs.order_by('searched_price')
        elif sort_by == 'price':
            qs = qs.annotate(min_price=Min('vendorprice__price'))
            qs = qs.order_by('min_price')
        elif sort_by == 'nearest':
            qs = qs.order_by('-rating_avg')
        elif sort_by == 'reliability':
            qs = qs.order_by('-rating_avg', '-rating_count')
        else:
            qs = qs.order_by('-rating_avg')
            
        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['q'] = self.request.query_params.get('q')
        return context

class VendorLocationListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Vendor.objects.filter(is_verified=True, latitude__isnull=False, longitude__isnull=False)
    serializer_class = VendorLocationSerializer
    pagination_class = None

from .models import VendorPrice
from .serializers import VendorPriceSerializer

class ItemVendorPricesView(generics.ListAPIView):
    """
    GET /api/market/vendors/prices/ — list prices from vendors.
    Supports:
      - item_id: filter by specific item
      - search: term matching item name, vendor name, or description
      - category: filter by item category
      - city: filter by vendor city
      - min_price: filter by minimum price
      - max_price: filter by maximum price
      - is_verified: filter by vendor verification status
      - ordering: sort order (price_asc, price_desc, newest)
    """
    permission_classes = [AllowAny]
    serializer_class = VendorPriceSerializer
    pagination_class = CustomMarketPagination

    def get_queryset(self):
        from django.db.models import Q
        
        qs = VendorPrice.objects.all().select_related('vendor', 'item')
        
        item_id = self.request.query_params.get("item_id")
        if item_id:
            qs = qs.filter(item_id=item_id)
            
        q = self.request.query_params.get('search') or self.request.query_params.get('q')
        if q:
            qs = qs.filter(
                Q(item__name__icontains=q) |
                Q(vendor__shop_name__icontains=q) |
                Q(description__icontains=q)
            )
            
        category = self.request.query_params.get('category')
        if category and category.lower() != 'all':
            qs = qs.filter(item__category__icontains=category)
            
        city = self.request.query_params.get('city')
        if city and city.lower() != 'all':
            qs = qs.filter(vendor__city__iexact=city)
            
        min_price = self.request.query_params.get('min_price') or self.request.query_params.get('minPrice')
        if min_price:
            qs = qs.filter(price__gte=min_price)
            
        max_price = self.request.query_params.get('max_price') or self.request.query_params.get('maxPrice')
        if max_price:
            qs = qs.filter(price__lte=max_price)
            
        is_verified = self.request.query_params.get('is_verified') or self.request.query_params.get('verified')
        if is_verified:
            qs = qs.filter(vendor__is_verified=(is_verified.lower() == 'true' or is_verified == '1'))
            
        ordering = self.request.query_params.get('ordering')
        if ordering == 'price_asc':
            qs = qs.order_by('price')
        elif ordering == 'price_desc':
            qs = qs.order_by('-price')
        elif ordering == 'newest':
            qs = qs.order_by('-date')
        else:
            qs = qs.order_by('price')
            
        return qs


from .serializers import VendorDetailSerializer, VendorProductSerializer
from .models import VendorPrice
from rest_framework import views
from rest_framework.response import Response
from django.db.models import Min, Max
import uuid
from django.utils import timezone

class VendorDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = Vendor.objects.filter(is_verified=True).select_related('owner')
    serializer_class = VendorDetailSerializer
    lookup_field = 'pk'

class VendorProductListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = VendorProductSerializer
    pagination_class = CustomMarketPagination

    def get_queryset(self):
        vendor_id = self.kwargs.get('pk')
        qs = VendorPrice.objects.filter(vendor_id=vendor_id).select_related('item')
        
        # filters
        category = self.request.query_params.get('category')
        if category and category.lower() != 'all':
            qs = qs.filter(item__category__icontains=category)
            
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(item__name__icontains=q)
            
        min_price = self.request.query_params.get('minPrice')
        if min_price:
            qs = qs.filter(price__gte=min_price)
            
        max_price = self.request.query_params.get('maxPrice')
        if max_price:
            qs = qs.filter(price__lte=max_price)
            
        sort_by = self.request.query_params.get('sortBy', 'popularity')
        if sort_by == 'price':
            qs = qs.order_by('price')
        else:
            qs = qs.order_by('-date')

        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        serializer = self.get_serializer(page, many=True)
        paginated_res = self.get_paginated_response(serializer.data)
        
        # adding extras
        vendor_id = self.kwargs.get('pk')
        all_qs = VendorPrice.objects.filter(vendor_id=vendor_id).select_related('item')
        categories = list(all_qs.values_list('item__category', flat=True).distinct())
        agg = all_qs.aggregate(min_p=Min('price'), max_p=Max('price'))
        
        return Response({
            'pagination': paginated_res.data['pagination'],
            'categories': [c for c in categories if c],
            'priceRange': {
                'min': float(agg['min_p'] or 0),
                'max': float(agg['max_p'] or 0)
            },
            'products': paginated_res.data['results']
        })

class VendorReviewListView(views.APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, pk):
        from ecommerce.models import VendorReview, Transaction
        from django.utils import timezone
        
        vendor_id = pk
        page = int(request.query_params.get('page', 1))
        
        # Check eligibility silently for request.user
        eligibility = 'ineligible'
        verified_purchase_details = None
        user_review_details = None
        
        user = request.user
        if user and user.is_authenticated:
            # Already reviewed?
            user_review = VendorReview.objects.filter(vendor_id=vendor_id, user=user).first()
            if user_review:
                eligibility = 'already_reviewed'
                # Check 24 hour edit grace window
                can_edit = (timezone.now() - user_review.created_at).total_seconds() < 86400
                expires_in = max(0, int(86400 - (timezone.now() - user_review.created_at).total_seconds()))
                user_review_details = {
                    'id': str(user_review.id),
                    'rating': user_review.rating,
                    'comment': user_review.comment,
                    'createdAt': user_review.created_at.isoformat(),
                    'canEdit': can_edit,
                    'expiresInSeconds': expires_in
                }
            else:
                # Check for a completed purchase
                completed_purchase = Transaction.objects.filter(
                    user=user,
                    vendor_id=vendor_id,
                    status__in=['paid', 'shipped', 'delivered']
                ).select_related('vendor_price__item').first()
                
                if completed_purchase:
                    eligibility = 'eligible'
                    item_name = completed_purchase.vendor_price.item.name if completed_purchase.vendor_price and completed_purchase.vendor_price.item else "Verified Item"
                    date_str = (completed_purchase.paid_at or completed_purchase.created_at).strftime('%B %d, %Y')
                    verified_purchase_details = {
                        'itemName': item_name,
                        'date': date_str
                    }
        
        # Fetch all reviews for this vendor
        reviews_qs = VendorReview.objects.filter(vendor_id=vendor_id).select_related('user')
        total_reviews = reviews_qs.count()
        
        # Calculate distribution counts
        from django.db.models import Count
        dist_counts = reviews_qs.values('rating').annotate(c=Count('id'))
        distribution = {str(i): 0 for i in range(1, 6)}
        for item in dist_counts:
            r = str(item['rating'])
            if r in distribution:
                distribution[r] = item['c']
                
        # Average rating
        avg_rating = 0.0
        if total_reviews > 0:
            avg_rating = sum(r.rating for r in reviews_qs.all()) / total_reviews
            avg_rating = round(avg_rating, 1)
        else:
            try:
                vendor = Vendor.objects.filter(pk=vendor_id).first()
                avg_rating = float(vendor.rating_avg) if vendor else 0.0
            except Exception:
                avg_rating = 0.0
        
        # Paginate results
        page_size = 10
        total_pages = max(1, (total_reviews + page_size - 1) // page_size)
        start = (page - 1) * page_size
        end = start + page_size
        
        paginated_qs = reviews_qs.order_by('-created_at')[start:end]
        
        reviews_list = []
        for r in paginated_qs:
            # Check if this specific review has a completed transaction
            has_purchase = Transaction.objects.filter(
                user=r.user,
                vendor_id=vendor_id,
                status__in=['paid', 'shipped', 'delivered']
            ).exists()
            
            full_name = r.user.full_name or r.user.email
            initial = full_name[0].upper() if full_name else 'U'
            
            reviews_list.append({
                'id': str(r.id),
                'userName': full_name,
                'userInitial': initial,
                'rating': r.rating,
                'comment': r.comment,
                'date': r.created_at.isoformat(),
                'helpfulCount': 0,
                'verifiedPurchase': has_purchase
            })
            
        return Response({
            'pagination': {
                'total_records': total_reviews,
                'total_pages': total_pages,
                'page_size': page_size,
                'current_page': page
            },
            'reviews': reviews_list,
            'averageRating': avg_rating,
            'totalReviews': total_reviews,
            'distribution': distribution,
            'eligibility': eligibility,
            'verifiedPurchaseDetails': verified_purchase_details,
            'userReview': user_review_details
        })


class VendorPriceTrendView(views.APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, pk):
        vendor_id = pk
        prices = list(VendorPrice.objects.filter(vendor_id=vendor_id).values_list('price', flat=True))
        avg_price = sum(prices) / len(prices) if prices else 120.0
        
        weeks = ["Week 1", "Week 2", "Week 3", "Week 4"]
        vendor_prices = [
            round(float(avg_price) * 1.02, 2),
            round(float(avg_price) * 1.01, 2),
            round(float(avg_price) * 0.99, 2),
            round(float(avg_price) * 0.96, 2)
        ]
        market_prices = [
            round(float(avg_price) * 1.10, 2),
            round(float(avg_price) * 1.09, 2),
            round(float(avg_price) * 1.08, 2),
            round(float(avg_price) * 1.07, 2)
        ]
        
        return Response({
            'weeks': weeks,
            'vendorPrices': vendor_prices,
            'marketPrices': market_prices
        })


class VendorSimilarView(views.APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, pk):
        region = request.query_params.get('region', '')
        limit = int(request.query_params.get('limit', 6))
        
        qs = Vendor.objects.filter(is_verified=True).exclude(pk=pk)
        if region:
            qs = qs.filter(city__iexact=region)
            
        qs = qs[:limit]
        
        results = []
        for v in qs:
            items_listed = VendorPrice.objects.filter(vendor=v).count()
            results.append({
                'id': str(v.id),
                'shopName': v.shop_name,
                'imageUrl': v.image.url if v.image else None,
                'rating': float(v.rating_avg),
                'reviewCount': v.rating_count,
                'location': v.address or v.city,
                'itemsListed': items_listed,
                'competitivenessScore': 92,
            })
            
        return Response(results)


from rest_framework.permissions import IsAuthenticated
from users.models import AuditLog
from rest_framework import status
from users.models import Notification, Vendor

class VendorReportView(views.APIView):
    permission_classes = [IsAuthenticated]
    REPORT_SUSPEND_THRESHOLD = 3
    
    def post(self, request, pk):
        reason = request.data.get('reason')
        details = request.data.get('details', '')
        if not reason:
            return Response({'error': 'Reason is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        AuditLog.objects.create(
            actor=request.user,
            action='vendor_report',
            resource='vendor',
            resource_id=str(pk),
            detail={'reason': reason, 'details': details}
        )

        report_count = (
            AuditLog.objects.filter(action='vendor_report', resource='vendor', resource_id=str(pk))
            .values('actor_id')
            .distinct()
            .count()
        )
        vendor = Vendor.objects.filter(pk=pk).first()
        if vendor and report_count >= self.REPORT_SUSPEND_THRESHOLD and vendor.verification_status != 'suspended':
            vendor.is_verified = False
            vendor.verification_status = 'suspended'
            vendor.verification_rejection_reason = f'Auto-suspended after {report_count} unique reports. Latest reason: {reason}'
            vendor.save(update_fields=['is_verified', 'verification_status', 'verification_rejection_reason'])
            Notification.objects.create(
                user=vendor.owner,
                type='vendor_suspended',
                message=f'Your vendor account was temporarily suspended after multiple reports. Reason: {reason}',
            )
            AuditLog.objects.create(
                actor=request.user,
                action='vendor_auto_suspend',
                resource='vendor',
                resource_id=str(pk),
                detail={'report_count': report_count, 'reason': reason},
            )
        
        return Response({'success': True, 'message': 'Report submitted. We\'ll review within 24 hours.'})

