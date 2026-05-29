import json
import logging
import urllib.error
import urllib.request

from django.conf import settings
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from .models import Notification, Vendor

logger = logging.getLogger(__name__)

# Socket.io event names (Next.js RealtimeProvider listens for these).
_EVENT_BY_NOTIFICATION_TYPE = {
    "budget_warning": "notification:budget_alert",
    "price_spike": "notification:price_spike",
    "price_alert": "notification:price_alert",
    "vendor_deal": "notification:vendor_deal",
    "delivery_update": "notification:delivery_update",
    "payment": "notification:payment_confirmation",
    "submission_status": "notification:submission_status",
    "vendor_verification": "notification:vendor_verification",
}


def _emit_realtime_bridge(user_id: str, event: str, payload: dict) -> None:
    """Deliver to Express Socket.io: Redis PUB/SUB if configured, else HTTP internal emit."""
    envelope = json.dumps(
        {"userId": user_id, "event": event, "payload": payload},
        default=str,
    )
    redis_url = getattr(settings, "REDIS_URL", "") or ""
    if redis_url:
        try:
            import redis

            r = redis.from_url(redis_url, decode_responses=True)
            r.publish("spendsense:notifications", envelope)
            logger.debug("Realtime notification published to Redis (%s)", event)
            return
        except Exception as exc:
            logger.warning("Redis publish failed, falling back to HTTP: %s", exc)

    base = getattr(settings, "REALTIME_INTERNAL_URL", "") or ""
    token = getattr(settings, "REALTIME_INTERNAL_TOKEN", "")
    if not base:
        return
    url = f"{base.rstrip('/')}/internal/emit"
    req = urllib.request.Request(
        url,
        data=json.dumps(
            {"userId": user_id, "event": event, "payload": payload},
            default=str,
        ).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "X-Internal-Token": token,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=3) as resp:
            if resp.status >= 400:
                logger.warning("Realtime emit returned %s", resp.status)
    except urllib.error.URLError as e:
        logger.debug("Realtime emit skipped: %s", e)


def emit_realtime_broadcast(room: str, event: str, payload: dict) -> None:
    """Deliver a room broadcast to Express Socket.io: Redis PUB/SUB if configured, else HTTP internal emit."""
    envelope = json.dumps(
        {"room": room, "event": event, "payload": payload},
        default=str,
    )
    redis_url = getattr(settings, "REDIS_URL", "") or ""
    if redis_url:
        try:
            import redis

            r = redis.from_url(redis_url, decode_responses=True)
            r.publish("spendsense:notifications", envelope)
            logger.debug("Realtime broadcast published to Redis (%s)", event)
            return
        except Exception as exc:
            logger.warning("Redis publish failed, falling back to HTTP: %s", exc)

    base = getattr(settings, "REALTIME_INTERNAL_URL", "") or ""
    token = getattr(settings, "REALTIME_INTERNAL_TOKEN", "")
    if not base:
        return
    url = f"{base.rstrip('/')}/internal/emit"
    req = urllib.request.Request(
        url,
        data=json.dumps(
            {"room": room, "event": event, "payload": payload},
            default=str,
        ).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "X-Internal-Token": token,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=3) as resp:
            if resp.status >= 400:
                logger.warning("Realtime broadcast emit returned %s", resp.status)
    except urllib.error.URLError as e:
        logger.debug("Realtime broadcast emit skipped: %s", e)


@receiver(post_save, sender=Notification)
def push_notification_to_realtime(sender, instance, created, **kwargs):
    if not created:
        return
    event_name = _EVENT_BY_NOTIFICATION_TYPE.get(instance.type, "notification:generic")
    payload = {
        "id": instance.id,
        "type": instance.type,
        "message": instance.message,
        "metadata": instance.metadata if instance.metadata else {},
        "created_at": instance.created_at.isoformat() if instance.created_at else None,
    }
    _emit_realtime_bridge(str(instance.user_id), event_name, payload)


@receiver(pre_save, sender=Vendor)
def on_vendor_verification_change(sender, instance, **kwargs):
    """Notify vendor owner when verification reaches a final outcome (not queue states)."""
    if instance.pk is None:
        return

    try:
        old = Vendor.objects.get(pk=instance.pk)
    except Vendor.DoesNotExist:
        return

    if old.verification_status == instance.verification_status:
        return

    new_status = instance.verification_status
    # Only terminal / actionable outcomes (skip requested → pending, etc.).
    if new_status not in ("verified", "rejected"):
        return

    from .notification_utils import create_notification

    if new_status == "verified":
        message = (
            f'Congratulations! Your business "{instance.shop_name}" has been verified. '
            f"You now have a verified badge on your profile."
        )
    else:
        message = (
            f'Your verification request for "{instance.shop_name}" was not approved. '
            f"Please update your documents and try again."
        )

    create_notification(
        user=instance.owner,
        notification_type="vendor_verification",
        message=message,
        metadata={
            "vendor_id": str(instance.pk),
            "shop_name": instance.shop_name,
            "status": new_status,
        },
    )
