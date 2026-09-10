# ALRAEBI AUTO CARS V18 — ALL / CLOUD PRO

V18 is the API-first cloud dealership edition.

## New in V18
- Frontend cloud status/control layer
- Backend-first inventory API
- Real add/edit/delete inventory
- Multi-image upload from phone
- Featured vehicles
- Search, filters and pagination
- Customer accounts and customer order history
- Orders and workflow statuses
- Leads and workflow statuses
- Dealer settings storage
- Audit log
- JWT + bcrypt
- Helmet + rate limiting
- SQLite WAL
- Docker + docker-compose
- Express 5 compatible SPA fallback
- Node.js 20+

## Run
1. Copy `.env.example` to `.env`
2. Set strong JWT_SECRET and ADMIN_PASSWORD
3. `cd server`
4. `npm install`
5. `npm start`
6. Open http://localhost:3000
7. Admin: /admin.html

For production use HTTPS/reverse proxy, persistent volumes/backups, and PostgreSQL for larger scale.
