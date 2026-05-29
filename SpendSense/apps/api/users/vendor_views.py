from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django.http import Http404
from django.utils.decorators import method_decorator
from drf_yasg.utils import swagger_auto_schema
from .models import Vendor
from .vendor_serializers import VendorSerializer

class VendorRequestView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = VendorSerializer

    def perform_create(self, serializer):
        vendor = serializer.save()
        user = self.request.user
        if user.role != 'vendor':
            user.role = 'vendor'
            user.save(update_fields=['role'])

@method_decorator(name='put', decorator=swagger_auto_schema(
    operation_description="Update vendor profile completely. Supports file uploads for image and theme_image.",
    consumes=['multipart/form-data'],
))
@method_decorator(name='patch', decorator=swagger_auto_schema(
    operation_description="Update vendor profile partially. Supports file uploads for image and theme_image.",
    consumes=['multipart/form-data'],
))
class VendorUpdateView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = VendorSerializer

    def get_object(self):
        user = self.request.user
        if getattr(self, 'swagger_fake_view', False) or not user.is_authenticated:
            return Vendor()
        
        # 1. Try to get existing vendor first
        vendor = Vendor.objects.filter(owner=user).first()
        if vendor:
            if vendor.verification_status == 'suspended':
                raise PermissionDenied('This vendor account has been suspended by an administrator.')
            # Ensure the user has the 'vendor' role if they have a vendor record
            if user.role == 'user':
                user.role = 'vendor'
                user.save(update_fields=['role'])
            return vendor
            
        # 2. If not found, create a default record. 
        # This prevents 404 errors and supports automatic vendor onboarding.
        vendor, created = Vendor.objects.get_or_create(
            owner=user,
            defaults={
                'shop_name': user.full_name or "My Business",
                'city': user.city or "Addis Ababa",
                'contact_phone': user.phone or ""
            }
        )
        
        # Ensure user role is updated
        if user.role == 'user':
            user.role = 'vendor'
            user.save(update_fields=['role'])
            
        return vendor

class VendorVerifyRequestView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = VendorSerializer

    def get_object(self):
        user = self.request.user
        vendor, created = Vendor.objects.get_or_create(
            owner=user,
            defaults={
                'shop_name': user.full_name or "My Business",
                'city': user.city or "Addis Ababa",
                'contact_phone': user.phone or ""
            }
        )
        if user.role == 'user':
            user.role = 'vendor'
            user.save(update_fields=['role'])
        if vendor.verification_status == 'suspended':
            raise PermissionDenied('This vendor account has been suspended by an administrator.')
        return vendor

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True) # allow partial updates
        instance = self.get_object()
        if instance.verification_status == 'suspended':
            return Response(
                {'detail': 'This vendor account has been suspended by an administrator.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        # Update verification_status to "requested"
        serializer.validated_data['verification_status'] = 'requested'
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)
