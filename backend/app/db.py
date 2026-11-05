"""MongoDB connection and index management."""

import logging

from pymongo import ASCENDING, DESCENDING, AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase

from app.config import Settings

logger = logging.getLogger(__name__)

Database = AsyncDatabase


def create_client(settings: Settings) -> AsyncMongoClient:
    return AsyncMongoClient(settings.mongo_url, tz_aware=True, serverSelectionTimeoutMS=10_000)


async def ensure_indexes(db: Database, settings: Settings) -> None:
    """Create indexes (idempotent). TTL indexes keep transient collections small."""
    await db.products.create_index("id", unique=True)
    await db.products.create_index([("available", ASCENDING), ("sort_order", ASCENDING)])

    await db.gallery.create_index("id", unique=True)
    await db.gallery.create_index("order")

    await db.site_content.create_index("section", unique=True)
    await db.settings.create_index("type", unique=True)
    await db.admin_users.create_index("username", unique=True)

    await db.orders.create_index("id", unique=True)
    await db.orders.create_index([("status", ASCENDING), ("created_at", DESCENDING)])
    await db.orders.create_index([("customer_phone", ASCENDING), ("created_at", DESCENDING)])
    # Orders that were never verified are removed automatically.
    await db.orders.create_index(
        "expires_at",
        name="unverified_order_ttl",
        expireAfterSeconds=0,
        partialFilterExpression={"status": "pending_verification"},
    )

    await db.otp_codes.create_index("order_id", unique=True)
    await db.otp_codes.create_index("expires_at", expireAfterSeconds=0)

    await db.rate_limits.create_index([("key", ASCENDING), ("created_at", ASCENDING)])
    await db.rate_limits.create_index("expires_at", expireAfterSeconds=0)
    logger.info("MongoDB indexes ensured")
