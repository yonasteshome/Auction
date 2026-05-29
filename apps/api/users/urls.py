from django.urls import path

from . import views

app_name = 'users'

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path(
        'password/reset/request/',
        views.PasswordResetRequestView.as_view(),
        name='password-reset-request',
    ),
    path(
        'password/reset/confirm/',
        views.PasswordResetConfirmView.as_view(),
        name='password-reset-confirm',
    ),
    path(
        'password/change/',
        views.PasswordChangeView.as_view(),
        name='password-change',
    ),
    path('me/notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('me/notifications/bulk/', views.NotificationBulkUpdateView.as_view(), name='notification-bulk'),
    path('me/notifications/<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    path('me/dashboard/', views.UserDashboardView.as_view(), name='user-dashboard'),
    path('me/', views.MeView.as_view(), name='me'),
    path('me/vendor-wallet/', views.VendorWalletView.as_view(), name='vendor-wallet'),
    path('me/wallet/withdrawals/', views.VendorPayoutListCreateView.as_view(), name='vendor-payout-list-create'),
    path('preferences/', views.UserPreferencesView.as_view(), name='user-preferences'),
    path('admin/users/stats/', views.AdminUserStatsView.as_view(), name='admin-user-stats'),
    path('admin/users/<uuid:pk>/', views.AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/users/<uuid:pk>/suspend/', views.AdminUserSuspendView.as_view(), name='admin-user-suspend'),
    path('admin/users/<uuid:pk>/restore/', views.AdminUserRestoreView.as_view(), name='admin-user-restore'),
    path('admin/users/', views.AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/payouts/', views.AdminPayoutListView.as_view(), name='admin-payout-list'),
    path('admin/payouts/<uuid:pk>/action/', views.AdminPayoutActionView.as_view(), name='admin-payout-action'),
]

from .vendor_views import VendorRequestView, VendorUpdateView, VendorVerifyRequestView
urlpatterns.extend([
    path('vendors/request/', VendorRequestView.as_view(), name='vendor-request'),
    path('vendors/me/', VendorUpdateView.as_view(), name='vendor-update'),
    path('vendors/verify/', VendorVerifyRequestView.as_view(), name='vendor-verify-request'),
])
