from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta

from .models import Item, PriceSubmission


def _image_url(image_field, request=None):
    """Return an absolute URL for any ImageField.

    Cloudinary storage already returns a full https://res.cloudinary.com/…
    URL from `.url`, so we must NOT wrap it with build_absolute_uri.
    For local FileSystemStorage the URL is relative (e.g. /media/…) and we
    DO need build_absolute_uri to make it usable by the frontend.
    """
    if not image_field:
        return None
    try:
        url = image_field.url
    except ValueError:
        return None
    if url and url.startswith('http'):
        # Already an absolute URL (Cloudinary, S3, etc.) – return as-is.
        return url
    # Relative local path – make absolute using the request.
    if request:
        return request.build_absolute_uri(url)
    return url


class ItemSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = ('id', 'name', 'category', 'unit', 'description', 'image', 'image_url')

    def get_image_url(self, obj):
        img = obj.image
        if not img:
            from .models import VendorPrice
            first_vp = VendorPrice.objects.filter(item=obj, image__isnull=False).exclude(image='').first()
            if first_vp:
                img = first_vp.image
        return _image_url(img, self.context.get('request'))


class AdminItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ('id', 'name', 'category', 'unit', 'description', 'image')
        read_only_fields = ('id',)

    def validate_name(self, value):
        normalized = value.strip()
        if Item.objects.filter(name__iexact=normalized).exists():
            raise serializers.ValidationError('An item with this name already exists.')
        return normalized

    def validate_category(self, value):
        return value.strip()

    def validate_unit(self, value):
        return value.strip()


