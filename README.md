<div align="center">

# bahari-shop-ecommerce — Full-Stack E-Commerce Platform

### A production-grade, monorepo e-commerce ecosystem built for Bangladesh's digital market

[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## Table of Contents

- [Overview](#-overview)
- [Live Screenshots](#-live-screenshots)
- [System Architecture](#-system-architecture)
- [Monorepo Structure](#-monorepo-structure)
- [Technology Stack](#-technology-stack)
- [Feature Modules](#-feature-modules)
  - [Backend API](#backend-api--nestjs-11)
  - [Customer Frontend](#customer-frontend--nextjs-16)
  - [Admin Dashboard](#admin--vite--react-19)
- [Database Design](#-database-design)
- [Integrations & Third-Party Services](#-integrations--third-party-services)
- [Security Implementation](#-security-implementation)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)

---

## Live Demo

**Customer:**
https://bahari-shop.vercel.app/

**Admin:**
https://bahari-shop-admin.vercel.app

### Demo Admin

| Field    | Value           |
|----------|-----------------|
| Email    | admin@gmail.com  |
| Password | Password@123       |

---

## 🎯 Overview

**bahari-shop-ecommerce** is a comprehensive, production-ready e-commerce platform designed specifically for the Bangladeshi market. Built as a three-part monorepo, it delivers a complete business solution — from customer-facing storefront to backend operations and administrative management.

The platform handles the full lifecycle of an e-commerce business: product catalog management, customer acquisition (with marketing attribution), order processing, payment collection (SSL Commerce + Cash on Delivery), logistics (Pathao courier), inventory tracking, accounting, human resources, and business intelligence reporting — all in a single integrated system.

### Key Highlights

- **37+ backend modules** covering every aspect of e-commerce operations
- **Full marketing attribution** — UTM tracking + Facebook Conversions API (server-side CAPI)
- **Bangladesh-native payment stack** — SSL Commerce gateway + Cash on Delivery
- **Real-time notifications** — Firebase FCM push notifications to customers
- **Double-entry accounting** engine built in
- **Multi-variant product system** with bulk pricing tiers
- **Pathao courier integration** with fraud detection
- **Asynchronous job processing** via BullMQ + Redis queues
- **Complete HRM module** for staff management

---

## 📸 Live Screenshots

### Customer Storefront

> *[Screenshot: Customer-facing homepage — hero banners, featured sections, deals, and product grid]*

![Frontend Screenshot]('https://i.ibb.co.com/hFxvYw79/Screenshot-2026-06-28-073312.png')

### Admin Dashboard

> *[Screenshot: Admin dashboard — analytics overview, order management, and reporting interface]*

![Admin Screenshot]('https://i.ibb.co.com/8nSGn0RC/Screenshot-2026-06-28-073548.png')

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│                                                                     │
│  ┌─────────────────────────┐    ┌──────────────────────────────┐   │
│  │   Customer Frontend     │    │      Admin Dashboard         │   │
│  │   Next.js 16 (SSR/CSR)  │    │   Vite + React 19 (SPA)      │   │
│  │   Port: 3000            │    │   Port: 5173                 │   │
│  └────────────┬────────────┘    └──────────────┬───────────────┘   │
└───────────────┼──────────────────────────────── ┼───────────────────┘
                │  RTK Query / Axios               │  RTK Query / Axios
                ▼                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         API LAYER                                    │
│                                                                      │
│               NestJS 11 REST API  (Port: 3001)                       │
│          JWT Auth │ Guards │ Interceptors │ Pipes │ Swagger           │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Auth    │ │ Products │ │  Orders  │ │Accounting│ │Tracking  │  │
│  │  Module  │ │  Module  │ │  Module  │ │  Module  │ │  Module  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Coupons  │ │ SSL Pay  │ │Messaging │ │   HRM    │ │Inventory │  │
│  │  Module  │ │  Module  │ │  Module  │ │  Module  │ │  Module  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│              ... and 27 more specialized modules                     │
└────────┬──────────────────────┬──────────────────────┬──────────────┘
         │                      │                      │
         ▼                      ▼                      ▼
┌────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  PostgreSQL 16 │  │    Redis 7           │  │  External Services  │
│                │  │                     │  │                     │
│  37+ Tables    │  │  • Cache Layer       │  │  • SSL Commerce     │
│  TypeORM ORM   │  │  • BullMQ Queues     │  │  • Pathao Courier   │
│  Auto-sync     │  │    - tracking        │  │  • Facebook CAPI    │
│                │  │    - notifications   │  │  • ImageKit CDN     │
│                │  │  • Session Store     │  │  • Firebase FCM     │
│                │  │                     │  │  • AWS S3           │
│                │  │                     │  │  • Nodemailer/SMTP  │
└────────────────┘  └─────────────────────┘  └─────────────────────┘
```

### Request Flow

```
Customer Browser
      │
      ▼
Next.js 16 (SSR / App Router)
      │  ─── Server Components: direct fetch (revalidate cache)
      │  ─── Client Components:  RTK Query → Axios → API
      ▼
NestJS REST API
      │  ─── JwtAuthGuard → RolesGuard → Controller
      │  ─── TransformInterceptor wraps all responses
      │         { success, statusCode, data, timestamp, path }
      ▼
TypeORM + PostgreSQL
      │
      └─── BullMQ Jobs (async, non-blocking)
                │
                ├── Facebook CAPI Purchase Event
                └── SMS / Email Delivery Queue
```

---

## 📁 Monorepo Structure

```
bahari-shop-ecommerce/
├── backend/                      # NestJS 11 REST API
│   └── src/
│       ├── modules/              # 37+ feature modules
│       │   ├── auth/             # Authentication & authorization
│       │   ├── users/            # User accounts & addresses
│       │   ├── product/          # Products, variants, images
│       │   ├── categories/       # Product categories (hierarchical)
│       │   ├── brand/            # Product brands
│       │   ├── orders/           # Order lifecycle management
│       │   ├── order-payments/   # Payment ledger
│       │   ├── ssl-payment/      # SSL Commerce gateway
│       │   ├── coupons/          # Promotional codes
│       │   ├── deals/            # Flash deals & offers
│       │   ├── inventory/        # Stock tracking
│       │   ├── accounting/       # Double-entry bookkeeping
│       │   │   ├── account/
│       │   │   ├── ledger/
│       │   │   ├── transaction/
│       │   │   └── reports/
│       │   ├── hrm/              # Human resources
│       │   │   ├── employee/
│       │   │   └── degignation/
│       │   ├── courier-service/  # Pathao + fraud check
│       │   ├── delivery-charges/ # Zone-based pricing
│       │   ├── tracking/         # UTM + Facebook CAPI
│       │   ├── notifications/    # Firebase FCM
│       │   ├── messaging/        # Bulk SMS / Email
│       │   ├── company-info/     # Brand identity settings
│       │   ├── admin-reports/    # Business intelligence
│       │   ├── dashboard/        # Analytics API
│       │   ├── banners/          # Homepage banners
│       │   ├── blog-post/        # Blog content
│       │   ├── blog-category/    # Blog categories
│       │   ├── pages/            # CMS static pages
│       │   ├── gallery/          # Media library
│       │   ├── testimonials/     # Customer reviews
│       │   ├── featured-sections/# Homepage sections
│       │   ├── feature-types/    # Product spec types
│       │   ├── top-ranking/      # Top-ranked products
│       │   ├── trending-search/  # Search term tracking
│       │   ├── customer-rank/    # Loyalty tier system
│       │   ├── order-sources/    # Channel attribution
│       │   ├── subscribers/      # Email list
│       │   ├── system-modules/   # Role-based access
│       │   ├── image-upload/     # ImageKit + Sharp
│       │   └── mail/             # Nodemailer service
│       └── common/               # Shared decorators, guards, interceptors
│
├── frontend/                     # Next.js 16 Customer Storefront
│   └── src/
│       ├── app/
│       │   ├── (auth-layout)/    # Login, Register
│       │   ├── (common-layout)/  # Main site pages
│       │   │   ├── page.tsx      # Homepage
│       │   │   ├── shop/         # Product listing & filters
│       │   │   ├── product-details/[slug]/
│       │   │   ├── account/      # Customer dashboard
│       │   │   ├── enjoy/        # Cart, Checkout, Payment result
│       │   │   ├── blog/         # Blog listing & detail
│       │   │   ├── deals/        # Flash deals
│       │   │   ├── rankings/     # Top products
│       │   │   ├── wishlist/
│       │   │   └── pages/        # CMS static pages
│       │   └── (invoice-layout)/ # Print invoice
│       ├── components/           # Shared UI components
│       ├── features/             # Page-level feature components
│       ├── redux/                # RTK Query API slices
│       ├── hooks/                # Custom hooks (useTrackingParams, etc.)
│       └── helpers/              # Axios instance, token helpers
│
└── admin/              # Vite + React 19 Admin SPA
    └── src/
        ├── features/
        │   ├── accounting/       # Accounts, ledger, transactions, reports
        │   ├── blog/             # Blog post & category management
        │   ├── common/           # Banners, gallery, pages, testimonials
        │   ├── courier-service/  # Pathao courier assignment
        │   ├── customer/         # Customer management
        │   ├── hrm/              # Employee & designation management
        │   ├── inventory/        # Stock & product management
        │   ├── messaging/        # Bulk SMS/email & templates
        │   ├── offers/           # Coupons & deals
        │   ├── orders/           # Order processing
        │   ├── profile/          # Admin profile
        │   ├── reports/          # BI reports & analytics
        │   ├── settings/         # Company info, delivery, system
        │   ├── subscribers/      # Email subscribers
        │   └── top-ranking-products/
        ├── redux/                # RTK Query API slices
        └── routes/               # React Router DOM 7 routes
```

---

## 🛠 Technology Stack

### Backend — NestJS 11

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | NestJS | 11.x | Modular Node.js framework |
| Language | TypeScript | 5.7 | Type-safe development |
| Database | PostgreSQL | 16 | Primary relational database |
| ORM | TypeORM | 0.3.x | Database abstraction & schema sync |
| Cache | Redis + `@keyv/redis` | 7.x | Response caching & sessions |
| Job Queue | BullMQ + `@nestjs/bullmq` | 5.x | Async background job processing |
| Auth | JWT + Passport | — | Stateless authentication |
| Validation | class-validator + class-transformer | 0.14 | DTO validation pipeline |
| API Docs | Swagger / OpenAPI | 11.x | Auto-generated API documentation |
| Email | Nodemailer | 7.x | Transactional email delivery |
| Push Notifications | Firebase Admin SDK | 13.x | FCM push notifications |
| OAuth | google-auth-library | 10.x | Google Sign-In verification |
| Image CDN | ImageKit | 6.x | Image upload, transform & CDN |
| File Storage | AWS S3 SDK | 3.x | Binary file storage |
| Image Processing | Sharp | 0.34 | Server-side image resizing |
| Security | Helmet | 8.x | HTTP security headers |
| HTTP Client | Axios | 1.x | External API calls (CAPI, courier) |
| Scheduler | `@nestjs/schedule` | 6.x | Cron jobs (inventory cleanup) |
| ID Generation | nanoid | 5.x | Short unique IDs |
| Slug | slugify | 1.6 | URL-friendly slugs |
| IP Detection | request-ip | 3.x | Client IP for fraud detection |
| User Agent | ua-parser-js | 2.x | Device/browser detection |

### Customer Frontend — Next.js 16

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | Next.js | 16.1.6 | SSR + SSG + App Router |
| UI Library | React | 19.2 | Component model |
| Styling | TailwindCSS | 4.x | Utility-first CSS |
| State | Redux Toolkit | 2.x | Global state management |
| API Layer | RTK Query | — | Data fetching, caching, mutations |
| Persistence | redux-persist | 6.x | Cart & auth state persistence |
| HTTP | Axios | 1.x | API communication |
| Forms | React Hook Form + Zod | 7.x / 4.x | Form validation |
| Animations | Framer Motion | 12.x | Page & component animations |
| Carousel | Swiper.js | 12.x | Product sliders |
| Charts | Recharts | 3.x | Data visualization |
| Notifications | React Hot Toast | 2.x | Toast notifications |
| Icons | Lucide React + React Icons | — | Icon library |
| Auth | `@react-oauth/google` | 0.13 | Google OAuth popup |
| Push | Firebase | 12.x | FCM client-side |
| Cookies | js-cookie | 3.x | UTM param persistence |

### Admin Dashboard — Vite + React 19

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Build Tool | Vite | 7.x | Fast HMR dev server & bundler |
| UI Library | React | 19.2 | Component model |
| Routing | React Router DOM | 7.x | SPA client-side routing |
| Styling | TailwindCSS | 4.1 | Utility-first CSS |
| State | Redux Toolkit + RTK Query | 2.x | State & data fetching |
| Rich Text | Jodit React | 5.x | WYSIWYG blog/page editor |
| PDF Export | jsPDF + jsPDF-AutoTable | 4.x | Invoice & report PDF generation |
| Excel Export | XLSX | 0.18 | Report Excel exports |
| Date Picker | React DatePicker | 9.x | Date range filters |
| Pagination | React Paginate | 8.x | Server-side pagination |
| Icons | Lucide React + React Icons | — | Icon library |
| HTTP | Axios | 1.x | API communication |
| Forms | React Hook Form | 7.x | Admin form handling |
| Persistence | redux-persist | 6.x | Auth state persistence |

---

## ⚙️ Feature Modules

### Backend API — NestJS 11

#### 🔐 Authentication & Users
- **JWT authentication** with access token + refresh token rotation
- **Google OAuth** — verifies Google ID tokens server-side via `google-auth-library`
- **Role-based access control** — `CUSTOMER`, `ADMIN` roles with `@Roles()` guard
- `@PublicRoute()` decorator bypasses auth guard for open endpoints
- `@CurrentUser()` decorator injects authenticated user into controllers
- Customer profile management: name, phone, avatar, addresses
- Password hashing via `bcrypt`

#### 🛍️ Product Catalog
- **Multi-variant products** — size, color, material, or any custom option
- `ProductOption` + `ProductOptionValue` + `ProductVariant` entity tree
- **Bulk pricing tiers** — quantity-based price breaks per variant
- Product types: `physical`, `digital`, `service`
- Product status workflow: `draft → submitted → approved → active`
- SEO fields: slug (auto-generated via `slugify`), meta title, meta description
- Product images: multiple per product + per variant
- Category assignment (hierarchical), brand association
- **Product views tracking** — view count per product

#### 📦 Orders & Fulfillment
- Order lifecycle: `pending → confirmed → processing → shipped → delivered → cancelled → refunded`
- Payment statuses: `unpaid → paid → partial → refunded`
- Payment methods: `Cash`, `bKash`, `Nagad`, `Card`, `Bank Transfer`, `SSL Commerce`, `Cash on Delivery`
- Order address stored as a snapshot (immutable after creation)
- **Coupon discount** and manual **admin discount** both tracked per order
- **Delivery charge** applied by zone at checkout
- Courier assignment (Pathao) with tracking number
- UTM/marketing attribution fields on every order

#### 💳 SSL Commerce Payment Gateway
- Full **SSL Commerce Bangladesh** integration (sandbox + production)
- Five endpoints: `initiate`, `success`, `fail`, `cancel`, `IPN`
- SSL callback validation via SSL's verification API
- On success: `OrderPayment` ledger entry auto-created, order marked `PAID`
- Frontend redirect flow: `POST /orders → POST /ssl-payment/initiate → redirect to gateway → callback → redirect back`
- Environment-switchable: sandbox (`testbox`) ↔ live store credentials

#### 🎟️ Coupon System
- Fields: unique `code`, `discountType` (percent | fixed), `discountValue`, `minPurchase`, `maxUses`, `usedCount`, `validFrom`, `validUntil`, `isActive`
- `POST /coupons/validate` — public endpoint, validates code against cart total
- `usedCount` auto-incremented on successful order creation
- Admin CRUD: create, edit, enable/disable coupons with full dashboard UI

#### 📊 Marketing Attribution & Analytics
- **Client-side**: `useTrackingParams` hook captures UTM params (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) + `fbclid` / `gclid` from URL, stores in `kc_tracking` cookie (30-day TTL)
- **Auto FBC generation**: constructs Facebook click ID (`fbc`) from `fbclid` + timestamp
- **Server-side**: Order entity stores all tracking fields; `CheckoutPage` spreads stored params into order payload
- **Facebook Conversions API (CAPI)**: fires `Purchase` event asynchronously via BullMQ `tracking` queue after order commit — bypasses iOS privacy restrictions
- **Campaign Attribution Report**: groups orders by `utmSource / utmMedium / utmCampaign`, calculates revenue share per campaign, Excel export

#### 📬 Bulk Messaging
- **SMS** via configurable HTTP gateway (env vars: `SMS_GATEWAY_URL`, `SMS_API_TOKEN`, `SMS_SID`)
- **Email** via Nodemailer (SMTP)
- Template system with `{{name}}` personalization placeholder
- Send targets: all customers | single customer | multiple by user IDs
- Delivery tracking: `totalSent`, `totalFailed`, per-recipient status in JSONB
- Full send history with pagination and detail modal

#### 🏢 Company Information
- Singleton `company_info` table — one row, upserted via `PATCH`
- Fields: name, tagline, description, `logoUrl` (ImageKit), address, phone, email, website, `socialLinks` (JSONB)
- Frontend dynamically loads company name, logo, and contact info from this API
- Auth page left panel, site header, and footer all reference company info

#### 📈 Business Intelligence Reports

| Report | Description |
|--------|-------------|
| **Sales Summary** | Revenue, orders, AOV by date range |
| **Orders Report** | Order volume, status breakdown, trends |
| **Income Report** | Revenue by category/product/period |
| **Expense Report** | Expense ledger with categorization |
| **Inventory Report** | Current stock levels, low-stock alerts |
| **Stock Movements** | In/out movements with timestamps |
| **Campaign Attribution** | UTM-based revenue attribution per campaign |

All reports support date range filtering and Excel export.

#### 💰 Accounting Module
- **Chart of Accounts** — asset, liability, equity, income, expense account types
- **Journal Ledger** — all financial entries with debit/credit columns
- **Transactions** — income & expense recording
- **Auto-entries**: SSL Commerce payments automatically create ledger entries via `SSL_ACCOUNT_ID` env var
- Reports: P&L, balance summary

#### 👥 HRM Module
- **Employees** — name, designation, department, join date, salary, contact
- **Designations** — role/title management
- Designed for managing shop staff and operations team

#### 🚚 Courier Integration
- **Pathao** — store creation, order creation, tracking via Pathao API
- **Fraud Check** — heuristic fraud detection before courier assignment
- Admin assigns courier from order detail page; tracking number stored on order

#### 🔔 Push Notifications
- **Firebase FCM** integration via `firebase-admin`
- `FcmService` sends targeted push notifications to customer devices
- Notification log stored in database for history

#### 📦 Inventory
- Stock level tracking per product variant
- Stock movement logging (in/out with reason)
- **Cron job**: scheduled cleanup of expired inventory reservation locks via `@nestjs/schedule`

---

### Customer Frontend — Next.js 16

#### Pages & Experiences

| Page | Description |
|------|-------------|
| **Homepage** | Hero banners (Swiper), featured sections, flash deals, top-ranking products, testimonials |
| **Shop** `/shop` | Product grid with category, brand, price filters; sorting; server-side pagination |
| **Product Details** `/product-details/[slug]` | Variant selector, option picker, bulk pricing display, image gallery, reviews, related products |
| **Cart** | Persistent cart (Redux Persist), quantity control, coupon application, delivery charge calculation |
| **Checkout** `/enjoy/checkout` | Address form, payment method selection (COD / SSL Commerce), order summary |
| **Payment Results** | Success confirmation, failure & cancellation pages with retry option |
| **Account Dashboard** `/account` | Order history, order detail, saved addresses, wishlist, password change |
| **Deals** `/deals` | Time-limited flash deals with countdown |
| **Rankings** `/rankings` | Top-ranked products |
| **Blog** `/blog` | Article listing + full article page |
| **Static Pages** `/pages/[slug]` | CMS-driven: About, Terms, Privacy, Contact, FAQ |
| **Login / Register** | JWT auth + Google OAuth, animated food-themed card UI |
| **Wishlist** | Persisted wishlist with quick add-to-cart |

#### Frontend Architecture Patterns
- **App Router** — Server Components for initial data fetch (SEO, revalidation), Client Components for interactivity
- **RTK Query** — All API calls through typed hooks; automatic cache invalidation
- **`TransformInterceptor` contract** — All responses follow `{ success, data, statusCode }` shape
- **Axios instance** with auto-refresh token interceptor — transparently renews JWT on 401
- **`useTrackingParams`** — Runs globally via `<TrackingInitializer />` in root layout; captures UTM + FB params on landing

---

### Admin Dashboard — Vite + React 19

#### Dashboard & Analytics
- KPI cards: total orders, revenue, customers, pending orders
- Recent orders table with status badges
- Quick-link banners to Campaign Attribution and key reports
- Date-filtered analytics charts

#### Product & Catalog Management
- Full product CRUD with rich form: name, description (Jodit WYSIWYG), specifications, SEO fields
- Variant builder: define options (e.g. Size: S/M/L) and generate variants with individual pricing/stock
- Bulk pricing tier management per variant
- Image upload (drag & drop, reorder, delete) via ImageKit
- Category tree management and brand CRUD

#### Order Management
- Order list with status filters, search, date range, payment status
- Order detail: items, customer info, delivery address, payment timeline
- Status update workflow with history
- Courier assignment via Pathao API (one-click from order detail)
- Manual payment recording (bKash, Nagad, cash, etc.)
- Admin-created custom orders

#### Customer Management
- Customer list with order count, total spend
- Customer detail: profile, order history, address book
- Customer rank assignment (loyalty tiers)

#### Inventory Management
- Stock level grid by product/variant
- Stock adjustment form with reason tracking
- Inventory report with low-stock highlighting

#### Accounting
- Account chart (create, edit, categorize accounts)
- Transaction entry (income / expense)
- Ledger view with debit/credit columns
- Income & Expense reports with date filtering

#### HRM
- Employee roster with full profile fields
- Designation/role management
- Add/edit/deactivate employees

#### Marketing — Offers
- **Coupons**: CRUD, activate/deactivate, usage stats
- **Deals**: Create flash deals with products and expiry

#### Messaging Center
- Compose and send bulk SMS or email
- Target: all customers / specific user(s) / multiple users
- Template library (save, load, edit templates)
- Send history with delivery stats and per-recipient status modal

#### Reports Suite
- **Sales Summary** — KPI snapshot with trend chart
- **Orders Report** — Volume, AOV, status breakdown
- **Income Report** — Revenue entries with filtering
- **Expense Report** — Cost entries with category breakdown
- **Inventory Report** — Current stock state
- **Stock Movements** — Movement audit log
- **Campaign Attribution** — UTM-based revenue by source/campaign, revenue share %, Excel export

#### Settings & Configuration
- **Company Info** — Logo upload, contact details, social media links
- **Delivery Charges** — Zone-based shipping rules
- **Order Sources** — Define & manage order channels
- **Banners** — Homepage banner CRUD with image upload
- **Gallery** — Media library management
- **Pages** — CMS for static content pages (WYSIWYG)
- **Testimonials** — Customer testimonial management
- **Featured Sections** — Homepage curated section editor
- **Trending Searches** — Manage trending keyword chips
- **Subscribers** — Email subscriber list

---

## 🗄 Database Design

The platform uses **PostgreSQL 16** managed through **TypeORM** with `synchronize: true` (development) / migration-based (production). Key entities and relationships:

```
users ──────────────────────────────────────────────────────────┐
  │                                                             │
  ├── customer_addresses (one-to-many)                         │
  │                                                             │
  └── orders (one-to-many) ─────────────────────────────────── ┤
        │                                                       │
        ├── order_items (one-to-many)                           │
        │     └── products ─── product_variants                 │
        │                        └── bulk_pricing_tiers         │
        ├── order_address (one-to-one, snapshot)                │
        ├── order_payments (one-to-many, ledger)                │
        └── ssl_payments (one-to-one)                           │
                                                                │
products ──────────────────────────────────────────────────────-┘
  ├── product_images
  ├── product_options
  │     └── product_option_values
  ├── product_variants
  │     ├── variant_images
  │     ├── variant_option_values
  │     └── bulk_pricing_tiers
  ├── categories (self-referential tree)
  ├── brands
  └── feature_types

accounting
  ├── accounts (chart of accounts)
  ├── transactions
  └── ledger_entries

hrm
  ├── employees
  └── designations

messaging
  ├── message_templates
  └── message_logs (JSONB per-recipient status)

company_info (singleton)
coupons
deals
banners
gallery
blog_posts ── blog_categories
pages
testimonials
featured_sections
top_rankings
trending_searches
subscribers
notifications
customer_ranks
order_sources
```

**Key Design Decisions:**
- UUIDs as primary keys throughout (except legacy integer PKs where noted)
- `OrderAddress` is a **snapshot entity** — decoupled from user addresses to preserve historical data
- `company_info` is a **singleton** — always upserted, never multi-row
- Marketing tracking fields (`utmSource`, `utmMedium`, etc.) embedded directly on `Order` for query simplicity
- Accounting `ledger` follows **double-entry principles** with debit/credit columns

---

## 🔌 Integrations & Third-Party Services

### SSL Commerce (Payment Gateway)
- Provider: [SSLCommerz](https://sslcommerz.com) — Bangladesh's leading payment gateway
- Supports all local payment methods: VISA, Mastercard, bKash, Nagad, Rocket, bank transfer
- Sandbox and production environments configurable via env vars
- IPN (Instant Payment Notification) endpoint for server-to-server confirmation

### Pathao Courier
- Integration with [Pathao](https://pathao.com/bd/business/) logistics API
- Store registration, order creation, and tracking within admin dashboard
- Fraud detection layer before order dispatch

### Facebook Conversions API (CAPI)
- Server-side Purchase event sent after every order — bypasses browser ad blockers and iOS 14+ privacy restrictions
- Deduplication via `eventId` + `fbp`/`fbc` cookies
- Implemented as asynchronous BullMQ job (non-blocking to order creation)

### ImageKit
- All product images and company logo stored and served via ImageKit CDN
- Auto-thumbnail generation and URL-based transformations
- `Sharp` used server-side for pre-processing before upload

### Firebase
- **Admin SDK** (backend): FCM push notification dispatch
- **Client SDK** (frontend): notification reception + service worker for background push

### Google OAuth
- `google-auth-library` verifies Google ID token server-side
- `@react-oauth/google` on frontend for OAuth popup
- On success: user upserted in DB, JWT tokens issued

### Nodemailer (SMTP)
- Transactional email: order confirmation, password reset
- Bulk messaging for campaigns

### AWS S3
- Binary file/asset backup storage
- Configured via `@aws-sdk/client-s3`

---

## 🔒 Security Implementation

| Layer | Mechanism |
|-------|-----------|
| **Authentication** | JWT access tokens (short-lived) + refresh token rotation |
| **Authorization** | Role-based `@Roles()` guard on controllers; `@PublicRoute()` for open endpoints |
| **HTTP Headers** | `Helmet` middleware — sets `X-Frame-Options`, `CSP`, `HSTS`, etc. |
| **Password Storage** | `bcrypt` with salt rounds (never plain-text) |
| **Input Validation** | `class-validator` DTOs on all incoming request bodies |
| **SQL Injection** | TypeORM parameterized queries throughout (no raw SQL concatenation) |
| **CORS** | Configured to allow only trusted origins (`FRONTEND_URL`, `ADMIN_URL`) |
| **Payment Validation** | All SSL Commerce callbacks re-validated against SSL's verification API |
| **Fraud Detection** | Pathao orders pass through fraud check service before dispatch |
| **Admin Routes** | All `/admin-*` endpoints require `ADMIN` role |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20.x
- PostgreSQL 16
- Redis 7
- npm ≥ 10

### 1. Clone & Install

```bash
git clone https://github.com/builtbyshamim/bahari-shop-ecommerce.git
cd bahari-shop-ecommerce

# Install all three apps
cd backend         && npm install && cd ..
cd frontend        && npm install && cd ..
cd admin && npm install && cd ..
```

### 2. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE bahari-shop-ecommerce;"
```

TypeORM will auto-sync the schema on first backend start (`synchronize: true` in development).

### 3. Configure Environment Variables

Create `.env.development` in each app directory (see [Environment Variables](#-environment-variables) below).

### 4. Start Development Servers

```bash
# Terminal 1 — Backend API
cd backend
npm run start:dev
# → http://localhost:3001
# → http://localhost:3001/api/docs  (Swagger UI)

# Terminal 2 — Customer Frontend
cd frontend
npm run dev
# → http://localhost:3000

# Terminal 3 — Admin Dashboard
cd admin
npm run dev
# → http://localhost:5173
```

---

## 🔧 Environment Variables

### Backend (`backend/.env.development`)

```env
# Application
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001   # Use ngrok for SSL Commerce callbacks

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=bahari-shop-ecommerce

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRY=30d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Firebase Admin
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# ImageKit
IMAGEKIT_PUBLIC_KEY=public_xxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# AWS S3
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-southeast-1
AWS_BUCKET_NAME=bahari-shop-ecommerce-assets

# SMTP / Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM="bahari-shop-ecommerce <noreply@bahari-shop-ecommerce.com>"

# SMS Gateway
SMS_GATEWAY_URL=https://your-sms-provider.com/api/send
SMS_API_TOKEN=your_sms_token
SMS_SID=your_sender_id

# SSL Commerce
SSL_STORE_ID=testbox
SSL_STORE_PASSWD=qwerty
SSL_API_URL=https://sandbox.sslcommerz.com/gwprocess/v4/api.php
SSL_VALIDATION_URL=https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php
SSL_ACCOUNT_ID=   # Optional: accounting account UUID to auto-credit SSL payments

# Facebook CAPI
FB_PIXEL_ID=your_pixel_id
FB_ACCESS_TOKEN=your_capi_access_token

# Pathao Courier
PATHAO_CLIENT_ID=...
PATHAO_CLIENT_SECRET=...
PATHAO_API_URL=https://api-hermes.pathao.com
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_VAPID_KEY=...
```

### Admin Dashboard (`admin/.env`)

```env
VITE_API_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## 📖 API Reference

The backend exposes a **Swagger UI** at `http://localhost:3001/api/docs` when running in development.

### Base URL
```
http://localhost:3001/api/v1
```

### Authentication

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

### Response Format

All API responses follow this envelope:
```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "timestamp": "2026-06-27T10:00:00.000Z",
  "path": "/api/v1/products"
}
```

### Core Endpoint Groups

| Group | Base Path | Auth |
|-------|-----------|------|
| Auth | `/api/v1/auth` | Public / JWT |
| Users | `/api/v1/users` | JWT |
| Products | `/api/v1/products` | Public (read) / Admin (write) |
| Categories | `/api/v1/categories` | Public (read) / Admin (write) |
| Orders | `/api/v1/orders` | JWT |
| Coupons | `/api/v1/coupons` | Public (validate) / Admin (CRUD) |
| SSL Payment | `/api/v1/ssl-payment` | Public (callbacks) / JWT (initiate) |
| Admin Reports | `/api/v1/admin-reports` | Admin |
| Dashboard | `/api/v1/dashboard` | Admin |
| Messaging | `/api/v1/messaging` | Admin |
| Company Info | `/api/v1/company-info` | Public (read) / Admin (write) |
| Accounting | `/api/v1/accounting` | Admin |
| HRM | `/api/v1/hrm` | Admin |
| Inventory | `/api/v1/inventory` | Admin |
| Tracking | (internal queue, no REST) | — |

---

## 🚢 Deployment

### Recommended Stack

| Component | Platform |
|-----------|----------|
| Backend | Railway / Render / VPS (Ubuntu) |
| Frontend | Vercel |
| Admin Dashboard | Vercel / Netlify |
| Database | Railway PostgreSQL / Supabase / RDS |
| Redis | Railway Redis / Upstash |
| Images | ImageKit (CDN included) |

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Switch SSL Commerce credentials to live store (remove sandbox `testbox`)
- [ ] Set `BACKEND_URL` to public domain (no ngrok)
- [ ] Configure PostgreSQL SSL connection
- [ ] Set Redis TLS URL (`rediss://`)
- [ ] Rotate all JWT secrets to strong random values
- [ ] Configure CORS `FRONTEND_URL` and `ADMIN_URL` to production domains
- [ ] Set up Firebase App Check for FCM security
- [ ] Enable Helmet HSTS in production config
- [ ] Set up database backups (daily automated snapshots)

### Build Commands

```bash
# Backend
cd backend && npm run build && npm run start:prod

# Frontend
cd frontend && npm run build && npm run start

# Admin Dashboard
cd admin && npm run build
# Serve /dist as static files
```

---

## 📄 License

This project is proprietary software. All rights reserved.

---

<div align="center">

Built with precision for Bangladesh's e-commerce ecosystem.

**NestJS** · **Next.js** · **React** · **PostgreSQL** · **Redis** · **TypeScript**

</div>
# bahari-shop-ecommerce
