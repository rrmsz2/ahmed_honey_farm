# 🍯 تطبيق مزرعة أحمد للعسل - Docker

## 📋 نظرة عامة
هذا التطبيق الآن جاهز للعمل في Docker container واحد يحتوي على:
- ✅ Frontend (React)
- ✅ Backend (FastAPI)
- ✅ Database (MongoDB)

## 🚀 طريقة الاستخدام

### 1️⃣ بناء الـ Docker Image
```bash
docker build -t honey-farm-app .
```

هذه العملية قد تستغرق 5-10 دقائق في المرة الأولى.

### 2️⃣ تشغيل الـ Container
```bash
docker run -d \
  --name honey-farm \
  -p 3003:3003 \
  -v honey-data:/data/db \
  --restart unless-stopped \
  honey-farm-app
```

**شرح الأوامر:**
- `-d`: تشغيل في الخلفية
- `--name honey-farm`: اسم الـ container
- `-p 3003:3003`: ربط البورت 3003
- `-v honey-data:/data/db`: حفظ بيانات MongoDB
- `--restart unless-stopped`: إعادة التشغيل التلقائي

### 3️⃣ التحقق من التشغيل
```bash
# عرض حالة الـ container
docker ps

# عرض الـ logs
docker logs honey-farm

# متابعة الـ logs مباشرة
docker logs -f honey-farm
```

### 4️⃣ الوصول للتطبيق
افتح المتصفح على: `http://localhost:3003`

## 🔧 إعداد Nginx (على السيرفر)

أضف هذا الإعداد في ملف Nginx الخاص بك:

```nginx
server {
    listen 80;
    server_name hony.fidanet.om;
    
    # إعادة توجيه HTTP إلى HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name hony.fidanet.om;
    
    # شهادات SSL (ضع مسار شهاداتك)
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    
    # إعدادات SSL الأساسية
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

بعد تعديل الإعداد:
```bash
# اختبر الإعداد
sudo nginx -t

# إعادة تحميل Nginx
sudo systemctl reload nginx
```

## 📊 أوامر الإدارة

### إيقاف التطبيق
```bash
docker stop honey-farm
```

### تشغيل التطبيق
```bash
docker start honey-farm
```

### إعادة تشغيل التطبيق
```bash
docker restart honey-farm
```

### حذف الـ Container
```bash
docker stop honey-farm
docker rm honey-farm
```

### حذف الـ Image
```bash
docker rmi honey-farm-app
```

### عرض استخدام الموارد
```bash
docker stats honey-farm
```

## 🔍 استكشاف الأخطاء

### مشكلة: التطبيق لا يعمل
```bash
# تحقق من الـ logs
docker logs honey-farm

# تحقق من الـ services الداخلية
docker exec honey-farm supervisorctl status
```

### مشكلة: MongoDB لا يعمل
```bash
# تحقق من MongoDB logs
docker exec honey-farm tail -f /var/log/mongodb/mongod.log
```

### مشكلة: Backend لا يعمل
```bash
# تحقق من Backend logs
docker exec honey-farm tail -f /var/log/supervisor/backend.err.log
```

### الدخول إلى الـ Container
```bash
docker exec -it honey-farm bash
```

## 💾 النسخ الاحتياطي

### نسخ احتياطي للبيانات
```bash
# إنشاء نسخة احتياطية
docker exec honey-farm mongodump --out /tmp/backup

# نسخ الملفات من الـ container
docker cp honey-farm:/tmp/backup ./mongo-backup-$(date +%Y%m%d)
```

### استعادة النسخة الاحتياطية
```bash
# نسخ الملفات إلى الـ container
docker cp ./mongo-backup-20240101 honey-farm:/tmp/restore

# استعادة البيانات
docker exec honey-farm mongorestore /tmp/restore
```

## 🔄 التحديث

عند وجود تحديث جديد:

```bash
# 1. إيقاف الـ container القديم
docker stop honey-farm

# 2. نسخ احتياطي للبيانات (اختياري)
docker exec honey-farm mongodump --out /tmp/backup
docker cp honey-farm:/tmp/backup ./backup

# 3. حذف الـ container القديم
docker rm honey-farm

# 4. بناء image جديد
docker build -t honey-farm-app .

# 5. تشغيل container جديد
docker run -d \
  --name honey-farm \
  -p 3003:3003 \
  -v honey-data:/data/db \
  --restart unless-stopped \
  honey-farm-app
```

## 📦 حجم الـ Image
حجم الـ Docker image تقريباً: **800-900 MB**

## ⚙️ المتطلبات
- Docker 20.10 أو أحدث
- 2GB RAM على الأقل
- 2GB مساحة تخزين

## 🔐 الأمان

**مهم جداً:**
1. غيّر كلمة مرور الـ Admin من الإعدادات الافتراضية
2. استخدم HTTPS في الإنتاج
3. احفظ نسخ احتياطية دورية للبيانات

## 📱 معلومات الـ Admin الافتراضية
- Username: `admin`
- Password: `admin123`

**يرجى تغيير كلمة المرور فوراً!**

## 🆘 الدعم
للمساعدة أو الأسئلة، تواصل معي.

## 📄 الترخيص
جميع الحقوق محفوظة © 2024