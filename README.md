# 🍯 منحل أحمد — Ahmad's Honey Farm

متجر إلكتروني ثنائي اللغة (عربي/إنجليزي) لعسل منحل أحمد: عرض المنتجات، وسلة مشتريات، وتأكيد الطلب برمز تحقق يصل عبر **واتساب**، ولوحة تحكم كاملة للمشرف.

## المزايا
- **المتجر:** الواجهة، والقصة، والمنتجات، ومعرض الصور، والتواصل، مع تبديل اللغة واتجاه الصفحة (RTL/LTR).
- **الطلب:** السلة ← بيانات العميل ← رمز OTP على واتساب ← تأكيد. بعد التأكيد تصل للعميل رسالة تأكيد، ثم يصل إشعار للمشرف.
- **لوحة التحكم `/admin`:** إحصائيات، وإدارة الطلبات (بحث، وتصفية، وتغيير الحالة، ومراسلة العميل)، والمنتجات، والمعرض، ونصوص الموقع، وإعدادات واتساب (مع رسالة تجريبية)، وتغيير كلمة المرور.

## البنية
```
backend/    FastAPI + MongoDB (pymongo async)      ← API تحت /api
  app/
    main.py          إنشاء التطبيق ودورة حياته
    config.py        الإعدادات من متغيرات البيئة
    routers/         public.py (المتجر) و admin.py (لوحة التحكم)
    services/        الطلبات و OTP، واتساب، المحتوى، البيانات الأولية
  tests/             اختبارات pytest على MongoDB حقيقية
frontend/   React 19 + Tailwind + shadcn/ui        ← تُبنى وتُخدم عبر nginx
docker-compose.yml        mongo + backend + web
docker-compose.prod.yml   إعدادات الإنتاج على Apps VM (منفذ منشور لبوابة Caddy)
.github/workflows/        CI (اختبارات وبناء) + Deploy (نشر تلقائي بعد نجاح CI)
docs/DEPLOY.md            دليل النشر على خوادم فدى نت
```

## الأمان
- **الأسعار والمجموع يحسبها الخادم** من قاعدة البيانات. أي سعر يرسله المتصفح يُرفض.
- **رمز OTP:** يُولَّد عشوائياً بطريقة آمنة (`secrets`) ويُخزَّن مشفّراً (HMAC). صلاحيته 5 دقائق، وله 5 محاولات كحد أقصى، وإعادة الإرسال بعد 60 ثانية.
- **تحديد معدل الطلبات** لكل رقم هاتف ولكل عنوان IP، ولمحاولات تسجيل الدخول.
- **لا أسرار في الكود:** كل المفاتيح في `.env`، ومفتاح واتساب لا يُعرض كاملاً في لوحة التحكم.
- **لا توجد كلمة مرور افتراضية:** حساب المشرف الأول يُنشأ من `ADMIN_PASSWORD`. تغيير كلمة المرور يُبطل الجلسات القديمة.
- **حذف تلقائي:** الطلبات غير المؤكدة تُحذف بعد 24 ساعة، ورموز OTP بعد انتهاء صلاحيتها (فهارس TTL).
- **رسائل واتساب لا توقف الخادم:** تُرسل في الخلفية بشكل غير متزامن.

## التشغيل محلياً
```bash
cp .env.example .env
# اضبط: JWT_SECRET=$(openssl rand -hex 32) و ADMIN_PASSWORD و WHATSAPP_DRY_RUN=true
docker compose up -d --build
# الموقع: http://localhost:8080   لوحة التحكم: http://localhost:8080/admin
```
عند تفعيل `WHATSAPP_DRY_RUN=true` لا تُرسل الرسائل، بل تُطبع في السجلات. لرؤية رمز التحقق: `docker compose logs -f backend`.

### التطوير بدون Docker
```bash
# الخلفية (تحتاج MongoDB على localhost:27017)
cd backend && python -m venv .venv && . .venv/bin/activate
pip install -r requirements-dev.txt
JWT_SECRET=$(openssl rand -hex 32) ADMIN_PASSWORD=dev-password-123 ENVIRONMENT=development \
  WHATSAPP_DRY_RUN=true uvicorn app.main:app --reload     # توثيق الـ API: /api/docs
pytest -q && ruff check . && ruff format --check .

# الواجهة
cd frontend && yarn install
REACT_APP_BACKEND_URL=http://localhost:8000 yarn start
```

## الإعدادات (`.env`)
| المتغير | الوصف |
|---|---|
| `JWT_SECRET` | **إلزامي**، 32 حرفاً على الأقل |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | لإنشاء حساب المشرف الأول فقط |
| `WHATSAPP_API_KEY` | مفتاح TextMeBot (يمكن ضبطه لاحقاً من لوحة التحكم) |
| `ADMIN_PHONE` | رقم يستقبل إشعارات الطلبات، ويُعرض افتراضياً كرقم التواصل في الموقع |
| `WHATSAPP_DRY_RUN` | `true` لطباعة الرسائل في السجلات بدل إرسالها |
| `SEED_SAMPLE_DATA` | إضافة منتجات وصور تجريبية إذا كانت قاعدة البيانات فارغة |
| `HOST_PORT` | منفذ الإنتاج على Apps VM (الافتراضي 8095) |

كل الإعدادات الأخرى (مدة OTP، والحدود، وغيرها) موجودة في `backend/app/config.py`.

## النشر
كل `push` إلى `main` يشغّل CI. إذا نجح، يبدأ النشر تلقائياً عبر self-hosted runner على Apps VM (`10.10.70.20`). التفاصيل والإعداد لأول مرة في **[docs/DEPLOY.md](docs/DEPLOY.md)**.
