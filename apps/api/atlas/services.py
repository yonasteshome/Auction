from __future__ import annotations

import math
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import timedelta
from decimal import Decimal
from statistics import mean, pstdev

from django.db.models import Avg, Count, Q, Sum
from django.utils import timezone

from ecommerce.models import Category, Product, Transaction, VendorReview
from finance.models import Budget, Expense
from market.models import Item, PriceSubmission, VendorPrice
from users.models import Notification, User, Vendor

from .catalog import FAMILY_BLUEPRINTS, FAMILY_CARDS, card_for_key, cards_for_family, family_blueprint_map
from .insight_templates import grouped_insight_summary, list_insights, lookup_insight, sample_insight_report
from .models import (
    CashflowForecast,
    ComplianceAlert,
    DeliveryPromise,
    DynamicPriceRule,
    InventoryCycleReport,
    MarketplaceBenchmark,
    PaymentReconciliationBatch,
    RealtimeEvent,
    RealtimeSubscription,
    RecurringBudgetRule,
    RefundRequest,
    VendorRiskProfile,
)


@dataclass(frozen=True)
class AtlasSnapshot:
    generated_at: str
    item_count: int
    vendor_count: int
    submission_count: int
    approved_submission_count: int
    review_count: int
    transaction_count: int
    budget_count: int
    expense_count: int
    notification_count: int
    average_vendor_price: str
    active_items: int
    verified_vendors: int
    trust_score: str

    def as_dict(self) -> dict:
        return {
            'generated_at': self.generated_at,
            'item_count': self.item_count,
            'vendor_count': self.vendor_count,
            'submission_count': self.submission_count,
            'approved_submission_count': self.approved_submission_count,
            'review_count': self.review_count,
            'transaction_count': self.transaction_count,
            'budget_count': self.budget_count,
            'expense_count': self.expense_count,
            'notification_count': self.notification_count,
            'average_vendor_price': self.average_vendor_price,
            'active_items': self.active_items,
            'verified_vendors': self.verified_vendors,
            'trust_score': self.trust_score,
        }


def safe_money(value):
    if value is None:
        return Decimal('0')
    if isinstance(value, Decimal):
        return value
    try:
        return Decimal(str(value))
    except Exception:
        return Decimal('0')


def build_snapshot() -> AtlasSnapshot:
    now = timezone.now().isoformat()
    item_count = Item.objects.count()
    vendor_count = Vendor.objects.count()
    submission_count = PriceSubmission.objects.count()
    approved_submission_count = PriceSubmission.objects.filter(status='approved').count()
    review_count = VendorReview.objects.count()
    transaction_count = Transaction.objects.count()
    budget_count = Budget.objects.count()
    expense_count = Expense.objects.count()
    notification_count = Notification.objects.count()
    verified_vendors = Vendor.objects.filter(Q(is_verified=True) | Q(verification_status='verified')).count()
    active_items = Item.objects.filter(is_active=True).count() if hasattr(Item, 'is_active') else item_count
    average_vendor_price = safe_money(VendorPrice.objects.aggregate(avg=Avg('price')).get('avg'))
    trust_score = round(
        (verified_vendors + approved_submission_count + max(review_count, 1))
        / max(vendor_count + item_count + 1, 1)
        * 100,
        2,
    )
    return AtlasSnapshot(
        generated_at=now,
        item_count=item_count,
        vendor_count=vendor_count,
        submission_count=submission_count,
        approved_submission_count=approved_submission_count,
        review_count=review_count,
        transaction_count=transaction_count,
        budget_count=budget_count,
        expense_count=expense_count,
        notification_count=notification_count,
        average_vendor_price=str(round(float(average_vendor_price or 0), 2)),
        active_items=active_items,
        verified_vendors=verified_vendors,
        trust_score=str(trust_score),
    )


def calculate_transaction_value(transaction):
    if transaction is None:
        return Decimal('0')
    value = getattr(transaction, 'total_price', None)
    if value is None:
        value = getattr(transaction, 'price', None)
    if value is None:
        unit_price = getattr(transaction, 'unit_price', None)
        quantity = getattr(transaction, 'quantity', None)
        if unit_price is not None and quantity is not None:
            value = safe_money(unit_price) * safe_money(quantity)
    return safe_money(value)


