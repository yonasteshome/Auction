from __future__ import annotations

from django.http import Http404
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .catalog import FAMILY_BLUEPRINTS
from .serializers import (
    ActionPlaybookSerializer,
    AtlasEnvelopeSerializer,
    BudgetRuleSerializer,
    CashflowForecastSerializer,
    ComplianceAlertSerializer,
    DeliveryPromiseSerializer,
    DisputeTicketSerializer,
    DynamicPriceRuleSerializer,
    InventoryHealthSerializer,
    MarketplaceBenchmarkSerializer,
    PriceAnomalySerializer,
    ReconciliationSummarySerializer,
    RealtimeEventSerializer,
    RealtimeSubscriptionSerializer,
    RefundRequestSerializer,
    VendorAnalyticsSerializer,
    VendorFunnelSerializer,
    VendorRiskProfileSerializer,
)
from .services import (
    build_family_export,
    build_family_summary,
    build_snapshot,
    build_realtime_status,
    build_operational_playbook,
    build_reconciliation_summary,
    build_vendor_analytics,
    build_vendor_growth_funnel,
    build_vendor_risk_profile,
    build_inventory_health,
    build_market_heatmap,
    build_benchmark_summary,
    detect_compliance_issues,
    detect_price_anomalies,
    recommend_dynamic_pricing,
    build_delivery_promises,
    compare_family_cards,
    family_bundle,
    family_card_detail,
    family_cards,
    list_realtime_events,
    manifest_payload,
    metric_layers,
    narrative_for_family,
    build_cashflow_projection,
    build_tax_ready_summary,
    build_dispute_backlog,
)
from .models import DisputeTicket, RealtimeEvent, RealtimeSubscription, RefundRequest, RecurringBudgetRule


def _parse_id(value):
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return value


class AtlasEndpointView(APIView):
    permission_classes = [AllowAny]
    family = ''
    mode = 'list'

    def get(self, request, *args, **kwargs):
        family_slug = self.family or kwargs.get('family', '')
        key = kwargs.get('key')
        if family_slug and family_slug not in {blueprint['slug'] for blueprint in FAMILY_BLUEPRINTS}:
            raise Http404('Unknown atlas family.')

        if family_slug and self.mode == 'detail':
            card = family_card_detail(family_slug, key or '')
            if not card:
                raise Http404('Unknown atlas card.')
            payload = {
                'family': family_bundle(family_slug),
                'mode': self.mode,
                'title': f"{family_slug.title()} detail",
                'generated_at': build_snapshot().generated_at,
                'snapshot': build_snapshot().as_dict(),
                'items': [card],
                'related': [item for item in family_cards(family_slug) if item['key'] != card['key']][:4],
            }
            return Response(payload)

        if family_slug and self.mode == 'summary':
            payload = {
                'family': family_bundle(family_slug),
                'mode': self.mode,
                'title': f"{family_slug.title()} summary",
                'generated_at': build_snapshot().generated_at,
                'snapshot': build_snapshot().as_dict(),
                'summary': build_family_summary(family_slug),
                'items': family_cards(family_slug),
            }
            return Response(payload)

        if family_slug and self.mode == 'compare':
            payload = {
                'family': family_bundle(family_slug),
                'mode': self.mode,
                'title': f"{family_slug.title()} comparison",
                'generated_at': build_snapshot().generated_at,
                'snapshot': build_snapshot().as_dict(),
                'items': compare_family_cards(family_slug),
            }
            return Response(payload)

        if family_slug and self.mode == 'export':
            return Response(build_family_export(family_slug), status=status.HTTP_200_OK)

        if family_slug:
            payload = {
                'family': family_bundle(family_slug),
                'mode': self.mode,
                'title': f"{family_slug.title()} atlas lane",
                'generated_at': build_snapshot().generated_at,
                'snapshot': build_snapshot().as_dict(),
                'items': family_cards(family_slug),
                'narrative': narrative_for_family(family_slug),
            }
            return Response(payload)

        if self.mode == 'manifest':
            return Response(manifest_payload())

        if self.mode == 'metrics':
            payload = {
                'family': 'system',
                'mode': self.mode,
                'title': 'Atlas metrics',
                'generated_at': build_snapshot().generated_at,
                'snapshot': build_snapshot().as_dict(),
                'items': metric_layers(),
            }
            return Response(payload)

        if self.mode == 'health':
            snapshot = build_snapshot()
            return Response(
                {
                    'status': 'ok',
                    'generated_at': snapshot.generated_at,
                    'snapshot': snapshot.as_dict(),
                }
            )

        if self.mode == 'chronicle':
            snapshot = build_snapshot()
            return Response(
                {
                    'generated_at': snapshot.generated_at,
                    'snapshot': snapshot.as_dict(),
                    'items': [
                        {
                            'chapter': idx,
                            'title': family['title'],
                            'question': family['question'],
                            'highlight': family['highlight'],
                        }
                        for idx, family in enumerate(FAMILY_BLUEPRINTS, start=1)
                    ],
                }
            )

        if self.mode == 'index':
            return Response(
                {
                    'generated_at': build_snapshot().generated_at,
                    'snapshot': build_snapshot().as_dict(),
                    'items': [family_bundle(family['slug']) for family in FAMILY_BLUEPRINTS],
                }
            )

        raise Http404('Unknown atlas mode.')


class VendorAnalyticsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, vendor_id=None, *args, **kwargs):
        payload = build_vendor_analytics(vendor_id=vendor_id)
        if vendor_id and not payload:
            raise Http404('Vendor not found.')
        return Response(payload)


class VendorFunnelView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, vendor_id=None, *args, **kwargs):
        payload = build_vendor_growth_funnel(vendor_id=vendor_id)
        if vendor_id and not payload:
            raise Http404('Vendor not found.')
        return Response(payload)


class VendorRiskProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, vendor_id=None, *args, **kwargs):
        payload = build_vendor_risk_profile(vendor_id=vendor_id)
        if vendor_id and not payload:
            raise Http404('Vendor not found.')
        return Response(payload)


class InventoryHealthView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, vendor_id=None, *args, **kwargs):
        payload = build_inventory_health(vendor_id=vendor_id)
        if vendor_id and not payload:
            raise Http404('Vendor not found.')
        return Response(payload)


class ReconciliationSummaryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, vendor_id=None, *args, **kwargs):
        payload = build_reconciliation_summary(vendor_id=vendor_id)
        return Response(payload)


class BenchmarkSummaryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        city = request.query_params.get('city')
        return Response(build_benchmark_summary(city=city))


class ComplianceAlertsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        vendor_id = request.query_params.get('vendor_id')
        return Response(detect_compliance_issues(vendor_id=vendor_id))


class DynamicPricingView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, vendor_id=None, *args, **kwargs):
        return Response(recommend_dynamic_pricing(vendor_id=vendor_id))


class DeliveryPromiseView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response(build_delivery_promises())


class ActionPlaybookView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response(build_operational_playbook())


class MarketIntelligenceView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response({
            'heatmap': build_market_heatmap(),
            'anomalies': detect_price_anomalies(),
            'coverage': build_snapshot().as_dict(),
        })


class PriceAnomalyView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response(detect_price_anomalies())


class RefundRequestListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        vendor_id = request.query_params.get('vendor_id')
        refund_requests = RefundRequest.objects.filter(vendor__pk=vendor_id) if vendor_id else RefundRequest.objects.all()
        serializer = RefundRequestSerializer(refund_requests, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        serializer = RefundRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        refund = RefundRequest.objects.create(
            requested_by_id=_parse_id(serializer.validated_data.get('requested_by')),
            vendor_id=_parse_id(serializer.validated_data['vendor']),
            transaction_reference=serializer.validated_data['transaction_reference'],
            amount=serializer.validated_data['amount'],
            reason=serializer.validated_data.get('reason', ''),
            status=serializer.validated_data.get('status', 'requested'),
            resolution_note=serializer.validated_data.get('resolution_note', ''),
        )
        return Response(RefundRequestSerializer(refund).data, status=status.HTTP_201_CREATED)


class RefundRequestDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, refund_id):
        try:
            return RefundRequest.objects.get(pk=refund_id)
        except RefundRequest.DoesNotExist:
            raise Http404('Refund request not found.')

    def get(self, request, refund_id, *args, **kwargs):
        refund = self.get_object(refund_id)
        return Response(RefundRequestSerializer(refund).data)

    def patch(self, request, refund_id, *args, **kwargs):
        refund = self.get_object(refund_id)
        serializer = RefundRequestSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        for field, value in serializer.validated_data.items():
            setattr(refund, field, value)
        refund.save()
        return Response(RefundRequestSerializer(refund).data)


class DisputeTicketListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        vendor_id = request.query_params.get('vendor_id')
        disputes = DisputeTicket.objects.filter(vendor__pk=vendor_id) if vendor_id else DisputeTicket.objects.all()
        serializer = DisputeTicketSerializer(disputes, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        serializer = DisputeTicketSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        dispute = DisputeTicket.objects.create(
            reporter_id=_parse_id(serializer.validated_data.get('reporter')),
            vendor_id=_parse_id(serializer.validated_data['vendor']),
            transaction_reference=serializer.validated_data.get('transaction_reference', ''),
            issue_type=serializer.validated_data['issue_type'],
            message=serializer.validated_data['message'],
            status=serializer.validated_data.get('status', 'open'),
            outcome_note=serializer.validated_data.get('outcome_note', ''),
        )
        return Response(DisputeTicketSerializer(dispute).data, status=status.HTTP_201_CREATED)


class DisputeTicketDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, dispute_id):
        try:
            return DisputeTicket.objects.get(pk=dispute_id)
        except DisputeTicket.DoesNotExist:
            raise Http404('Dispute ticket not found.')

    def get(self, request, dispute_id, *args, **kwargs):
        dispute = self.get_object(dispute_id)
        return Response(DisputeTicketSerializer(dispute).data)

    def patch(self, request, dispute_id, *args, **kwargs):
        dispute = self.get_object(dispute_id)
        serializer = DisputeTicketSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        for field, value in serializer.validated_data.items():
            setattr(dispute, field, value)
        dispute.save()
        return Response(DisputeTicketSerializer(dispute).data)


class BudgetRuleView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        rules = RecurringBudgetRule.objects.all()
        serializer = BudgetRuleSerializer(rules, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        serializer = BudgetRuleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        rule = RecurringBudgetRule.objects.create(
            user_id=_parse_id(serializer.validated_data['user']),
            name=serializer.validated_data['name'],
            frequency=serializer.validated_data['frequency'],
            target_total=serializer.validated_data['target_total'],
            category_config=serializer.validated_data.get('category_config', {}),
            next_run=serializer.validated_data.get('next_run'),
            is_active=serializer.validated_data.get('is_active', True),
        )
        return Response(BudgetRuleSerializer(rule).data, status=status.HTTP_201_CREATED)


class CashflowForecastView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id=None, *args, **kwargs):
        payload = build_cashflow_projection(user_id=user_id)
        return Response(CashflowForecastSerializer(payload).data)


class TaxExportView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        user_id = request.query_params.get('user_id')
        year = request.query_params.get('year')
        if year is not None:
            try:
                year = int(year)
            except ValueError:
                year = None
        payload = build_tax_ready_summary(user_id=user_id, year=year)
        return Response(payload)


class RealtimeEventView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        channel = request.query_params.get('channel', 'global')
        return Response(list_realtime_events(channel=channel, limit=50))

    def post(self, request, *args, **kwargs):
        serializer = RealtimeEventSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        event = RealtimeEvent.objects.create(
            event_type=serializer.validated_data['event_type'],
            channel=serializer.validated_data['channel'],
            payload=serializer.validated_data.get('payload', {}),
            owner_id=serializer.validated_data.get('owner_id'),
        )
        return Response(RealtimeEventSerializer({
            'event_id': str(event.id),
            'event_type': event.event_type,
            'channel': event.channel,
            'payload': event.payload,
            'created_at': event.created_at,
            'owner_id': str(event.owner.pk) if event.owner else None,
        }).data, status=status.HTTP_201_CREATED)


class RealtimeSubscriptionView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        subscriptions = RealtimeSubscription.objects.filter(is_active=True)
        serializer = RealtimeSubscriptionSerializer(subscriptions, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        serializer = RealtimeSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        subscription = RealtimeSubscription.objects.create(
            user_id=serializer.validated_data['user'],
            channel=serializer.validated_data['channel'],
            is_active=serializer.validated_data.get('is_active', True),
            last_seen_at=serializer.validated_data.get('last_seen_at'),
        )
        return Response(RealtimeSubscriptionSerializer(subscription).data, status=status.HTTP_201_CREATED)


class RealtimeStatusView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response(build_realtime_status())
