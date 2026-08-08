# TASKS

## M0 — Discovery
- [x] Crawl legacy site, extract business info, products, categories, blogs, policies → `data/crawl/site-content.json`

## M1 — Foundation
- [x] Monorepo scaffolding (workspaces, tsconfig, lint, docker-compose, envs)
- [x] ARCHITECTURE.md / TASKS.md / PROJECT_PROGRESS.md
- [x] packages/shared: types + constants

## M2 — Database
- [x] Prisma schema (28 models: catalog, orders, content, advisor, marketing, system)
- [x] Seed script from crawl data (22 products with original copy, 3 categories, 5 collections, 20 ingredients, 7 blog posts, 12 FAQs, 6 testimonials, 13 advisor concerns, 8 questions, 9 rules, 21 search synonyms, settings, admin user)

## M3 — Backend API
- [x] App bootstrap: helmet, CORS allow-list, compression, validation, throttling, global exception filter
- [x] Auth module (JWT access + rotating hashed refresh tokens, roles ADMIN/STAFF/CUSTOMER)
- [x] Catalog: products / categories / collections / ingredients (full CRUD, filters, related products)
- [x] Reviews (submission + moderation + rating rollup), FAQs, testimonials, before-after gallery
- [x] Orders (server-side re-pricing, BYO-order numbers, dual emails, wa.me deep link, status pipeline, dashboard stats)
- [x] Blog, newsletter (subscribe/export), contact
- [x] Advisor (concerns, questions, rule engine behind LLM-ready RecommendationStrategy interface)
- [x] Search (synonym expansion incl. Roman-Urdu, multi-entity)
- [x] Uploads (Cloudinary, validated), settings, homepage sections, SEO entries, audit log
- [x] Unit tests (rule engine matching, order pricing invariants, WhatsApp URL contract)

## M4 — Design System
- [x] Tailwind theme (forest/cream/clay palette, Fraunces + Jost, luxe tracking, organic radii)
- [x] UI primitives (Button, Badge, Input/Textarea/Select/Field, Rating, Accordion, skeletons)
- [x] Header (announcement bar, sticky blur nav, mobile drawer, cart/wishlist counters), Footer
- [x] Motion primitives (Reveal, Stagger, reduced-motion aware)

## M5 — Storefront
- [x] Home (animated hero, categories, best sellers, ingredients, story band, advisor CTA, testimonials, blog, newsletter)
- [x] About / Our Story / Our Philosophy
- [x] Shop listing (category/price filters, 6 sort options, pagination) + Hair Care & Skin Care landings + Collections
- [x] Product detail (gallery + hover zoom + video slide, variants, benefits, ingredients, directions, FAQs, reviews, related, recently viewed, Product/FAQ/Breadcrumb JSON-LD)
- [x] Ingredients library + detail, Before/After (draggable slider), Testimonials
- [x] Blog (featured + grid + article w/ markdown rendering), FAQs (grouped + FAQPage schema), Contact
- [x] Wishlist, Compare (side-by-side table), Search page (intent expansion, multi-entity results)
- [x] Policies (Privacy, Shipping, Refund, Terms — drafted fresh), custom 404

## M6 — Commerce
- [x] Cart store (persistent), drawer with free-shipping progress, cart page
- [x] Checkout (info → review → place order, stepper, validation)
- [x] Order success + automatic WhatsApp open with pre-filled message (customer just presses Send)
- [x] Email templates (branded customer confirmation + business notification)

## M7 — AI Advisor
- [x] Wizard (goal → concern [only concerns with products] → optional profile → results, animated, deep-linkable)
- [x] Results (ranked products with "why", routine timeline, before/after, blogs, FAQs, add-all-to-cart, Ask Expert)

## M8 — Admin Panel
- [x] JWT login, role-guarded shell (sidebar, mobile nav)
- [x] Dashboard (revenue, orders, pending counts, recent orders)
- [x] Products (rich editor: unlimited images w/ Cloudinary upload, variants, benefits, concerns, FAQs, SEO, related)
- [x] Categories / Collections / Ingredients CRUD
- [x] Orders (search, filter, expand, status pipeline, WhatsApp shortcut)
- [x] Blog / FAQs / Testimonials / Before-After CRUD
- [x] Homepage section editor, Settings (grouped), SEO overrides
- [x] Advisor: concerns manager + no-code rule builder (conditions, weighted products, routine steps)
- [x] Search synonyms, Newsletter (list + export), Users, Reviews moderation, Contact messages, Audit log

## M9 — SEO & Performance
- [x] Metadata + OG/Twitter/canonical on every route; JSON-LD (Organization, Product, Article, FAQPage, Breadcrumb)
- [x] Dynamic sitemap.ts (API-driven) + robots.ts
- [x] next/image everywhere (AVIF/WebP), ISR caching, code splitting, font subsetting, security headers

## M10 — QA & Delivery
- [x] `tsc --noEmit` strict: **PASS** (shared, api, web)
- [x] Jest unit tests: **10/10 PASS**
- [x] README with quick start + production deployment guide
- [~] `next build` in the CI sandbox hits a SIGBUS environment limitation (build workers + restricted shared memory). Run `npm run build` locally/CI — code is fully type-clean.
