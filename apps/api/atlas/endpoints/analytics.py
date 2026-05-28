from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..services import (
    build_category_insights,
    build_seller_segmentation,
    build_vendor_performance,
    build_vendor_score,
    build_vendor_trendline,
    grouped_insight_summary,
    list_insights,
    lookup_insight,
    sample_insight_report,
)


class VendorPerformanceView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, vendor_id=None, *args, **kwargs):
        return Response(build_vendor_performance(vendor_id=vendor_id))


class VendorTrendlineView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, vendor_id=None, *args, **kwargs):
        return Response(build_vendor_trendline(vendor_id=vendor_id))


class VendorScoreView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, vendor_id=None, *args, **kwargs):
        return Response(build_vendor_score(vendor_id=vendor_id))


class SellerSegmentationView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response(build_seller_segmentation())


class CategoryInsightsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response(build_category_insights())


class InsightLookupView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug=None, *args, **kwargs):
        result = lookup_insight(slug or request.query_params.get('slug', ''))
        if slug and not result:
            raise Http404('Insight not found.')
        return Response(result or {'message': 'No insight found', 'slug': slug})


class InsightsListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        category = request.query_params.get('category')
        risk_level = request.query_params.get('risk_level')
        return Response(list_insights(category=category, risk_level=risk_level))


class InsightReportView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        limit = int(request.query_params.get('limit', 10))
        return Response(sample_insight_report(limit=limit))


class InsightGroupView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response(grouped_insight_summary())
