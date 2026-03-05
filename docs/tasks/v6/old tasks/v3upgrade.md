# Fitova V3 Upgrade Plan

> **Generated:** 2026-03-02 | **Status:** Planning  
> **Scope:** Database analysis + Frontend improvement + Admin dashboard

---

## 1. Database Analysis Report

### Current Schema Overview (15 Tables)

| Table | Purpose | Status |
|---|---|---|
| `profiles` | User accounts + admin flag | ✅ Good |
| `user_addresses` | Shipping addresses | ✅ Good |
| `categories` | Product categories (self-referencing via `parent_id`) | ⚠️ Partially used |
| `products` | Core product data + affiliate fields | ⚠️ Missing fields |
| `product_images` | Thumbnail + preview images | ✅ Good |
| `product_reviews` | User ratings | ✅ Good |
| `collections` | Lookbook collections | ⚠️ Missing fields |
| `collection_products` | Collection ↔ Product join | ✅ Good |
| `offers` | Coupons / discount codes | ✅ Good |
| `wishlist` | User saved products | ⚠️ Missing fields |
| `blog_posts` | Editorial content | ✅ Good |
| `testimonials` | Reviews | ✅ Good |
| `contact_messages` | Support messages | ✅ Good |
| `newsletter_subscribers` | Emails | ✅ Good |
| `saved_style_worlds` | StyleHub saved filters | ✅ Good |
| `homepage_slides` | Hero slides (phase2) | ✅ Good |
| `product_views` | View tracking (feature15) | ✅ Good |
| `cart_events` | Cart click tracking (feature15) | ✅ Good |

---

## 2. Database Issues Found

### 2.1 Categories — Wrong Classification

**Current state (hardcoded in `categoryData.ts`, not DB-driven):**
- T-Shirts, Shirts, Pants, Jackets, Shoes, Accessories, Bags, Activewear

**Problem:** Not structured by gender (Men / Women / Kids). The `parent_id` column exists in `categories` table but is NOT being used. The frontend reads a hardcoded static array, bypassing the database entirely.

### 2.2 Products — Missing Homepage Section Flags

**Missing columns in `products`:**
- `is_new_arrival` BOOLEAN — for New Arrivals page
- `is_trending` BOOLEAN — for Trending section (keep hidden for now)
- `is_best_seller` BOOLEAN — for Best Sellers section (keep hidden for now)
- `section_tag` TEXT — flexible label: `'new_arrival' | 'trending' | 'best_seller' | 'this_week'`
- `gender` TEXT — `'men' | 'women' | 'kids' | 'unisex'`  

> **Note:** `is_best_seller_pinned` and analytics-driven trending already exist in feature15. The `is_new_arrival`, `is_trending`, `is_best_seller` booleans add admin control layer on top.

### 2.3 Collections (Lookbook) — Missing Fields

**Missing columns in `collections`:**
- `is_featured` BOOLEAN — show on homepage
- `type` TEXT — `'lookbook' | 'ai_generated' | 'editorial'`
- `product_count` INTEGER — auto-computed rollup (or via view)
- `display_order` INTEGER — for admin sorting

### 2.4 Wishlist — Missing Categorization

**Missing columns in `wishlist`:**
- `color_tag` TEXT — color category saved by user
- `style_tag` TEXT — style category saved by user
- `wishlist_type` TEXT — `'product' | 'lookbook'` (to support lookbook collections in wishlist)
- `collection_id` UUID REFERENCES `collections(id)` — for lookbook wishlist items

### 2.5 Homepage Sections Control Table — MISSING

**Need a new table: `homepage_sections`**  
This gives admins the ability to enable/disable homepage sections and edit content.

```sql
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key  TEXT NOT NULL UNIQUE,  -- 'new_arrivals' | 'best_sellers' | 'trending' | 'lookbook' | 'this_week'
  title        TEXT,
  subtitle     TEXT,
  is_visible   BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  config       JSONB DEFAULT '{}',    -- flexible section config
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.6 Affiliate Tracking — Partially Exists

`affiliate_link_clicks` exists on products (feature15). Missing:
- `affiliate_program` and `merchant_id` already exist on `products` ✅
- No dedicated `affiliate_clicks` event log table for per-click tracking
- No `affiliate_partners` table for managing affiliate networks

### 2.7 New Arrivals Page — Missing Dedicated Query

No dedicated route or query for `/new-arrivals`. Products must be tagged with `is_new_arrival = true` and the page needs a DB query.

---

## 3. Database Improvement Plan

### 3.1 SQL Migrations Needed

#### Migration A — Products: Add Homepage Control Flags
```sql
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_trending    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS gender         TEXT CHECK (gender IN ('men','women','kids','unisex'));