class PriceSubmissionSerializer(serializers.ModelSerializer):
    item_id = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all(), source='item')
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_category = serializers.CharField(source='item.category', read_only=True)
    outlier_warning = serializers.SerializerMethodField()

    class Meta:
        model = PriceSubmission
        fields = (
            'id', 'item_id', 'item_name', 'item_category',
            'price_value', 'unit', 'market_location', 'city', 'vendor_name',
            'date_observed', 'time_observed', 'quality_grade',
            'quantity_available', 'notes',
            'status', 'rejection_reason', 'outlier_flag',
            'image', 'latitude', 'longitude', 'created_at', 'outlier_warning',
        )
        read_only_fields = ('id', 'status', 'rejection_reason', 'outlier_flag', 'created_at')

    def get_outlier_warning(self, obj):
        return getattr(obj, '_outlier_warning', None)

    def validate_date_observed(self, value):
        today = timezone.now().date()
        max_past = today - timedelta(days=7)
        if value > today:
            raise serializers.ValidationError("Future dates are not allowed.")
        if value < max_past:
            raise serializers.ValidationError("Observation date must be within the last 7 days.")
        return value

    def validate_price_value(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be a positive number.")
        if value > 999999:
            raise serializers.ValidationError("Price cannot exceed 999,999 ETB.")
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        # Copy item unit as default if not provided
        item = validated_data.get('item')
        if not validated_data.get('unit') and item:
            validated_data['unit'] = item.unit
        return super().create(validated_data)


class MySubmissionSerializer(serializers.ModelSerializer):
    """Serializer for listing the current user's own submissions."""
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_category = serializers.CharField(source='item.category', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PriceSubmission
        fields = (
            'id', 'item_name', 'item_category',
            'price_value', 'unit', 'market_location', 'city', 'vendor_name',
            'date_observed', 'time_observed', 'quality_grade',
            'quantity_available', 'notes',
            'status', 'rejection_reason', 'outlier_flag',
            'image_url', 'created_at',
        )

    def get_image_url(self, obj):
        return _image_url(obj.image, self.context.get('request'))


class AdminSubmissionListSerializer(serializers.ModelSerializer):
    """Admin queue: includes submitter identity."""
    item_name = serializers.CharField(source='item.name', read_only=True)
    submitter_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = PriceSubmission
        fields = (
            'id', 'item', 'item_name', 'price_value', 'unit', 'market_location', 'city',
            'vendor_name', 'date_observed', 'time_observed', 'quality_grade',
            'quantity_available', 'notes', 'status', 'rejection_reason', 'outlier_flag',
            'image', 'created_at', 'submitter_email',
        )


class AdminSubmissionUpdateSerializer(serializers.ModelSerializer):
    """Admin may correct fields before approve."""
    item = serializers.PrimaryKeyRelatedField(
        queryset=Item.objects.all(), required=False,
    )

    class Meta:
        model = PriceSubmission
        fields = (
            'item', 'price_value', 'unit', 'market_location', 'city', 'vendor_name',
            'date_observed', 'time_observed', 'quality_grade', 'quantity_available',
            'notes', 'status', 'rejection_reason', 'outlier_flag', 'image',
        )


from .models import VendorPrice


class VendorPriceSerializer(serializers.ModelSerializer):
    vendor_id = serializers.UUIDField(source='vendor.id', read_only=True)
    vendor_name = serializers.CharField(source='vendor.shop_name', read_only=True)
    city = serializers.CharField(source='vendor.city', read_only=True)
    rating_avg = serializers.DecimalField(source='vendor.rating_avg', max_digits=3, decimal_places=2, read_only=True)
    is_verified = serializers.BooleanField(source='vendor.is_verified', read_only=True)
    description = serializers.CharField(read_only=True)
    variant = serializers.CharField(read_only=True)
    base_price = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True, read_only=True)
    
    item = serializers.PrimaryKeyRelatedField(read_only=True)
    item_name = serializers.CharField(source='item.name', read_only=True)
    unit = serializers.CharField(source='item.unit', read_only=True)
    category = serializers.CharField(source='item.category', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = VendorPrice
        fields = (
            'id', 'vendor_id', 'vendor_name', 'city', 'rating_avg', 'is_verified',
            'description', 'variant', 'price', 'base_price', 'date', 'stock_count',
            'item', 'item_name', 'unit', 'category', 'image_url',
        )
        ref_name = "MarketVendorPrice"

    def get_image_url(self, obj):
        request = self.context.get('request')
        img = obj.image or (obj.item.image if obj.item else None)
        return _image_url(img, request)


from users.models import Vendor


class MarketVendorListCardSerializer(serializers.ModelSerializer):
    vendorName = serializers.CharField(source='owner.full_name', read_only=True)
    shopName = serializers.CharField(source='shop_name', read_only=True)
    location = serializers.CharField(source='address', read_only=True)
    region = serializers.CharField(source='city', read_only=True)
    rating = serializers.FloatField(source='rating_avg', read_only=True)
    reviewCount = serializers.IntegerField(source='rating_count', read_only=True)
    verifiedStatus = serializers.SerializerMethodField()
    contactInfo = serializers.CharField(source='contact_phone', read_only=True)
    itemsListed = serializers.SerializerMethodField()
    priceRangeMin = serializers.SerializerMethodField()
    priceRangeMax = serializers.SerializerMethodField()
    imageUrl = serializers.SerializerMethodField()
    topItems = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='joined_at', read_only=True)
    competitivenessScore = serializers.SerializerMethodField()
    priceForSearchedItem = serializers.SerializerMethodField()

    class Meta:
        model = Vendor
        fields = (
            'id', 'vendorName', 'shopName', 'location', 'region',
            'latitude', 'longitude', 'rating', 'reviewCount', 'competitivenessScore',
            'verifiedStatus', 'contactInfo', 'itemsListed', 'priceRangeMin',
            'priceRangeMax', 'topItems', 'imageUrl', 'createdAt', 'priceForSearchedItem'
        )

    def get_verifiedStatus(self, obj):
        return "Verified" if obj.is_verified else "Unverified"

    def get_itemsListed(self, obj):
        return VendorPrice.objects.filter(vendor=obj).count()

    def get_priceRangeMin(self, obj):
        prices = VendorPrice.objects.filter(vendor=obj).values_list('price', flat=True)
        return float(min(prices)) if prices else 0.0

    def get_priceRangeMax(self, obj):
        prices = VendorPrice.objects.filter(vendor=obj).values_list('price', flat=True)
        return float(max(prices)) if prices else 0.0

    def get_topItems(self, obj):
        top_prices = VendorPrice.objects.filter(vendor=obj).select_related('item').order_by('price')[:3]
        return [
            {
                "itemName": vp.item.name,
                "price": float(vp.price),
                "unit": getattr(vp.item, 'unit', '')
            }
            for vp in top_prices
        ]

    def get_imageUrl(self, obj):
        return _image_url(obj.image, self.context.get('request'))

    def get_competitivenessScore(self, obj):
        return 95  # Static for now as requested

    def get_priceForSearchedItem(self, obj):
        q = self.context.get('q')
        if not q:
            return None
        if hasattr(obj, 'searched_price') and obj.searched_price is not None:
            return float(obj.searched_price)
            
        prices = VendorPrice.objects.filter(vendor=obj, item__name__icontains=q).values_list('price', flat=True)
        if prices:
            return float(min(prices))
        return None


class VendorDetailSerializer(MarketVendorListCardSerializer):
    description = serializers.SerializerMethodField()
    businessHours = serializers.SerializerMethodField()
    deliveryAvailable = serializers.SerializerMethodField()
    deliveryEstimate = serializers.SerializerMethodField()
    paymentMethods = serializers.SerializerMethodField()
    totalSales = serializers.SerializerMethodField()
    memberSince = serializers.DateTimeField(source='joined_at', read_only=True)
    responseTimeMinutes = serializers.SerializerMethodField()
    socialLinks = serializers.SerializerMethodField()

    class Meta(MarketVendorListCardSerializer.Meta):
        fields = MarketVendorListCardSerializer.Meta.fields + (
            'description', 'businessHours', 'deliveryAvailable', 'deliveryEstimate',
            'paymentMethods', 'totalSales', 'memberSince', 'responseTimeMinutes', 'socialLinks'
        )

    def get_description(self, obj):
        return f"{obj.shop_name} is a trusted vendor in {obj.city}. We provide high-quality items with excellent customer service."

    def get_businessHours(self, obj):
        return "Mon - Sat: 8:00 AM - 6:00 PM"

    def get_deliveryAvailable(self, obj):
        return True

    def get_deliveryEstimate(self, obj):
        return "1 - 2 days"

    def get_paymentMethods(self, obj):
        return ["Chapa", "Cash on Delivery", "Telebirr"]

    def get_totalSales(self, obj):
        return getattr(obj, 'rating_count', 0) * 12 + 50

    def get_responseTimeMinutes(self, obj):
        return 15

    def get_socialLinks(self, obj):
        return {"facebook": "#", "telegram": "#"}


class VendorProductSerializer(serializers.ModelSerializer):
    itemId = serializers.CharField(source='item.id', read_only=True)
    itemName = serializers.CharField(source='item.name', read_only=True)
    category = serializers.CharField(source='item.category', read_only=True)
    imageUrl = serializers.SerializerMethodField()
    unit = serializers.CharField(source='item.unit', read_only=True)
    description = serializers.CharField(read_only=True)
    variant = serializers.CharField(read_only=True)
    basePrice = serializers.DecimalField(source='base_price', max_digits=10, decimal_places=2, allow_null=True, read_only=True)
    comparePrice = serializers.SerializerMethodField()
    stockStatus = serializers.SerializerMethodField()
    stockQuantity = serializers.SerializerMethodField()
    priceTrend = serializers.SerializerMethodField()
    nationalAveragePrice = serializers.SerializerMethodField()
    nationalAverageDiff = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='date', read_only=True)
    updatedAt = serializers.DateTimeField(source='date', read_only=True)

    class Meta:
        model = VendorPrice
        fields = (
            'id', 'itemId', 'itemName', 'category', 'imageUrl', 'description', 'variant', 'price', 'basePrice', 'unit',
            'comparePrice', 'stockStatus', 'stockQuantity', 'priceTrend',
            'nationalAveragePrice', 'nationalAverageDiff', 'createdAt', 'updatedAt'
        )

    def get_imageUrl(self, obj):
        # Prefer the listing-specific image; fall back to the item's catalogue image.
        request = self.context.get('request')
        if obj.image:
            return _image_url(obj.image, request)
        if obj.item and obj.item.image:
            return _image_url(obj.item.image, request)
        return None

    def get_comparePrice(self, obj):
        return float(obj.price) * 1.15

    def get_stockStatus(self, obj):
        if obj.stock_count is None:
            return "OutOfStock"
        return "InStock" if obj.stock_count > 10 else "LowStock" if obj.stock_count > 0 else "OutOfStock"

    def get_stockQuantity(self, obj):
        return obj.stock_count or 0

    def get_priceTrend(self, obj):
        return -2.5

    def get_nationalAveragePrice(self, obj):
        return float(obj.price) * 1.05

    def get_nationalAverageDiff(self, obj):
        return -5.0


class VendorReviewSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    userName = serializers.CharField()
    userInitial = serializers.CharField()
    rating = serializers.IntegerField()
    comment = serializers.CharField()
    date = serializers.DateTimeField()
    helpfulCount = serializers.IntegerField()
    verifiedPurchase = serializers.BooleanField()


from .models import PriceAlert


class PriceAlertSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)

    class Meta:
        model = PriceAlert
        fields = (
            'id', 'item', 'item_name', 'target_price', 'city',
            'is_active', 'triggered_at', 'created_at',
        )
        read_only_fields = ('id', 'is_active', 'triggered_at', 'created_at')

    def validate_target_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Target price must be a positive number.")
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
