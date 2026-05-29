import uuid
from decimal import Decimal

from django.db import transaction
from django.db.models import Avg
from django.conf import settings
from rest_framework import serializers

from market.models import VendorPrice, VendorPriceImage
from users.models import User, Vendor

from .chapa import ChapaInitError, initialize_chapa_checkout
from .models import Transaction, VendorReview
from finance.models import Expense
import datetime
import logging


class VendorPublicSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    report_count = serializers.SerializerMethodField()
    latest_report_reason = serializers.SerializerMethodField()
    latest_reported_at = serializers.SerializerMethodField()

    class Meta:
        model = Vendor
        fields = (
            'id', 'shop_name', 'city', 'address', 'contact_phone',
            'latitude', 'longitude', 'is_verified', 'verification_status',
            'verification_rejection_reason',
            'business_license', 'tin_number', 'rating_avg', 'rating_count', 'joined_at',
            'report_count', 'latest_report_reason', 'latest_reported_at',
            'owner_name', 'owner_email',
        )

    def _report_summary(self, obj):
        summary = self.context.get('report_summary') or {}
        return summary.get(str(obj.id), {})

    def get_report_count(self, obj):
        return int(self._report_summary(obj).get('report_count') or 0)

    def get_latest_report_reason(self, obj):
        return self._report_summary(obj).get('latest_report_reason') or ''

    def get_latest_reported_at(self, obj):
        return self._report_summary(obj).get('latest_reported_at')


class VendorRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ('shop_name', 'city', 'address', 'contact_phone', 'latitude', 'longitude')

    def validate(self, attrs):
        user = self.context['request'].user
        if Vendor.objects.filter(owner=user).exists():
            raise serializers.ValidationError('A vendor profile already exists for this account.')
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        with transaction.atomic():
            vendor = Vendor.objects.create(owner=user, **validated_data)
            User.objects.filter(pk=user.pk).update(role='vendor')
        return vendor


class VendorPriceSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    unit = serializers.CharField(source='item.unit', read_only=True)
    category = serializers.CharField(source='item.category', read_only=True)
    description = serializers.CharField(required=False, allow_blank=True, default='')
    variant = serializers.CharField(required=False, allow_blank=True, default='')
    base_price = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    # Vendor identity — exposed on every listing so consumers can display the shop name
    vendor_id = serializers.UUIDField(source='vendor.id', read_only=True)
    vendor_name = serializers.CharField(source='vendor.shop_name', read_only=True)
    images = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = VendorPrice
        fields = (
            'id', 'item', 'item_name', 'unit', 'category',
            'vendor_id', 'vendor_name',
            'description', 'variant', 'price', 'base_price', 'stock_count',
            'image', 'images', 'date', 'is_verified',
        )
        read_only_fields = ('id', 'date', 'is_verified')
        ref_name = "EcommerceVendorPrice"

    def _normalize_price_fields(self, validated_data, instance=None):
        price = validated_data.get('price', getattr(instance, 'price', None))
        base_price = validated_data.get('base_price', getattr(instance, 'base_price', None))

        if price is None and base_price is None:
            raise serializers.ValidationError({'price': 'Either price or base_price is required.'})

        if 'price' not in validated_data and price is not None:
            validated_data['price'] = price

        if 'base_price' not in validated_data and base_price is not None:
            validated_data['base_price'] = base_price

        if validated_data.get('price') is None:
            validated_data['price'] = base_price
            price = base_price

        if validated_data.get('base_price') is None:
            validated_data['base_price'] = price

        if validated_data.get('price') is not None and validated_data['price'] <= Decimal('0'):
            raise serializers.ValidationError({'price': 'Price must be a positive number.'})

        if validated_data.get('base_price') is not None and validated_data['base_price'] <= Decimal('0'):
            raise serializers.ValidationError({'base_price': 'Base price must be a positive number.'})

        return validated_data

    def get_images(self, obj):
        request = self.context.get('request')
        images = []
        for listing_image in obj.images.all():
            image_url = listing_image.image.url if listing_image.image else ""
            if request and image_url:
                image_url = request.build_absolute_uri(image_url)
            images.append({
                'id': listing_image.id,
                'url': image_url,
                'position': listing_image.position,
            })
        return images

    def _replace_images(self, vendor_price, files):
        vendor_price.images.all().delete()
        for index, file_obj in enumerate(files):
            VendorPriceImage.objects.create(
                vendor_price=vendor_price,
                image=file_obj,
                position=index,
            )
        if files:
            files[0].seek(0)
            vendor_price.image = files[0]
            vendor_price.save(update_fields=['image'])

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data = self._normalize_price_fields(validated_data)
        vendor_price = super().create(validated_data)
        files = request.FILES.getlist('images') if request else []
        if files:
            self._replace_images(vendor_price, files)
        elif vendor_price.image:
            VendorPriceImage.objects.create(
                vendor_price=vendor_price,
                image=vendor_price.image,
                position=0,
            )
        return vendor_price

    def update(self, instance, validated_data):
        request = self.context.get('request')
        validated_data = self._normalize_price_fields(validated_data, instance=instance)
        vendor_price = super().update(instance, validated_data)
        files = request.FILES.getlist('images') if request else []
        if files:
            self._replace_images(vendor_price, files)
        return vendor_price


class TransactionSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.shop_name', read_only=True)
    customer_name = serializers.CharField(source='user.full_name', read_only=True)
    customer_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Transaction
        fields = (
            'id', 'vendor', 'vendor_name', 'vendor_price', 'quantity', 'amount', 'currency',
            'status', 'reference', 'payment_method', 'payment_reference',
            'customer_name', 'customer_email',
            'payment_url', 'paid_at', 'created_at', 'updated_at',
        )
        read_only_fields = fields


class PurchaseCreateSerializer(serializers.Serializer):
    vendor_id = serializers.UUIDField()
    listing_id = serializers.IntegerField(help_text='VendorPrice id')
    quantity = serializers.IntegerField(min_value=1, default=1)
    delivery_address = serializers.CharField(required=False, allow_blank=True, default='')
    payment_method = serializers.ChoiceField(
        choices=['chapa', 'telebirr', 'cash'],
        required=False,
        default='chapa',
    )

    def create(self, validated_data):
        request = self.context['request']
        user = request.user
        vendor_id = validated_data['vendor_id']
        listing_id = validated_data['listing_id']
        qty = validated_data['quantity']

        try:
            vp = VendorPrice.objects.select_related('vendor').get(pk=listing_id, vendor_id=vendor_id)
        except VendorPrice.DoesNotExist:
            raise serializers.ValidationError('Invalid vendor_id or listing_id.')

        if not vp.vendor.is_verified:
            raise serializers.ValidationError('Vendor is not verified yet.')

        amount = (vp.price * Decimal(str(qty))).quantize(Decimal('0.01'))
        ref = uuid.uuid4().hex

        payment_method = validated_data.get('payment_method') or 'chapa'
        rec = Transaction.objects.create(
            user=user,
            vendor=vp.vendor,
            vendor_price=vp,
            quantity=qty,
            amount=amount,
            status='pending',
            reference=ref,
            payment_method=payment_method,
            payment_url='',
        )
        # Create a pending Expense record so the purchase is visible in expense history
        try:
            Expense.objects.create(
                user=user,
                category='Shopping',
                item=vp.item if vp else None,
                amount=amount,
                vendor=vp.vendor,
                payment_method=payment_method,
                date=datetime.date.today(),
                note=f'Pending Chapa payment. Order ref: {rec.reference}',
            )
        except Exception:
            pass
        if payment_method == 'chapa':
            try:
                full_name = (user.full_name or 'SpendSense User').split()
                first_name = full_name[0]
                last_name = ' '.join(full_name[1:]) if len(full_name) > 1 else 'User'
                rec.payment_url = initialize_chapa_checkout(
                    tx_ref=rec.reference,
                    amount=rec.amount,
                    email=user.email,
                    first_name=first_name,
                    last_name=last_name,
                )
            except ChapaInitError as exc:
                raise serializers.ValidationError({'payment': str(exc)})
        else:
            rec.payment_url = (
                f"{settings.FRONTEND_URL.rstrip('/')}/shop/payment/return?reference={rec.reference}"
            )
        rec.save(update_fields=['payment_url'])
        try:
            logging.getLogger(__name__).info(
                'Created Transaction: id=%s reference=%s payment_method=%s payment_url=%s',
                rec.id,
                rec.reference,
                rec.payment_method,
                rec.payment_url,
            )
        except Exception:
            pass
        return rec