CREATE INDEX IF NOT EXISTS idx_products_is_new_arrival ON public.products(is_new_arrival) WHERE is_new_arrival = true;
CREATE INDEX IF NOT EXISTS idx_products_gender ON public.products(gender);
```

#### Migration B — Categories: Seed Correct Structure
```sql
-- Top-level gender categories
INSERT INTO public.categories (name, slug, sort_order) VALUES
  ('Men',   'men',   1),
  ('Women', 'women', 2),
  ('Kids',  'kids',  3)
ON CONFLICT (slug) DO NOTHING;

-- Subcategories (linked to each parent)
-- Jackets (Men + Women), Pants (Men + Women + Kids), Accessories (all), etc.
-- Each subcategory gets parent_id set to the matching gender category UUID.
```

#### Migration C — Collections: Add Lookbook Fields
```sql
ALTER TABLE public.collections
  ADD COLUMN IF NOT EXISTS is_featured    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS type           TEXT NOT NULL DEFAULT 'lookbook',
  ADD COLUMN IF NOT EXISTS display_order  INTEGER NOT NULL DEFAULT 0;
```

#### Migration D — Wishlist: Add Categorization Fields
```sql
ALTER TABLE public.wishlist
  ADD COLUMN IF NOT EXISTS color_tag      TEXT,
  ADD COLUMN IF NOT EXISTS style_tag      TEXT,
  ADD COLUMN IF NOT EXISTS wishlist_type  TEXT NOT NULL DEFAULT 'product',
  ADD COLUMN IF NOT EXISTS collection_id  UUID REFERENCES public.collections(id) ON DELETE CASCADE;
```

#### Migration E — New Table: `homepage_sections`
```sql
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key   TEXT NOT NULL UNIQUE,
  title         TEXT,
  subtitle      TEXT,
  is_visible    BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  config        JSONB DEFAULT '{}',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "homepage_sections: public read"  ON public.homepage_sections FOR SELECT USING (true);
CREATE POLICY "homepage_sections: admin write"  ON public.homepage_sections FOR ALL USING (public.is_admin());

-- Seed default sections
INSERT INTO public.homepage_sections (section_key, title, is_visible, display_order) VALUES
  ('new_arrivals',  'New Arrivals',   true, 1),
  ('best_sellers',  'Best Sellers',   false, 2),
  ('trending',      'Trending Now',   false, 3),
  ('this_week',     'This Week',      true, 4),
  ('lookbook',      'Lookbook',       true, 5)
ON CONFLICT (section_key) DO NOTHING;
```

#### Migration F — New Table: `affiliate_click_events`
```sql
CREATE TABLE IF NOT EXISTS public.affiliate_click_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id  TEXT,
  clicked_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_click_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "affiliate_clicks: anyone can insert" ON public.affiliate_click_events FOR INSERT WITH CHECK (true);
CREATE POLICY "affiliate_clicks: admin read" ON public.affiliate_click_events FOR SELECT USING (public.is_admin());
```

---

## 4. Category Reclassification Plan

### Target Structure (DB-Driven)

```
Men (top-level, slug: "men")
  ├── Jackets        (shared with Women)
  ├── Pants          (shared with Women + Kids)
  ├── Shirts
  ├── T-Shirts
  ├── Shoes          (shared)
  ├── Accessories    (shared)
  └── Activewear

Women (top-level, slug: "women")
  ├── Jackets        (shared)
  ├── Pants          (shared)
  ├── Dresses        (women-specific)
  ├── Tops
  ├── Shoes          (shared)
  └── Accessories    (shared)

Kids (top-level, slug: "kids")
  ├── Pants          (shared)
  ├── T-Shirts
  ├── Shoes          (shared)
  └── Accessories    (shared)
