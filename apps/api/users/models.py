import uuid
from decimal import Decimal

from django.db import models, transaction
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('vendor', 'Vendor'),
        ('admin', 'Admin'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    city = models.CharField(max_length=100, null=True, blank=True)
    household_size = models.PositiveIntegerField(null=True, blank=True)
    income_bracket = models.CharField(max_length=50, null=True, blank=True)
    notification_preferences = models.JSONField(default=dict, blank=True)
    onboarding_completed = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        db_table = 'users_user'

    def __str__(self):
        return self.email


class Vendor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    shop_name = models.CharField(max_length=150)
    city = models.CharField(max_length=120)
    address = models.CharField(max_length=255, blank=True, default='')
    contact_phone = models.CharField(max_length=30, blank=True, default='')
    VERIFICATION_STATUS_CHOICES = (
        ('unrequested', 'Unrequested'),
        ('requested', 'Requested'),
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
        ('suspended', 'Suspended'),
    )
    is_verified = models.BooleanField(default=False)
    verification_status = models.CharField(
        max_length=20, 
        choices=VERIFICATION_STATUS_CHOICES, 
        default='unrequested'
    )
    verification_rejection_reason = models.TextField(blank=True, default='')
    # Average rating updated when reviews are posted (denormalized)
    rating_avg = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    rating_count = models.PositiveIntegerField(default=0)
    latitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    image = models.ImageField(upload_to='vendor_profiles/', null=True, blank=True)
    theme_image = models.ImageField(upload_to='vendor_themes/', null=True, blank=True)
    business_license = models.FileField(upload_to='vendor_licenses/', null=True, blank=True)
    tin_number = models.CharField(max_length=50, blank=True, default='')
    joined_at = models.DateTimeField(auto_now_add=True)


class VendorWallet(models.Model):
    vendor = models.OneToOneField(Vendor, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=10, default='ETB')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.vendor.shop_name} wallet'


class VendorWalletEntry(models.Model):
    ENTRY_TYPES = (
        ('credit', 'Credit'),
        ('debit', 'Debit'),
    )

    wallet = models.ForeignKey(VendorWallet, on_delete=models.CASCADE, related_name='entries')
    transaction_reference = models.CharField(max_length=120, unique=True)
    entry_type = models.CharField(max_length=10, choices=ENTRY_TYPES, default='credit')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    balance_after = models.DecimalField(max_digits=12, decimal_places=2)
    source = models.CharField(max_length=50, default='chapa')
    note = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.transaction_reference} - {self.amount}'


def credit_vendor_wallet(*, vendor, amount, transaction_reference, source='chapa', note=''):
    credit_amount = Decimal(str(amount)).quantize(Decimal('0.01'))
    if credit_amount <= 0:
        return None

    with transaction.atomic():
        wallet, _ = VendorWallet.objects.select_for_update().get_or_create(
            vendor=vendor,
            defaults={'currency': 'ETB'},
        )

        existing = wallet.entries.filter(transaction_reference=transaction_reference).first()
        if existing:
            return existing

        wallet.balance = (Decimal(str(wallet.balance)) + credit_amount).quantize(Decimal('0.01'))
        wallet.currency = wallet.currency or 'ETB'
        wallet.save(update_fields=['balance', 'currency', 'updated_at'])

        return VendorWalletEntry.objects.create(
            wallet=wallet,
            transaction_reference=transaction_reference,
            entry_type='credit',
            amount=credit_amount,
            balance_after=wallet.balance,
            source=source,
            note=note,
        )


def debit_vendor_wallet(*, vendor, amount, transaction_reference, source='payout', note=''):
    """Debit the vendor's wallet by `amount` and record a debit entry.

    This is idempotent based on `transaction_reference` and uses a DB
    transaction with `select_for_update` to prevent race conditions.
    Raises ValueError if insufficient funds.
    """
    debit_amount = Decimal(str(amount)).quantize(Decimal('0.01'))
    if debit_amount <= 0:
        raise ValueError('Amount must be positive')

    with transaction.atomic():
        wallet, _ = VendorWallet.objects.select_for_update().get_or_create(
            vendor=vendor,
            defaults={'currency': 'ETB'},
        )

        existing = wallet.entries.filter(transaction_reference=transaction_reference).first()
        if existing:
            return existing

        current_balance = Decimal(str(wallet.balance))
        if current_balance < debit_amount:
            raise ValueError('Insufficient wallet balance')

        wallet.balance = (current_balance - debit_amount).quantize(Decimal('0.01'))
        wallet.save(update_fields=['balance', 'updated_at'])

        return VendorWalletEntry.objects.create(
            wallet=wallet,
            transaction_reference=transaction_reference,
            entry_type='debit',
            amount=debit_amount,
            balance_after=wallet.balance,
            source=source,
            note=note,
        )


class PayoutRequest(models.Model):
    STATUS_CHOICES = (
        ('requested', 'Requested'),
        ('approved', 'Approved'),
        ('paid', 'Paid'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='payouts')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='ETB')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    external_reference = models.CharField(max_length=120, blank=True, default='')
    admin_note = models.TextField(blank=True, default='')
    transaction_reference = models.CharField(max_length=120, blank=True, default='')
    requested_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'users_payoutrequest'

    def __str__(self):
        return f'Payout {self.id} {self.vendor.shop_name} {self.amount} {self.status}'


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=50)
    message = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class SystemSetting(models.Model):
    key = models.CharField(max_length=120, unique=True)
    value = models.JSONField(default=dict, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)


class AuditLog(models.Model):
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=120)
    resource = models.CharField(max_length=120)
    resource_id = models.CharField(max_length=120, blank=True, default='')
    detail = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
