# 🚀 دليل نشر التطبيق على السيرفر

## المتطلبات
- Ubuntu/Debian server (20.04 أو أحدث)
- Docker مثبت
- اتصال SSH بالسيرفر
- Domain name (hony.fidanet.om)

---

## الخطوة 1️⃣: تحضير السيرفر

### تثبيت Docker
```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# إضافة المستخدم الحالي لمجموعة docker
sudo usermod -aG docker $USER

# تفعيل Docker
sudo systemctl enable docker
sudo systemctl start docker

# التحقق من التثبيت
docker --version
```

---

## الخطوة 2️⃣: رفع ملفات التطبيق

### الطريقة 1: استخدام Git (موصى به)
```bash
# على السيرفر
cd /home/youruser
git clone https://github.com/yourusername/honey-farm.git
cd honey-farm
```

### الطريقة 2: رفع الملفات يدوياً
```bash
# على جهازك المحلي
cd /app
tar -czf honey-farm.tar.gz .

# رفع للسيرفر
scp honey-farm.tar.gz user@hony.fidanet.om:/home/user/

# على السيرفر
cd /home/user
tar -xzf honey-farm.tar.gz
cd honey-farm
```

---

## الخطوة 3️⃣: بناء وتشغيل التطبيق

```bash
# بناء الـ image
docker build -t honey-farm-app .

# تشغيل التطبيق
docker run -d \
  --name honey-farm \
  -p 3003:3003 \
  -v honey-data:/data/db \
  --restart unless-stopped \
  honey-farm-app

# التحقق من التشغيل
docker ps
docker logs honey-farm
```

### أو استخدام السكريبت التلقائي:
```bash
chmod +x build-and-run.sh
./build-and-run.sh
```

---

## الخطوة 4️⃣: إعداد Nginx

### تثبيت Nginx
```bash
sudo apt install nginx -y
```

### إنشاء ملف الإعداد
```bash
sudo nano /etc/nginx/sites-available/honey-farm
```

### إضافة هذا الإعداد:
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name hony.fidanet.om www.hony.fidanet.om;
    
    # للحصول على SSL certificate من Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # إعادة توجيه لـ HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name hony.fidanet.om www.hony.fidanet.om;
    
    # SSL Certificates (سيتم إنشاؤها في الخطوة التالية)
    ssl_certificate /etc/letsencrypt/live/hony.fidanet.om/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hony.fidanet.om/privkey.pem;
    
    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Logging
    access_log /var/log/nginx/honey-farm-access.log;
    error_log /var/log/nginx/honey-farm-error.log;
    
    # Proxy to Docker container
    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer
        proxy_buffering off;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Limits
    client_max_body_size 50M;
}
```

### تفعيل الإعداد
```bash
# إنشاء رابط رمزي
sudo ln -s /etc/nginx/sites-available/honey-farm /etc/nginx/sites-enabled/

# حذف الإعداد الافتراضي
sudo rm /etc/nginx/sites-enabled/default

# اختبار الإعداد
sudo nginx -t

# إعادة تحميل Nginx
sudo systemctl reload nginx
```

---

## الخطوة 5️⃣: الحصول على SSL Certificate

### تثبيت Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### الحصول على الشهادة
```bash
# ⚠️ تأكد أن Domain يشير لـ IP السيرفر أولاً!
sudo certbot --nginx -d hony.fidanet.om -d www.hony.fidanet.om
```

### تجديد تلقائي
```bash
# اختبار التجديد
sudo certbot renew --dry-run

# Certbot سيجدد الشهادة تلقائياً
```

---

## الخطوة 6️⃣: إعداد Firewall

```bash
# تفعيل UFW
sudo ufw enable

# السماح بـ SSH
sudo ufw allow ssh
sudo ufw allow 22/tcp

# السماح بـ HTTP & HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# التحقق
sudo ufw status
```

---

## الخطوة 7️⃣: التحقق من التشغيل

### 1. فحص Docker
```bash
docker ps
docker logs honey-farm
docker exec honey-farm supervisorctl status
```

### 2. فحص Nginx
```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/honey-farm-access.log
```

### 3. اختبار الموقع
```bash
# محلياً
curl http://localhost:3003

