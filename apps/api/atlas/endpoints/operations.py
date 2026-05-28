from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..services import (
    build_channel_health,
    build_event_audit,
    build_logistics_alerts,
    build_payment_latency_summary,
    build_shipment_latency_summary,
)


class PaymentLatencyView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response(build_payment_latency_summary())


class ShipmentLatencyView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response(build_shipment_latency_summary())


class LogisticsAlertsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response(build_logistics_alerts())


class ChannelHealthView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response(build_channel_health())


class EventAuditView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response(build_event_audit())
