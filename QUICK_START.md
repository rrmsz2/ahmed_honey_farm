# 🚀 البدء السريع

## الطريقة 1: استخدام السكريبت التلقائي (الأسهل)

```bash
chmod +x build-and-run.sh
./build-and-run.sh
```

هذا كل شيء! 🎉

---

## الطريقة 2: الأوامر اليدوية

### البناء
```bash
docker build -t honey-farm-app .
```

### التشغيل
```bash
docker run -d \
  --name honey-farm \
  -p 3003:3003 \
  -v honey-data:/data/db \
  --restart unless-stopped \
  honey-farm-app
```

---

## الطريقة 3: استخدام Docker Compose

```bash
docker-compose up -d
```

---

## 🌐 الوصول للتطبيق

افتح المتصفح على:
- **محلياً:** http://localhost:3003
- **عبر النطاق:** http://hony.fidanet.om (بعد إعداد Nginx)

---

## 👤 تسجيل الدخول كـ Admin

```
Username: admin
Password: admin123
```

**⚠️ مهم جداً: غيّر كلمة المرور بعد أول تسجيل دخول!**

---

## 📋 أوامر سريعة

```bash
# عرض الـ logs
docker logs -f honey-farm

# إيقاف
docker stop honey-farm

# تشغيل
docker start honey-farm

# إعادة تشغيل
docker restart honey-farm

# حالة الخدمات الداخلية
docker exec honey-farm supervisorctl status

# الدخول للـ container
docker exec -it honey-farm bash
```

---

## 🔧 إعداد Nginx على السيرفر

أنشئ ملف في `/etc/nginx/sites-available/honey-farm`:

```nginx
server {
    listen 80;
    server_name hony.fidanet.om;
    
    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

ثم فعّل الإعداد:
```bash
sudo ln -s /etc/nginx/sites-available/honey-farm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🐛 حل المشاكل

### التطبيق لا يعمل؟
```bash
# تحقق من الـ logs
docker logs honey-farm

# تحقق من حالة الخدمات
docker exec honey-farm supervisorctl status
```

### MongoDB لا يعمل؟
```bash
docker exec honey-farm tail -f /var/log/mongodb/mongod.log
```

### Backend لا يعمل؟
```bash
docker exec honey-farm tail -f /var/log/supervisor/backend.err.log
```

---

## 💾 نسخ احتياطي سريع

```bash
# نسخ احتياطي
docker exec honey-farm mongodump --out /tmp/backup
docker cp honey-farm:/tmp/backup ./backup-$(date +%Y%m%d)

# استعادة
docker cp ./backup-20240101 honey-farm:/tmp/restore
docker exec honey-farm mongorestore /tmp/restore
```

---

## 📦 نقل التطبيق لسيرفر آخر

### على السيرفر القديم:
```bash
# حفظ الـ image
docker save honey-farm-app > honey-farm-app.tar

# نسخ احتياطي للبيانات
docker exec honey-farm mongodump --out /tmp/backup
docker cp honey-farm:/tmp/backup ./backup
```

### على السيرفر الجديد:
```bash
# تحميل الـ image
docker load < honey-farm-app.tar

# تشغيل container
docker run -d \
  --name honey-farm \
  -p 3003:3003 \
  -v honey-data:/data/db \
  --restart unless-stopped \
  honey-farm-app

# استعادة البيانات
docker cp ./backup honey-farm:/tmp/restore
docker exec honey-farm mongorestore /tmp/restore
```

---

للمزيد من التفاصيل، اقرأ: **DOCKER_README.md**
