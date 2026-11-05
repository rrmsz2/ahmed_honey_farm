"""Order creation and OTP verification logic."""

from datetime import timedelta

from fastapi import HTTPException, status
from pymongo import ReturnDocument

from app.config import Settings
from app.db import Database
from app.schemas import OrderCreate, OrderStatus, new_id, utcnow
from app.security import generate_otp, hash_otp, otp_matches

PUBLIC_ORDER_FIELDS = ("id", "number", "status", "total", "items", "created_at")


async def _next_order_number(db: Database) -> str:
    counter = await db.counters.find_one_and_update(
        {"_id": "orders"}, {"$inc": {"value": 1}}, upsert=True, return_document=ReturnDocument.AFTER
    )
    return f"HF-{1000 + counter['value']}"


async def build_order(db: Database, settings: Settings, data: OrderCreate) -> dict:
    """Prices and names always come from the database, never from the client."""
    quantities: dict[str, int] = {}
    for item in data.items:
        quantities[item.product_id] = quantities.get(item.product_id, 0) + item.quantity

    products = {
        p["id"]: p async for p in db.products.find({"id": {"$in": list(quantities)}, "available": True}, {"_id": 0})
    }
    missing = [pid for pid in quantities if pid not in products]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="بعض المنتجات في السلة لم تعد متوفرة، الرجاء تحديث السلة",
        )

    items = [
        {
            "product_id": pid,
            "name_ar": products[pid]["name_ar"],
            "name_en": products[pid]["name_en"],
            "price": round(float(products[pid]["price"]), 3),
            "quantity": qty,
        }
        for pid, qty in quantities.items()
    ]
    total = round(sum(i["price"] * i["quantity"] for i in items), 3)
    now = utcnow()
    return {
        "id": new_id(),
        "number": await _next_order_number(db),
        "customer_name": data.customer_name,
        "customer_phone": data.customer_phone,
        "language": data.language,
        "items": items,
        "total": total,
        "status": OrderStatus.PENDING_VERIFICATION.value,
        "otp_verified": False,
        "created_at": now,
        "updated_at": now,
        "expires_at": now + timedelta(hours=settings.unverified_order_ttl_hours),
    }


async def issue_otp(db: Database, settings: Settings, order: dict) -> str:
    code = generate_otp()
    now = utcnow()
    await db.otp_codes.replace_one(
        {"order_id": order["id"]},
        {
            "order_id": order["id"],
            "code_hash": hash_otp(code, order["id"], settings.jwt_secret),
            "attempts": 0,
            "created_at": now,
            "expires_at": now + timedelta(minutes=settings.otp_ttl_minutes),
        },
        upsert=True,
    )
    return code


async def ensure_resend_allowed(db: Database, settings: Settings, order_id: str) -> None:
    otp = await db.otp_codes.find_one({"order_id": order_id})
    if otp and utcnow() - otp["created_at"] < timedelta(seconds=settings.otp_resend_cooldown_seconds):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="الرجاء الانتظار دقيقة قبل طلب رمز جديد",
        )


async def verify_otp(db: Database, settings: Settings, order_id: str, code: str) -> dict:
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="الطلب غير موجود")
    if order["status"] != OrderStatus.PENDING_VERIFICATION:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="تم تأكيد هذا الطلب مسبقاً")

    otp = await db.otp_codes.find_one({"order_id": order_id})
    if otp is None or otp["expires_at"] < utcnow():
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="انتهت صلاحية الرمز، اطلب رمزاً جديداً")
    if otp["attempts"] >= settings.otp_max_attempts:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="تجاوزت عدد المحاولات المسموح، اطلب رمزاً جديداً",
        )

    if not otp_matches(code, order_id, settings.jwt_secret, otp["code_hash"]):
        await db.otp_codes.update_one({"_id": otp["_id"]}, {"$inc": {"attempts": 1}})
        remaining = settings.otp_max_attempts - otp["attempts"] - 1
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"رمز التحقق غير صحيح (المحاولات المتبقية: {max(remaining, 0)})",
        )

    # Atomic transition guards against double confirmation from concurrent requests.
    confirmed = await db.orders.find_one_and_update(
        {"id": order_id, "status": OrderStatus.PENDING_VERIFICATION.value},
        {
            "$set": {"status": OrderStatus.CONFIRMED.value, "otp_verified": True, "updated_at": utcnow()},
            "$unset": {"expires_at": ""},
        },
        projection={"_id": 0},
        return_document=ReturnDocument.AFTER,
    )
    if confirmed is None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="تم تأكيد هذا الطلب مسبقاً")
    await db.otp_codes.delete_one({"_id": otp["_id"]})
    return confirmed


def public_order(order: dict) -> dict:
    return {key: order[key] for key in PUBLIC_ORDER_FIELDS}
