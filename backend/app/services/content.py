"""Site content: stored overrides merged on top of the defaults."""

from app.config import Settings
from app.db import Database
from app.schemas import SECTIONS
from app.services.seed import default_content


async def get_all_content(db: Database, settings: Settings) -> dict[str, dict[str, dict]]:
    defaults = default_content(settings.admin_phone)
    stored = {doc["section"]: doc async for doc in db.site_content.find({}, {"_id": 0})}
    merged: dict[str, dict[str, dict]] = {}
    for section in SECTIONS:
        doc = stored.get(section, {})
        merged[section] = {
            lang: {**defaults[section][lang], **(doc.get(f"content_{lang}") or {})} for lang in ("ar", "en")
        }
    return merged
