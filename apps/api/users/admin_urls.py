from django.urls import path

from .admin_views import AdminAuditListView, AdminDashboardView, AdminSettingsView

urlpatterns = [
    path('dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('settings/', AdminSettingsView.as_view(), name='admin-settings'),
    path('audit/', AdminAuditListView.as_view(), name='admin-audit'),
]
