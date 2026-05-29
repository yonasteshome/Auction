from datetime import timedelta

from django.db.models import Avg, Q
from django.utils import timezone
from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core_api.permissions import IsAdminRole
from market.models import PriceSubmission
from ecommerce.models import VendorReview

from .models import AuditLog, SystemSetting, User, Vendor


class SystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = ('key', 'value', 'updated_by', 'updated_at')
        read_only_fields = ('updated_by', 'updated_at')


class AdminSettingsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        rows = SystemSetting.objects.all().order_by('key')
        return Response(SystemSettingSerializer(rows, many=True).data)

    def patch(self, request):
        payload = request.data if isinstance(request.data, list) else [request.data]
        out = []
        for item in payload:
            key = item.get('key')
            if not key:
                continue
            row, _ = SystemSetting.objects.get_or_create(key=key)
            row.value = item.get('value', {})
            row.updated_by = request.user
            row.save()
            out.append(row)
            AuditLog.objects.create(
                actor=request.user,
                action='admin_setting_patch',
                resource='system_setting',
                resource_id=key,
                detail={'value': row.value},
            )
        return Response(SystemSettingSerializer(out, many=True).data)


class AdminAuditListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        limit = min(int(request.query_params.get('limit', 100)), 500)
        rows = AuditLog.objects.select_related('actor').order_by('-created_at')[:limit]
        return Response(
            [
                {
                    'id': r.id,
                    'actor_id': str(r.actor_id) if r.actor_id else None,
                    'action': r.action,
                    'resource': r.resource,
                    'resource_id': r.resource_id,
                    'detail': r.detail,
                    'created_at': r.created_at,
                }
                for r in rows
            ]
        )


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        today = timezone.localdate()
        start_date = today - timedelta(days=6)

        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()

        total_vendors = Vendor.objects.count()
        verified_vendors = Vendor.objects.filter(Q(is_verified=True) | Q(verification_status='verified')).count()
        pending_vendors = Vendor.objects.filter(verification_status__in=['requested', 'pending']).count()
        suspended_vendors = Vendor.objects.filter(verification_status='suspended').count()
        rejected_vendors = Vendor.objects.filter(
            Q(verification_status='rejected')
            | Q(verification_status='suspended')
            | (Q(verification_rejection_reason__isnull=False) & ~Q(verification_rejection_reason=''))
        ).count()

        price_flags_today = PriceSubmission.objects.filter(created_at__date=today).filter(
            Q(outlier_flag=True) | Q(status='rejected')
        ).count()
        total_reviews = VendorReview.objects.count()
        average_rating = VendorReview.objects.aggregate(avg=Avg('rating'))['avg'] or 0

        activity_trend = []
        for offset in range(6, -1, -1):
            day = start_date + timedelta(days=offset)
            activity_trend.append(
                {
                    'date': day.isoformat(),
                    'label': day.strftime('%a'),
                    'users': User.objects.filter(created_at__date=day).count(),
                    'vendors': Vendor.objects.filter(joined_at__date=day).count(),
                    'flags': PriceSubmission.objects.filter(created_at__date=day).filter(
                        Q(outlier_flag=True) | Q(status='rejected')
                    ).count(),
                    'suspensions': AuditLog.objects.filter(action='vendor_suspend', created_at__date=day).count(),
                    'reviews': VendorReview.objects.filter(created_at__date=day).count(),
                }
            )

        recent_activity = [
            {
                'id': row.id,
                'actor_name': row.actor.full_name if row.actor else None,
                'action': row.action,
                'resource': row.resource,
                'resource_id': row.resource_id,
                'detail': row.detail,
                'created_at': row.created_at,
            }
            for row in AuditLog.objects.select_related('actor').order_by('-created_at')[:8]
        ]

        top_rated_vendors = [
            {
                'id': str(v.id),
                'shop_name': v.shop_name,
                'city': v.city,
                'rating_avg': str(v.rating_avg),
                'rating_count': v.rating_count,
                'is_verified': v.is_verified,
                'verification_status': v.verification_status,
            }
            for v in Vendor.objects.order_by('-rating_avg', '-rating_count', '-joined_at')[:20]
        ]

        least_rated_vendors = [
            {
                'id': str(v.id),
                'shop_name': v.shop_name,
                'city': v.city,
                'rating_avg': str(v.rating_avg),
                'rating_count': v.rating_count,
                'is_verified': v.is_verified,
                'verification_status': v.verification_status,
            }
            for v in Vendor.objects.order_by('rating_avg', '-rating_count', 'joined_at')[:10]
        ]

        return Response(
            {
                'stats': {
                    'total_users': total_users,
                    'active_users': active_users,
                    'total_vendors': total_vendors,
                    'verified_vendors': verified_vendors,
                    'pending_vendors': pending_vendors,
                    'rejected_vendors': rejected_vendors,
                    'suspended_vendors': suspended_vendors,
                    'price_flags_today': price_flags_today,
                    'total_reviews': total_reviews,
                    'average_rating': round(float(average_rating), 2),
                },
                'activity_trend': activity_trend,
                'recent_activity': recent_activity,
                'top_rated_vendors': top_rated_vendors,
                'least_rated_vendors': least_rated_vendors,
            }
        )
