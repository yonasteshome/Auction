from django.urls import path

from . import views

app_name = 'market'

urlpatterns = [
    path('categories/', views.MarketCategoriesView.as_view(), name='market-categories'),
    path('items/<int:pk>/', views.ItemDetailView.as_view(), name='item-detail'),
    path('items/', views.ItemsListView.as_view(), name='items'),
    path('admin/items/', views.AdminItemCreateView.as_view(), name='admin-item-create'),
    path('prices/submit/', views.SubmitPriceView.as_view(), name='price-submit'),
    path('prices/averages/', views.PriceAveragesView.as_view(), name='price-averages'),
    path('prices/my-submissions/', views.MySubmissionsListView.as_view(), name='my-submissions'),
    path('prices/my-submissions/<int:pk>/', views.MySubmissionDetailView.as_view(), name='my-submission-detail'),
    path('prices/contributor-stats/', views.ContributorStatsView.as_view(), name='contributor-stats'),
    path('prices/item-averages/', views.ItemAveragesView.as_view(), name='item-averages'),
    path('trends/', views.PriceTrendsView.as_view(), name='price-trends'),
    path('forecasts/', views.PriceForecastsView.as_view(), name='price-forecasts'),
    path('inflation/', views.InflationView.as_view(), name='inflation'),
    path('national-prices/', views.NationalPriceListView.as_view(), name='national-prices'),
    path('prices/geo/', views.GeoSubmissionsView.as_view(), name='prices-geo'),
    path('admin/submissions/', views.AdminPendingSubmissionsView.as_view(), name='admin-submissions-pending'),
    path('admin/submissions/<int:pk>/', views.AdminSubmissionDetailView.as_view(), name='admin-submission-detail'),
    path('admin/submissions/<int:pk>/approve/', views.AdminSubmissionApproveView.as_view(), name='admin-submission-approve'),
    path('admin/submissions/<int:pk>/reject/', views.AdminSubmissionRejectView.as_view(), name='admin-submission-reject'),
    path('admin/moderation-stats/', views.AdminModerationStatsView.as_view(), name='admin-moderation-stats'),
]

# Import new views
from .vendor_views import VendorListView, VendorLocationListView, ItemVendorPricesView
urlpatterns.extend([
    path('vendors/', VendorListView.as_view(), name='vendors-list'),
    path('vendors/locations/', VendorLocationListView.as_view(), name='vendors-locations-list'),
    path('vendors/prices/', ItemVendorPricesView.as_view(), name='vendors-prices-list'),
])


from .vendor_views import VendorDetailView, VendorProductListView, VendorReviewListView, VendorPriceTrendView, VendorSimilarView, VendorReportView
urlpatterns.extend([
    path('vendors/<uuid:pk>/', VendorDetailView.as_view(), name='vendor-detail'),
    path('vendors/<uuid:pk>/products/', VendorProductListView.as_view(), name='vendor-products'),
    path('vendors/<uuid:pk>/reviews/', VendorReviewListView.as_view(), name='vendor-reviews'),
    path('vendors/<uuid:pk>/price-trend/', VendorPriceTrendView.as_view(), name='vendor-price-trend'),
    path('vendors/<uuid:pk>/similar/', VendorSimilarView.as_view(), name='vendor-similar'),
    path('vendors/<uuid:pk>/reports/', VendorReportView.as_view(), name='vendor-report'),
])

from .views import PriceAlertListCreateView, PriceAlertDestroyView
urlpatterns.extend([
    path('price-alerts/', PriceAlertListCreateView.as_view(), name='price-alert-list-create'),
    path('price-alerts/<int:pk>/', PriceAlertDestroyView.as_view(), name='price-alert-destroy'),
])
