"""Request/response schemas."""

import re
import uuid
from datetime import UTC, datetime
from enum import StrEnum
from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator

Language = Literal["ar", "en"]
SECTIONS = ("hero", "story", "contact", "footer")
Section = Literal["hero", "story", "contact", "footer"]

_OMAN_MOBILE = re.compile(r"^\+968[79]\d{7}$")


def new_id() -> str:
    return str(uuid.uuid4())


def utcnow() -> datetime:
    return datetime.now(UTC)


def normalize_oman_phone(value: str) -> str:
    """Accept `9xxxxxxx`, `+9689xxxxxxx`, `009689xxxxxxx` (spaces/dashes allowed) → `+9689xxxxxxx`."""
    digits = re.sub(r"[\s\-()]", "", value or "")
    if digits.startswith("00"):
        digits = "+" + digits[2:]
    elif digits.startswith("968") and len(digits) == 11:
        digits = "+" + digits
    elif not digits.startswith("+"):
        digits = "+968" + digits
    if not _OMAN_MOBILE.match(digits):
        raise ValueError("رقم الهاتف يجب أن يكون رقم جوال عُماني صحيح (8 أرقام يبدأ بـ 9 أو 7)")
    return digits


class OrderStatus(StrEnum):
    PENDING_VERIFICATION = "pending_verification"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


REVENUE_STATUSES = (OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.DELIVERED)

ShortText = Annotated[str, Field(min_length=1, max_length=120)]
LongText = Annotated[str, Field(max_length=2000)]


class _Strict(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


# ---------- Products ----------
class ProductIn(_Strict):
    name_ar: ShortText
    name_en: ShortText
    description_ar: LongText = ""
    description_en: LongText = ""
    price: float = Field(gt=0, le=100_000)
    weight: Annotated[str, Field(max_length=40)] = ""
    image_url: HttpUrl
    available: bool = True
    sort_order: int = 0

    @field_validator("price")
    @classmethod
    def _round_price(cls, v: float) -> float:
        return round(v, 3)  # Omani rial has 3 decimals (baisa)


class ProductUpdate(_Strict):
    name_ar: ShortText | None = None
    name_en: ShortText | None = None
    description_ar: LongText | None = None
    description_en: LongText | None = None
    price: float | None = Field(default=None, gt=0, le=100_000)
    weight: Annotated[str, Field(max_length=40)] | None = None
    image_url: HttpUrl | None = None
    available: bool | None = None
    sort_order: int | None = None


# ---------- Gallery ----------
class GalleryImageIn(_Strict):
    url: HttpUrl
    caption_ar: ShortText
    caption_en: ShortText
    order: int = 0


# ---------- Orders ----------
class OrderItemIn(_Strict):
    product_id: Annotated[str, Field(min_length=1, max_length=64)]
    quantity: int = Field(ge=1, le=50)


class OrderCreate(_Strict):
    customer_name: Annotated[str, Field(min_length=2, max_length=80)]
    customer_phone: str
    items: list[OrderItemIn] = Field(min_length=1, max_length=20)
    language: Language = "ar"

    @field_validator("customer_phone")
    @classmethod
    def _phone(cls, v: str) -> str:
        return normalize_oman_phone(v)


class OTPVerification(_Strict):
    order_id: Annotated[str, Field(min_length=1, max_length=64)]
    otp: Annotated[str, Field(pattern=r"^\d{6}$")]


class ResendOTP(_Strict):
    order_id: Annotated[str, Field(min_length=1, max_length=64)]


class OrderStatusUpdate(_Strict):
    status: Literal["confirmed", "processing", "delivered", "cancelled"]


# ---------- Content ----------
class SiteContentUpdate(_Strict):
    content_ar: dict[str, Any] = Field(default_factory=dict)
    content_en: dict[str, Any] = Field(default_factory=dict)


# ---------- Admin ----------
class AdminLogin(_Strict):
    username: Annotated[str, Field(min_length=1, max_length=64)]
    password: Annotated[str, Field(min_length=1, max_length=128)]


class PasswordChange(_Strict):
    current_password: Annotated[str, Field(min_length=1, max_length=128)]
    new_password: Annotated[str, Field(min_length=10, max_length=128)]


class WhatsAppSettingsUpdate(_Strict):
    # Empty/missing api_key keeps the stored one.
    api_key: Annotated[str, Field(max_length=200)] | None = None
    admin_phone: str

    @field_validator("admin_phone")
    @classmethod
    def _phone(cls, v: str) -> str:
        return normalize_oman_phone(v)
