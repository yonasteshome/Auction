from django.urls import path

from . import views

app_name = 'ecommerce'

urlpatterns = [
    path('vendors/<uuid:vendor_id>/reviews/', views.VendorReviewListCreateView.as_view(), name='vendor-reviews'),
    path('reviews/<int:pk>/', views.VendorReviewDetailView.as_view(), name='review-detail'),
    path('vendors/<uuid:vendor_id>/listings/', views.VendorListingListCreateView.as_view(), name='vendor-listings'),
    path('vendors/<uuid:vendor_id>/categories/', views.VendorCategoriesView.as_view(), name='vendor-categories'),
    path('vendors/<uuid:pk>/', views.VendorDetailView.as_view(), name='vendor-detail'),
    path('vendors/', views.VendorRegisterView.as_view(), name='vendor-register'),
    path('listings/<int:pk>/', views.VendorListingUpdateView.as_view(), name='listing-detail'),
    path('recommendations/', views.RecommendationsView.as_view(), name='recommendations'),
    path('purchases/kpi-summary/', views.PurchaseKPISummaryView.as_view(), name='purchase-kpi-summary'),
    path('purchases/<uuid:pk>/', views.PurchaseDetailView.as_view(), name='purchase-detail'),
    path('purchases/<uuid:pk>/status/', views.PurchaseStatusUpdateView.as_view(), name='purchase-status'),
    path('purchases/', views.PurchaseListCreateView.as_view(), name='purchase-list'),
    path('vendor/sales/', views.VendorSalesListView.as_view(), name='vendor-sales-list'),
    path('vendor/sales/<uuid:pk>/', views.VendorSalesDetailView.as_view(), name='vendor-sales-detail'),
    # Accept webhook POSTs both with and without trailing slash to avoid APPEND_SLASH POST redirect errors
    path('webhooks/payment', views.PaymentWebhookView.as_view(), name='payment-webhook-no-slash'),
    path('webhooks/payment/', views.PaymentWebhookView.as_view(), name='payment-webhook'),
    path('admin/vendors/<uuid:pk>/verify/', views.AdminVendorVerifyView.as_view(), name='admin-vendor-verify'),
    path('admin/vendors/<uuid:pk>/reject/', views.AdminVendorRejectView.as_view(), name='admin-vendor-reject'),
    path('admin/vendors/<uuid:pk>/suspend/', views.AdminVendorSuspendView.as_view(), name='admin-vendor-suspend'),
    path('admin/vendors/<uuid:pk>/restore/', views.AdminVendorRestoreView.as_view(), name='admin-vendor-restore'),
    path('admin/vendors/', views.AdminVendorListView.as_view(), name='admin-vendor-list'),
]