def build_vendor_analytics(vendor_id: str | None = None) -> dict:
    vendor = None
    if vendor_id:
        vendor = Vendor.objects.filter(pk=vendor_id).first()
        if not vendor:
            return {}

    transactions = Transaction.objects.filter(vendor=vendor) if vendor else Transaction.objects.all()
    reviews = VendorReview.objects.filter(vendor=vendor) if vendor else VendorReview.objects.all()
    refunds = RefundRequest.objects.filter(vendor=vendor) if vendor else RefundRequest.objects.all()
    disputes = DisputeTicket.objects.filter(vendor=vendor) if vendor else DisputeTicket.objects.all()

    total_revenue = sum((calculate_transaction_value(tx) for tx in transactions), Decimal('0'))
    average_rating = reviews.aggregate(avg=Avg('rating')).get('avg') or 0
    rating_by_status = reviews.values('status').annotate(count=Count('id')) if hasattr(VendorReview, 'status') else []
    status_counts = {record['status']: record['count'] for record in rating_by_status} if rating_by_status else {}
    refund_rate = refunds.count() / max(transactions.count(), 1)
    dispute_backlog = disputes.filter(status__in=['open', 'investigating']).count()
    trends = {
        'weekly_order_velocity': transactions.filter(created_at__gte=timezone.now() - timedelta(days=7)).count(),
        'monthly_sales': transactions.filter(created_at__gte=timezone.now() - timedelta(days=30)).count(),
        'return_rate': disputes.filter(issue_type='product').count() / max(transactions.count(), 1),
    }

    return {
        'vendor_id': str(vendor.pk) if vendor else None,
        'vendor_name': vendor.name if vendor else 'platform-wide',
        'transaction_count': transactions.count(),
        'total_revenue': str(round(float(total_revenue), 2)),
        'average_rating': round(float(average_rating or 0), 2),
        'rating_breakdown': status_counts,
        'refund_rate': round(float(refund_rate or 0), 4),
        'dispute_backlog': dispute_backlog,
        'recent_trends': trends,
        'current_snapshot': build_snapshot().as_dict(),
    }


def build_vendor_growth_funnel(vendor_id: str | None = None) -> dict:
    vendor = None
    if vendor_id:
        vendor = Vendor.objects.filter(pk=vendor_id).first()
        if not vendor:
            return {}

    transactions = Transaction.objects.filter(vendor=vendor) if vendor else Transaction.objects.all()
    stages = ['discovered', 'in_cart', 'checkout', 'paid', 'shipped', 'delivered']
    counts = defaultdict(int)
    for stage in stages:
        counts[stage] = transactions.filter(status=stage).count() if hasattr(Transaction, 'status') else 0

    total = sum(counts.values())
    funnel = [
        {'stage': stage, 'count': counts[stage], 'share': round((counts[stage] / max(total, 1)) * 100, 2)}
        for stage in stages
    ]

    return {
        'vendor_id': str(vendor.pk) if vendor else None,
        'stages': funnel,
        'summary': ''.join([f"{step['stage']}={step['count']} " for step in funnel]),
    }


def build_market_heatmap() -> dict:
    top_markets = (
        PriceSubmission.objects.values('city')
        .annotate(average_price=Avg('price_value'), submission_count=Count('id'))
        .order_by('-submission_count')[:10]
    )
    return {
        'top_markets': [
            {
                'city': record['city'],
                'average_price': round(float(record['average_price'] or 0), 2),
                'submission_count': record['submission_count'],
            }
            for record in top_markets
        ]
    }


def detect_price_anomalies() -> list[dict]:
    anomalies = []
    grouped = defaultdict(list)
    for submission in PriceSubmission.objects.all():
        key = (getattr(submission, 'item_name', None) or getattr(submission, 'item_id', None) or 'unknown', submission.city)
        price = safe_money(getattr(submission, 'price_value', None) or getattr(submission, 'price', None))
        grouped[key].append(price)

    for (item_key, city), prices in grouped.items():
        if len(prices) < 3:
            continue
        try:
            avg_price = sum(prices) / len(prices)
            sd = pstdev([float(p) for p in prices])
        except Exception:
            continue
        threshold = Decimal(str(sd * 2))
        for idx, price in enumerate(prices):
            if abs(price - avg_price) > threshold:
                anomalies.append(
                    {
                        'item_key': item_key,
                        'city': city,
                        'price': str(round(float(price), 2)),
                        'average_price': str(round(float(avg_price), 2)),
                        'distance': str(round(float(abs(price - avg_price)), 2)),
                        'capture_index': idx,
                    }
                )
    return anomalies


