#!/usr/bin/env python3
"""
Seed script to add sample products to the database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

async def seed_products():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Sample products
    products = [
        {
            'id': str(uuid.uuid4()),
            'name_ar': 'عسل السدر الجبلي',
            'name_en': 'Mountain Sidr Honey',
            'description_ar': 'عسل سدر طبيعي من الجبال العمانية، غني بالفوائد الصحية ومذاق فريد',
            'description_en': 'Natural Sidr honey from Omani mountains, rich in health benefits with unique taste',
            'price': 35.0,
            'weight': '500g',
            'image_url': 'https://images.unsplash.com/photo-1587049352846-4a222e784eaf?w=800',
            'available': True,
            'created_at': datetime.utcnow()
        },
        {
            'id': str(uuid.uuid4()),
            'name_ar': 'عسل السمر الملكي',
            'name_en': 'Royal Acacia Honey',
            'description_ar': 'عسل سمر نقي 100% من أشجار السمر البرية، مثالي للصحة والطاقة',
            'description_en': '100% pure Acacia honey from wild Acacia trees, perfect for health and energy',
            'price': 30.0,
            'weight': '500g',
            'image_url': 'https://images.unsplash.com/photo-1471943311424-646960669fbc?w=800',
            'available': True,
            'created_at': datetime.utcnow()
        },
        {
            'id': str(uuid.uuid4()),
            'name_ar': 'عسل الزهور البرية',
            'name_en': 'Wildflower Honey',
            'description_ar': 'عسل متعدد الأزهار البرية، طعم رائع ومليء بالفوائد الطبيعية',
            'description_en': 'Multi-wildflower honey, wonderful taste full of natural benefits',
            'price': 25.0,
            'weight': '500g',
            'image_url': 'https://images.unsplash.com/photo-1558642891-54be180ea339?w=800',
            'available': True,
            'created_at': datetime.utcnow()
        },
        {
            'id': str(uuid.uuid4()),
            'name_ar': 'عسل السدر الفاخر - كبير',
            'name_en': 'Premium Sidr Honey - Large',
            'description_ar': 'عبوة كبيرة من عسل السدر الفاخر للعائلة، جودة عالية وسعر مميز',
            'description_en': 'Large premium Sidr honey for family, high quality and special price',
            'price': 60.0,
            'weight': '1kg',
            'image_url': 'https://images.unsplash.com/photo-1587049352847-4a222e784eaf?w=800',
            'available': True,
            'created_at': datetime.utcnow()
        },
        {
            'id': str(uuid.uuid4()),
            'name_ar': 'عسل الغابة المطيرة',
            'name_en': 'Rainforest Honey',
            'description_ar': 'عسل نادر من زهور الغابات المطيرة، غني بمضادات الأكسدة',
            'description_en': 'Rare honey from rainforest flowers, rich in antioxidants',
            'price': 40.0,
            'weight': '500g',
            'image_url': 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800',
            'available': True,
            'created_at': datetime.utcnow()
        },
        {
            'id': str(uuid.uuid4()),
            'name_ar': 'عسل المانجروف',
            'name_en': 'Mangrove Honey',
            'description_ar': 'عسل فريد من أشجار المانجروف الساحلية، طعم مميز وفوائد صحية رائعة',
            'description_en': 'Unique honey from coastal mangrove trees, distinctive taste and great health benefits',
            'price': 45.0,
            'weight': '500g',
            'image_url': 'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=800',
            'available': True,
            'created_at': datetime.utcnow()
        }
    ]
    
    # Check if products already exist
    existing_count = await db.products.count_documents({})
    
    if existing_count > 0:
        print(f"✅ Database already has {existing_count} products")
        choice = input("Do you want to replace them? (yes/no): ")
        if choice.lower() != 'yes':
            print("Cancelled")
            return
        
        # Delete existing products
        await db.products.delete_many({})
        print("🗑️  Deleted existing products")
    
    # Insert new products
    result = await db.products.insert_many(products)
    print(f"✅ Successfully added {len(result.inserted_ids)} products!")
    
    # Display added products
    print("\n📦 Added Products:")
    for product in products:
        print(f"  - {product['name_ar']} / {product['name_en']} - {product['price']} ريال")
    
    client.close()

if __name__ == '__main__':
    print("🍯 Seeding products database...")
    asyncio.run(seed_products())
    print("\n✅ Done!")
