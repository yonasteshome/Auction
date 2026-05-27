from rest_framework import serializers


class AtlasCardSerializer(serializers.Serializer):
    family = serializers.CharField()
    key = serializers.CharField()
    title = serializers.CharField()
    summary = serializers.CharField()
    detail = serializers.CharField()
    rank = serializers.IntegerField()
    mood = serializers.CharField()
    motif = serializers.CharField()
    region = serializers.CharField()
    action = serializers.CharField()
    tags = serializers.ListField(child=serializers.CharField())


class AtlasFamilySerializer(serializers.Serializer):
    slug = serializers.CharField()
    title = serializers.CharField()
    symbol = serializers.CharField()
    question = serializers.CharField()
    highlight = serializers.CharField()
    card_count = serializers.IntegerField()
    top_mood = serializers.CharField()
    top_motif = serializers.CharField()


class AtlasEnvelopeSerializer(serializers.Serializer):
    family = serializers.CharField()
    mode = serializers.CharField()
    title = serializers.CharField()
    generated_at = serializers.DateTimeField()
    snapshot = serializers.DictField()
    items = AtlasCardSerializer(many=True)


class VendorAnalyticsSerializer(serializers.Serializer):
    vendor_id = serializers.CharField(required=False, allow_null=True)
    vendor_name = serializers.CharField()
    transaction_count = serializers.IntegerField()
    total_revenue = serializers.CharField()
    average_rating = serializers.FloatField()
    rating_breakdown = serializers.DictField(child=serializers.IntegerField(), required=False)
    refund_rate = serializers.FloatField()
    dispute_backlog = serializers.IntegerField()
    recent_trends = serializers.DictField(child=serializers.FloatField())
    current_snapshot = serializers.DictField()


class VendorFunnelSerializer(serializers.Serializer):
    vendor_id = serializers.CharField(required=False, allow_null=True)
    stages = serializers.ListField(child=serializers.DictField())
    summary = serializers.CharField()


class MarketHeatmapSerializer(serializers.Serializer):
    top_markets = serializers.ListField(child=serializers.DictField())


class PriceAnomalySerializer(serializers.Serializer):
    item_key = serializers.CharField()
    city = serializers.CharField()
    price = serializers.CharField()
    average_price = serializers.CharField()
    distance = serializers.CharField()
    capture_index = serializers.IntegerField()


class RefundRequestSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    requested_by = serializers.CharField(required=True)
    vendor = serializers.CharField()
    transaction_reference = serializers.CharField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    reason = serializers.CharField(required=False, allow_blank=True)
    status = serializers.CharField(required=False)
    resolution_note = serializers.CharField(required=False, allow_blank=True)
    requested_at = serializers.DateTimeField(required=False)
    resolved_at = serializers.DateTimeField(required=False, allow_null=True)


class DisputeTicketSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    reporter = serializers.CharField(required=True)
    vendor = serializers.CharField()
    transaction_reference = serializers.CharField(required=False, allow_blank=True)
    issue_type = serializers.CharField()
    message = serializers.CharField()
    status = serializers.CharField(required=False)
    outcome_note = serializers.CharField(required=False, allow_blank=True)
    created_at = serializers.DateTimeField(required=False)
    updated_at = serializers.DateTimeField(required=False)


class BudgetRuleSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    user = serializers.CharField()
    name = serializers.CharField()
    frequency = serializers.CharField()
    target_total = serializers.DecimalField(max_digits=12, decimal_places=2)
    category_config = serializers.DictField(required=False)
    next_run = serializers.DateField(required=False, allow_null=True)
    is_active = serializers.BooleanField()
    created_at = serializers.DateTimeField(required=False)
    updated_at = serializers.DateTimeField(required=False)


class CashflowForecastSerializer(serializers.Serializer):
    user_id = serializers.CharField(required=False, allow_null=True)
    forecast_months = serializers.ListField(child=serializers.DictField())
    projected_income = serializers.CharField()
    projected_expenses = serializers.CharField()
    coverage_ratio = serializers.FloatField()


class RealtimeEventSerializer(serializers.Serializer):
    event_id = serializers.CharField(required=False)
    event_type = serializers.CharField()
    channel = serializers.CharField()
    payload = serializers.DictField(required=False)
    created_at = serializers.DateTimeField(required=False)
    owner_id = serializers.CharField(required=False, allow_null=True)


class RealtimeSubscriptionSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    user = serializers.CharField()
    channel = serializers.CharField()
    is_active = serializers.BooleanField()
    last_seen_at = serializers.DateTimeField(required=False, allow_null=True)
    created_at = serializers.DateTimeField(required=False)
    updated_at = serializers.DateTimeField(required=False)


class VendorRiskProfileSerializer(serializers.Serializer):
    vendor_id = serializers.CharField(required=False, allow_null=True)
    risk_score = serializers.CharField()
    dispute_rate = serializers.FloatField()
    refund_rate = serializers.FloatField()
    low_stock_rate = serializers.FloatField()
    average_listing_price = serializers.CharField()
    active_listing_count = serializers.IntegerField()
    primary_risk_factors = serializers.DictField(child=serializers.IntegerField())
    recommended_actions = serializers.ListField(child=serializers.CharField())


class InventoryHealthSerializer(serializers.Serializer):
    vendor_id = serializers.CharField(required=False, allow_null=True)
    stock_health = serializers.DictField(child=serializers.FloatField())
    low_stock_items = serializers.ListField(child=serializers.DictField())
    overstock_items = serializers.ListField(child=serializers.DictField())


class ReconciliationSummarySerializer(serializers.Serializer):
    vendor_id = serializers.CharField(required=False, allow_null=True)
    batch_count = serializers.IntegerField()
    matched_batches = serializers.IntegerField()
    flagged_batches = serializers.IntegerField()
    pending_batches = serializers.IntegerField()
    total_variance = serializers.CharField()


class MarketplaceBenchmarkSerializer(serializers.Serializer):
    city = serializers.CharField(required=False, allow_blank=True)
    benchmark_count = serializers.IntegerField()
    top_price_indexes = serializers.ListField(child=serializers.DictField())


class ComplianceAlertSerializer(serializers.Serializer):
    vendor_id = serializers.CharField(required=False, allow_null=True)
    open_alerts = serializers.IntegerField()
    resolved_alerts = serializers.IntegerField()
    severity_counts = serializers.DictField(child=serializers.IntegerField())
    recent_alerts = serializers.ListField(child=serializers.DictField())


class DynamicPriceRuleSerializer(serializers.Serializer):
    vendor_id = serializers.CharField(required=False, allow_null=True)
    recommendations = serializers.ListField(child=serializers.DictField())
    active_rules = serializers.IntegerField()


class DeliveryPromiseSerializer(serializers.Serializer):
    transaction_reference = serializers.CharField(required=False, allow_blank=True)
    vendor_id = serializers.CharField(required=False, allow_null=True)
    promise_window = serializers.CharField()
    confidence_score = serializers.FloatField()
    delay_risk = serializers.FloatField()
    summary = serializers.CharField()


class PlaybookActionSerializer(serializers.Serializer):
    title = serializers.CharField()
    description = serializers.CharField()


class ActionPlaybookSerializer(serializers.Serializer):
    snapshot = serializers.DictField()
    action_plan = PlaybookActionSerializer(many=True)
    playbook_summary = serializers.CharField()
