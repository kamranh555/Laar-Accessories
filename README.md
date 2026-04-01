# Laar - Sindhi E-Commerce Platform

**Laar** (meaning "treasure" in Sindhi) is a single-seller e-commerce platform for selling accessories for men, women, and children. Built with a modern stack and an Ajrak-inspired design reflecting Sindhi cultural identity.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, TypeScript, Turbopack) |
| **Styling** | Tailwind CSS v4 + shadcn/ui (base-nova) |
| **Database** | PostgreSQL (Supabase for production, Docker for local dev) |
| **ORM** | Drizzle ORM |
| **Auth** | Supabase Auth (Email + Google OAuth) |
| **Storage** | Supabase Storage (product images) / local `/public/uploads/` for dev |
| **State** | Zustand (cart with localStorage persistence) |
| **Forms** | react-hook-form + Zod |
| **Icons** | Lucide React |
| **Toasts** | Sonner |

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **Docker** (for local database)
- A **Supabase** project (for production auth + storage)

## Getting Started

### 1. Clone and Install

```bash
git clone <repo-url>
cd laar
npm install
```

### 2. Set Up Local Database

Start a PostgreSQL container:

```bash
docker run -d \
  --name laar-db \
  -e POSTGRES_DB=laar \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5555:5432 \
  postgres:16
```

### 3. Configure Environment

Required variables in `.env.local`:

```env
# Local database
DATABASE_URL=postgresql://postgres:postgres@localhost:5555/laar

# Supabase (get from your Supabase project dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

For local development without Supabase auth, the app will gracefully skip authentication. Set the Supabase values to placeholder strings.

### 4. Run Database Migrations

```bash
npx drizzle-kit push
```

### 5. Seed Sample Data

Populates 8 categories and 28 products with placeholder images:

```bash
npx tsx scripts/seed.ts
```

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (shop)/          # Public storefront (home, shop, product, cart, checkout)
│   ├── (auth)/          # Login, signup, forgot-password
│   ├── (account)/       # User account (profile, orders, wishlist)
│   ├── (admin)/         # Admin panel (dashboard, products, orders, categories, etc.)
│   └── api/             # API routes (orders, upload, auth callbacks)
├── components/
│   ├── ui/              # shadcn/ui base components
│   ├── layout/          # Navbar, footer, Ajrak border
│   ├── shop/            # Hero, product cards, filters, grids
│   ├── product/         # Image gallery, product info
│   ├── cart/            # Cart drawer, cart items
│   ├── admin/           # Product form, order actions, category manager
│   └── shared/          # Breadcrumbs, price display, empty state
├── lib/
│   ├── db/              # Drizzle client, schema, queries
│   ├── supabase/        # Supabase clients (server, client, admin, middleware)
│   ├── auth/            # Server actions, guards
│   ├── actions/         # Admin server actions
│   └── utils.ts         # Helpers (formatPrice, slugify, cn)
├── stores/              # Zustand stores (cart, UI)
├── types/               # TypeScript interfaces
└── hooks/               # Custom React hooks
```

## Key Features

### Storefront
- Responsive product catalog with filters (category, audience, price, size)
- URL-driven filtering for SSR and shareability
- Product detail pages with image gallery and variant selection
- Slide-out cart drawer (Zustand + localStorage for guests)
- Search with server-side results

### Admin Panel (`/admin`)
- **Dashboard**: Revenue, orders, products, customer stats + recent orders + low stock alerts
- **Products**: Full CRUD with image upload, variant management, active/featured toggles
- **Orders**: List with status filters, detail pages with status/tracking/payment management
- **Categories**: Inline CRUD with dialog forms
- **Reviews**: Moderation (approve/delete)
- **Coupons**: CRUD with percentage/fixed discounts, expiry dates
- **Customers**: Read-only list with order history stats

To access the admin panel, set `role = 'admin'` on your user's profile in the `profiles` table.

### Payment Methods
- JazzCash
- EasyPaisa
- Bank Transfer (manual confirmation)
- Cash on Delivery (COD)

### Design
Ajrak-inspired color palette:
- **Indigo** (`#1B3A5C`) -- navbar, headings, secondary buttons
- **Crimson** (`#C41E3A`) -- primary buttons, CTAs, sale badges
- **Gold** (`#D4A234`) -- accents, hover states, focus rings
- **Cream** (`#FAFAF7`) -- page background

Typography: DM Sans (body) + Cormorant Garamond (headings)

## Database Schema

All tables use UUID primary keys. Prices are stored as integers in **paisa** (1 PKR = 100 paisa).

- `profiles` -- user profiles synced from Supabase Auth
- `categories` -- product categories with self-referencing parent
- `products` -- product catalog with audience targeting
- `product_images` -- multiple images per product with primary flag
- `product_variants` -- size/color variants with optional price override
- `orders` -- order lifecycle (pending > confirmed > processing > shipped > delivered)
- `order_items` -- line items with snapshot data
- `cart_items` -- server-side cart for authenticated users
- `reviews` -- product reviews with approval moderation
- `wishlists` -- user wishlists
- `addresses` -- saved shipping addresses
- `coupons` -- discount codes (percentage or fixed)

## Going to Production

### 1. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Get your project URL, anon key, and service role key from Settings > API
3. Enable Google OAuth in Authentication > Providers (optional)
4. Create a storage bucket named `product-images` with public access
5. Use the **pooled connection string** (port 6543) from Settings > Database for `DATABASE_URL`

### 2. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Set these environment variables in Vercel:

```
DATABASE_URL=postgresql://...@db.xxx.supabase.co:6543/postgres?pgbouncer=true
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. Run Migrations on Production

```bash
DATABASE_URL="your-production-url" npx drizzle-kit push
```

### 4. Create Admin User

1. Sign up on the site
2. In Supabase SQL Editor, run:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

### 5. Configure Image Storage

Update `next.config.ts` to allow your Supabase storage domain:

```ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "*.supabase.co" },
  ],
},
```

Update the upload API route (`src/app/api/upload/route.ts`) to upload to Supabase Storage instead of local filesystem.

### 6. Set Up Row-Level Security (RLS)

In Supabase SQL Editor, enable RLS on all tables and create policies:

- Products/categories: public SELECT (where `is_active = true`), admin-only mutations
- Orders: users read own, admins read all
- Cart/wishlist/addresses: users CRUD own only
- Reviews: public SELECT (where `is_approved = true`), users INSERT own, admins UPDATE

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npx drizzle-kit push` | Push schema to database |
| `npx drizzle-kit studio` | Open Drizzle Studio (DB browser) |
| `npx tsx scripts/seed.ts` | Seed database with sample data |

## Performance

The app is designed to handle ~10,000 concurrent users:

- ISR (1h) for homepage and category pages
- SSG + ISR (30min) for product detail pages
- SSR for dynamic pages (shop filters, cart, checkout, admin)
- React Server Components minimize client-side JS
- Supabase connection pooling via PgBouncer
- `next/image` for automatic image optimization
- `next/font` with `display: swap` for fonts
