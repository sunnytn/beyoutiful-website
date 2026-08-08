# BeYoutiful Organics — Architecture

Production e-commerce platform for BeYoutiful Organics (Karachi, Pakistan). Custom build — no CMS.

## Monorepo Layout (npm workspaces)

```
├── apps/
│   ├── web/          # Next.js 14 (App Router) — storefront + custom admin panel (/admin)
│   └── api/          # NestJS 10 REST API
├── packages/
│   └── shared/       # Shared TypeScript types & constants (order status, advisor enums…)
├── data/crawl/       # Extracted content from the legacy site (source of seed data)
├── docker-compose.yml# PostgreSQL 16 for local dev
└── docs: ARCHITECTURE.md · TASKS.md · PROJECT_PROGRESS.md · README.md
```

## Stack

| Layer     | Choice                                             | Why |
|-----------|-----------------------------------------------------|-----|
| Frontend  | Next.js 14 App Router, React 18, TypeScript strict | SSR/ISR for SEO + Core Web Vitals |
| Styling   | Tailwind CSS + custom design tokens                | Consistent premium design system |
| Motion    | Framer Motion                                      | Scroll reveals, page transitions, micro-interactions |
| Backend   | NestJS 10 + REST                                   | Modular, testable, guards/pipes/interceptors |
| ORM/DB    | Prisma + PostgreSQL 16                             | Type-safe schema, migrations, FTS via raw SQL |
| Images    | Cloudinary (next/image remote loader)              | Transformations, CDN |
| Auth      | JWT (access 15m + refresh 7d rotation), bcrypt(12) | Stateless, role-based (ADMIN/STAFF/CUSTOMER) |
| Email     | Nodemailer (SMTP, config via env) + HTML templates | Order confirmations to customer + business |
| WhatsApp  | `wa.me/<number>?text=<prefilled>` deep link         | Generated server-side on order creation |

## Frontend Architecture (apps/web)

- `app/(storefront)/…` — public pages; `app/admin/…` — admin panel (client components + JWT); `app/api/…` — none (all data via NestJS API).
- Server Components fetch from the API with ISR (`revalidate`) for product/category/blog pages → SEO + speed.
- Client state: `zustand` stores persisted to `localStorage` — cart, wishlist, recently-viewed, compare.
- `lib/api.ts` — typed fetch client; `lib/seo.ts` — Metadata builders + JSON-LD generators (Product, Article, Organization, BreadcrumbList, FAQPage).
- `sitemap.ts` + `robots.ts` generated dynamically from API data.
- Design system in `components/ui/*` (Button, Badge, Input, Modal, Skeleton…), sections in `components/sections/*`, all themed by CSS custom properties + Tailwind tokens.

## Backend Architecture (apps/api)

NestJS modules: `auth`, `users`, `products`, `categories`, `collections`, `orders`, `reviews`, `blog`, `faqs`, `testimonials`, `gallery` (before/after), `ingredients`, `advisor`, `search`, `newsletter`, `contact`, `uploads` (Cloudinary), `settings`, `homepage`, `seo`, `audit`, `health`.

- Global: `ValidationPipe` (whitelist+transform), `helmet`, CORS allow-list, rate limiting (`@nestjs/throttler`), global exception filter, response serialization interceptor.
- Public GET endpoints cached (ETag + Cache-Control); mutating endpoints guarded by `JwtAuthGuard` + `RolesGuard`.
- Audit log interceptor records every admin mutation (actor, action, entity, diff).

## Database (Prisma)

Key models: `User`, `RefreshToken`, `Category`, `Collection`, `Product`, `ProductImage`, `ProductVariant`, `Ingredient`, `ProductIngredient`, `ProductFaq`, `Review`, `Order`, `OrderItem`, `BlogPost`, `BlogCategory`, `Faq`, `Testimonial`, `BeforeAfter`, `AdvisorQuestion`, `AdvisorOption`, `AdvisorRule`, `NewsletterSubscriber`, `ContactMessage`, `HomepageSection`, `Setting`, `SeoEntry`, `AuditLog`, `SearchSynonym`.

- Products ↔ Categories: many-to-many. Concerns (hair/skin) stored as string arrays + advisor tags.
- `SeoEntry` polymorphic (entityType + entityId) → per-page meta overrides managed in admin.
- Order lifecycle: `PENDING → CONFIRMED → PACKED → SHIPPED → DELIVERED / CANCELLED` (COD/WhatsApp model, no payment gateway).

## Order Flow

1. `POST /orders` (validated cart payload; server re-prices from DB — client prices never trusted).
2. Transaction: create Order + OrderItems, generate order number `BYO-YYMMDD-XXXX`.
3. Fire-and-forget: email business + customer (failures logged, never block order).
4. Response includes `whatsappUrl` — prefilled wa.me message (customer details, items, totals, order #). Frontend redirects; customer just presses Send.

## AI Advisor

- Wizard: goal (hair/skin) → concern (only concerns having products) → optional profile questions → results.
- `AdvisorRule`: JSON `conditions` (match on goal/concern/answers) + weighted product/blog/faq/gallery outputs + routine steps. Evaluated by `RuleEngineService` (pure function: answers → scored recommendations).
- `RecommendationStrategy` interface — `RuleEngineStrategy` today; an `LlmStrategy` can be registered later without touching the wizard or API contract (strategy chosen via `Setting: advisor.strategy`).

## Search

`GET /search?q=` — Postgres `tsvector` (products: name, description, ingredients, concerns; blogs; faqs) + `pg_trgm` fuzzy fallback + `SearchSynonym` table (admin-managed intent mapping, e.g. "dandruff" → rosemary oil, "khushki" → dandruff).

## Security

Helmet, CORS allow-list, throttling (global + strict on auth/orders/contact), bcrypt(12), JWT rotation with revocable refresh tokens (hashed in DB), class-validator on every DTO, Prisma (parameterized SQL), Cloudinary signed uploads (type/size validated), audit logs, admin routes role-guarded, no secrets in repo (.env only).

## Performance

ISR + streaming SSR, `next/image` with Cloudinary loader (AVIF/WebP), route-level code splitting, dynamic imports for heavy client components (zoom, advisor wizard), font subsetting via `next/font`, HTTP compression on API, DB indexes on all query paths.