```

### Implementation
- Add `gender` column to `categories` table: `gender TEXT[] DEFAULT '{}'` — allows a category like "Jackets" to be tagged for multiple genders
- Connect `categories` table to frontend — replace hardcoded `categoryData.ts` with a Supabase query
- Filter categories on shop pages by selected gender tab

---

## 5. Homepage Frontend Improvement Plan

### 5.1 Section Order (Revised)
```
VideoHero
BrandMarquee
Hero (remove "wear ur identity" text from carousel subtitle if present)
Categories (DB-driven, gender-based)
NewArrivals (new page + homepage section)
ThisWeek (Trending + Best Sellers tabs — keep but HIDE best_sellers/trending from nav)
ThreeDSection
LookbookPreview (real DB data, remove placeholders)
TrendingSection (HIDDEN for now — keep code, add is_visible flag)
BestSeller (HIDDEN for now — keep code, add is_visible flag)
Newsletter / Affiliate Section
```

### 5.2 Specific Section Fixes

#### Hero Section
- Remove "wear ur identity" text if it appears in HeroCarousel subtitle
- Fix right-column card alignment (consistent height between AI Styling card and Lookbook card)
- Lookbook card: should have exact same height as AI Styling card
- "Refine ur style" / StyleHub card:
  - Remove link to `/shop`
  - Change link to `/trending` page

#### Categories Section
- Replace hardcoded `categoryData.ts` with live Supabase query
- Display top-level gender categories (Men / Women / Kids) as primary tabs
- Show subcategories (Jackets, Pants, etc.) in horizontal slider below
- Fix carousel alignment: ensure consistent card sizes and image aspect ratios

#### New Arrivals Section (New Page)
- Create `/new-arrivals` route in `src/app/(site)/new-arrivals/`
- Add homepage section showing products where `is_new_arrival = true`
- Add "View All" button linking to `/new-arrivals`
- Responsive grid: 2 cols mobile, 4 cols desktop

#### ThisWeek / OurView Section
- Keep 3 tabs: Trending (7 Days), Best Sellers, Recently Viewed
- Add **"View All"** button in top-right corner → links to `/trending`
- Ensure it uses real products from DB (already implemented via `getTrendingProducts` / `getBestSellers`)
- If no products exist, show elegant empty state, NOT broken layout

#### BestSeller Section
- Do NOT delete — hide it
- Add `is_visible: false` to `homepage_sections` DB row
- Wrap component with visibility check: `if (!section?.is_visible) return null`

#### TrendingSection
- Do NOT delete — hide it  
- Same approach as BestSeller — hidden via DB flag

#### LookbookPreview Section
- Replace hardcoded `looks` array with real data from `collections` table
- Query: `SELECT * FROM collections WHERE is_featured = true ORDER BY display_order LIMIT 4`
- Show real cover images — fallback to gradient if image_url is null
- Remove placeholder gradient panels once real data exists

#### Newsletter / Next Section (Affiliate)
- Keep ONLY affiliate-related content:
  - Brand partner announcements
  - "Shop via our affiliate links and support Fitova"
  - Affiliate click tracking integration
- Remove: generic newsletter signup, unrelated promos

---

## 6. 3D Section Fix Plan (Vercel Issue)

### Root Cause Analysis
The 3D section uses `@react-three/fiber`, `@react-three/drei`, and loads `.glb` model files from `/public/models/`. The Vercel failure is likely caused by:

1. **GLB files not in `/public/models/`** — Vercel only serves files in `public/`. If `suit.glb` / `coat.glb` are missing or not committed, the models 404.
2. **WebGL context creation failure** — Server-side rendering conflict. The Canvas tries to render on server. The component uses a `client.tsx` wrapper which should fix this, but may not fully gate it.
3. **Large bundle size** — Three.js + drei adds ~2MB. If the bundle hits Vercel's function size limit, it fails silently.
4. **Environment preset CDN block** — `Environment preset="studio"` loads an HDR from a CDR URL which may be blocked by Vercel's CSP or network rules.

### Fix Steps
1. **Verify GLB files exist:** Confirm `public/models/suit.glb` and `public/models/coat.glb` are committed to git (not in `.gitignore`)
2. **Add error boundary:** Wrap `<Scene>` in a React `ErrorBoundary` that shows a static fallback image if WebGL fails
3. **Replace CDR-hosted Environment:** Use a local HDR file or remove `<Environment>` preset entirely, replacing with manual lighting
4. **Move to dynamic import with SSR off:**
   ```tsx
   // In ThreeDSection/client.tsx
   const ThreeDSectionInner = dynamic(() => import('./index'), { ssr: false });
   ```
5. **Add `crossOrigin` attribute** to Canvas if CDN resources are used
6. **Test locally with `next build && next start`** before deploying — Vercel behavior mirrors this exactly

---

## 7. Background & Design Plan

### Current State
- White/cream `#F6F5F2` for light sections
- Dark `#0A0A0A` for 3D section

