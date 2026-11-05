"""FastAPI dependencies and small request helpers."""

from datetime import timedelta
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import Settings
from app.db import Database
from app.schemas import utcnow
from app.security import decode_access_token

_bearer = HTTPBearer(auto_error=False)


def get_db(request: Request) -> Database:
    return request.app.state.db


def get_app_settings(request: Request) -> Settings:
    return request.app.state.settings


SettingsDep = Annotated[Settings, Depends(get_app_settings)]
DbDep = Annotated[Database, Depends(get_db)]


def client_ip(request: Request) -> str:
    """Real client IP. The app runs behind Caddy → nginx, which set X-Forwarded-For."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def current_admin(
    db: DbDep,
    settings: SettingsDep,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> dict:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="انتهت الجلسة، الرجاء تسجيل الدخول مرة أخرى",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise unauthorized
    payload = decode_access_token(credentials.credentials, settings.jwt_secret)
    if not payload or not payload.get("sub"):
        raise unauthorized
    admin = await db.admin_users.find_one({"username": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if admin is None:
        raise unauthorized
    # Tokens issued before a password change are rejected.
    changed_at = admin.get("password_changed_at")
    if changed_at and payload.get("iat", 0) < int(changed_at.timestamp()):
        raise unauthorized
    return admin


AdminDep = Annotated[dict, Depends(current_admin)]


async def hit_rate_limit(db: Database, key: str, limit: int, window: timedelta) -> None:
    """Fixed-window counter stored in MongoDB (TTL-cleaned). Raises 429 when exceeded."""
    now = utcnow()
    count = await db.rate_limits.count_documents({"key": key, "created_at": {"$gt": now - window}})
    if count >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="محاولات كثيرة، الرجاء المحاولة لاحقاً",
        )
    await db.rate_limits.insert_one({"key": key, "created_at": now, "expires_at": now + window})
