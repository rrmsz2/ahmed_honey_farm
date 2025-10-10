from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

# Product Models
class ProductBase(BaseModel):
    name_ar: str
    name_en: str
    description_ar: str
    description_en: str
    price: float
    weight: str
    image_url: str
    available: bool = True

class Product(ProductBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProductUpdate(BaseModel):
    name_ar: Optional[str] = None
    name_en: Optional[str] = None
    description_ar: Optional[str] = None
    description_en: Optional[str] = None
    price: Optional[float] = None
    weight: Optional[str] = None
    image_url: Optional[str] = None
    available: Optional[bool] = None

# Order Models
class OrderItem(BaseModel):
    product_id: str
    name_ar: str
    name_en: str
    quantity: int
    price: float

class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    items: List[OrderItem]
    total: float
    language: str = 'ar'

class Order(OrderCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = 'pending_verification'  # pending_verification, confirmed, processing, delivered, cancelled
    otp_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class OrderStatusUpdate(BaseModel):
    status: str

class OTPVerification(BaseModel):
    order_id: str
    otp: str

# OTP Models
class OTPCode(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str
    phone: str
    code: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    verified: bool = False

# Site Content Models
class SiteContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    section: str  # hero, story, products, gallery, contact, footer
    content_ar: Dict[str, Any]
    content_en: Dict[str, Any]
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class SiteContentUpdate(BaseModel):
    content_ar: Optional[Dict[str, Any]] = None
    content_en: Optional[Dict[str, Any]] = None

# Gallery Models
class GalleryImage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    url: str
    caption_ar: str
    caption_en: str
    order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class GalleryImageCreate(BaseModel):
    url: str
    caption_ar: str
    caption_en: str
    order: int = 0

# Admin Models
class AdminUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminToken(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Stats Models
class OrderStats(BaseModel):
    total_orders: int
    pending_orders: int
    confirmed_orders: int
    processing_orders: int
    delivered_orders: int
    total_revenue: float
