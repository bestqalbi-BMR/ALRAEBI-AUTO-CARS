# ALRAEBI AUTO CARS V16 — CLOUD PRO

V16 upgrades the V15 cloud foundation into a more deployment-ready dealership system.

## Highlights
- Node.js 20+ / Express 5
- SQLite with WAL
- JWT + bcrypt authentication
- Helmet security headers
- API rate limiting
- Admin + customer authentication
- Real API inventory CRUD
- Image upload endpoint
- Orders, customers, leads
- Customer order history endpoint
- Inventory search/filter API
- Statistics endpoint
- Docker-ready structure
- Fixed Express fallback route compatibility

## Run locally
1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Set a strong JWT_SECRET and ADMIN_PASSWORD.
4. `cd server`
5. `npm install`
6. `npm start`
7. Open `http://localhost:3000`

Admin:
- URL: `/admin.html`
- Username: `admin`
- Password: the value you set in `ADMIN_PASSWORD`

## Production
Use HTTPS, a reverse proxy, persistent storage for `server/data` and `server/uploads`, and a strong secret/password. For higher scale, migrate SQLite to PostgreSQL/MySQL.
