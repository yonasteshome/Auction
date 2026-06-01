"""
URL configuration for core_api project.
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework_simplejwt.views import TokenRefreshView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from users.views import EmailTokenObtainPairView, LogoutView
from market.views import AdminMLMonitoringView, AdminMLRetrainView, AdminMLStatusView

schema_view = get_schema_view(
    openapi.Info(
        title='MarketSight API',
        default_version='v1',
        description='MarketSight — Local Market Insights & Budgeting API',
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
    authentication_classes=(),  # schema endpoints work without JWT
)

urlpatterns = [
    path('admin/', admin.site.urls),
    # Swagger / OpenAPI
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    # JWT auth (accepts email + password)
    path('api/auth/token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/logout/', LogoutView.as_view(), name='token_logout'),
    # API apps
    path('api/humans/', include('users.urls')),
    path('api/hq/', include('users.admin_urls')),
    path('api/hq/ml/retrain/', AdminMLRetrainView.as_view(), name='admin-ml-retrain'),
    path('api/hq/ml/status/', AdminMLStatusView.as_view(), name='admin-ml-status'),
    path('api/hq/ml/monitoring/', AdminMLMonitoringView.as_view(), name='admin-ml-monitoring'),
    path('api/marketplace/', include('market.urls')),
    path('api/treasury/', include('finance.urls')),
    path('api/shop/', include('ecommerce.urls')),
    path('api/atlas/', include('atlas.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
