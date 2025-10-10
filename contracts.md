# Ahmad Honey Farm - Backend & Admin Panel Contracts

## Overview
Building a complete e-commerce backend with shopping cart, OTP verification via WhatsApp, and admin panel.

## WhatsApp API Integration
- **Provider**: TextMeBot API
- **Base URL**: http://api.textmebot.com/send.php
- **API Key**: akcfvdN9YTRL
- **Admin Phone**: +96895555386

### API Usage:
```
Send Text: GET http://api.textmebot.com/send.php?recipient={phone}&apikey={key}&text={message}
Send Image: Add &file={image_url} parameter
```

## Backend Architecture

### 1. Database Models (MongoDB)
- **products**: Product catalog with images, prices, descriptions (AR/EN)
- **orders**: Customer orders with items, status, contact info
- **otp_codes**: Temporary OTP storage with expiry
- **site_content**: Editable website content (hero, story, etc.)
- **admin_users**: Admin login credentials

### 2. API Endpoints

#### Public Endpoints (No Auth):
- `GET /api/products` - Get all products
- `GET /api/site-content` - Get site content
- `POST /api/orders` - Create new order (generates OTP)
- `POST /api/orders/verify-otp` - Verify OTP and confirm order
- `GET /api/gallery` - Get gallery images

#### Admin Endpoints (Auth Required):
- `POST /api/admin/login` - Admin login
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/{id}` - Update order status
- `PUT /api/admin/products/{id}` - Update product
- `POST /api/admin/products` - Add new product
- `DELETE /api/admin/products/{id}` - Delete product
- `PUT /api/admin/site-content` - Update site content
- `POST /api/admin/gallery` - Add gallery image
- `DELETE /api/admin/gallery/{id}` - Delete gallery image

### 3. Order Flow

#### Step 1: Customer Creates Order
```
POST /api/orders
Body: {
  name: string,
  phone: string (format: +968XXXXXXXX),
  items: [{productId, quantity, price}],
  total: number
}
```
**Process:**
1. Validate phone format
2. Generate 6-digit OTP
3. Store OTP in database (expires in 5 mins)
4. Send OTP via WhatsApp to customer
5. Return orderId and message "OTP sent"

#### Step 2: Customer Verifies OTP
```
POST /api/orders/verify-otp
Body: {
  orderId: string,
  otp: string
}
```
**Process:**
1. Validate OTP
2. Mark order as confirmed
3. Send order details to customer via WhatsApp
4. Wait 6 seconds
5. Send order notification to admin (+96895555386)
6. Return success message

### 4. WhatsApp Message Templates

#### OTP Message (to customer):
```arabic
مرحباً {name}!
رمز التحقق الخاص بك: {otp}
الرمز صالح لمدة 5 دقائق
منحل أحمد 🍯
```

#### Order Confirmation (to customer):
```arabic
شكراً {name}! ✅
تم تأكيد طلبك بنجاح

📦 تفاصيل الطلب:
{product_list}

💰 المجموع: {total} ريال

سنتواصل معك قريباً لتأكيد التوصيل والدفع
منحل أحمد 🍯
```

#### Admin Notification:
```arabic
🔔 طلب جديد!

👤 العميل: {name}
📱 الهاتف: {phone}

📦 المنتجات:
{product_list}

💰 المجموع: {total} ريال

يرجى التواصل مع العميل لتأكيد التوصيل والدفع
```

### 5. Admin Panel Features
- Login with username/password
- Dashboard with order statistics
- Order management (view, update status)
- Product management (CRUD)
- Content management (edit all site text, images)
- Gallery management

### 6. Frontend Changes Needed

#### Current Mock Data to Replace:
- `/app/frontend/src/data/mock.js` - All content will come from API

#### New Components to Create:
- `Cart.js` - Shopping cart with add/remove items
- `Checkout.js` - Checkout form with OTP verification
- `AdminLogin.js` - Admin login page
- `AdminDashboard.js` - Admin panel main page
- `AdminOrders.js` - Order management
- `AdminProducts.js` - Product management
- `AdminContent.js` - Content management

#### New Context:
- `CartContext.js` - Manage cart state globally

#### API Integration:
- Replace all mock data with API calls
- Add axios interceptor for admin auth
- Handle loading states and errors

### 7. Security Considerations
- Admin password hashing (bcrypt)
- JWT tokens for admin sessions
- Rate limiting on OTP generation
- Phone number validation
- OTP expiry (5 minutes)
- Delay between WhatsApp messages (6 seconds)

### 8. Implementation Order
1. ✅ Setup WhatsApp API helper
2. ✅ Create database models
3. ✅ Build public APIs (products, content, orders, OTP)
4. ✅ Build admin APIs (login, CRUD operations)
5. ✅ Update frontend to use real APIs
6. ✅ Add shopping cart functionality
7. ✅ Create checkout with OTP verification
8. ✅ Build admin panel UI
9. ✅ Test complete flow
10. ✅ Deploy and verify

## Testing Plan
1. Test OTP generation and expiry
2. Test WhatsApp message delivery
3. Test admin authentication
4. Test order flow end-to-end
5. Test cart operations
6. Test admin CRUD operations
