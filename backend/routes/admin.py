from fastapi import APIRouter, HTTPException, Depends, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.models import (
    AdminLogin, AdminToken, Product, ProductUpdate,
    OrderStatusUpdate, SiteContentUpdate, GalleryImageCreate, OrderStats
)
from utils.auth import verify_password, create_access_token, get_password_hash
from middleware.auth_middleware import get_current_admin
from datetime import datetime
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/login", response_model=AdminToken)
async def admin_login(credentials: AdminLogin, request: Request):
    """Admin login endpoint"""
    try:
        db = request.state.db
        # Find admin user
        admin = await db.admin_users.find_one({'username': credentials.username})
        
        if not admin or not verify_password(credentials.password, admin['password_hash']):
            raise HTTPException(status_code=401, detail="Incorrect username or password")
        
        # Create access token
        access_token = create_access_token(data={"sub": admin['username']})
        
        return {"access_token": access_token, "token_type": "bearer"}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error during admin login: {str(e)}")
        raise HTTPException(status_code=500, detail="Login error")

@router.get("/orders")
async def get_all_orders(
    request: Request,
    current_admin: dict = Depends(get_current_admin),
    status: str = None,
    limit: int = 50,
    skip: int = 0
):
    """Get all orders with optional filtering"""
    try:
        db = request.state.db
        query = {}
        if status:
            query['status'] = status
        
        orders = await db.orders.find(query).sort('created_at', -1).skip(skip).limit(limit).to_list(limit)
        total = await db.orders.count_documents(query)
        
        return {
            "orders": orders,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        logger.error(f"Error fetching orders: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching orders")

@router.get("/orders/stats")
async def get_order_stats(
    request: Request,
    current_admin: dict = Depends(get_current_admin)
):
    """Get order statistics"""
    try:
        db = request.state.db
        total_orders = await db.orders.count_documents({})
        pending_orders = await db.orders.count_documents({'status': 'pending_verification'})
        confirmed_orders = await db.orders.count_documents({'status': 'confirmed'})
        processing_orders = await db.orders.count_documents({'status': 'processing'})
        delivered_orders = await db.orders.count_documents({'status': 'delivered'})
        
        # Calculate total revenue from confirmed and delivered orders
        pipeline = [
            {'$match': {'status': {'$in': ['confirmed', 'processing', 'delivered']}}},
            {'$group': {'_id': None, 'total': {'$sum': '$total'}}}
        ]
        revenue_result = await db.orders.aggregate(pipeline).to_list(1)
        total_revenue = revenue_result[0]['total'] if revenue_result else 0
        
        return {
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "confirmed_orders": confirmed_orders,
            "processing_orders": processing_orders,
            "delivered_orders": delivered_orders,
            "total_revenue": total_revenue
        }
    except Exception as e:
        logger.error(f"Error fetching stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching statistics")

@router.put("/orders/{order_id}")
async def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdate,
    request: Request,
    current_admin: dict = Depends(get_current_admin)
):
    """Update order status"""
    try:
        db = request.state.db
        result = await db.orders.update_one(
            {'id': order_id},
            {
                '$set': {
                    'status': status_update.status,
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return {"success": True, "message": "Order status updated"}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error updating order: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating order")

@router.get("/products")
async def get_all_products(
    request: Request,
    current_admin: dict = Depends(get_current_admin)
):
    """Get all products (including unavailable)"""
    try:
        db = request.state.db
        products = await db.products.find().to_list(100)
        return {"products": products}
    except Exception as e:
        logger.error(f"Error fetching products: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching products")

@router.post("/products")
async def create_product(
    product: Product,
    request: Request,
    current_admin: dict = Depends(get_current_admin)
):
    """Create new product"""
    try:
        db = request.state.db
        product_dict = product.dict()
        product_dict['created_at'] = datetime.utcnow()
        
        await db.products.insert_one(product_dict)
        
        return {"success": True, "product": product_dict}
    except Exception as e:
        logger.error(f"Error creating product: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating product")

@router.put("/products/{product_id}")
async def update_product(
    product_id: str,
    product_update: ProductUpdate,
    request: Request,
    current_admin: dict = Depends(get_current_admin)
):
    """Update product"""
    try:
        db = request.state.db
        update_data = {k: v for k, v in product_update.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided")
        
        result = await db.products.update_one(
            {'id': product_id},
            {'$set': update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return {"success": True, "message": "Product updated"}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error updating product: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating product")

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    request: Request,
    current_admin: dict = Depends(get_current_admin)
):
    """Delete product"""
    try:
        db = request.state.db
        result = await db.products.delete_one({'id': product_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return {"success": True, "message": "Product deleted"}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error deleting product: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting product")

@router.get("/site-content")
async def get_site_content_admin(
    request: Request,
    current_admin: dict = Depends(get_current_admin)
):
    """Get all site content for editing"""
    try:
        db = request.state.db
        content = await db.site_content.find().to_list(100)
        return {"content": content}
    except Exception as e:
        logger.error(f"Error fetching site content: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching site content")

@router.put("/site-content/{section}")
async def update_site_content(
    section: str,
    content_update: SiteContentUpdate,
    request: Request,
    current_admin: dict = Depends(get_current_admin)
):
    """Update site content section"""
    try:
        db = request.state.db
        update_data = {'updated_at': datetime.utcnow()}
        
        if content_update.content_ar:
            update_data['content_ar'] = content_update.content_ar
        if content_update.content_en:
            update_data['content_en'] = content_update.content_en
        
        result = await db.site_content.update_one(
            {'section': section},
            {'$set': update_data},
            upsert=True
        )
        
        return {"success": True, "message": "Content updated"}
    except Exception as e:
        logger.error(f"Error updating site content: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating site content")

@router.get("/gallery")
async def get_gallery_admin(
    request: Request,
    current_admin: dict = Depends(get_current_admin)
):
    """Get all gallery images"""
    try:
        db = request.state.db
        images = await db.gallery.find().sort('order', 1).to_list(100)
        return {"images": images}
    except Exception as e:
        logger.error(f"Error fetching gallery: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching gallery")

@router.post("/gallery")
async def add_gallery_image(
    image: GalleryImageCreate,
    request: Request,
    current_admin: dict = Depends(get_current_admin)
):
    """Add new gallery image"""
    try:
        db = request.state.db
        from models.models import GalleryImage
        gallery_image = GalleryImage(**image.dict())
        image_dict = gallery_image.dict()
        image_dict['created_at'] = datetime.utcnow()
        
        await db.gallery.insert_one(image_dict)
        
        return {"success": True, "image": image_dict}
    except Exception as e:
        logger.error(f"Error adding gallery image: {str(e)}")
        raise HTTPException(status_code=500, detail="Error adding gallery image")

@router.delete("/gallery/{image_id}")
async def delete_gallery_image(
    image_id: str,
    request: Request,
    current_admin: dict = Depends(get_current_admin)
):
    """Delete gallery image"""
    try:
        db = request.state.db
        result = await db.gallery.delete_one({'id': image_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Image not found")
        
        return {"success": True, "message": "Image deleted"}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error deleting gallery image: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting gallery image")
