#!/usr/bin/env python3
"""
Comprehensive seed script to populate all database collections with sample data
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timedelta
from passlib.context import CryptContext

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_all_data():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("🌱 Starting comprehensive data seeding...")
    print("=" * 60)
    
    # 1. Admin Users
    print("\n1️⃣  Seeding Admin Users...")
    admin_users = [
        {
            'username': 'admin',
            'password_hash': pwd_context.hash('admin123'),
            'created_at': datetime.utcnow()
        }
    ]
    await db.admin_users.delete_many({})
    await db.admin_users.insert_many(admin_users)
    print(f"   ✅ Added {len(admin_users)} admin user(s)")
    
    # 2. Products
    print("\n2️⃣  Seeding Products...")
    products = [
        {
            'id': str(uuid.uuid4()),
            'name_ar': 'عسل السدر الجبلي',
            'name_en': 'Mountain Sidr Honey',
            'description_ar': 'عسل سدر طبيعي 100% من الجبال العمانية، يتميز بلونه الذهبي الداكن ومذاقه الفريد. غني بمضادات الأكسدة والفيتامينات، مثالي لتقوية المناعة وعلاج مشاكل الجهاز الهضمي.',
            'description_en': 'Natural 100% Sidr honey from Omani mountains, distinguished by its dark golden color and unique taste. Rich in antioxidants and vitamins, perfect for boosting immunity and treating digestive issues.',
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
            'description_ar': 'عسل سمر نقي 100% من أشجار السمر البرية في عُمان. لون فاتح وطعم معتدل لذيذ، مثالي للاستخدام اليومي. يساعد على تحسين الصحة العامة وزيادة الطاقة.',
            'description_en': '100% pure Acacia honey from wild Acacia trees in Oman. Light color and delicious mild taste, perfect for daily use. Helps improve overall health and increase energy.',
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
            'description_ar': 'عسل متعدد الأزهار البرية من حقول عُمان الخضراء. مزيج رائع من نكهات مختلفة، غني بالمعادن والفيتامينات. مناسب لجميع أفراد العائلة.',
            'description_en': 'Multi-wildflower honey from Oman\'s green fields. Wonderful blend of different flavors, rich in minerals and vitamins. Suitable for all family members.',
            'price': 25.0,
            'weight': '500g',
            'image_url': 'https://images.unsplash.com/photo-1558642891-54be180ea339?w=800',
            'available': True,
            'created_at': datetime.utcnow()
        },
        {
            'id': str(uuid.uuid4()),
            'name_ar': 'عسل السدر الفاخر - عبوة كبيرة',
            'name_en': 'Premium Sidr Honey - Large Pack',
            'description_ar': 'عبوة عائلية كبيرة 1 كيلو من أفضل أنواع عسل السدر. جودة استثنائية وسعر مميز للعائلة. يدوم لفترة طويلة ومناسب للاستخدام اليومي.',
            'description_en': 'Large family pack 1kg of the finest Sidr honey. Exceptional quality and special family price. Long-lasting and suitable for daily use.',
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
            'description_ar': 'عسل نادر من زهور الغابات المطيرة في ظفار. لون غامق وطعم قوي مميز، غني جداً بمضادات الأكسدة. مثالي لعلاج الالتهابات وتقوية الجهاز المناعي.',
            'description_en': 'Rare honey from Dhofar rainforest flowers. Dark color and distinctive strong taste, very rich in antioxidants. Perfect for treating infections and strengthening the immune system.',
            'price': 40.0,
            'weight': '500g',
            'image_url': 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800',
            'available': True,
            'created_at': datetime.utcnow()
        },
        {
            'id': str(uuid.uuid4()),
            'name_ar': 'عسل المانجروف الساحلي',
            'name_en': 'Coastal Mangrove Honey',
            'description_ar': 'عسل فريد من نوعه من أشجار المانجروف على سواحل عُمان. طعم مميز بلمسة ملحية خفيفة، غني بالمعادن البحرية. تجربة فريدة لعشاق العسل الطبيعي.',
            'description_en': 'Unique honey from mangrove trees on Oman\'s coasts. Distinctive taste with light salty touch, rich in marine minerals. A unique experience for natural honey lovers.',
            'price': 45.0,
            'weight': '500g',
            'image_url': 'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=800',
            'available': True,
            'created_at': datetime.utcnow()
        }
    ]
    await db.products.delete_many({})
    result = await db.products.insert_many(products)
    print(f"   ✅ Added {len(result.inserted_ids)} products")
    
    # 3. Site Content
    print("\n3️⃣  Seeding Site Content...")
    site_content = [
        {
            'section': 'hero',
            'content_ar': {
                'title': 'عسل أحمد الطبيعي',
                'subtitle': 'رحلة طالب في الصف الخامس نحو العسل الطبيعي',
                'description': 'من مدرسة زيد بن ثابت الابتدائية إلى قلوبكم، أحمل لكم عسلاً طبيعياً 100% من منحلي الصغير. بدأت رحلتي بحلم بسيط وتحول إلى مشروع أفخر به.',
                'cta': 'اطلب الآن'
            },
            'content_en': {
                'title': "Ahmad's Natural Honey",
                'subtitle': "A 5th Grade Student's Journey to Natural Honey",
                'description': "From Zaid Bin Thabit Elementary School to your hearts, I bring you 100% natural honey from my small apiary. My journey started with a simple dream and turned into a project I'm proud of.",
                'cta': 'Order Now'
            },
            'updated_at': datetime.utcnow()
        },
        {
            'section': 'story',
            'content_ar': {
                'title': 'قصة أحمد',
                'subtitle': 'حلم صغير أصبح حقيقة',
                'content': 'أنا أحمد، طالب في الصف الخامس بمدرسة زيد بن ثابت. بدأت رحلتي مع تربية النحل من شغفي بالطبيعة وحب الاستكشاف. ساعدني والدي في بناء خليتي الأولى، ومنذ ذلك الحين والمشروع يكبر معي. أتعلم كل يوم شيئاً جديداً عن النحل والطبيعة، وأفخر بتقديم منتج طبيعي 100% لكم.',
                'stats': [
                    {'number': '50+', 'label': 'خلية نحل نشطة'},
                    {'number': '1000+', 'label': 'عبوة عسل منتجة'},
                    {'number': '100%', 'label': 'طبيعي ونقي'}
                ]
            },
            'content_en': {
                'title': "Ahmad's Story",
                'subtitle': 'A Small Dream That Became Reality',
                'content': "I'm Ahmad, a 5th-grade student at Zaid Bin Thabit School. My journey with beekeeping started from my passion for nature and love of exploration. My father helped me build my first hive, and since then, the project has grown with me. I learn something new about bees and nature every day, and I'm proud to offer you a 100% natural product.",
                'stats': [
                    {'number': '50+', 'label': 'Active Beehives'},
                    {'number': '1000+', 'label': 'Honey Jars Produced'},
                    {'number': '100%', 'label': 'Natural & Pure'}
                ]
            },
            'updated_at': datetime.utcnow()
        },
        {
            'section': 'contact',
            'content_ar': {
                'title': 'تواصل معنا',
                'subtitle': 'نسعد بطلباتكم واستفساراتكم'
            },
            'content_en': {
                'title': 'Contact Us',
                'subtitle': 'We welcome your orders and inquiries'
            },
            'updated_at': datetime.utcnow()
        },
        {
            'section': 'footer',
            'content_ar': {
                'tagline': 'عسل طبيعي من القلب',
                'copyright': '© 2024 منحل أحمد. جميع الحقوق محفوظة',
                'school': 'مدرسة زيد بن ثابت الابتدائية - سلطنة عُمان'
            },
            'content_en': {
                'tagline': 'Natural Honey from the Heart',
                'copyright': '© 2024 Ahmad Apiary. All rights reserved',
                'school': 'Zaid Bin Thabit Elementary School - Sultanate of Oman'
            },
            'updated_at': datetime.utcnow()
        }
    ]
    await db.site_content.delete_many({})
    result = await db.site_content.insert_many(site_content)
    print(f"   ✅ Added {len(result.inserted_ids)} content sections")
    
    # 4. Gallery
    print("\n4️⃣  Seeding Gallery...")
    gallery = [
        {
            'id': str(uuid.uuid4()),
            'image_url': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800',
            'title_ar': 'خلايا النحل في المنحل',
            'title_en': 'Beehives at the Apiary',
            'order': 1,
            'created_at': datetime.utcnow()
        },
        {
            'id': str(uuid.uuid4()),
            'image_url': 'https://images.unsplash.com/photo-1587049352846-4a222e784eaf?w=800',
            'title_ar': 'عسل سدر طازج',
            'title_en': 'Fresh Sidr Honey',
            'order': 2,
            'created_at': datetime.utcnow()
        },
        {
            'id': str(uuid.uuid4()),
            'image_url': 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=800',
            'title_ar': 'النحل على الزهور',
            'title_en': 'Bees on Flowers',
            'order': 3,
            'created_at': datetime.utcnow()
        },
        {
            'id': str(uuid.uuid4()),
            'image_url': 'https://images.unsplash.com/photo-1471943311424-646960669fbc?w=800',
            'title_ar': 'عملية التعبئة',
            'title_en': 'Packaging Process',
            'order': 4,
            'created_at': datetime.utcnow()
        },
        {
            'id': str(uuid.uuid4()),
            'image_url': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800',
            'title_ar': 'فحص خلايا النحل',
            'title_en': 'Inspecting Beehives',
            'order': 5,
            'created_at': datetime.utcnow()
        },
        {
            'id': str(uuid.uuid4()),
            'image_url': 'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=800',
            'title_ar': 'منتجاتنا المتنوعة',
            'title_en': 'Our Diverse Products',
            'order': 6,
            'created_at': datetime.utcnow()
        }
    ]
    await db.gallery.delete_many({})
    result = await db.gallery.insert_many(gallery)
    print(f"   ✅ Added {len(result.inserted_ids)} gallery images")
    
    # 5. Settings (WhatsApp)
    print("\n5️⃣  Seeding Settings...")
    settings = {
        'type': 'whatsapp',
        'api_key': 'akcfvdN9YTRL',
        'admin_phone': '+96895555386',
        'updated_at': datetime.utcnow()
    }
    await db.settings.delete_many({'type': 'whatsapp'})
    await db.settings.insert_one(settings)
    print(f"   ✅ Added WhatsApp settings")
    
    # 6. Sample Orders (for testing)
    print("\n6️⃣  Seeding Sample Orders...")
    sample_orders = [
        {
            'id': str(uuid.uuid4()),
            'customer_name': 'محمد السعيدي',
            'customer_phone': '+96899123456',
            'items': [
                {
                    'product_id': products[0]['id'],
                    'name_ar': products[0]['name_ar'],
                    'name_en': products[0]['name_en'],
                    'quantity': 2,
                    'price': products[0]['price']
                }
            ],
            'total': products[0]['price'] * 2,
            'status': 'confirmed',
            'otp_verified': True,
            'language': 'ar',
            'created_at': datetime.utcnow() - timedelta(days=2),
            'updated_at': datetime.utcnow() - timedelta(days=2)
        },
        {
            'id': str(uuid.uuid4()),
            'customer_name': 'فاطمة المعمري',
            'customer_phone': '+96899234567',
            'items': [
                {
                    'product_id': products[1]['id'],
                    'name_ar': products[1]['name_ar'],
                    'name_en': products[1]['name_en'],
                    'quantity': 1,
                    'price': products[1]['price']
                },
                {
                    'product_id': products[2]['id'],
                    'name_ar': products[2]['name_ar'],
                    'name_en': products[2]['name_en'],
                    'quantity': 1,
                    'price': products[2]['price']
                }
            ],
            'total': products[1]['price'] + products[2]['price'],
            'status': 'processing',
            'otp_verified': True,
            'language': 'ar',
            'created_at': datetime.utcnow() - timedelta(days=1),
            'updated_at': datetime.utcnow() - timedelta(hours=12)
        },
        {
            'id': str(uuid.uuid4()),
            'customer_name': 'سعيد البلوشي',
            'customer_phone': '+96899345678',
            'items': [
                {
                    'product_id': products[3]['id'],
                    'name_ar': products[3]['name_ar'],
                    'name_en': products[3]['name_en'],
                    'quantity': 1,
                    'price': products[3]['price']
                }
            ],
            'total': products[3]['price'],
            'status': 'delivered',
            'otp_verified': True,
            'language': 'ar',
            'created_at': datetime.utcnow() - timedelta(days=5),
            'updated_at': datetime.utcnow() - timedelta(days=3)
        }
    ]
    await db.orders.delete_many({})
    result = await db.orders.insert_many(sample_orders)
    print(f"   ✅ Added {len(result.inserted_ids)} sample orders")
    
    print("\n" + "=" * 60)
    print("✅ Database seeding completed successfully!")
    print("\n📊 Summary:")
    print(f"   - Admin Users: {len(admin_users)}")
    print(f"   - Products: {len(products)}")
    print(f"   - Site Content: {len(site_content)} sections")
    print(f"   - Gallery Images: {len(gallery)}")
    print(f"   - Sample Orders: {len(sample_orders)}")
    print(f"   - Settings: WhatsApp configured")
    
    print("\n🔐 Admin Login:")
    print("   Username: admin")
    print("   Password: admin123")
    
    print("\n🌐 Ready to use!")
    
    client.close()

if __name__ == '__main__':
    asyncio.run(seed_all_data())