def build_refund_overview(vendor_id: str | None = None) -> dict:
    refunds = RefundRequest.objects.filter(vendor__pk=vendor_id) if vendor_id else RefundRequest.objects.all()
    status_counts = {record['status']: record['count'] for record in refunds.values('status').annotate(count=Count('id'))}
    return {
        'total_refunds': refunds.count(),
        'status_counts': status_counts,
        'pending_requests': refunds.filter(status='requested').count(),
        'open_disputes': DisputeTicket.objects.filter(vendor__pk=vendor_id, status__in=['open', 'investigating']).count() if vendor_id else DisputeTicket.objects.filter(status__in=['open', 'investigating']).count(),
    }


def build_dispute_backlog(vendor_id: str | None = None) -> dict:
    disputes = DisputeTicket.objects.filter(vendor__pk=vendor_id) if vendor_id else DisputeTicket.objects.all()
    open_disputes = disputes.filter(status__in=['open', 'investigating']).count()
    resolved_disputes = disputes.filter(status='resolved').count()
    return {
        'open_disputes': open_disputes,
        'resolved_disputes': resolved_disputes,
        'escalation_rate': round((open_disputes / max(disputes.count(), 1)) * 100, 2),
    }


def build_budget_overview(user_id: str | None = None) -> dict:
    budgets = RecurringBudgetRule.objects.filter(user__pk=user_id) if user_id else RecurringBudgetRule.objects.all()
    active_rules = budgets.filter(is_active=True).count()
    monthly_target = sum((safe_money(rule.target_total) for rule in budgets), Decimal('0'))
    return {
        'rule_count': budgets.count(),
        'active_rules': active_rules,
        'monthly_target_total': str(round(float(monthly_target), 2)),
        'next_run_dates': [rule.next_run.isoformat() for rule in budgets.exclude(next_run=None)[:5]],
    }


def build_cashflow_projection(user_id: str | None = None, months: int = 6) -> dict:
    user = User.objects.filter(pk=user_id).first() if user_id else None
    expenses = Expense.objects.filter(user=user) if user else Expense.objects.all()
    recent_expenses = expenses.filter(created_at__gte=timezone.now() - timedelta(days=months * 30))
    spend_per_month = defaultdict(Decimal)
    for expense in recent_expenses:
        month_key = expense.created_at.strftime('%Y-%m')
        spend_per_month[month_key] += safe_money(getattr(expense, 'amount', None))

    forecast = []
    for month, amount in sorted(spend_per_month.items()):
        forecast.append({'month': month, 'expense': str(round(float(amount), 2))})

    projected_income = sum((safe_money(getattr(expense, 'expected_income', None)) for expense in recent_expenses), Decimal('0'))
    projected_expenses = sum(spend_per_month.values())
    return {
        'user_id': str(user.pk) if user else None,
        'forecast_months': forecast,
        'projected_income': str(round(float(projected_income), 2)),
        'projected_expenses': str(round(float(projected_expenses), 2)),
        'coverage_ratio': round(float((projected_income / max(projected_expenses, Decimal('1'))) * 100), 2) if projected_expenses else 0,
    }


def build_tax_ready_summary(user_id: str | None = None, year: int | None = None) -> dict:
    user = User.objects.filter(pk=user_id).first() if user_id else None
    expenses = Expense.objects.filter(user=user) if user else Expense.objects.all()
    if year:
        expenses = expenses.filter(created_at__year=year)
    categories = expenses.values('category').annotate(total=Sum('amount')).order_by('-total') if hasattr(Expense, 'category') else []
    total_expense = expenses.aggregate(total=Sum('amount')).get('total') if hasattr(Expense, 'amount') else Decimal('0')
    return {
        'user_id': str(user.pk) if user else None,
        'year': year,
        'category_totals': [
            {'category': record['category'], 'total': str(round(float(record['total'] or 0), 2))}
            for record in categories
        ],
        'total_expense': str(round(float(total_expense or 0), 2)),
        'attachments': [],
    }


def list_realtime_events(channel: str = 'global', limit: int = 50) -> list[dict]:
    events = RealtimeEvent.objects.filter(channel=channel).order_by('-created_at')[:limit]
    return [
        {
            'event_id': str(event.id),
            'event_type': event.event_type,
            'channel': event.channel,
            'payload': event.payload,
            'created_at': event.created_at.isoformat(),
            'owner_id': str(event.owner.pk) if event.owner else None,
        }
        for event in events
    ]


def build_realtime_status() -> dict:
    active_channels = RealtimeSubscription.objects.filter(is_active=True).values('channel').distinct().count()
    subscriptions = RealtimeSubscription.objects.filter(is_active=True).count()
    event_count = RealtimeEvent.objects.count()
    return {
        'active_channels': active_channels,
        'active_subscriptions': subscriptions,
        'event_count': event_count,
        'recent_events': list_realtime_events(limit=10),
    }


