from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..services import (
    build_market_share,
    build_market_trends,
    build_narrative_digest,
    build_peak_demand,
    build_seasonal_forecast,
)


class MarketShareView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response(build_market_share())


class MarketTrendsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response(build_market_trends())


class SeasonalForecastView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response(build_seasonal_forecast())


class PeakDemandView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response(build_peak_demand())


class NarrativeDigestView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response(build_narrative_digest())
