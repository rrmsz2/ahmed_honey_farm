"""Public storefront API."""

from datetime import timedelta

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, status

from app.deps import DbDep, SettingsDep, client_ip, hit_rate_limit
from app.schemas import OrderCreate, OTPVerification, ResendOTP
from app.services import orders as order_service
from app.services import whatsapp
from app.services.content import get_all_content

router = APIRouter(tags=["public"])

HOUR = timedelta(hours=1)


@router.get("/health")
async def health(db: DbDep) -> dict:
    await db.command("ping")
    return {"status": "ok"}


@router.get("/products")
async def list_products(db: DbDep) -> dict:
    cursor = db.products.find({"available": True}, {"_id": 0}).sort([("sort_order", 1), ("created_at", 1)])
    return {"products": await cursor.to_list(200)}


@router.get("/gallery")
async def list_gallery(db: DbDep) -> dict:
    cursor = db.gallery.find({}, {"_id": 0}).sort([("order", 1), ("created_at", 1)])
    return {"images": await cursor.to_list(200)}


@router.get("/site-content")
async def site_content(db: DbDep, settings: SettingsDep) -> dict:
    return {"content": await get_all_content(db, settings)}


@router.post("/orders", status_code=status.HTTP_201_CREATED)
async def create_order(data: OrderCreate, request: Request, db: DbDep, settings: SettingsDep) -> dict:
    await hit_rate_limit(db, f"order:ip:{client_ip(request)}", settings.orders_per_ip_per_hour, HOUR)
    await hit_rate_limit(db, f"order:phone:{data.customer_phone}", settings.orders_per_phone_per_hour, HOUR)

    order = await order_service.build_order(db, settings, data)
    await db.orders.insert_one(dict(order))
    code = await order_service.issue_otp(db, settings, order)

    config = await whatsapp.load_config(db, settings)
    sent = await request.app.state.whatsapp.send(
        config, order["customer_phone"], whatsapp.otp_message(order["customer_name"], code, settings.otp_ttl_minutes)
    )
    if not sent:
        await db.orders.delete_one({"id": order["id"]})
        await db.otp_codes.delete_one({"order_id": order["id"]})
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="تعذر إرسال رمز التحقق عبر واتساب، الرجاء المحاولة لاحقاً",
        )

    return {
        "order_id": order["id"],
        "number": order["number"],
        "total": order["total"],
        "otp_expires_in": settings.otp_ttl_minutes * 60,
        "resend_after": settings.otp_resend_cooldown_seconds,
    }


@router.post("/orders/verify-otp")
async def verify_order(
    data: OTPVerification, request: Request, background: BackgroundTasks, db: DbDep, settings: SettingsDep
) -> dict:
    await hit_rate_limit(db, f"verify:ip:{client_ip(request)}", 30, timedelta(minutes=15))
    order = await order_service.verify_otp(db, settings, data.order_id, data.otp)
    background.add_task(whatsapp.notify_order_confirmed, request.app.state.whatsapp, db, settings, order)
    return {"order": order_service.public_order(order)}


@router.post("/orders/resend-otp")
async def resend_otp(data: ResendOTP, request: Request, db: DbDep, settings: SettingsDep) -> dict:
    order = await db.orders.find_one({"id": data.order_id}, {"_id": 0})
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="الطلب غير موجود")
    if order["status"] != "pending_verification":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="تم تأكيد هذا الطلب مسبقاً")

    await order_service.ensure_resend_allowed(db, settings, order["id"])
    await hit_rate_limit(db, f"resend:phone:{order['customer_phone']}", 5, HOUR)
    code = await order_service.issue_otp(db, settings, order)
    config = await whatsapp.load_config(db, settings)
    sent = await request.app.state.whatsapp.send(
        config, order["customer_phone"], whatsapp.otp_message(order["customer_name"], code, settings.otp_ttl_minutes)
    )
    if not sent:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="تعذر إرسال رمز التحقق عبر واتساب")
    return {"resend_after": settings.otp_resend_cooldown_seconds}
