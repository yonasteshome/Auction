from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Notification, User, Vendor, VendorWallet, VendorWalletEntry


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'full_name', 'role', 'is_active', 'created_at')
    list_filter = ('role', 'is_active')
    search_fields = ('email', 'full_name', 'phone')
    ordering = ('-created_at',)
    filter_horizontal = ()
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal', {'fields': ('full_name', 'phone', 'city', 'household_size', 'income_bracket')}),
        ('Role', {'fields': ('role',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'password1', 'password2'),
        }),
    )


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('shop_name', 'owner', 'city', 'joined_at')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'is_read', 'created_at')


@admin.register(VendorWallet)
class VendorWalletAdmin(admin.ModelAdmin):
    list_display = ('vendor', 'balance', 'currency', 'updated_at')
    search_fields = ('vendor__shop_name', 'vendor__owner__email')


@admin.register(VendorWalletEntry)
class VendorWalletEntryAdmin(admin.ModelAdmin):
    list_display = ('wallet', 'transaction_reference', 'entry_type', 'amount', 'balance_after', 'created_at')
    search_fields = ('transaction_reference', 'wallet__vendor__shop_name')
