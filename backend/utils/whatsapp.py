import requests
import urllib.parse
import logging
import time
from motor.motor_asyncio import AsyncIOMotorClient
import os

logger = logging.getLogger(__name__)

WHATSAPP_API_URL = "http://api.textmebot.com/send.php"

# Default settings (will be overridden by DB settings if available)
DEFAULT_WHATSAPP_API_KEY = "akcfvdN9YTRL"
DEFAULT_ADMIN_PHONE = "+96895555386"

async def get_whatsapp_settings():
    """Get WhatsApp settings from database"""
    try:
        mongo_url = os.environ.get('MONGO_URL')
        client = AsyncIOMotorClient(mongo_url)
        db = client[os.environ.get('DB_NAME')]
        
        settings = await db.settings.find_one({'type': 'whatsapp'})
        
        if settings:
            return {
                'api_key': settings.get('api_key', DEFAULT_WHATSAPP_API_KEY),
                'admin_phone': settings.get('admin_phone', DEFAULT_ADMIN_PHONE)
            }
        
        return {
            'api_key': DEFAULT_WHATSAPP_API_KEY,
            'admin_phone': DEFAULT_ADMIN_PHONE
        }
    except Exception as e:
        logger.error(f"Error getting WhatsApp settings: {str(e)}")
        return {
            'api_key': DEFAULT_WHATSAPP_API_KEY,
            'admin_phone': DEFAULT_ADMIN_PHONE
        }

def send_whatsapp_message(recipient: str, text: str, file_url: str = None, api_key: str = None) -> dict:
    """
    Send WhatsApp message using TextMeBot API
    
    Args:
        recipient: Phone number with country code (e.g., +96895555386)
        text: Message text
        file_url: Optional image URL to send
    
    Returns:
        dict: API response
    """
    try:
        # Validate phone format
        if not recipient.startswith('+'):
            recipient = f'+{recipient}'
        
        # Prepare parameters
        params = {
            'recipient': recipient,
            'apikey': WHATSAPP_API_KEY,
            'text': text,
            'json': 'yes'
        }
        
        if file_url:
            params['file'] = file_url
        
        logger.info(f"Sending WhatsApp message to {recipient}")
        
        # Send request
        response = requests.get(WHATSAPP_API_URL, params=params, timeout=30)
        response.raise_for_status()
        
        result = response.json() if response.headers.get('content-type', '').startswith('application/json') else {'text': response.text}
        
        logger.info(f"WhatsApp message sent successfully to {recipient}")
        return {'success': True, 'data': result}
        
    except Exception as e:
        logger.error(f"Error sending WhatsApp message to {recipient}: {str(e)}")
        return {'success': False, 'error': str(e)}


def send_otp_message(recipient: str, name: str, otp: str) -> dict:
    """Send OTP verification message"""
    message = f"""مرحباً {name}! 👋

رمز التحقق الخاص بك: *{otp}*

الرمز صالح لمدة 5 دقائق ⏰

منحل أحمد 🍯"""
    
    return send_whatsapp_message(recipient, message)


def send_order_confirmation(recipient: str, name: str, order_details: dict) -> dict:
    """Send order confirmation to customer"""
    
    # Format product list
    products_text = "\n".join([
        f"• {item['name_ar']} - {item['quantity']}x ({item['price']} ريال)"
        for item in order_details['items']
    ])
    
    message = f"""شكراً {name}! ✅
تم تأكيد طلبك بنجاح

📦 تفاصيل الطلب:
{products_text}

💰 المجموع الكلي: {order_details['total']} ريال

سنتواصل معك قريباً لتأكيد التوصيل والدفع 🚚

منحل أحمد 🍯
+968 9555 5386"""
    
    return send_whatsapp_message(recipient, message)


def send_admin_notification(order_details: dict) -> dict:
    """Send new order notification to admin"""
    
    # Format product list
    products_text = "\n".join([
        f"• {item['name_ar']} - {item['quantity']}x ({item['price']} ريال)"
        for item in order_details['items']
    ])
    
    message = f"""🔔 طلب جديد!

👤 العميل: {order_details['customer_name']}
📱 الهاتف: {order_details['customer_phone']}

📦 المنتجات:
{products_text}

💰 المجموع الكلي: {order_details['total']} ريال

⏰ وقت الطلب: {order_details['created_at']}

يرجى التواصل مع العميل لتأكيد التوصيل والدفع"""
    
    # Add delay before sending to admin (6 seconds as per requirement)
    logger.info("Waiting 6 seconds before sending admin notification...")
    time.sleep(6)
    
    return send_whatsapp_message(ADMIN_PHONE, message)