class PurchaseBulkCreateSerializer(serializers.Serializer):
    """
    Accepts a list of cart items and creates one Transaction per item,
    then initializes a single Chapa checkout for the combined total.
    All transactions share the same combined tx_ref (joined by '-').
    """

    class ItemSerializer(serializers.Serializer):
        vendor_id = serializers.UUIDField()
        listing_id = serializers.IntegerField(help_text='VendorPrice id')
        quantity = serializers.IntegerField(min_value=1, default=1)

    items = ItemSerializer(many=True, min_length=1)
    payment_method = serializers.ChoiceField(
        choices=['chapa', 'telebirr', 'cash'],
        required=False,
        default='chapa',
    )

    def create(self, validated_data):
        request = self.context['request']
        user = request.user
        payment_method = validated_data.get('payment_method') or 'chapa'
        items_data = validated_data['items']

        transactions = []
        with transaction.atomic():
            for item_data in items_data:
                vendor_id = item_data['vendor_id']
                listing_id = item_data['listing_id']
                qty = item_data['quantity']

                try:
                    vp = VendorPrice.objects.select_related('vendor').get(
                        pk=listing_id, vendor_id=vendor_id
                    )
                except VendorPrice.DoesNotExist:
                    raise serializers.ValidationError(
                        f'Invalid vendor_id or listing_id: {listing_id}.'
                    )

                if not vp.vendor.is_verified:
                    raise serializers.ValidationError(
                        f'Vendor "{vp.vendor.shop_name}" is not verified yet.'
                    )

                amount = (vp.price * Decimal(str(qty))).quantize(Decimal('0.01'))
                ref = uuid.uuid4().hex

                tx = Transaction.objects.create(
                    user=user,
                    vendor=vp.vendor,
                    vendor_price=vp,
                    quantity=qty,
                    amount=amount,
                    status='pending',
                    reference=ref,
                    payment_method=payment_method,
                    payment_url='',
                )
                # create a pending expense to show in payment history
                try:
                    Expense.objects.create(
                        user=user,
                        category='Shopping',
                        item=vp.item if vp else None,
                        amount=amount,
                        vendor=vp.vendor,
                        payment_method=payment_method,
                        date=datetime.date.today(),
                        note=f'Pending Chapa payment. Order ref: {tx.reference}',
                    )
                except Exception:
                    pass
                transactions.append((tx, vp))
                try:
                    logging.getLogger(__name__).info(
                        'Bulk-created Transaction: id=%s reference=%s amount=%s',
                        tx.id,
                        tx.reference,
                        tx.amount,
                    )
                except Exception:
                    pass

            # Chapa expects a compact unique tx_ref. Keep individual order refs
            # on each transaction and store this group ref for webhook lookup.
            combined_ref = uuid.uuid4().hex
            total_amount = sum(tx.amount for tx, _ in transactions)

            if payment_method == 'chapa':
                try:
                    full_name = (user.full_name or 'SpendSense User').split()
                    first_name = full_name[0]
                    last_name = ' '.join(full_name[1:]) if len(full_name) > 1 else 'User'
                    checkout_url = initialize_chapa_checkout(
                        tx_ref=combined_ref,
                        amount=total_amount,
                        email=user.email,
                        first_name=first_name,
                        last_name=last_name,
                    )
                except ChapaInitError as exc:
                    raise serializers.ValidationError({'payment': str(exc)})
            else:
                checkout_url = (
                    f"{settings.FRONTEND_URL.rstrip('/')}/shop/payment/return"
                    f"?reference={combined_ref}"
                )

            # Update all transactions with the checkout URL
            refs = [tx.reference for tx, _ in transactions]
            Transaction.objects.filter(reference__in=refs).update(
                payment_reference=combined_ref,
                payment_url=checkout_url,
            )
            try:
                logging.getLogger(__name__).info(
                    'Bulk checkout initialized: combined_ref=%s total_amount=%s checkout_url=%s transactions=%s',
                    combined_ref,
                    total_amount,
                    checkout_url,
                    refs,
                )
            except Exception:
                pass
            for tx, _ in transactions:
                tx.payment_reference = combined_ref
                tx.payment_url = checkout_url

        return transactions


class PurchaseStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['shipped', 'delivered', 'cancelled'])


class VendorReviewSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='pk', read_only=True)
    vendor = serializers.CharField(source='vendor_id', read_only=True)
    user = serializers.CharField(source='user_id', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    userName = serializers.SerializerMethodField()
    userInitial = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    helpfulCount = serializers.SerializerMethodField()
    verifiedPurchase = serializers.SerializerMethodField()

    class Meta:
        model = VendorReview
        fields = (
            'id', 'vendor', 'user', 'user_email', 'userName', 'userInitial',
            'rating', 'comment', 'date', 'helpfulCount', 'verifiedPurchase', 'created_at'
        )
        read_only_fields = (
            'id', 'vendor', 'user', 'user_email', 'userName', 'userInitial',
            'date', 'helpfulCount', 'verifiedPurchase', 'created_at'
        )

    def validate_rating(self, v):
        if v < 1 or v > 5:
            raise serializers.ValidationError('Rating must be 1–5.')
        return v

    def get_userName(self, obj):
        return getattr(obj.user, 'full_name', '') or getattr(obj.user, 'email', '')

    def get_userInitial(self, obj):
        name = self.get_userName(obj).strip()
        return (name[:1] or 'U').upper()

    def get_date(self, obj):
        return obj.created_at

    def get_helpfulCount(self, obj):
        return 0

    def get_verifiedPurchase(self, obj):
        from .models import Transaction

        return Transaction.objects.filter(
            user=obj.user,
            vendor=obj.vendor,
            status__in=['paid', 'shipped', 'delivered'],
        ).exists()

    def create(self, validated_data):
        request = self.context['request']
        vendor = self.context['vendor']
        if VendorReview.objects.filter(vendor=vendor, user=request.user).exists():
            raise serializers.ValidationError('You already reviewed this vendor.')
        review = VendorReview.objects.create(vendor=vendor, user=request.user, **validated_data)
        agg = VendorReview.objects.filter(vendor=vendor).aggregate(avg=Avg('rating'))
        count = VendorReview.objects.filter(vendor=vendor).count()
        Vendor.objects.filter(pk=vendor.pk).update(
            rating_avg=Decimal(str(round(float(agg['avg'] or 0), 2))),
            rating_count=count,
        )
        return review
