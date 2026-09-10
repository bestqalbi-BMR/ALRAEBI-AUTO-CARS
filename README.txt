ALRAEBI AUTO CARS V19 — CLOUD PRO
=================================

نسخة V19 المطورة من الراعبي أوتو كارز، مبنية لتعمل محلياً على الهاتف أو مع Backend حقيقي.

أبرز التطويرات:
- Cloud-first للسيارات: عند تشغيل Backend يتم تحميل المخزون الحقيقي من API، مع رجوع تلقائي للبيانات المحلية إذا لم يتوفر الخادم.
- حسابات عملاء سحابية: تسجيل، دخول، وطلبات العميل.
- ربط الاستفسارات/الطلبات مع API.
- إعدادات المعرض قابلة للحفظ من لوحة الإدارة.
- PWA: manifest + Service Worker لتثبيت الموقع على الهاتف وتحسين العمل مع الكاش.
- SEO و Open Graph أساسية.
- Backend Node.js/Express + SQLite + JWT + bcrypt + Helmet + Rate Limit.
- رفع صور متعدد للسيارات، مخزون، طلبات، عملاء، استفسارات، إعدادات، وسجل تدقيق.
- Docker و docker-compose جاهزان من الإصدارات السابقة.

تشغيل Backend:
1) Node.js 20+.
2) ادخل مجلد server.
3) npm install
4) اضبط JWT_SECRET و ADMIN_PASSWORD في البيئة.
5) npm start
6) افتح عنوان الخادم من المتصفح.

مهم للإنتاج:
- لا تستخدم أسرار افتراضية.
- استخدم HTTPS.
- احتفظ بقاعدة البيانات ومجلد uploads على تخزين دائم.
- عند التوسع الكبير يفضّل PostgreSQL وتخزين صور خارجي.

ملفات مهمة:
index.html — الصفحة الرئيسية
admin.html — لوحة الإدارة
app.js — محرك المتجر
api.js — جسر API
v19.js — تكامل V19 السحابي
server/server.js — Backend
manifest.webmanifest / sw.js — PWA
