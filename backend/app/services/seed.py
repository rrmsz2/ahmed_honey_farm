"""Startup bootstrap: first admin account, default site content and sample catalogue."""

import logging

from app.config import Settings
from app.db import Database
from app.schemas import new_id, utcnow
from app.security import hash_password

logger = logging.getLogger(__name__)


def default_content(contact_phone: str | None) -> dict[str, dict[str, dict]]:
    """Default texts for every editable section. Stored values override these field by field."""
    phone = contact_phone or ""
    return {
        "hero": {
            "ar": {
                "title": "عسل أحمد الطبيعي",
                "subtitle": "رحلة طالب في الصف الخامس نحو عالم النحل",
                "description": "من مدرسة زيد بن ثابت الابتدائية إلى منحل حقيقي ينتج أجود أنواع العسل الطبيعي",
                "cta": "اطلب الآن",
                "learnMore": "اعرف قصتي",
                "image": "https://images.unsplash.com/photo-1590334280735-e8121293dbf6",
            },
            "en": {
                "title": "Ahmad's Natural Honey",
                "subtitle": "A 5th Grader's Journey into the World of Bees",
                "description": (
                    "From Zaid Bin Thabit Primary School to a real apiary producing the finest natural honey"
                ),
                "cta": "Order Now",
                "learnMore": "Learn My Story",
                "image": "https://images.unsplash.com/photo-1590334280735-e8121293dbf6",
            },
        },
        "story": {
            "ar": {
                "title": "قصة أحمد",
                "subtitle": "حلم صغير أصبح حقيقة",
                "content": (
                    "أنا أحمد، طالب في الصف الخامس بمدرسة زيد بن ثابت. بدأت رحلتي مع النحل بفضول صغير، "
                    "وتحوّل هذا الفضول إلى شغف ثم إلى منحل حقيقي. أعتني بالخلايا بنفسي بعد المدرسة، "
                    "وأحرص على أن يصلكم عسل طبيعي نقي كما تصنعه النحلات تماماً."
                ),
                "stats": [
                    {"number": "50+", "label": "خلية نحل نشطة"},
                    {"number": "100%", "label": "عسل طبيعي نقي"},
                    {"number": "2024", "label": "بداية الإنتاج"},
                ],
            },
            "en": {
                "title": "Ahmad's Story",
                "subtitle": "A Small Dream That Became Reality",
                "content": (
                    "I'm Ahmad, a 5th grader at Zaid Bin Thabit School. My journey with bees started with a "
                    "little curiosity that grew into a passion and then into a real apiary. I take care of the "
                    "hives myself after school, making sure you get pure natural honey exactly as the bees make it."
                ),
                "stats": [
                    {"number": "50+", "label": "Active Beehives"},
                    {"number": "100%", "label": "Pure Natural Honey"},
                    {"number": "2024", "label": "Production Start"},
                ],
            },
        },
        "contact": {
            "ar": {
                "title": "تواصل معنا",
                "subtitle": "نسعد بطلباتكم واستفساراتكم",
                "phone": phone,
                "whatsapp": phone,
                "hoursDays": "السبت - الخميس",
                "hoursTime": "3:00م - 8:00م",
                "hoursNote": "(بعد المدرسة)",
                "whatsappMessage": "مرحباً، أرغب في الاستفسار عن منتجات عسل أحمد 🍯",
            },
            "en": {
                "title": "Contact Us",
                "subtitle": "We welcome your orders and inquiries",
                "phone": phone,
                "whatsapp": phone,
                "hoursDays": "Saturday - Thursday",
                "hoursTime": "3:00 PM - 8:00 PM",
                "hoursNote": "(After School)",
                "whatsappMessage": "Hello, I would like to inquire about Ahmad's honey products 🍯",
            },
        },
        "footer": {
            "ar": {"tagline": "عسل طبيعي من القلب", "copyright": "© منحل أحمد", "school": "مدرسة زيد بن ثابت"},
            "en": {
                "tagline": "Natural Honey from the Heart",
                "copyright": "© Ahmad's Apiary",
                "school": "Zaid Bin Thabit School",
            },
        },
    }


