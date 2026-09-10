# ALRAEBI AUTO CARS V17 — ALL / CLOUD PRO

V17 = API-first dealership edition.

## Added
- Real cloud/API-first admin workflow
- Add/edit/delete cars through the backend
- Multi-image upload from phone
- Search/filter + pagination API
- Customer registration/login
- Customer order history
- Orders + status workflow
- Leads + status workflow
- Statistics
- Settings storage
- Audit log
- JWT + bcrypt
- Helmet security headers
- Rate limiting
- SQLite WAL
- Docker + docker-compose
- Express-compatible SPA fallback
- Node.js 20+

## Run
Copy `.env.example` to `.env`, set a strong JWT_SECRET and ADMIN_PASSWORD, then:
cd server
npm install
npm start

Open http://localhost:3000
Admin: /admin.html
Username: admin
Password: the ADMIN_PASSWORD you configured.

## Production
Use HTTPS/reverse proxy, persistent data/uploads, regular backups, and preferably PostgreSQL for larger deployments.