# من الخارج
curl https://hony.fidanet.om
```

### 4. افتح المتصفح
- https://hony.fidanet.om

---

## 🔄 التحديثات

عند وجود تحديث جديد:

```bash
# 1. نسخ احتياطي للبيانات
docker exec honey-farm mongodump --out /tmp/backup
docker cp honey-farm:/tmp/backup ./backup-$(date +%Y%m%d)

# 2. إيقاف وحذف container القديم
docker stop honey-farm
docker rm honey-farm

# 3. جلب آخر تحديث
git pull origin main
# أو رفع الملفات الجديدة

# 4. بناء image جديد
docker build -t honey-farm-app .

# 5. تشغيل container جديد
docker run -d \
  --name honey-farm \
  -p 3003:3003 \
  -v honey-data:/data/db \
  --restart unless-stopped \
  honey-farm-app

# 6. التحقق
docker logs -f honey-farm
```

---

## 💾 النسخ الاحتياطي التلقائي

### إنشاء سكريبت للنسخ الاحتياطي
```bash
sudo nano /usr/local/bin/honey-farm-backup.sh
```

### محتوى السكريبت:
```bash
#!/bin/bash
BACKUP_DIR="/backups/honey-farm"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR

# نسخ احتياطي MongoDB
docker exec honey-farm mongodump --out /tmp/backup-$DATE
docker cp honey-farm:/tmp/backup-$DATE $BACKUP_DIR/

# ضغط النسخة
cd $BACKUP_DIR
tar -czf backup-$DATE.tar.gz backup-$DATE
rm -rf backup-$DATE

# حذف النسخ القديمة (أكثر من 30 يوم)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: backup-$DATE.tar.gz"
```

### جدولة النسخ الاحتياطي
```bash
# تعديل crontab
sudo crontab -e

# إضافة هذا السطر (نسخ احتياطي يومي الساعة 2 صباحاً)
0 2 * * * /usr/local/bin/honey-farm-backup.sh
```

---

## 📊 المراقبة

### مراقبة استخدام الموارد
```bash
# استخدام Docker
docker stats honey-farm

# استخدام النظام
htop
```

### مراقبة Logs
```bash
# Real-time logs
docker logs -f honey-farm

# آخر 100 سطر
docker logs --tail 100 honey-farm

# logs محددة
docker exec honey-farm tail -f /var/log/supervisor/backend.log
```

---

## 🐛 حل المشاكل الشائعة

### المشكلة 1: التطبيق لا يعمل
```bash
# فحص الـ logs
docker logs honey-farm

# فحص الخدمات
docker exec honey-farm supervisorctl status

# إعادة تشغيل
docker restart honey-farm
```

### المشكلة 2: MongoDB لا يعمل
```bash
# فحص MongoDB logs
docker exec honey-farm cat /var/log/mongodb/mongod.log

# إعادة تشغيل MongoDB فقط
docker exec honey-farm supervisorctl restart mongodb
```

### المشكلة 3: 502 Bad Gateway
```bash
# فحص إذا التطبيق يعمل
curl http://localhost:3003

# فحص Nginx
sudo nginx -t
sudo systemctl status nginx
```

### المشكلة 4: SSL Certificate خطأ
```bash
# تجديد الشهادة
sudo certbot renew --force-renewal

# إعادة تحميل Nginx
sudo systemctl reload nginx
```

---

## 🔐 الأمان

### 1. تغيير كلمة مرور Admin
- سجل دخول كـ admin
- اذهب للإعدادات
- غيّر كلمة المرور

### 2. قفل SSH
```bash
sudo nano /etc/ssh/sshd_config
```
غيّر:
- `PermitRootLogin no`
- `PasswordAuthentication no` (استخدم SSH keys)

```bash
sudo systemctl restart sshd
```

### 3. تحديثات تلقائية
```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع logs: `docker logs honey-farm`
2. تحقق من: [QUICK_START.md](QUICK_START.md)
3. تواصل معي للدعم

---

**تم بنجاح! 🎉**

موقعك الآن يعمل على: **https://hony.fidanet.om**