def build_vendor_risk_profile(vendor_id: str | None = None) -> dict:
    vendor = Vendor.objects.filter(pk=vendor_id).first() if vendor_id else None
    if vendor_id and not vendor:
        return {}

    prices = VendorPrice.objects.filter(vendor=vendor) if vendor else VendorPrice.objects.all()
    price_values = [safe_money(price.price) for price in prices]
    avg_price = sum(price_values) / max(len(price_values), 1)
    price_variance = sum((value - avg_price) ** 2 for value in price_values) / max(len(price_values), 1)
    refunds = RefundRequest.objects.filter(vendor=vendor) if vendor else RefundRequest.objects.all()
    disputes = DisputeTicket.objects.filter(vendor=vendor) if vendor else DisputeTicket.objects.all()
    transactions = Transaction.objects.filter(vendor=vendor) if vendor else Transaction.objects.all()

    dispute_rate = disputes.filter(status__in=['open', 'investigating']).count() / max(transactions.count(), 1)
    refund_rate = refunds.count() / max(transactions.count(), 1)
    low_stock_rate = prices.filter(stock_count__lt=10).count() / max(prices.count(), 1)
    risk_score = max(
        0,
        min(
            100,
            100
            - dispute_rate * 40
            - refund_rate * 30
            - float(price_variance / max(avg_price, Decimal('1')) * 10)
            - low_stock_rate * 20,
        )
    )
    profile = {
        'vendor_id': str(vendor.pk) if vendor else None,
        'risk_score': round(risk_score, 2),
        'dispute_rate': round(float(dispute_rate), 4),
        'refund_rate': round(float(refund_rate), 4),
        'low_stock_rate': round(float(low_stock_rate), 4),
        'average_listing_price': str(round(float(avg_price or 0), 2)),
        'active_listing_count': prices.count(),
        'primary_risk_factors': {
            'dispute_pressure': disputes.filter(status__in=['open', 'investigating']).count(),
            'refund_pressure': refunds.count(),
            'low_stock_alerts': prices.filter(stock_count__lt=10).count(),
        },
        'recommended_actions': [
            'Review refund handling workflow',
            'Raise low-stock alerts for SKU replenishment',
            'Reconcile high-variance listings against market benchmarks',
        ],
    }
    return profile


def build_inventory_health(vendor_id: str | None = None) -> dict:
    vendor = Vendor.objects.filter(pk=vendor_id).first() if vendor_id else None
    prices = VendorPrice.objects.filter(vendor=vendor) if vendor else VendorPrice.objects.all()
    low_stock_items = prices.filter(stock_count__lt=10).order_by('stock_count')[:5]
    overstock_items = prices.filter(stock_count__gt=80).order_by('-stock_count')[:5]
    stock_health = {
        'total_skus': prices.count(),
        'low_stock_count': low_stock_items.count(),
        'overstock_count': overstock_items.count(),
        'average_stock': round(float(sum((safe_money(price.stock_count) for price in prices), Decimal('0')) / max(prices.count(), 1)), 2) if prices.exists() else 0,
    }
    return {
        'vendor_id': str(vendor.pk) if vendor else None,
        'stock_health': stock_health,
        'low_stock_items': [
            {'item_name': item.item.name if hasattr(item, 'item') else item.description, 'stock_count': item.stock_count}
            for item in low_stock_items
        ],
        'overstock_items': [
            {'item_name': item.item.name if hasattr(item, 'item') else item.description, 'stock_count': item.stock_count}
            for item in overstock_items
        ],
    }


def build_reconciliation_summary(vendor_id: str | None = None) -> dict:
    batches = PaymentReconciliationBatch.objects.filter(vendor__pk=vendor_id) if vendor_id else PaymentReconciliationBatch.objects.all()
    matched = batches.filter(status='matched').count()
    flagged = batches.filter(status='flagged').count()
    pending = batches.filter(status='pending').count()
    total_variance = sum((safe_money(batch.variance) for batch in batches), Decimal('0'))
    return {
        'vendor_id': vendor_id,
        'batch_count': batches.count(),
        'matched_batches': matched,
        'flagged_batches': flagged,
        'pending_batches': pending,
        'total_variance': str(round(float(total_variance), 2)),
    }


def build_benchmark_summary(city: str | None = None) -> dict:
    benchmarks = MarketplaceBenchmark.objects.filter(city=city) if city else MarketplaceBenchmark.objects.all()
    top_by_index = benchmarks.order_by('-price_index')[:10]
    return {
        'city': city,
        'benchmark_count': benchmarks.count(),
        'top_price_indexes': [
            {
                'item_name': record.item_name,
                'city': record.city,
                'benchmark_price': str(record.benchmark_price),
                'price_index': str(record.price_index),
                'source': record.source,
            }
            for record in top_by_index
        ],
    }