### V3 Target: Luxury Editorial Aesthetic
- **Primary background:** Soft off-white `#F8F6F2` with subtle paper texture overlay
- **Dark sections:** Deep charcoal `#0C0C0C` with very subtle noise grain
- **Gradient transitions** between sections (light → dark → light) for editorial flow
- **Soft gradient accents:** Warm beige-to-ivory linear gradients on cards
- **Pattern option:** Micro diagonal line pattern (CSS-only) on hero section for premium feel

---

## 8. Footer Plan

### Changes Required
1. **Remove** entire "Download App" column (App Store + Google Play buttons)
2. **Remove** payment system logos (Visa, PayPal, MasterCard, Apple Pay, Google Pay)
3. **Remove** "We Accept:" text
4. **Update copyright text:**
   - Current: `© {year}. All rights reserved by PimjoLabs.`
   - Target: `All rights reserved by Fitova`
5. **Center** the copyright line in the footer bottom
6. **Update contact info** (replace placeholder Las Vegas address + fake phone)

---

## 9. Navbar Plan

### Changes Required
1. **Replace "My Account" text** with the user's `full_name` from `profiles` table
   - If signed out → show "Sign In"
   - If signed in → show `user.full_name` (truncated if > 15 chars)
2. **Replace account icon** with user's `avatar_url` profile picture
   - If no avatar → show initials in a circle (e.g., "JD" for John Doe)
   - Use `profiles.avatar_url` field already in DB

---

## 10. Loading Screen & Favicon Plan

### Loading Screen
- Replace generic spinner with **logo-based loading animation**
- Animation: Fitova logo fades in from 0 opacity, slight upward drift, then fades out
- Shown once per session using `sessionStorage` flag
- Duration: ~1.2s max

### Favicon
- Replace current `favicon.ico` with Fitova branded icon
- Export logo as 32×32 and 180×180 (for Apple touch icon)
- Add to `src/app/layout.tsx` metadata

---

## 11. Wishlist Improvement Plan

### Current State
- Basic wishlist: user_id + product_id + created_at
- Shows stock status (remove this)

### V3 Target Design
```
Wishlist Page Layout:
  ┌─────────────────────────────────────────┐
  │  Tab 1: Products  │  Tab 2: Lookbooks  │
  └─────────────────────────────────────────┘
  
  Per product card:
  - Product image (consistent 4:5 ratio)
  - Product name + brand
  - Color tag dropdown (save color preference)
  - Style tag dropdown (casual / formal / streetwear / etc.)
  - Remove stock status badge
  - Heart icon to remove
  - Affiliate link button
```

### DB Changes
- Add `color_tag`, `style_tag`, `wishlist_type`, `collection_id` to `wishlist` table (Migration D above)

---

## 12. Admin Dashboard Control Plan

### Existing Admin (`/admin` route)
Already has: Products, Categories, Collections, Offers CRUD.

### New Controls Needed

#### 12.1 Homepage Section Manager
- Table: `homepage_sections`
- UI: List of sections with toggle (visible/hidden), title editor, order drag-and-drop
- Controls: Enable/disable New Arrivals, Best Sellers, Trending, Lookbook, ThisWeek

#### 12.2 Category Manager (Enhanced)
- Current category admin exists but needs:
  - Gender filter (Men/Women/Kids selector)
  - Parent category assignment UI
  - Drag-and-drop sort order

#### 12.3 Trending & New Arrivals Manager
- Product list with checkboxes:
  - `is_new_arrival` toggle
  - `is_trending` toggle  
  - `is_best_seller` toggle
- Bulk tagging tool

#### 12.4 Lookbook Section Manager
- Mark collections as `is_featured = true` for homepage preview
- Set `display_order` for collection cards
- Upload real cover images per collection

