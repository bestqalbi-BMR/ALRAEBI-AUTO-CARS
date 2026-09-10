ALRAEBI AUTO CARS V19 — CLOUD PRO

أهم ما يميز V19:
- Cloud-first: واجهة المعرض تسحب المخزون من /api/cars عند توفر Backend وتعود للوضع المحلي عند تعذر الاتصال.
- حساب عميل سحابي: تسجيل/دخول/عرض الطلبات.
- طلبات واستفسارات مرتبطة بالـ API.
- إعدادات المعرض قابلة للحفظ من لوحة الإدارة.
- PWA: manifest + service worker للتثبيت على الهاتف وكاش الواجهة.
- SEO/OG metadata أساسية.
- Backend Node/Express + SQLite + JWT + bcrypt + Helmet + rate limit.

التشغيل السحابي:
1) ثبّت Node.js 20+.
2) cd server && npm install
3) أنشئ متغيرات البيئة: JWT_SECRET و ADMIN_PASSWORD
4) npm start
5) افتح عنوان الخادم.

ملاحظة: SQLite مناسب كبداية لخادم واحد. عند التوسع الكبير يفضّل PostgreSQL/Object Storage للصور.
