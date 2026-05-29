from rest_framework import serializers
from .models import Vendor, VendorWallet


def _image_url(image_field, request=None):
    """Return an absolute URL for any ImageField / FileField.

    Cloudinary storage returns full https://res.cloudinary.com/… URLs;
    local FileSystemStorage returns relative /media/… paths.
    """
    if not image_field:
        return None
    try:
        url = image_field.url
    except ValueError:
        return None
    if url and url.startswith('http'):
        return url
    if request:
        return request.build_absolute_uri(url)
    return url


class VendorSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    image_url = serializers.SerializerMethodField()
    theme_image_url = serializers.SerializerMethodField()
    business_license_url = serializers.SerializerMethodField()
    wallet_balance = serializers.SerializerMethodField()
    wallet_currency = serializers.SerializerMethodField()
    wallet_updated_at = serializers.SerializerMethodField()

    class Meta:
        model = Vendor
        fields = (
            'id', 'owner', 'owner_name', 'shop_name', 'city', 'address', 'contact_phone',
            'is_verified', 'verification_status', 'tin_number',
            'rating_avg', 'rating_count', 'latitude', 'longitude',
            # Raw file fields (writable)
            'image', 'theme_image', 'business_license',
            # Resolved absolute URL fields (read-only)
            'image_url', 'theme_image_url', 'business_license_url',
            'wallet_balance', 'wallet_currency', 'wallet_updated_at',
            'joined_at',
        )
        read_only_fields = (
            'id', 'owner', 'is_verified', 'rating_avg', 'rating_count',
            'joined_at', 'verification_status',
            'image_url', 'theme_image_url', 'business_license_url',
            'wallet_balance', 'wallet_currency', 'wallet_updated_at',
        )

    def get_image_url(self, obj):
        return _image_url(obj.image, self.context.get('request'))

    def get_theme_image_url(self, obj):
        return _image_url(obj.theme_image, self.context.get('request'))

    def get_business_license_url(self, obj):
        return _image_url(obj.business_license, self.context.get('request'))

    def _get_wallet(self, obj):
        try:
            return obj.wallet
        except VendorWallet.DoesNotExist:
            return None

    def get_wallet_balance(self, obj):
        wallet = self._get_wallet(obj)
        return str(wallet.balance) if wallet else '0.00'

    def get_wallet_currency(self, obj):
        wallet = self._get_wallet(obj)
        return wallet.currency if wallet else 'ETB'

    def get_wallet_updated_at(self, obj):
        wallet = self._get_wallet(obj)
        return wallet.updated_at if wallet else None

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Automatically set to pending if verification documents are provided
        # and current status is not already verified or pending
        if ('business_license' in validated_data or 'tin_number' in validated_data):
            if instance.verification_status not in ['verified', 'pending']:
                validated_data['verification_status'] = 'pending'

        return super().update(instance, validated_data)


class VendorLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ('id', 'shop_name', 'latitude', 'longitude')

