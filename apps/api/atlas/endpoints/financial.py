from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..services import (
    build_budget_forecast,
    build_payment_receipt_summary,
    build_seller_payout_report,
)


class PaymentReceiptSummaryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response(build_payment_receipt_summary())


class BudgetForecastView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response(build_budget_forecast())


class SellerPayoutView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response(build_seller_payout_report())
