"""Initialize database with sample data"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def init_products():
    """Initialize products"""
    # Check if products already exist
    count = await db.products.count_documents({})
    if count > 0:
        print(f"Products already exist ({count} products). Skipping...")
        return
    
    products = [
        {
            'id': str(uuid.uuid4()),
            'name_ar': 'عسل الزهور البرية',
            'name_en': 'Wildflower Honey',
            'description_ar': 'عسل طبيعي من رحيق الزهور البرية، غني بالفيتامينات والمعادن',
            'description_en': 'Natural honey from wild flower nectar, rich in vitamins and minerals',
            'price': 120.0,
            'weight': '1 كيلو',
            'image_url': 'https://images.unsplash.com/photo-1645549826194-1956802d83c2',
            'available': True,
            'created_at': datetime.utcnow()
        },
        {
            'id': str(uuid.uuid4()),
            'name_ar': 'عسل السدر',
            'name_en': 'Sidr Honey',
            'description_ar': 'عسل السدر الفاخر، من أجود أنواع العسل العلاجية',
            'description_en': 'Premium Sidr honey, one of the finest therapeutic honey varieties',
            'price': 200.0,
            'weight': '1 كيلو',
            'image_url': 'https://images.unsplash.com/photo-1720765491527-2f57eaefdcbb',
            'available': True,
            'created_at': datetime.utcnow()
        },
        {
            'id': str(uuid.uuid4()),
            'name_ar': 'عسل الحمضيات',
            'name_en': 'Citrus Honey',
            'description_ar': 'عسل بنكهة الحمضيات المنعشة، مثالي لتعزيز المناعة',
            'description_en': 'Honey with refreshing citrus flavor, perfect for boosting immunity',
            'price': 150.0,
            'weight': '1 كيلو',
            'image_url': 'https://images.pexels.com/photos/18231108/pexels-photo-18231108.jpeg',
            'available': True,
            'created_at': datetime.utcnow()
        }
    ]
    
    await db.products.insert_many(products)
    print(f"✓ Inserted {len(products)} products")

async def init_gallery():
    """Initialize gallery images"""
    count = await db.gallery.count_documents({})
    if count > 0:
        print(f"Gallery images already exist ({count} images). Skipping...")
        return
    
    gallery_images = [
        {
            'id': str(uuid.uuid4()),
            'url': 'https://images.unsplash.com/photo-1751482820009-7e8a0cd07719',
            'caption_ar': 'خلايا النحل في المنحل',
            'caption_en': 'Beehives at the Apiary',
            'order': 1,
            'created_at': datetime.utcnow()
        },
        {
            'id': str(uuid.uuid4()),
            'url': 'https://images.unsplash.com/photo-1634525979433-6533e5d64812',
            'caption_ar': 'النحل يجمع الرحيق',
            'caption_en': 'Bees Collecting Nectar',
            'order': 2,
            'created_at': datetime.utcnow()
        },
        {
            'id': str(uuid.uuid4()),
            'url': 'https://images.pexels.com/photos/5247995/pexels-photo-5247995.jpeg',
            'caption_ar': 'العمل في المنحل',
            'caption_en': 'Working at the Apiary',
            'order': 3,
            'created_at': datetime.utcnow()
        },
        {
            'id': str(uuid.uuid4()),
            'url': 'https://images.unsplash.com/photo-1697197897016-f9abb34cfeea',
            'caption_ar': 'عملية التلقيح',
            'caption_en': 'Pollination Process',
            'order': 4,
            'created_at': datetime.utcnow()
        },
        {
            'id': str(uuid.uuid4()),
            'url': 'https://images.unsplash.com/photo-1758522965567-02aaa48cd510',
            'caption_ar': 'أحمد يفحص الخلايا',
            'caption_en': 'Ahmad Inspecting Hives',
            'order': 5,
            'created_at': datetime.utcnow()
        },
        {
            'id': str(uuid.uuid4()),
            'url': 'https://images.unsplash.com/photo-1758522964581-a60c3e87a44e',
            'caption_ar': 'تسجيل بيانات الإنتاج',
            'caption_en': 'Recording Production Data',
            'order': 6,
            'created_at': datetime.utcnow()
        }
    ]
    
    await db.gallery.insert_many(gallery_images)
    print(f"✓ Inserted {len(gallery_images)} gallery images")

async def main():
    print("Initializing database with sample data...")
    try:
        await init_products()
        await init_gallery()
        print("\n✅ Database initialized successfully!")
    except Exception as e:
        print(f"\n❌ Error initializing database: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())
