"""WhatsApp messaging through the TextMeBot HTTP API.

Credentials come from the admin settings stored in MongoDB, falling back to environment variables.
Sending never raises: failures are logged and reported as `False`.
"""

import asyncio
import logging
from dataclasses import dataclass

import httpx

from app.config import Settings
from app.db import Database

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class WhatsAppConfig:
    api_key: str | None
    admin_phone: str | None


async def load_config(db: Database, settings: Settings) -> WhatsAppConfig:
    stored = await db.settings.find_one({"type": "whatsapp"}) or {}
    return WhatsAppConfig(
        api_key=stored.get("api_key") or settings.whatsapp_api_key,
        admin_phone=stored.get("admin_phone") or settings.admin_phone,
    )


class WhatsAppClient:
    def __init__(self, settings: Settings, http: httpx.AsyncClient | None = None) -> None:
        self._settings = settings
        self._http = http or httpx.AsyncClient(timeout=20)

    async def aclose(self) -> None:
        await self._http.aclose()

    async def send(self, config: WhatsAppConfig, recipient: str, text: str) -> bool:
        masked = f"{recipient[:-4]}****" if len(recipient) > 4 else recipient
        if self._settings.whatsapp_dry_run:
            logger.info("[dry-run] WhatsApp to %s:\n%s", masked, text)
            return True
        if not config.api_key:
            logger.warning("WhatsApp API key is not configured; message to %s not sent", masked)
            return False
        try:
            response = await self._http.get(
                self._settings.whatsapp_api_url,
                params={"recipient": recipient, "apikey": config.api_key, "text": text, "json": "yes"},
            )
            response.raise_for_status()
        except httpx.HTTPError as exc:
            # Do not log the URL: it contains the API key.
            logger.error("WhatsApp send to %s failed: %s", masked, type(exc).__name__)
            return False
        logger.info("WhatsApp message sent to %s", masked)
        return True


# ---------- Message templates ----------
def _money(value: float) -> str:
    return f"{value:.3f}".rstrip("0").rstrip(".")


def _items_text(items: list[dict]) -> str:
    return "\n".join(
        f"• {item['name_ar']} × {item['quantity']} — {_money(item['price'] * item['quantity'])} ر.ع" for item in items
    )


def otp_message(name: str, otp: str, ttl_minutes: int) -> str:
    return (
        f"مرحباً {name}! 👋\n\n"
        f"رمز التحقق الخاص بك: *{otp}*\n\n"
        f"الرمز صالح لمدة {ttl_minutes} دقائق ⏰\n"
        "لا تشارك هذا الرمز مع أي شخص.\n\n"
        "منحل أحمد 🍯"
    )


def customer_confirmation_message(order: dict, contact_phone: str | None) -> str:
    lines = [
        f"شكراً {order['customer_name']}! ✅",
        "تم تأكيد طلبك بنجاح",
        "",
        f"🧾 رقم الطلب: {order['number']}",
        "📦 تفاصيل الطلب:",
        _items_text(order["items"]),
        "",
        f"💰 المجموع الكلي: {_money(order['total'])} ر.ع",
        "",
        "سنتواصل معك قريباً لتأكيد التوصيل والدفع 🚚",
        "",
        "منحل أحمد 🍯",
    ]
    if contact_phone:
        lines.append(contact_phone)
    return "\n".join(lines)


def admin_notification_message(order: dict) -> str:
    created = order["created_at"].strftime("%Y-%m-%d %H:%M UTC")
    return "\n".join(
        [
            "🔔 طلب جديد!",
            "",
            f"🧾 رقم الطلب: {order['number']}",
            f"👤 العميل: {order['customer_name']}",
            f"📱 الهاتف: {order['customer_phone']}",
            "",
            "📦 المنتجات:",
            _items_text(order["items"]),
            "",
            f"💰 المجموع الكلي: {_money(order['total'])} ر.ع",
            f"⏰ وقت الطلب: {created}",
            "",
            "يرجى التواصل مع العميل لتأكيد التوصيل والدفع",
        ]
    )


async def notify_order_confirmed(client: WhatsAppClient, db: Database, settings: Settings, order: dict) -> None:
    """Background task: confirmation to the customer, then (after a delay) a notification to the admin."""
    try:
        config = await load_config(db, settings)
        await client.send(config, order["customer_phone"], customer_confirmation_message(order, config.admin_phone))
        if not config.admin_phone:
            logger.warning("Admin phone is not configured; skipping admin notification")
            return
        await asyncio.sleep(settings.admin_notification_delay_seconds)
        await client.send(config, config.admin_phone, admin_notification_message(order))
    except Exception:  # pragma: no cover - background task must never crash silently
        logger.exception("Failed to send order notifications for %s", order.get("id"))