def detect_compliance_issues(vendor_id: str | None = None) -> dict:
    alerts = ComplianceAlert.objects.filter(vendor__pk=vendor_id) if vendor_id else ComplianceAlert.objects.all()
    severity_counts = {level: alerts.filter(severity=level).count() for level, _ in ComplianceAlert.ALERT_TYPES}
    return {
        'vendor_id': vendor_id,
        'open_alerts': alerts.filter(resolved=False).count(),
        'resolved_alerts': alerts.filter(resolved=True).count(),
        'severity_counts': severity_counts,
        'recent_alerts': [
            {
                'id': str(alert.id),
                'alert_type': alert.alert_type,
                'severity': alert.severity,
                'message': alert.message,
                'resolved': alert.resolved,
                'created_at': alert.created_at.isoformat(),
            }
            for alert in alerts.order_by('-created_at')[:10]
        ],
    }


def recommend_dynamic_pricing(vendor_id: str | None = None) -> dict:
    rules = DynamicPriceRule.objects.filter(vendor__pk=vendor_id, is_active=True) if vendor_id else DynamicPriceRule.objects.filter(is_active=True)
    recommendations = []
    for rule in rules:
        recommendations.append(
            {
                'rule_id': str(rule.id),
                'item_name': rule.item_name,
                'current_range': f'{rule.min_price}-{rule.max_price}',
                'elasticity_factor': str(rule.elasticity_factor),
                'suggested_price': str(round(float((rule.min_price + rule.max_price) / 2), 2)),
                'note': rule.notes or 'Use active pricing rule to adjust listings dynamically.',
            }
        )
    return {
        'vendor_id': vendor_id,
        'recommendations': recommendations,
        'active_rules': rules.count(),
    }


def build_delivery_promises(limit: int = 20) -> list[dict]:
    transactions = Transaction.objects.filter(status__in=['paid', 'shipped', 'delivered']).order_by('-created_at')[:limit]
    promises = []
    for tx in transactions:
        promise_window = '2-3 days' if tx.status == 'shipped' else '3-5 days'
        delay_risk = 0.12 if tx.status == 'shipped' else 0.28
        promises.append(
            {
                'transaction_reference': tx.reference if hasattr(tx, 'reference') else getattr(tx, 'transaction_reference', ''),
                'vendor_id': str(tx.vendor.pk) if hasattr(tx, 'vendor') and tx.vendor else None,
                'promise_window': promise_window,
                'confidence_score': round(100 - delay_risk * 100, 2),
                'delay_risk': round(delay_risk * 100, 2),
                'summary': f'Expected delivery window for {tx.reference if hasattr(tx, "reference") else "transaction"} is {promise_window}.',
            }
        )
    return promises


def build_operational_playbook() -> dict:
    snapshot = build_snapshot().as_dict()
    actions = [
        {
            'title': 'Refresh low-stock vendor plans',
            'description': 'Identify SKUs with below-threshold inventory and push restock reminders to vendors.',
        },
        {
            'title': 'Flag high-variance price listings',
            'description': 'Compare top benchmarked items against marketplace averages and verify price changes.',
        },
        {
            'title': 'Balance dispute backlog',
            'description': 'Prioritize disputes older than 3 days for manual review and fast resolution.',
        },
        {
            'title': 'Tune dynamic pricing rules',
            'description': 'Apply price elasticity factors to underpriced items and protect margins.',
        },
    ]
    return {
        'snapshot': snapshot,
        'action_plan': actions,
        'playbook_summary': 'Use this operational playbook to stabilize marketplace liquidity, risk, and pricing.',
    }


def build_vendor_performance(vendor_id: str | None = None) -> dict:
    vendor = Vendor.objects.filter(pk=vendor_id).first() if vendor_id else None
    if vendor_id and not vendor:
        return {}

    transactions = Transaction.objects.filter(vendor=vendor) if vendor else Transaction.objects.all()
    refunds = RefundRequest.objects.filter(vendor=vendor) if vendor else RefundRequest.objects.all()
    disputes = DisputeTicket.objects.filter(vendor=vendor) if vendor else DisputeTicket.objects.all()
    reviews = VendorReview.objects.filter(vendor=vendor) if vendor else VendorReview.objects.all()
    total_revenue = sum((safe_money(tx.amount) for tx in transactions), Decimal('0'))
    return {
        'vendor_id': str(vendor.pk) if vendor else None,
        'order_count': transactions.count(),
        'completed_orders': transactions.filter(status__in=['paid', 'delivered']).count(),
        'refund_count': refunds.count(),
        'dispute_count': disputes.count(),
        'average_order_value': str(round(float(total_revenue / max(transactions.count(), 1)), 2)) if transactions.exists() else '0.00',
        'review_score': round(float(reviews.aggregate(avg=Avg('rating')).get('avg') or 0), 2),
        'payment_methods': list(transactions.values_list('payment_method', flat=True).distinct()[:6]),
    }


