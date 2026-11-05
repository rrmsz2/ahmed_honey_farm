"""Admin API (JWT protected, except login)."""

import re
from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, Request, Response, status
from pymongo import ReturnDocument

from app.deps import AdminDep, DbDep, SettingsDep, client_ip, hit_rate_limit
from app.schemas import (
    REVENUE_STATUSES,
    AdminLogin,
    GalleryImageIn,
    OrderStatus,
    OrderStatusUpdate,
    PasswordChange,
    ProductIn,
    ProductUpdate,
    Section,
    SiteContentUpdate,
    WhatsAppSettingsUpdate,
    new_id,
    utcnow,
)
from app.security import DUMMY_PASSWORD_HASH, create_access_token, hash_password, verify_password
from app.services import whatsapp
from app.services.content import get_all_content

router = APIRouter(prefix="/admin", tags=["admin"])


def _not_found(what: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{what} غير موجود")


def _jsonable(model) -> dict:
    return model.model_dump(mode="json", exclude_unset=False)


# ---------- Auth ----------
@router.post("/login")
async def login(credentials: AdminLogin, request: Request, db: DbDep, settings: SettingsDep) -> dict:
    await hit_rate_limit(
        db, f"login:ip:{client_ip(request)}", settings.login_attempts_per_ip_per_15min, timedelta(minutes=15)
    )
    admin = await db.admin_users.find_one({"username": credentials.username})
    valid = verify_password(credentials.password, admin["password_hash"] if admin else DUMMY_PASSWORD_HASH)
    if not admin or not valid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="اسم المستخدم أو كلمة المرور غير صحيحة")
    token = create_access_token(admin["username"], settings.jwt_secret, settings.jwt_expire_minutes)
    return {"access_token": token, "token_type": "bearer", "expires_in": settings.jwt_expire_minutes * 60}


@router.get("/me")
async def me(admin: AdminDep) -> dict:
    return {"username": admin["username"]}


@router.post("/password")
async def change_password(data: PasswordChange, admin: AdminDep, db: DbDep, settings: SettingsDep) -> dict:
    stored = await db.admin_users.find_one({"username": admin["username"]})
    if not stored or not verify_password(data.current_password, stored["password_hash"]):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="كلمة المرور الحالية غير صحيحة")
    # Second precision: tokens issued in the same second as the change stay valid (the new one below).
    changed_at = utcnow().replace(microsecond=0)
    await db.admin_users.update_one(
        {"username": admin["username"]},
        {"$set": {"password_hash": hash_password(data.new_password), "password_changed_at": changed_at}},
    )
    token = create_access_token(admin["username"], settings.jwt_secret, settings.jwt_expire_minutes)
    return {"access_token": token, "token_type": "bearer"}


# ---------- Orders ----------
@router.get("/orders")
async def list_orders(
    _: AdminDep,
    db: DbDep,
    status_filter: Annotated[OrderStatus | None, Query(alias="status")] = None,
    search: Annotated[str | None, Query(max_length=80)] = None,
    limit: Annotated[int, Query(ge=1, le=200)] = 50,
    skip: Annotated[int, Query(ge=0)] = 0,
) -> dict:
    query: dict = {"status": status_filter.value} if status_filter else {"status": {"$ne": "pending_verification"}}
    if search:
        pattern = {"$regex": re.escape(search.strip()), "$options": "i"}
        query["$or"] = [{"customer_name": pattern}, {"customer_phone": pattern}, {"number": pattern}]
    cursor = db.orders.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit)
    return {
        "orders": await cursor.to_list(limit),
        "total": await db.orders.count_documents(query),
        "skip": skip,
        "limit": limit,
    }


@router.get("/orders/stats")
async def order_stats(_: AdminDep, db: DbDep) -> dict:
    counts = {s.value: 0 for s in OrderStatus}
    async for row in await db.orders.aggregate([{"$group": {"_id": "$status", "count": {"$sum": 1}}}]):
        counts[row["_id"]] = row["count"]
    revenue_rows = await (
        await db.orders.aggregate(
            [
                {"$match": {"status": {"$in": [s.value for s in REVENUE_STATUSES]}}},
                {"$group": {"_id": None, "total": {"$sum": "$total"}}},
            ]
        )
    ).to_list(1)
    return {
        "by_status": counts,
        "total_orders": sum(v for k, v in counts.items() if k != "pending_verification"),
        "total_revenue": round(revenue_rows[0]["total"], 3) if revenue_rows else 0,
    }


@router.put("/orders/{order_id}")
async def update_order_status(order_id: str, data: OrderStatusUpdate, _: AdminDep, db: DbDep) -> dict:
    result = await db.orders.update_one(
        {"id": order_id, "status": {"$ne": "pending_verification"}},
        {"$set": {"status": data.status, "updated_at": utcnow()}},
    )
    if result.matched_count == 0:
        raise _not_found("الطلب")
    return {"status": data.status}