#### 12.5 Affiliate Section Manager
- Configure affiliate content shown in the Newsletter/Next section
- ON/OFF toggle per affiliate brand card

---

## 13. New Arrivals Page Plan

### Route: `/new-arrivals`

```
New Arrivals Page:
  - Header: "New Arrivals" + subtitle
  - Filter bar: gender (Men / Women / Kids), category
  - Grid: responsive product cards (2 mobile, 4 desktop)
  - Data source: products WHERE is_new_arrival = true ORDER BY created_at DESC
  - View All is not needed on this page (it IS the full page)
  - Pagination or infinite scroll (20 items per load)
```

---

## 14. Card Styling Normalization Plan

### Problem
Inconsistent card sizes across: Categories, NewArrivals, BestSeller, TrendingSection, ThisWeek.

### Solution
- Define global `.product-card` CSS standard:
  - Image container: `aspect-ratio: 3/4` (portrait, fashion standard)
  - Card width: 100% of column
  - Image: `object-fit: cover`, `object-position: center top`
  - Min-height: none (let aspect-ratio control it)
- Apply uniformly in: `SingleItem` components across all sections

---

## 15. Trends Section Design Plan

### Current State
Unclear if using dark theme. TrendingSection component exists.

### V3 Target
- Dark themed section: `background: #0C0C0C`
- White text, subtle gold/warm accent for "trending" badge
- Matches site overall dark editorial style
- Keep in code but controlled by `homepage_sections.is_visible` flag

---

## 16. Deliverables Summary

| # | Deliverable | DB Changes | Frontend Files | Priority |
|---|---|---|---|---|
| 1 | Database Analysis Report | — | — | ✅ Done (this doc) |
| 2 | DB Migrations (A-F) | 6 migrations | `sql/v3_migrations.sql` | 🔴 High |
| 3 | Category Reclassification | Migration B | `categoryData.ts` → Supabase | 🔴 High |
| 4 | Homepage Sections Control | Migration E | Admin dashboard | 🔴 High |
| 5 | Footer Cleanup | — | `Footer/index.tsx` | 🟡 Medium |
| 6 | Navbar User Name + Avatar | — | `Header/` | 🟡 Medium |
| 7 | New Arrivals Page | Migration A | `app/(site)/new-arrivals/` | 🔴 High |
| 8 | BestSellers + Trending Hidden | Migration E | Wrap with visibility check | 🟡 Medium |
| 9 | LookbookPreview Real Data | Migration C | `LookbookPreview/index.tsx` | 🟡 Medium |
| 10 | 3D Section Vercel Fix | — | `ThreeDSection/index.tsx` | 🔴 High |
| 11 | Wishlist Improvements | Migration D | `Wishlist/` | 🟢 Low |
| 12 | Admin Homepage Controls | Migration E | `Admin/` dashboard | 🟡 Medium |
| 13 | Loading Screen + Favicon | — | `layout.tsx`, new component | 🟢 Low |
| 14 | Card Sizing Normalization | — | All `SingleItem` components | 🟡 Medium |
| 15 | Affiliate Section Cleanup | Migration F | `Newsletter/` or new section | 🟡 Medium |

---

## 17. Implementation Order (Phased)

### Phase 1 — Database First (No code yet)
1. Run Migration A (products flags)
2. Run Migration B (category seeding)
3. Run Migration C (collections fields)
4. Run Migration D (wishlist fields)
5. Run Migration E (homepage_sections table)
6. Run Migration F (affiliate click events)

### Phase 2 — Core Frontend
1. Fix categories to use DB data
2. Add New Arrivals page + homepage section
3. Fix Footer (remove app store, payment, update copyright)
4. Fix Navbar (user name + avatar)

### Phase 3 — Homepage Sections
1. Connect LookbookPreview to real data
2. Hide BestSellers + Trending via section flags
3. Add "View All" to ThisWeek
4. Fix ThisWeek empty state

### Phase 4 — 3D Fix
1. Verify GLB assets in git
2. Add error boundary
3. Replace Environment preset with local HDR or custom lights
4. Test with `next build && next start`

### Phase 5 — Admin Controls
1. Add Homepage Sections manager to admin
2. Add product tagging (new arrival / trending / best seller toggles)
3. Enhance category manager with gender + parent support