def build_vendor_trendline(vendor_id: str | None = None) -> dict:
    vendor = Vendor.objects.filter(pk=vendor_id).first() if vendor_id else None
    transactions = Transaction.objects.filter(vendor=vendor) if vendor else Transaction.objects.all()
    trend = defaultdict(Decimal)
    for tx in transactions.order_by('created_at'):
        if tx.created_at:
            period = tx.created_at.strftime('%Y-%m')
            trend[period] += safe_money(tx.amount)
    return {
        'vendor_id': str(vendor.pk) if vendor else None,
        'trendline': [{'month': month, 'revenue': str(round(float(total), 2))} for month, total in sorted(trend.items())],
    }


def build_vendor_score(vendor_id: str | None = None) -> dict:
    vendor = Vendor.objects.filter(pk=vendor_id).first() if vendor_id else None
    if vendor_id and not vendor:
        return {}

    risk_profile = VendorRiskProfile.objects.filter(vendor=vendor).first() if vendor else None
    rating = VendorReview.objects.filter(vendor=vendor).aggregate(avg=Avg('rating')).get('avg') if vendor else VendorReview.objects.aggregate(avg=Avg('rating')).get('avg')
    score = float(risk_profile.score if risk_profile else 75)
    return {
        'vendor_id': str(vendor.pk) if vendor else None,
        'seller_score': round(min(max(score, 0), 100), 2),
        'market_trust': round(min(max(float(rating or 3) / 5 * 100, 0), 100), 2),
        'risk_summary': risk_profile.summary if risk_profile else 'Standard risk profile in place.',
    }


def build_seller_segmentation() -> dict:
    vendors = Vendor.objects.all()
    segment_counts = {'emerging': 0, 'growing': 0, 'enterprise': 0}
    for vendor in vendors:
        review_count = VendorReview.objects.filter(vendor=vendor).count()
        if review_count < 5:
            segment_counts['emerging'] += 1
        elif review_count < 25:
            segment_counts['growing'] += 1
        else:
            segment_counts['enterprise'] += 1
    return {
        'segments': segment_counts,
        'total_vendors': vendors.count(),
    }


def build_category_insights() -> dict:
    categories = Category.objects.all()
    insights = []
    for category in categories:
        products = Product.objects.filter(category=category)
        insights.append(
            {
                'category': category.name,
                'product_count': products.count(),
                'average_price': str(round(float(products.aggregate(avg=Avg('price')).get('avg') or 0), 2)),
                'top_product': products.order_by('-price').first().name if products.exists() else '',
            }
        )
    return {
        'category_count': categories.count(),
        'insights': insights,
    }


def build_market_share() -> dict:
    vendor_volumes = (
        Transaction.objects.values('vendor__id', 'vendor__user__first_name')
        .annotate(volume=Sum('amount'))
        .order_by('-volume')[:10]
    )
    return {
        'top_vendors': [
            {'vendor_id': str(item['vendor__id']), 'name': item['vendor__user__first_name'] or '', 'volume': str(round(float(item['volume'] or 0), 2))}
            for item in vendor_volumes
        ]
    }


def build_market_trends() -> dict:
    recent_items = (
        PriceSubmission.objects.filter(status='approved')
        .values('item__name')
        .annotate(score=Count('id'))
        .order_by('-score')[:8]
    )
    return {
        'top_trending_items': [{'item_name': item['item__name'] or 'unknown', 'submission_count': item['score']} for item in recent_items]
    }


def build_seasonal_forecast() -> dict:
    now = timezone.now()
    forecast = []
    for add in range(1, 7):
        month = now + timedelta(days=30 * add)
        forecast.append(
            {
                'period': month.strftime('%Y-%m'),
                'expected_revenue': str(round(float(Decimal(50000) + add * Decimal('6200')), 2)),
                'confidence': 65 + add,
            }
        )
    return {
        'forecast': forecast,
        'model': 'seasonal momentum',
    }


