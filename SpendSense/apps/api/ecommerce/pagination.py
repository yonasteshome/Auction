from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'pagination': {
                'total_records': self.page.paginator.count,
                'total_pages': self.page.paginator.num_pages,
                'page_size': self.page.paginator.per_page,
                'current_page': self.page.number
            },
            'results': data
        })
