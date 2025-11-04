# 📚 فهرس الملفات والتوثيق

## 🚀 للبدء السريع - ابدأ من هنا!

1. **[QUICK_START.md](QUICK_START.md)** ⭐
   - دليل البدء السريع
   - 3 طرق للتشغيل
   - أوامر أساسية

2. **تشغيل السكريبت التلقائي:**
   ```bash
   ./build-and-run.sh
   ```

---

## 📖 التوثيق الكامل

### 1. الأساسيات
- **[README.md](README.md)** - نظرة عامة على المشروع
- **[QUICK_START.md](QUICK_START.md)** - البدء السريع
- **[DOCKER_FILES_SUMMARY.md](DOCKER_FILES_SUMMARY.md)** - ملخص جميع ملفات Docker

### 2. التفاصيل التقنية
- **[DOCKER_README.md](DOCKER_README.md)** - الدليل الكامل لـ Docker
  - كيفية البناء والتشغيل
  - أوامر الإدارة
  - استكشاف الأخطاء
  - النسخ الاحتياطي والاستعادة
  - التحديثات

### 3. النشر على السيرفر
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - دليل النشر الكامل
  - تحضير السيرفر
  - رفع الملفات
  - إعداد Nginx
  - SSL Certificate
  - Firewall
  - النسخ الاحتياطي التلقائي
  - المراقبة

---

## 🛠️ الملفات التنفيذية

### السكريبتات
- **`build-and-run.sh`** - بناء وتشغيل تلقائي
- **`test-docker.sh`** - اختبار الإعداد قبل البناء
- **`Makefile`** - أوامر Make للإدارة

### أمثلة الاستخدام:
```bash
# استخدام السكريبت
./build-and-run.sh

# استخدام Make
make help
make quick
make logs

# اختبار الإعداد
./test-docker.sh
```

---

## 📦 ملفات Docker

### الملفات الرئيسية
- **`Dockerfile`** - ملف Docker الرئيسي (multi-stage)
- **`docker-compose.yml`** - ملف Docker Compose (اختياري)
- **`.dockerignore`** - تجاهل الملفات غير المطلوبة

### ملفات الإعداد (مجلد docker/)
- **`docker/nginx.conf`** - إعدادات Nginx الداخلي
- **`docker/supervisord.conf`** - إعدادات Supervisor
- **`docker/start.sh`** - سكريبت بدء التشغيل

---

## 💻 الكود المصدري

### Backend (FastAPI)
```
backend/
├── server.py           # الملف الرئيسي
├── requirements.txt    # المكتبات المطلوبة
├── routes/            # API endpoints
├── models/            # Database models
├── utils/             # Utilities
└── middleware/        # Middleware
```

### Frontend (React)
```
frontend/
├── src/
│   ├── App.js
│   ├── pages/
│   ├── components/
│   └── context/
├── package.json
└── public/
```

---

## 🎯 حسب الحالة الاستخدامية

### أريد أن أبدأ محلياً؟
👉 [QUICK_START.md](QUICK_START.md)

### أريد فهم كل شيء عن Docker؟
👉 [DOCKER_README.md](DOCKER_README.md)

### أريد نشر التطبيق على السيرفر؟
👉 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

### أريد معرفة ما تم إنشاؤه؟
👉 [DOCKER_FILES_SUMMARY.md](DOCKER_FILES_SUMMARY.md)

### عندي مشكلة؟
1. راجع قسم "استكشاف الأخطاء" في [DOCKER_README.md](DOCKER_README.md)
2. راجع قسم "حل المشاكل" في [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
3. تحقق من logs: `docker logs honey-farm`

---

## 📊 معلومات سريعة

### المنافذ (Ports)
- **3003** - منفذ التطبيق الرئيسي

### الخدمات
- MongoDB (27017 - داخلي)
- FastAPI Backend (8001 - داخلي)
- Nginx (3003 - خارجي)

### Volumes
- **honey-data** - بيانات MongoDB

### Admin الافتراضي
- Username: `admin`
- Password: `admin123`
- ⚠️ **غيّرها فوراً!**

---

## 🔗 روابط مهمة

### محلياً
- التطبيق: http://localhost:3003
- API Health: http://localhost:3003/api/

### الإنتاج
- الموقع: https://hony.fidanet.om

---

## ✅ قائمة التحقق (Checklist)

### قبل البناء
- [ ] Docker مثبت (`docker --version`)
- [ ] جميع الملفات موجودة (`./test-docker.sh`)
- [ ] مساحة كافية (2GB+)

### بعد البناء
- [ ] Container يعمل (`docker ps`)
- [ ] Logs نظيفة (`docker logs honey-farm`)
- [ ] التطبيق يفتح (http://localhost:3003)
- [ ] يمكن تسجيل الدخول

### قبل النشر
- [ ] السيرفر جاهز
- [ ] Domain يشير للـ IP
- [ ] Nginx مثبت
- [ ] SSL Certificate جاهز

### بعد النشر
- [ ] الموقع يعمل على HTTPS
- [ ] غيّرت كلمة مرور Admin
- [ ] Firewall معد
- [ ] النسخ الاحتياطي معد

---

## 🆘 الدعم

إذا كنت بحاجة للمساعدة:
1. راجع التوثيق أعلاه
2. افحص الـ logs
3. تواصل معي

---

## 📝 ملاحظات

- جميع الملفات بالعربية للسهولة
- التوثيق شامل ومفصل
- السكريبتات تلقائية وسهلة
- الإعداد جاهز للإنتاج

---

**جاهز للبدء! 🚀**

ابدأ من [QUICK_START.md](QUICK_START.md)
