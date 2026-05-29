

from rest_framework import serializers
from users.models import Vendor
from .models import VendorPrice

class MarketVendorListCardSerializer(serializers.ModelSerializer):
    vendorName = serializers.CharField(source='owner.full_name', read_only=True)
    shopName = serializers.CharField(source='shop_name')
    location = serializers.CharField(source='address')
    region = serializers.CharField(source='city')
    rating = serializers.FloatField(source='rating_avg')
    reviewCount = serializers.IntegerField(source='rating_count')
    verifiedStatus = serializers.SerializerMethodField()
    contactInfo = serializers.CharField(source='contact_phone')
    itemsListed = serializers.SerializerMethodField()
    priceRangeMin = serializers.SerializerMethodField()
    priceRangeMax = serializers.SerializerMethodField()
    imageUrl = serializers.SerializerMethodField()
    topItems = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='joined_at')
    competitivenessScore = serializers.SerializerMethodField()

    class Meta:
        model = Vendor
        fields = (
            'id', 'vendorName', 'shopName', 'location', 'region',
            'latitude', 'longitude', 'rating', 'reviewCount', 'competitivenessScore',
            'verifiedStatus', 'contactInfo', 'itemsListed', 'priceRangeMin',
            'priceRangeMax', 'topItems', 'imageUrl', 'createdAt'
        )

    def get_verifiedStatus(self, obj):
        return "Verified" if obj.is_verified else "Unverified"

    def get_itemsListed(self, obj):
        return VendorPrice.objects.filter(vendor=obj).count()

    def get_priceRangeMin(self, obj):
        prices = VendorPrice.objects.filter(vendor=obj).values_list('price', flat=True)
        return min(prices) if prices else 0

    def get_priceRangeMax(self, obj):
        prices = VendorPrice.objects.filter(vendor=obj).values_list('price', flat=True)
        return max(prices) if prices else 0

    def get_topItems(self, obj):
        top_prices = VendorPrice.objects.filter(vendor=obj).select_related('item')[:3]
        return [
            {
                "itemName": vp.item.name,
                "price": vp.price,
                "unit": vp.item.unit
            }
            for vp in top_prices
        ]

    def get_imageUrl(self, obj):
        if obj.image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None

    def get_competitivenessScore(self, obj):
        return 90  # Default or simple calculation