def build_peak_demand() -> dict:
    hours = defaultdict(int)
    for tx in Transaction.objects.filter(status__in=['paid', 'shipped', 'delivered']).order_by('created_at'):
        if tx.created_at:
            hours[tx.created_at.hour] += 1
    top_hours = sorted(hours.items(), key=lambda pair: pair[1], reverse=True)[:5]
    return {'peak_hours': [{'hour': hour, 'count': count} for hour, count in top_hours]}


def build_narrative_digest() -> dict:
    snapshot = build_snapshot().as_dict()
    return {
        'headline': f"{snapshot['vendor_count']} vendors and {snapshot['transaction_count']} commerce events are shaping the Atlas economy.",
        'summary': 'The platform is trending toward stronger trust and tighter inventory workflows.',
        'key_signals': [
            {'signal': 'verified_vendors', 'value': snapshot['verified_vendors']},
            {'signal': 'active_items', 'value': snapshot['active_items']},
            {'signal': 'trust_score', 'value': snapshot['trust_score']},
        ],
    }


def build_payment_latency_summary() -> dict:
    payments = Transaction.objects.filter(status='paid').order_by('-paid_at')[:40]
    return {
        'sample_size': payments.count(),
        'average_payment_lag_seconds': round(
            float(
                sum(
                    (tx.paid_at - tx.created_at).total_seconds()
                    for tx in payments
                    if tx.paid_at and tx.created_at
                )
                / max(payments.count(), 1)
            ),
            2,
        ),
        'recent_payments': [
            {'reference': tx.reference, 'lag_seconds': round((tx.paid_at - tx.created_at).total_seconds(), 2)}
            for tx in payments if tx.paid_at and tx.created_at
        ],
    }


def build_shipment_latency_summary() -> dict:
    shipped = Transaction.objects.filter(status__in=['shipped', 'delivered']).order_by('-updated_at')[:40]
    return {
        'sample_size': shipped.count(),
        'average_latency_hours': round(
            float(
                sum(
                    (tx.updated_at - tx.created_at).total_seconds() / 3600
                    for tx in shipped
                    if tx.updated_at and tx.created_at
                )
                / max(shipped.count(), 1)
            ),
            2,
        ),
    }


def build_logistics_alerts() -> dict:
    late_shipments = Transaction.objects.filter(status='shipped', updated_at__lte=timezone.now() - timedelta(days=5)).count()
    failed_payments = Transaction.objects.filter(status='failed').count()
    return {
        'late_shipments': late_shipments,
        'failed_payments': failed_payments,
        'alerts': [
            {'type': 'late_shipment', 'count': late_shipments},
            {'type': 'failed_payment', 'count': failed_payments},
        ],
    }


def build_channel_health() -> dict:
    event_count = RealtimeEvent.objects.count()
    active_channels = RealtimeSubscription.objects.filter(is_active=True).values_list('channel', flat=True).distinct().count()
    return {
        'active_channels': active_channels,
        'total_events': event_count,
        'subscriber_health': RealtimeSubscription.objects.filter(is_active=True).count(),
    }


def build_event_audit() -> dict:
    events = RealtimeEvent.objects.order_by('-created_at')[:20]
    return {
        'event_count': RealtimeEvent.objects.count(),
        'recent_events': [
            {'id': event.id, 'type': event.event_type, 'channel': event.channel, 'created_at': event.created_at.isoformat()}
            for event in events
        ],
    }


def build_subscription_audit() -> dict:
    subscriptions = RealtimeSubscription.objects.all()
    return {
        'total_subscriptions': subscriptions.count(),
        'active_subscriptions': subscriptions.filter(is_active=True).count(),
        'channels': list(subscriptions.values_list('channel', flat=True).distinct()),
    }


def build_payment_receipt_summary() -> dict:
    receipts = Transaction.objects.filter(status='paid').values('payment_method').annotate(count=Count('id'), revenue=Sum('amount')).order_by('-revenue')[:8]
    return {
        'payment_methods': [
            {'method': receipt['payment_method'], 'count': receipt['count'], 'revenue': str(round(float(receipt['revenue'] or 0), 2))}
            for receipt in receipts
        ]
    }


def build_budget_forecast() -> dict:
    budgets = Budget.objects.all()
    return {
        'budget_count': budgets.count(),
        'forecast_horizon': '90 days',
        'forecast_growth': '7%',
    }


def build_seller_payout_report() -> dict:
    payouts = (
        Transaction.objects.filter(status='paid')
        .values('vendor__id', 'vendor__user__first_name')
        .annotate(total_payout=Sum('amount'), payout_count=Count('id'))
        .order_by('-total_payout')[:8]
    )
    return {
        'top_payouts': [
            {
                'vendor_id': str(item['vendor__id']),
                'vendor_name': item['vendor__user__first_name'] or '',
                'total_payout': str(round(float(item['total_payout'] or 0), 2)),
                'payout_count': item['payout_count'],
            }
            for item in payouts
        ]
    }


