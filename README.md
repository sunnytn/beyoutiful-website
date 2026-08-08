# BeYoutiful Organics — E-Commerce Platform

A complete, production-ready e-commerce platform for BeYoutiful Organics (Karachi, Pakistan): a luxury organic
skincare & haircare storefront, a custom admin panel, an AI Hair & Skin Advisor, and a WhatsApp-first checkout —
built entirely from scratch. No WordPress, no Shopify, no CMS.

## Stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Framer Motion · NestJS 10 · Prisma · PostgreSQL 16 ·
Cloudinary · JWT auth · Nodemailer

See `ARCHITECTURE.md` for the full design, `TASKS.md` for the module checklist and `PROJECT_PROGRESS.md` for the build log.

## Repository layout

```
apps/web        Next.js storefront + custom admin panel (/admin)
apps/api        NestJS REST API (all data, auth, orders, advisor, search)
packages/shared Shared TypeScript types & constants
data/crawl      Content extracted from the legacy site (seed source)
```

## Quick start (local development)

Prerequisites: Node 18.17+, Docker (for PostgreSQL), npm 9+.

```bash
# 1. Install dependencies (workspace root)
npm install

# 2. Environment
cp .env.example apps/api/.env          # then edit values
#    For the web app create apps/web/.env.local with:
#    NEXT_PUBLIC_API_URL=http://localhost:4000
#    NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 3. Database
npm run db:up                          # starts postgres:16 via docker compose
npm run db:migrate -- --name init      # creates schema
npm run db:seed                        # seeds full catalog, blog, FAQs, advisor rules, admin user

# 4. Run everything
npm run dev                            # api on :4000, web on :3000
```

**Default admin login** (change immediately in production):
`beyoutiful.organics@gmail.com` / `BeYoutiful@2026` — or set `SEED_ADMIN_PASSWORD` before seeding.
Admin panel: `http://localhost:3000/admin`.

## Configuration

All secrets live in environment variables (`.env.example` documents every one):

| Group | Keys |
|---|---|
| Database | `DATABASE_URL` |
| Auth | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, TTLs |
| Cloudinary | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| Email | `SMTP_HOST/PORT/USER/PASS`, `MAIL_FROM`, `BUSINESS_EMAIL` (Gmail: use an App Password) |
| Business | `WHATSAPP_NUMBER` (international format, no +) |
| Web | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER` |

Without Cloudinary/SMTP configured the app still runs: uploads return a friendly error and emails are logged instead
of sent — so you can develop everything else immediately.

## Order flow (business-critical)

1. Customer checks out (info → review → **Place Order**).
2. API re-prices the cart from the database (client prices are never trusted), creates the order in a transaction and
   generates an order number `BYO-YYMMDD-XXXX`.
3. Confirmation emails go to the customer and the business (failures never block the order).
4. The response contains a `wa.me` deep link with the complete order message pre-filled; the storefront opens WhatsApp
   automatically — the customer just presses **Send**.
5. Staff manage the status pipeline (PENDING → CONFIRMED → PACKED → SHIPPED → DELIVERED) in Admin → Orders.

## AI Advisor

Rule-based and fully admin-configurable (Admin → Advisor Rules): each rule matches goal/concern/profile answers and
outputs weighted products, a routine, blog posts and gallery entries. The engine sits behind a
`RecommendationStrategy` interface (`apps/api/src/advisor/strategies/`) so an LLM strategy can replace or augment the
rules later without touching the wizard, controller or API contract.

## Testing & verification

```bash
npm run typecheck        # strict TS across api + web
npm run test -w apps/api # unit tests (rule engine, order invariants)
npm run build            # production builds
```

## Production deployment

Any Node host works. Recommended minimal setup:

1. **PostgreSQL** — managed instance (Neon, Supabase, RDS…). Set `DATABASE_URL`.
2. **API** — `npm run build -w apps/api && npm run prisma:deploy -w apps/api && node apps/api/dist/src/main.js`
   (PM2/systemd/Docker). Put behind HTTPS (nginx/Caddy). Set all env vars; use long random JWT secrets.
3. **Web** — deploy `apps/web` to Vercel (set the three `NEXT_PUBLIC_*` vars) or self-host with `npm run build -w apps/web && npm run start -w apps/web`.
4. Run the seed once against production, then change the admin password in Admin → Users.
5. Point DNS, confirm `https://yourdomain/sitemap.xml` and `robots.txt`, and submit to Google Search Console.

## Security posture

Helmet, strict CORS allow-list, global + per-route rate limiting, bcrypt(12), JWT rotation with revocable hashed
refresh tokens, class-validator on every input, Prisma parameterized queries, upload type/size validation, role-guarded
admin routes, immutable audit log of every admin action, and security headers on the frontend.