# ---------- Products ----------
@router.get("/products")
async def list_all_products(_: AdminDep, db: DbDep) -> dict:
    cursor = db.products.find({}, {"_id": 0}).sort([("sort_order", 1), ("created_at", 1)])
    return {"products": await cursor.to_list(500)}


@router.post("/products", status_code=status.HTTP_201_CREATED)
async def create_product(data: ProductIn, _: AdminDep, db: DbDep) -> dict:
    now = utcnow()
    product = {**_jsonable(data), "id": new_id(), "created_at": now, "updated_at": now}
    await db.products.insert_one(dict(product))
    return {"product": product}


@router.put("/products/{product_id}")
async def update_product(product_id: str, data: ProductUpdate, _: AdminDep, db: DbDep) -> dict:
    changes = {k: v for k, v in data.model_dump(mode="json", exclude_unset=True).items() if v is not None}
    if "price" in changes:
        changes["price"] = round(changes["price"], 3)
    product = await db.products.find_one_and_update(
        {"id": product_id},
        {"$set": {**changes, "updated_at": utcnow()}},
        projection={"_id": 0},
        return_document=ReturnDocument.AFTER,
    )
    if product is None:
        raise _not_found("المنتج")
    return {"product": product}


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str, _: AdminDep, db: DbDep) -> Response:
    if (await db.products.delete_one({"id": product_id})).deleted_count == 0:
        raise _not_found("المنتج")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ---------- Gallery ----------
@router.get("/gallery")
async def list_gallery(_: AdminDep, db: DbDep) -> dict:
    cursor = db.gallery.find({}, {"_id": 0}).sort([("order", 1), ("created_at", 1)])
    return {"images": await cursor.to_list(500)}


@router.post("/gallery", status_code=status.HTTP_201_CREATED)
async def add_gallery_image(data: GalleryImageIn, _: AdminDep, db: DbDep) -> dict:
    image = {**_jsonable(data), "id": new_id(), "created_at": utcnow()}
    await db.gallery.insert_one(dict(image))
    return {"image": image}


@router.put("/gallery/{image_id}")
async def update_gallery_image(image_id: str, data: GalleryImageIn, _: AdminDep, db: DbDep) -> dict:
    image = await db.gallery.find_one_and_update(
        {"id": image_id}, {"$set": _jsonable(data)}, projection={"_id": 0}, return_document=ReturnDocument.AFTER
    )
    if image is None:
        raise _not_found("الصورة")
    return {"image": image}


@router.delete("/gallery/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gallery_image(image_id: str, _: AdminDep, db: DbDep) -> Response:
    if (await db.gallery.delete_one({"id": image_id})).deleted_count == 0:
        raise _not_found("الصورة")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ---------- Site content ----------
@router.get("/site-content")
async def get_content(_: AdminDep, db: DbDep, settings: SettingsDep) -> dict:
    return {"content": await get_all_content(db, settings)}


@router.put("/site-content/{section}")
async def update_content(section: Section, data: SiteContentUpdate, _: AdminDep, db: DbDep) -> dict:
    await db.site_content.update_one(
        {"section": section},
        {"$set": {"content_ar": data.content_ar, "content_en": data.content_en, "updated_at": utcnow()}},
        upsert=True,
    )
    return {"section": section}


# ---------- Settings ----------
def _mask(secret: str | None) -> str | None:
    if not secret:
        return None
    return f"{'•' * max(len(secret) - 4, 4)}{secret[-4:]}"


@router.get("/settings/whatsapp")
async def get_whatsapp_settings(_: AdminDep, db: DbDep, settings: SettingsDep) -> dict:
    config = await whatsapp.load_config(db, settings)
    return {
        "api_key_masked": _mask(config.api_key),
        "has_api_key": bool(config.api_key),
        "admin_phone": config.admin_phone or "",
        "dry_run": settings.whatsapp_dry_run,
    }


@router.put("/settings/whatsapp")
async def update_whatsapp_settings(data: WhatsAppSettingsUpdate, _: AdminDep, db: DbDep) -> dict:
    changes: dict = {"admin_phone": data.admin_phone, "updated_at": utcnow()}
    if data.api_key:
        changes["api_key"] = data.api_key
    await db.settings.update_one({"type": "whatsapp"}, {"$set": changes}, upsert=True)
    return {"admin_phone": data.admin_phone}


@router.post("/settings/whatsapp/test")
async def send_test_message(request: Request, _: AdminDep, db: DbDep, settings: SettingsDep) -> dict:
    config = await whatsapp.load_config(db, settings)
    if not config.admin_phone:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="رقم المشرف غير مضبوط")
    sent = await request.app.state.whatsapp.send(config, config.admin_phone, "✅ رسالة تجريبية من لوحة تحكم منحل أحمد")
    if not sent:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="فشل إرسال الرسالة التجريبية")
    return {"sent": True}