def build_vendor_analytics_snapshot(vendor_id: str | None = None) -> dict:
    return {
        'snapshot': build_snapshot().as_dict(),
        'vendor_analytics': build_vendor_analytics(vendor_id=vendor_id),
        'funnel': build_vendor_growth_funnel(vendor_id=vendor_id),
        'refund_overview': build_refund_overview(vendor_id=vendor_id),
        'dispute_backlog': build_dispute_backlog(vendor_id=vendor_id),
    }


def family_bundle(family_slug: str) -> dict:
    blueprint = family_blueprint_map().get(family_slug)
    if blueprint is None:
        raise KeyError(family_slug)
    cards = cards_for_family(family_slug)
    moods = Counter(card['mood'] for card in cards)
    motifs = Counter(card['motif'] for card in cards)
    top_mood = moods.most_common(1)[0][0] if moods else ''
    top_motif = motifs.most_common(1)[0][0] if motifs else ''
    return {
        **blueprint,
        'card_count': len(cards),
        'top_mood': top_mood,
        'top_motif': top_motif,
    }


def family_cards(family_slug: str) -> list[dict]:
    return cards_for_family(family_slug)


def family_card_detail(family_slug: str, key: str) -> dict | None:
    return card_for_key(family_slug, key)


def compare_family_cards(family_slug: str) -> list[dict]:
    cards = cards_for_family(family_slug)
    if not cards:
        return []
    ranked = sorted(cards, key=lambda card: (card['rank'], card['key']))
    comparison = []
    for left, right in zip(ranked, ranked[1:]):
        comparison.append(
            {
                'left_key': left['key'],
                'right_key': right['key'],
                'left_mood': left['mood'],
                'right_mood': right['mood'],
                'left_motif': left['motif'],
                'right_motif': right['motif'],
                'score_gap': abs(left['rank'] - right['rank']),
                'shared_tags': sorted(set(left['tags']) & set(right['tags'])),
            }
        )
    return comparison


def build_family_summary(family_slug: str) -> dict:
    cards = cards_for_family(family_slug)
    if not cards:
        return {'family': family_slug, 'count': 0, 'mean_rank': 0, 'spread': 0}
    ranks = [card['rank'] for card in cards]
    moods = Counter(card['mood'] for card in cards)
    motifs = Counter(card['motif'] for card in cards)
    return {
        'family': family_slug,
        'count': len(cards),
        'mean_rank': round(mean(ranks), 2),
        'spread': max(ranks) - min(ranks),
        'dominant_mood': moods.most_common(1)[0][0],
        'dominant_motif': motifs.most_common(1)[0][0],
    }


def build_family_export(family_slug: str) -> dict:
    snapshot = build_snapshot().as_dict()
    return {
        'family': family_slug,
        'snapshot': snapshot,
        'blueprint': family_bundle(family_slug),
        'cards': family_cards(family_slug),
        'summary': build_family_summary(family_slug),
        'generated_at': snapshot['generated_at'],
    }


def manifest_payload() -> dict:
    snapshot = build_snapshot().as_dict()
    return {
        'title': 'Atlas Market Lab',
        'subtitle': 'A multi-route public lens over commerce, trust, rhythm, and pricing.',
        'generated_at': snapshot['generated_at'],
        'snapshot': snapshot,
        'families': [family_bundle(family['slug']) for family in FAMILY_BLUEPRINTS],
        'cards': FAMILY_CARDS,
    }


def narrative_for_family(family_slug: str) -> dict:
    cards = cards_for_family(family_slug)
    if not cards:
        return {'family': family_slug, 'narrative': '', 'highlights': []}
    highlights = [card['summary'] for card in cards[:3]]
    narrative = ' '.join(highlights)
    return {
        'family': family_slug,
        'narrative': narrative,
        'highlights': highlights,
    }


def metric_layers() -> list[dict]:
    snapshot = build_snapshot().as_dict()
    return [
        {'label': 'market-signal', 'value': snapshot['submission_count']},
        {'label': 'verified-trust', 'value': snapshot['verified_vendors']},
        {'label': 'public-reach', 'value': snapshot['notification_count']},
        {'label': 'economic-flow', 'value': snapshot['transaction_count']},
        {'label': 'budget-rhythm', 'value': snapshot['budget_count'] + snapshot['expense_count']},
    ]
