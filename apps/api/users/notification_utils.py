"""
Centralised helper for creating Notification records.

Every notification flows through `create_notification()` which:
1. Checks the user's `notification_preferences` (opt-out).
2. Creates the DB row (which triggers the `post_save` signal → Express).
"""

import logging
from .models import Notification, User

logger = logging.getLogger(__name__)

# Maps notification type → preference key the user can toggle off.
_TYPE_TO_PREF = {
    'price_alert': 'price_alerts',
    'budget_warning': 'budget_alerts',
    'submission_status': 'submission_alerts',
    'vendor_verification': 'vendor_alerts',
}


def create_notification(
    user: User,
    notification_type: str,
    message: str,
    metadata: dict | None = None,
) -> Notification | None:
    """Create a notification if the user hasn't opted out of this type.

    Returns the created ``Notification`` or ``None`` if suppressed.
    """
    prefs = user.notification_preferences or {}
    pref_key = _TYPE_TO_PREF.get(notification_type)

    # If the user explicitly disabled this notification type, skip.
    if pref_key and prefs.get(pref_key) is False:
        logger.debug(
            "Notification suppressed for user %s (type=%s, pref=%s)",
            user.pk, notification_type, pref_key,
        )
        return None

    return Notification.objects.create(
        user=user,
        type=notification_type,
        message=message,
        metadata=metadata or {},
    )


def recent_budget_alert_exists(
    user: User,
    *,
    budget_id: int,
    severity: str,
    scope: str,
    category: str | None = None,
    within_hours: int = 24,
) -> bool:
    """Avoid spamming the same budget threshold on every small expense."""
    from datetime import timedelta

    from django.utils import timezone

    since = timezone.now() - timedelta(hours=within_hours)
    qs = Notification.objects.filter(
        user=user,
        type="budget_warning",
        created_at__gte=since,
        metadata__budget_id=budget_id,
        metadata__severity=severity,
        metadata__scope=scope,
    )
    if category is not None:
        qs = qs.filter(metadata__category=category)
    return qs.exists()