### Phase 6 — Polish
1. Loading screen with logo
2. Favicon update
3. Card size normalization
4. Wishlist improvements
5. Affiliate section cleanup
6. Background/design refinements

---

*This plan is the source of truth for Fitova V3. Update status fields as phases complete.*

---
---

# Part II — Extended Requirements Implementation Plan

> **Scope:** Supabase schema validation + Product Details page redesign  
> **Based on:** User-submitted `subabsae` SQL file + additional analysis

---

## 18. Supabase Schema Validation

### 18.1 What the `subabsae` SQL File Already Covers ✅

| Requirement | Column / Table |
|---|---|
| New Arrivals flag | `products.is_new_arrival` |
| Trending flag | `products.is_trending` |
| Best Sellers flag | `products.is_bestseller` |
| Hidden flag | `products.is_hidden` |
| Wishlist color tag | `wishlist.color` |
| Wishlist style tag | `wishlist.style` |
| Wishlist lookbook support | `wishlist.collection_id` + nullable `product_id` |
| Homepage sections control | `homepage_sections` table with seed data |

### 18.2 Still Missing — Requires `sql/v3_migration_additional.sql`

| Requirement | Gap | Fix |
|---|---|---|
| Gender classification | `products.gender` not added | Add column |
| Category gender structure | No seed data for Men/Women/Kids hierarchy | Seed categories |
| Multi-gender categories | Categories can't be tagged for multiple genders | Add `gender TEXT[]` to `categories` |
| Collections homepage | `collections.is_featured` missing | Add column |
| Collections ordering | `collections.display_order` missing | Add column |
| Affiliate click log | No `affiliate_click_events` table | Create table |
| TypeScript `Product` type | Missing `is_new_arrival`, `is_trending`, `gender` | Update `src/types/product.ts` |
| Products query | No `getNewArrivals()` function | Add to `src/lib/queries/products.ts` |

### 18.3 Additional Migration SQL (`sql/v3_migration_additional.sql`)

```sql
-- ============================================================
-- Fitova V3 — Additional Migration
-- Run AFTER the subabsae SQL file
-- ============================================================

-- 1. Add gender to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('men', 'women', 'kids', 'unisex'));

CREATE INDEX IF NOT EXISTS idx_products_gender ON public.products(gender);

-- 2. Add gender array to categories (allows multi-gender categories like "Accessories")
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS gender TEXT[] DEFAULT '{}';

-- 3. Seed top-level gender categories
INSERT INTO public.categories (name, slug, sort_order, gender)
VALUES
  ('Men',   'men',   1, '{men}'),
  ('Women', 'women', 2, '{women}'),
  ('Kids',  'kids',  3, '{kids}')
ON CONFLICT (slug) DO NOTHING;

-- 4. Add featured + ordering to collections
ALTER TABLE public.collections
  ADD COLUMN IF NOT EXISTS is_featured   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_collections_featured ON public.collections(is_featured) WHERE is_featured = true;

-- 5. Create affiliate_click_events table
CREATE TABLE IF NOT EXISTS public.affiliate_click_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id  TEXT,
  referrer    TEXT,
  clicked_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_product ON public.affiliate_click_events(product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_date    ON public.affiliate_click_events(clicked_at DESC);

ALTER TABLE public.affiliate_click_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "affiliate_clicks: anyone can insert" ON public.affiliate_click_events FOR INSERT WITH CHECK (true);
CREATE POLICY "affiliate_clicks: admin read"        ON public.affiliate_click_events FOR SELECT USING (public.is_admin());

-- Done!
```

---

## 19. Product Details Page Redesign

### 19.1 Current Problems with `ShopDetails/index.tsx`

| Problem | Impact |
|---|---|
| **1,465 lines** bloated component | Unmaintainable |
| Storage / SIM / Type selectors | Electronics UI — completely wrong for fashion |
| `bg-blue`, `border-blue` color scheme | Breaks luxury aesthetic |
| Hardcoded `colors = ["red","blue","orange","pink","purple"]` | Not from DB |
| "30% OFF" discount badge hardcoded | Always shows wrong value |
| **Price display backwards** — `price` shown as current, `discountedPrice` struck-through | Incorrect UX |
| Lorem Ipsum in Description tab | Placeholder content in production |
| No related products from DB | Missing key feature |
| No lookbook section | Missing key feature |
| No loading state | Broken UI on first load |
| `localStorage` + redux for product data | Fragile — loses data on refresh |