SAMPLE_PRODUCTS = [
    {
        "name_ar": "عسل الزهور البرية",
        "name_en": "Wildflower Honey",
        "description_ar": "عسل طبيعي من رحيق الزهور البرية، غني بالفيتامينات والمعادن",
        "description_en": "Natural honey from wild flower nectar, rich in vitamins and minerals",
        "price": 12.0,
        "weight": "1 كغ",
        "image_url": "https://images.unsplash.com/photo-1645549826194-1956802d83c2",
    },
    {
        "name_ar": "عسل السدر",
        "name_en": "Sidr Honey",
        "description_ar": "عسل السدر الفاخر، من أجود أنواع العسل العلاجية",
        "description_en": "Premium Sidr honey, one of the finest therapeutic honey varieties",
        "price": 20.0,
        "weight": "1 كغ",
        "image_url": "https://images.unsplash.com/photo-1720765491527-2f57eaefdcbb",
    },
    {
        "name_ar": "عسل الحمضيات",
        "name_en": "Citrus Honey",
        "description_ar": "عسل بنكهة الحمضيات المنعشة، مثالي لتعزيز المناعة",
        "description_en": "Honey with refreshing citrus flavor, perfect for boosting immunity",
        "price": 15.0,
        "weight": "1 كغ",
        "image_url": "https://images.pexels.com/photos/18231108/pexels-photo-18231108.jpeg",
    },
]

SAMPLE_GALLERY = [
    ("https://images.unsplash.com/photo-1751482820009-7e8a0cd07719", "خلايا النحل في المنحل", "Beehives at the Apiary"),
    ("https://images.unsplash.com/photo-1634525979433-6533e5d64812", "النحل يجمع الرحيق", "Bees Collecting Nectar"),
    ("https://images.pexels.com/photos/5247995/pexels-photo-5247995.jpeg", "العمل في المنحل", "Working at the Apiary"),
    ("https://images.unsplash.com/photo-1697197897016-f9abb34cfeea", "عملية التلقيح", "Pollination Process"),
    ("https://images.unsplash.com/photo-1758522965567-02aaa48cd510", "أحمد يفحص الخلايا", "Ahmad Inspecting Hives"),
    (
        "https://images.unsplash.com/photo-1758522964581-a60c3e87a44e",
        "تسجيل بيانات الإنتاج",
        "Recording Production Data",
    ),
]


async def ensure_admin(db: Database, settings: Settings) -> None:
    if await db.admin_users.count_documents({}) > 0:
        return
    if not settings.admin_password:
        logger.warning("No admin account exists. Set ADMIN_PASSWORD to create one on next start.")
        return
    await db.admin_users.insert_one(
        {
            "id": new_id(),
            "username": settings.admin_username,
            "password_hash": hash_password(settings.admin_password),
            "created_at": utcnow(),
        }
    )
    logger.info("Created initial admin account '%s'", settings.admin_username)


async def seed_sample_data(db: Database) -> None:
    now = utcnow()
    if await db.products.count_documents({}) == 0:
        await db.products.insert_many(
            [
                {**p, "id": new_id(), "available": True, "sort_order": i, "created_at": now, "updated_at": now}
                for i, p in enumerate(SAMPLE_PRODUCTS)
            ]
        )
        logger.info("Seeded %d sample products", len(SAMPLE_PRODUCTS))
    if await db.gallery.count_documents({}) == 0:
        await db.gallery.insert_many(
            [
                {"id": new_id(), "url": url, "caption_ar": ar, "caption_en": en, "order": i, "created_at": now}
                for i, (url, ar, en) in enumerate(SAMPLE_GALLERY, start=1)
            ]
        )
        logger.info("Seeded %d gallery images", len(SAMPLE_GALLERY))


async def bootstrap(db: Database, settings: Settings) -> None:
    await ensure_admin(db, settings)
    if settings.seed_sample_data:
        await seed_sample_data(db)
