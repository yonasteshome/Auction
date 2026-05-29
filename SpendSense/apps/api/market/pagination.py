from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
import math
from django.core.paginator import Paginator
from rest_framework.exceptions import NotFound

class CustomMarketPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        """Paginate the queryset but do not raise 404 on out-of-range pages.

        If the requested page is beyond the last page, return an empty list
        and set a lightweight page object so `get_paginated_response` can
        still build a response with correct totals and the requested page
        number.
        """
        self.request = request
        page_size = self.get_page_size(request)
        if not page_size:
            return None

        paginator = Paginator(queryset, page_size)
        page_number = request.query_params.get(self.page_query_param, 1)

        try:
            # try to get the requested page
            page_obj = paginator.page(page_number)
        except Exception:
            # On invalid/out-of-range page requests, produce an empty page-like object
            class _EmptyPage:
                def __init__(self, paginator, number):
                    self.paginator = paginator
                    self.number = int(number) if str(number).isdigit() else 1
                    self.object_list = []

            page_obj = _EmptyPage(paginator, page_number)

        self.page = page_obj
        # allow template logic to know there are multiple pages
        if paginator.num_pages > 1:
            self.display_page_controls = True

        return list(self.page.object_list)

    def get_page_size(self, request):
        """Allow both `page_size` and `pageSize` query params for compatibility."""
        if not self.page_size_query_param:
            return None
        raw = request.query_params.get(self.page_size_query_param) or request.query_params.get('pageSize')
        if raw is None:
            return self.page_size
        try:
            val = int(raw)
            return val if val > 0 else self.page_size
        except Exception:
            return self.page_size

    def get_paginated_response(self, data):
        total_records = self.page.paginator.count
        page_size = self.get_page_size(self.request)
        total_pages = math.ceil(total_records / page_size) if total_records > 0 else 1

        return Response({
            'pagination': {
                'total_records': total_records,
                'total_pages': total_pages,
                'page_size': page_size,
                'current_page': self.page.number
            },
            'results': data
        })