### 19.2 New Product Details Page Layout

```
┌──────────────────────────────────────────────────────┐
│  Breadcrumb: Home › Category › Product Name          │
│                                                      │
│  ┌─────────────────────┐  ┌────────────────────────┐ │
│  │   Main Image        │  │  Brand (eyebrow text)  │ │
│  │   (aspect-ratio 3:4)│  │  Product Title         │ │
│  │   object-fit: cover │  │  ─────────────────     │ │
│  │   top-aligned       │  │  Price: SAR 299         │ │
│  │                     │  │  Was: SAR 450 ~~        │ │
│  │  ┌───┐ ┌───┐ ┌───┐  │  │                        │ │
│  │  │ 1 │ │ 2 │ │ 3 │  │  │  Color: ● ● ●          │ │
│  │  └───┘ └───┘ └───┘  │  │  Size: XS S M L XL     │ │
│  └─────────────────────┘  │                        │ │
│                            │  [ Shop This Look → ] │ │
│                            │  [♡ Save to Wishlist ] │ │
│                            └────────────────────────┘ │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │  Description │ Details │ Reviews                │ │
│  │  ─────────────────────────────────────────────  │ │
│  │  [Tab content from DB]                          │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  You May Also Like (horizontal slider)               │
│  [Related products from same category]               │
│                                                      │
│  [If product in lookbook] Complete the Look          │
│  [Lookbook collection cards]                         │
└──────────────────────────────────────────────────────┘
```

### 19.3 Design Rules

| Element | Specification |
|---|---|
| Background | `#F6F5F2` (off-white) |
| Primary text | `#0A0A0A` |
| Secondary text | `#8A8A8A` |
| Borders | `#E8E4DF` |
| Title font | Playfair Display (`font-playfair`) |
| Body font | System / Inter light |
| Button primary | `border border-dark text-dark` → hover: `bg-dark text-white` |
| Button affiliate | Full dark `bg-dark text-white` → hover: `bg-dark/80` |
| Image aspect ratio | `3:4` portrait (`aspect-[3/4]`) |
| Image fit | `object-cover object-top` |
| Color swatches | Small circles from `product.colors` array (DB-driven) |
| Size tags | Pill-style tags from `product.size` array (DB-driven) |
| Remove | Storage, SIM, Type selectors, "30% OFF" badge, Lorem Ipsum |

### 19.4 Files to Change

| File | Change | Priority |
|---|---|---|
| `sql/v3_migration_additional.sql` | **[NEW]** Additional schema | 🔴 Run first |
| `src/types/product.ts` | Add `brand`, `description`, `colors`, `styles`, `gender`, `is_new_arrival`, `affiliate_link` | 🔴 High |
| `src/lib/queries/products.ts` | Add `getNewArrivals()`, add `is_new_arrival`/`gender` to `Product` type | 🔴 High |
| `src/components/ShopDetails/index.tsx` | **Full rewrite** — luxury fashion layout | 🔴 High |

---

## 20. Final Implementation Order (All Phases Combined)

### Step 1 — Run SQL in Supabase (No code changes)
1. Run `subabsae` SQL in Supabase SQL Editor
2. Run `sql/v3_migration_additional.sql` in Supabase SQL Editor

### Step 2 — TypeScript Types + Queries
- Update `src/types/product.ts`
- Update `src/lib/queries/products.ts`

### Step 3 — Product Details Redesign
- Full rewrite of `src/components/ShopDetails/index.tsx`

### Step 4 — Homepage Fixes (Phase 2 from Part I)
- Fix categories → DB-driven
- New Arrivals page + section
- Footer cleanup
- Navbar user name + avatar

### Step 5 — Homepage Sections (Phase 3 from Part I)
- LookbookPreview → real data
- Hide BestSellers + Trending via DB flag
- ThisWeek "View All" button

### Step 6 — 3D Fix (Phase 4 from Part I)
- Verify GLB assets, add error boundary, fix Environment preset

### Step 7 — Admin Controls (Phase 5 from Part I)
- Homepage sections manager
- Product tagging (new arrival / trending / best seller)

---

*Updated: 2026-03-02 | Both Part I and Part II are consolidated here as the single source of truth.*
