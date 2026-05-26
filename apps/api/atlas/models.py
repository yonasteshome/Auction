import uuid
from django.db import models
from django.conf import settings


class VendorPulseSnapshot(models.Model):
    vendor = models.ForeignKey('users.Vendor', on_delete=models.CASCADE, related_name='pulse_snapshots')
    generated_at = models.DateTimeField(auto_now_add=True)
    active_listings = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    review_velocity = models.PositiveIntegerField(default=0)
    weekly_orders = models.PositiveIntegerField(default=0)
    revenue_estimate = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    signal_strength = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    class Meta:
        ordering = ['-generated_at']
        verbose_name = 'Vendor Pulse Snapshot'
        verbose_name_plural = 'Vendor Pulse Snapshots'


class MarketSignalRecord(models.Model):
    key = models.CharField(max_length=120)
    label = models.CharField(max_length=120)
    city = models.CharField(max_length=120, blank=True, default='')
    score = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    payload = models.JSONField(default=dict, blank=True)
    detected_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-detected_at']
        verbose_name = 'Market Signal Record'
        verbose_name_plural = 'Market Signal Records'


class OrderLifecycleEvent(models.Model):
    STAGE_CHOICES = [
        ('discovered', 'Discovered'),
        ('in_cart', 'In Cart'),
        ('checkout', 'Checkout'),
        ('paid', 'Paid'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('returned', 'Returned'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction_reference = models.CharField(max_length=120, db_index=True)
    vendor = models.ForeignKey('users.Vendor', on_delete=models.CASCADE, related_name='lifecycle_events')
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES)
    note = models.TextField(blank=True, default='')
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['transaction_reference', 'created_at']
        verbose_name = 'Order Lifecycle Event'
        verbose_name_plural = 'Order Lifecycle Events'


class RefundRequest(models.Model):
    STATUS_CHOICES = [
        ('requested', 'Requested'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('processed', 'Processed'),
        ('expired', 'Expired'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='refund_requests')
    vendor = models.ForeignKey('users.Vendor', on_delete=models.CASCADE, related_name='refund_requests')
    transaction_reference = models.CharField(max_length=120, db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    resolution_note = models.TextField(blank=True, default='')
    requested_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-requested_at']
        verbose_name = 'Refund Request'
        verbose_name_plural = 'Refund Requests'


class DisputeTicket(models.Model):
    ISSUE_CHOICES = [
        ('product', 'Product Issue'),
        ('payment', 'Payment Issue'),
        ('delivery', 'Delivery Issue'),
        ('experience', 'Experience Issue'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('investigating', 'Investigating'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='disputes')
    vendor = models.ForeignKey('users.Vendor', on_delete=models.CASCADE, related_name='disputes')
    transaction_reference = models.CharField(max_length=120, blank=True, default='')
    issue_type = models.CharField(max_length=20, choices=ISSUE_CHOICES, default='other')
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    outcome_note = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'Dispute Ticket'
        verbose_name_plural = 'Dispute Tickets'


class RecurringBudgetRule(models.Model):
    FREQUENCY_CHOICES = [
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='budget_rules')
    name = models.CharField(max_length=150)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='monthly')
    target_total = models.DecimalField(max_digits=12, decimal_places=2)
    category_config = models.JSONField(default=dict, blank=True)
    next_run = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'Recurring Budget Rule'
        verbose_name_plural = 'Recurring Budget Rules'


class CashflowForecast(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cashflow_forecasts')
    forecast_month = models.IntegerField()
    forecast_year = models.IntegerField()
    projected_income = models.DecimalField(max_digits=14, decimal_places=2)
    projected_expenses = models.DecimalField(max_digits=14, decimal_places=2)
    notes = models.JSONField(default=dict, blank=True)
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-generated_at']
        verbose_name = 'Cashflow Forecast'
        verbose_name_plural = 'Cashflow Forecasts'


class RealtimeEvent(models.Model):
    EVENT_TYPES = [
        ('price_tick', 'Price Tick'),
        ('vendor_alert', 'Vendor Alert'),
        ('transaction_signal', 'Transaction Signal'),
        ('system_note', 'System Note'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    channel = models.CharField(max_length=80, default='global')
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='realtime_events')
    payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Realtime Event'
        verbose_name_plural = 'Realtime Events'


class RealtimeSubscription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='realtime_subscriptions')
    channel = models.CharField(max_length=80)
    is_active = models.BooleanField(default=True)
    last_seen_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'Realtime Subscription'
        verbose_name_plural = 'Realtime Subscriptions'
        unique_together = [('user', 'channel')]


class VendorRiskProfile(models.Model):
    vendor = models.ForeignKey('users.Vendor', on_delete=models.CASCADE, related_name='risk_profiles')
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    risk_factors = models.JSONField(default=dict, blank=True)
    summary = models.TextField(blank=True, default='')
    last_reviewed = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-last_reviewed']
        verbose_name = 'Vendor Risk Profile'
        verbose_name_plural = 'Vendor Risk Profiles'


class InventoryCycleReport(models.Model):
    vendor = models.ForeignKey('users.Vendor', on_delete=models.CASCADE, related_name='inventory_reports')
    item_name = models.CharField(max_length=150)
    opening_stock = models.PositiveIntegerField(default=0)
    closing_stock = models.PositiveIntegerField(default=0)
    units_sold = models.PositiveIntegerField(default=0)
    turnover_days = models.PositiveIntegerField(default=0)
    report_month = models.PositiveIntegerField()
    report_year = models.PositiveIntegerField()
    details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-report_year', '-report_month']
        verbose_name = 'Inventory Cycle Report'
        verbose_name_plural = 'Inventory Cycle Reports'


class PaymentReconciliationBatch(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('matched', 'Matched'),
        ('flagged', 'Flagged'),
        ('reconciled', 'Reconciled'),
    ]

    batch_reference = models.CharField(max_length=120, unique=True)
    vendor = models.ForeignKey('users.Vendor', on_delete=models.CASCADE, related_name='reconciliation_batches')
    expected_amount = models.DecimalField(max_digits=14, decimal_places=2)
    actual_amount = models.DecimalField(max_digits=14, decimal_places=2)
    variance = models.DecimalField(max_digits=14, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reconciled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Payment Reconciliation Batch'
        verbose_name_plural = 'Payment Reconciliation Batches'


class MarketplaceBenchmark(models.Model):
    item_name = models.CharField(max_length=150)
    city = models.CharField(max_length=120, blank=True, default='')
    benchmark_price = models.DecimalField(max_digits=12, decimal_places=2)
    price_index = models.DecimalField(max_digits=7, decimal_places=4, default=0)
    source = models.CharField(max_length=80, default='market-data')
    comparison_label = models.CharField(max_length=120, blank=True, default='')
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-generated_at']
        verbose_name = 'Marketplace Benchmark'
        verbose_name_plural = 'Marketplace Benchmarks'


class ComplianceAlert(models.Model):
    ALERT_TYPES = [
        ('payment', 'Payment Compliance'),
        ('listing', 'Listing Compliance'),
        ('delivery', 'Delivery Commitments'),
        ('license', 'License / Documentation'),
        ('safety', 'Product Safety'),
    ]

    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    vendor = models.ForeignKey('users.Vendor', on_delete=models.CASCADE, related_name='compliance_alerts')
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES, default='payment')
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='medium')
    message = models.TextField()
    resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Compliance Alert'
        verbose_name_plural = 'Compliance Alerts'


class DynamicPriceRule(models.Model):
    vendor = models.ForeignKey('users.Vendor', on_delete=models.CASCADE, related_name='price_rules')
    item_name = models.CharField(max_length=150)
    min_price = models.DecimalField(max_digits=12, decimal_places=2)
    max_price = models.DecimalField(max_digits=12, decimal_places=2)
    elasticity_factor = models.DecimalField(max_digits=5, decimal_places=2, default=1.0)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'Dynamic Price Rule'
        verbose_name_plural = 'Dynamic Price Rules'


class DeliveryPromise(models.Model):
    vendor = models.ForeignKey('users.Vendor', on_delete=models.CASCADE, related_name='delivery_promises')
    transaction_reference = models.CharField(max_length=120, blank=True, default='')
    promise_window = models.CharField(max_length=120)
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    delay_risk = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    summary = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Delivery Promise'
        verbose_name_plural = 'Delivery Promises'
