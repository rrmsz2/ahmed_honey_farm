from fastapi import APIRouter, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.models import Order, OrderCreate, OTPVerification, Product
from utils.whatsapp import send_otp_message, send_order_confirmation, send_admin_notification
from datetime import datetime, timedelta
import random
import logging
import os

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/products")
async def get_products(request: Request):
    """Get all available products"""
    try:
        db = request.state.db
        products = await db.products.find({"available": True}).to_list(100)
        return {"products": products}
    except Exception as e:
        logger.error(f"Error fetching products: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching products")

@router.get("/site-content")
async def get_site_content(request: Request):
    """Get all site content"""
    try:
        db = request.state.db
        content = await db.site_content.find().to_list(100)
        content_dict = {}
        for item in content:
            content_dict[item['section']] = {
                'ar': item.get('content_ar', {}),
                'en': item.get('content_en', {})
            }
        return {"content": content_dict}
    except Exception as e:
        logger.error(f"Error fetching site content: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching site content")

@router.get("/gallery")
async def get_gallery(request: Request):
    """Get gallery images"""
    try:
        db = request.state.db
        images = await db.gallery.find().sort("order", 1).to_list(100)
        return {"images": images}
    except Exception as e:
        logger.error(f"Error fetching gallery: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching gallery")

@router.post("/orders")
async def create_order(order_data: OrderCreate, request: Request):
    """
    Create new order and send OTP for verification
    """
    try:
        db = request.state.db
        # Validate phone format
        phone = order_data.customer_phone
        if not phone.startswith('+968'):
            raise HTTPException(status_code=400, detail="Phone number must start with +968")
        
        if len(phone) != 12:  # +968 + 8 digits
            raise HTTPException(status_code=400, detail="Invalid Omani phone number format")
        
        # Generate 6-digit OTP
        otp_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        
        # Create order
        order = Order(**order_data.dict())
        order_dict = order.dict()
        order_dict['created_at'] = datetime.utcnow()
        order_dict['updated_at'] = datetime.utcnow()
        
        # Save order to database
        await db.orders.insert_one(order_dict)
        
        # Save OTP to database (expires in 5 minutes)
        otp_entry = {
            'order_id': order.id,
            'phone': phone,
            'code': otp_code,
            'expires_at': datetime.utcnow() + timedelta(minutes=5),
            'created_at': datetime.utcnow(),
            'verified': False
        }
        await db.otp_codes.insert_one(otp_entry)
        
        # Send OTP via WhatsApp
        result = send_otp_message(phone, order_data.customer_name, otp_code)
        
        if not result['success']:
            logger.error(f"Failed to send OTP: {result.get('error')}")
            # Don't fail the order creation, but log the error
        
        return {
            "success": True,
            "order_id": order.id,
            "message": "تم إرسال رمز التحقق عبر واتساب" if order_data.language == 'ar' else "OTP sent via WhatsApp"
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating order")

@router.post("/orders/verify-otp")
async def verify_otp(verification: OTPVerification, request: Request):
    """
    Verify OTP and confirm order
    """
    try:
        db = request.state.db
        # Find OTP entry
        otp_entry = await db.otp_codes.find_one({
            'order_id': verification.order_id,
            'verified': False
        })
        
        if not otp_entry:
            raise HTTPException(status_code=404, detail="OTP not found or already verified")
        
        # Check if OTP expired
        if datetime.utcnow() > otp_entry['expires_at']:
            raise HTTPException(status_code=400, detail="OTP expired. Please request a new one.")
        
        # Verify OTP code
        if otp_entry['code'] != verification.otp:
            raise HTTPException(status_code=400, detail="Invalid OTP code")
        
        # Mark OTP as verified
        await db.otp_codes.update_one(
            {'_id': otp_entry['_id']},
            {'$set': {'verified': True}}
        )
        
        # Update order status
        order = await db.orders.find_one({'id': verification.order_id})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        await db.orders.update_one(
            {'id': verification.order_id},
            {
                '$set': {
                    'otp_verified': True,
                    'status': 'confirmed',
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
        # Prepare order details for WhatsApp messages
        order_details = {
            'customer_name': order['customer_name'],
            'customer_phone': order['customer_phone'],
            'items': order['items'],
            'total': order['total'],
            'created_at': order['created_at'].strftime('%Y-%m-%d %H:%M')
        }
        
        # Send confirmation to customer
        send_order_confirmation(
            order['customer_phone'],
            order['customer_name'],
            order_details
        )
        
        # Send notification to admin (with 6 second delay built into function)
        send_admin_notification(order_details)
        
        return {
            "success": True,
            "message": "تم تأكيد الطلب بنجاح!" if order.get('language', 'ar') == 'ar' else "Order confirmed successfully!",
            "order": {
                'id': order['id'],
                'status': 'confirmed',
                'total': order['total']
            }
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error verifying OTP: {str(e)}")
        raise HTTPException(status_code=500, detail="Error verifying OTP")

@router.post("/orders/resend-otp")
async def resend_otp(order_id: str, request: Request):
    """Resend OTP for an order"""
    try:
        order = await db.orders.find_one({'id': order_id})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        if order['otp_verified']:
            raise HTTPException(status_code=400, detail="Order already verified")
        
        # Generate new OTP
        otp_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        
        # Invalidate old OTPs
        await db.otp_codes.update_many(
            {'order_id': order_id},
            {'$set': {'verified': True}}  # Mark old ones as used
        )
        
        # Create new OTP entry
        otp_entry = {
            'order_id': order_id,
            'phone': order['customer_phone'],
            'code': otp_code,
            'expires_at': datetime.utcnow() + timedelta(minutes=5),
            'created_at': datetime.utcnow(),
            'verified': False
        }
        await db.otp_codes.insert_one(otp_entry)
        
        # Send OTP via WhatsApp
        send_otp_message(order['customer_phone'], order['customer_name'], otp_code)
        
        return {
            "success": True,
            "message": "تم إرسال رمز التحقق مرة أخرى" if order.get('language', 'ar') == 'ar' else "OTP resent"
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error resending OTP: {str(e)}")
        raise HTTPException(status_code=500, detail="Error resending OTP")
