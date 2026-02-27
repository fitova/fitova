# FITOVA — Tasks Plan & Execution Roadmap

> **Audit Date:** 2026-02-26  
> **Auditor Role:** Senior Software Architect & Code Auditor  
> **Project:** FITOVA — AI-Powered Fashion & Affiliate Platform  
> **Framework:** Next.js 16 (App Router) + Supabase + Redux + TailwindCSS

---

## 1. Executive Summary

FITOVA is a multi-page fashion affiliate platform with an AI styling feature, lookbook system, wishlist, cart, user accounts, and an admin dashboard. The platform is partially connected to Supabase (auth, products, categories, collections), but many components still use hardcoded static data, missing Supabase bindings, and incomplete UI logic.

**Critical production gaps identified:**
- Navbar missing Sign Up + logged-in user profile state
- Shop filters use hardcoded electronics categories (Desktop, Laptop, Monitor) — not fashion
- Cart checkout has no affiliate link opener ("Buy" behavior)
- Admin overview has all hardcoded zero values — not connected to Supabase
- Lookbook has no user creation system, no Supabase integration
- StyleHub worlds are lost on page refresh (no persistence)
- Homepage BestSeller/NewArrivals correctly fetch from Supabase, but Hero images are hardcoded static files
- Dashboard missing data visualization, analytics charts, homepage control section
- Coupons and Offers are in one section but must be split
- Mobile responsiveness is inconsistent across pages

---

## 2. Architecture Problems Found

| Problem | Location | Severity |
|:---|:---|:---|
| Admin overview has hardcoded zeros (no Supabase reads) | `app/admin/page.tsx` | 🔴 High |
| Shop sidebar filters use hardcoded electronics categories | `ShopWithSidebar/index.tsx:36-67` | 🔴 High |
| Lookbook is completely static (no CRUD, no Supabase) | `Lookbook/index.tsx` | 🔴 High |
| StyleHub worlds not persisted to DB | `StyleHubContext.tsx` | 🔴 High |
| Cart has `Process to Checkout` button (no affiliate link logic) | `Cart/OrderSummary.tsx:56-60` | 🔴 High |
| Navbar has no Sign Up link, no profile placeholder | `Header/index.tsx` | 🔴 High |
| Hero images are local static AI-generated images | `HeroCarousel.tsx` | 🟡 Medium |
| Products `imgs` field missing in Supabase `Product` type (uses `product_images[]` join) | `lib/queries/products.ts` | 🟡 Medium |
| AddressModal, MyAccount forms use hardcoded placeholder values | `AddressModal.tsx` | 🟡 Medium |
| Admin layout does not use Supabase to verify is_admin (uses dummy user) | `app/admin/layout.tsx` | 🟡 Medium |
| No coupons section (merged with offers) | `app/admin/offers/` | 🟡 Medium |
| No homepage control section in admin | `app/admin/` | 🟡 Medium |
| No analytics/charts in admin overview | `app/admin/page.tsx` | 🟡 Medium |

---

## 3. UI Consistency Issues

| Issue | Affected Pages | Priority |
|:---|:---|:---|
| Shop page uses generic ecommerce typography, not the luxury editorial system | `ShopWithSidebar`, `ShopWithoutSidebar` | 🔴 High |
| Cart page uses generic `bg-gray-2` styling, not consistent with site palette | `Cart/index.tsx` | 🟡 Medium |
| ShopWithSidebar filter sidebar colors don't match design system | All filter dropdowns | 🟡 Medium |
| Admin uses a different font/layout from main site (isolated `<html>`) | `admin/layout.tsx` | 🟢 Low |
| Breadcrumb colors inconsistent across pages | Multiple pages | 🟢 Low |
| Deals and Coupons pages have no consistent card design system | `Deals/`, `Coupons/` | 🟡 Medium |

---

## 4. Responsiveness & Mobile Issues

### Critical Mobile Breaks
- **Navbar:** On small screens, the search bar + icons compress and may overlap with logo. No documented hamburger behavior for mobile nav items.
- **Cart page:** Min-width of `1170px` on the cart table inner div forces horizontal scroll on all mobile devices — non-negotiable fix required.
  - `Cart/index.tsx:32` → `<div className="min-w-[1170px]">` — breaks on all phones
- **Lookbook:** Grid layout not tested on sub-375px and tablet portrait (768px) breakpoints.
- **Admin Dashboard:** Sidebar is fixed width, no collapse behavior below `lg` breakpoint. Admin is unusable on mobile.
- **ShopWithSidebar:** Sidebar filter panel pushes content on tablet sizes, no verified slide-in panel behavior for mobile.
- **Hero Carousel:** On mobile (`<sm`), text overflows and image ratio is incorrect.
- **StyleHub Modal:** Modal width not capped properly on 375px screens.

### Per-Page Audit Plan Required
| Page | Mobile | Tablet | Desktop | Status |
|:---|:---|:---|:---|:---|
| Home | ⚠ Check | ⚠ Check | ✅ OK | Needs audit |
| Shop With Sidebar | 🔴 Broken | ⚠ Partial | ✅ OK | Cart table breaks |
| Cart | 🔴 Broken | 🔴 Broken | ✅ OK | min-width issue |
| Lookbook | ⚠ Unknown | ⚠ Unknown | ✅ OK | No data yet |
| Admin | 🔴 Unusable | ⚠ Partial | ✅ OK | Sidebar unresponsive |
| Deals | ⚠ Unknown | ⚠ Unknown | ✅ OK | Need audit |
| Style Hub | ⚠ Unknown | ⚠ Unknown | ✅ OK | Modal issues likely |
| My Account | ⚠ Check | ✅ OK | ✅ OK | Needs user data |

---

## 5. Data & API Issues

| Issue | File | Fix Required |
|:---|:---|:---|
| `Product` type uses `product_images[]` join but components expect `imgs.previews[]` | `lib/queries/products.ts` + `Shop/SingleGridItem.tsx` | Map `product_images` to `imgs.previews` shape in query result |
| Admin overview fetches nothing — all hardcoded 0 | `app/admin/page.tsx` | Connect to Supabase `.count()` for all entities |
| StyleHub worlds save only to `useState` (lost on refresh) | `app/context/StyleHubContext.tsx` | Add Supabase insert/fetch via `saved_style_worlds` table |
| Lookbook data is entirely static hardcoded array | `Lookbook/index.tsx:15-78` | Replace with Supabase `collections` table fetch |
| Shop filters (category, gender, color, size, price) are not linked to Supabase filtering | `ShopWithSidebar/index.tsx` | Connect filter state to `getProducts()` query params |
| HeroCarousel images hardcoded to local AI-generated fallback PNGs | `HeroCarousel.tsx` | Pull from a `homepage_slides` admin-controlled table or CMS |
| Cart items have no `affiliate_link` field | `redux/features/cart-slice.ts` | Add `affiliate_link` to `CartItem` type; pass from product |

---

## 6. Database Changes Required

### New Tables
| Table | Purpose | Priority |
|:---|:---|:---|
| `homepage_slides` | Allows admin to control Hero carousel images/text | 🔴 High |
| `homepage_sections` | Toggle visibility and order of homepage sections | 🟡 Medium |
| `user_lookbooks` | Store user-created lookbooks (separate from admin collections) | 🔴 High |
| `user_lookbook_products` | Join table: lookbooks ↔ products | 🔴 High |
| `coupons` | Separate table from `offers` — coupon codes only | 🟡 Medium |
| `analytics_events` | Track clicks, views, conversions for admin charts | 🟡 Medium |

### Existing Table Modifications
| Table | Change | Priority |
|:---|:---|:---|
| `products` | Confirm `affiliate_link` field exists and is passed to cart | 🔴 High |
| `saved_style_worlds` | Confirm table exists; connect StyleHubContext to it | 🔴 High |
| `profiles` | Add `avatar_url` field for navbar profile image | 🟡 Medium |
| `offers` | Add `type` field: `'offer'` or `'coupon'` to split in admin | 🟡 Medium |

---

## 7. Feature Implementation Plans

### Feature 1: Homepage Images Fix
**Root Cause:** HeroCarousel uses hardcoded local AI-generated PNG files. The issue is data source, not component logic.

**Plan:**
1. Create `homepage_slides` table in Supabase with fields: `id`, `title`, `subtitle`, `image_url`, `cta_text`, `cta_link`, `sort_order`, `is_active`
2. Add a `Homepage` section in Admin dashboard (`/admin/homepage`)  
3. Create `getHomepageSlides()` query in `lib/queries/`
4. Refactor `HeroCarousel.tsx` to fetch slides from Supabase with `useEffect`/`useState`
5. Add fallback to current static images if no slides exist in DB
6. **Mobile:** `min-h-[350px] sm:min-h-[450px]` — keep carousel min-height responsive

---

### Feature 2: Shop Page Style Consistency
**Root Cause:** ShopWithSidebar uses hardcoded non-fashion categories (Desktop, Laptop, Monitor etc.) and filter dropdowns don't match design system.

**Plan:**
1. Fetch real categories from Supabase `categories` table via `getCategories()` in `lib/queries/categories.ts`
2. Replace hardcoded `categories` array in `ShopWithSidebar/index.tsx` with dynamic Supabase data
3. Replace hardcoded gender/size/color arrays with values derived from products in DB
4. Connect filter `onChange` handlers to call `getProducts({ categoryId, brand, ... })`
5. Apply consistent typography: `font-light tracking-wide text-sm` from design system
6. For sidebar on mobile: wrap filters in a slide-in drawer panel (absolute positioned, `translate-x` toggle)
7. **Mobile:** Sidebar hidden by default; shows "Filters" toggle button; slides in from left

---

### Feature 3: Lookbook System (Full Implementation)
**Root Cause:** Lookbook component is entirely static with a hardcoded data array. No user authoring capability, no Supabase.

**Frontend Plan:**
1. Fetch lookbook data from `collections` table in Supabase (for admin-curated) + `user_lookbooks` table (for user-created)
2. Add "Create Lookbook" button (visible to logged-in users only)
3. Create `LookbookCreateModal` component:
   - Upload image (Supabase Storage)
   - Set title, description, styles, colors
   - Submit → insert into `user_lookbooks` table
4. Display user lookbooks in the Lookbook grid with user avatar + username overlay
5. "Shop This Book" button → navigate to `/shop-with-sidebar?lookbook_id={id}` → fetch associated products from `user_lookbook_products` join table

**DB Plan:**
- `user_lookbooks`: `id`, `user_id`, `title`, `description`, `image_url`, `is_public`, `created_at`
- `user_lookbook_products`: `lookbook_id`, `product_id` (join table)

**Mobile Layout:** 2-column grid on mobile, 3-column on tablet, 4-column on desktop

---

### Feature 4: Navbar Fixes
**Root Cause:** Header uses `is_admin` check logic but is missing Sign Up link and logged-in user profile image. Navbar also causes z-index/overlap issues on some pages.

**Plan:**
1. Add "Sign Up" link next to "Sign In" in `Header/index.tsx`
2. Import `AuthContext` → conditionally show:
   - **Logged out:** Sign In + Sign Up buttons
   - **Logged in:** Profile avatar circle (from `profiles.avatar_url`) + My Account dropdown
3. On first signup success → `router.push('/')` (change from `/my-account` redirect in `Signup/index.tsx`)
4. Fix z-index for navbar: ensure `z-50` or higher on sticky header; audit all pages for `z-index` conflicts
5. **Mobile:** Hamburger menu must close on route change; ensure padding-top on pages equal to header height

---

### Feature 5: StyleHub — User Worlds Persistence
**Root Cause:** `StyleHubContext` saves worlds only to `useState` — lost on refresh. No Supabase integration.

**Plan:**
1. Connect `handleSave` in `StyleHubContext` to insert into `saved_style_worlds` table via `supabase.from('saved_style_worlds').insert(...)`
2. On context mount, fetch user's saved worlds from `saved_style_worlds` where `user_id = current user`
3. Filter display so user only sees their own worlds
4. Add delete functionality per world
5. **Mobile:** World cards should stack in a single-column list on mobile; filter chip grid must wrap

---

### Feature 6: Dashboard Improvements

#### 6A — Editable Filters & Color Picker
1. In Admin Products edit form, replace fixed color chips with a native HTML color input (`<input type="color">`) wrapped in a custom color wheel UI
2. Add dynamic tag/style/size filter editing in product form

#### 6B — Category Improvements
1. Admin Categories page: add `Women`, `Men`, `Kids` as default seeded categories
2. Make category names, images, and order editable from `/admin/categories`
3. Frontend `ShopWithSidebar` reads categories dynamically from Supabase

#### 6C — Profile Page
1. Connect `MyAccount` profile form to Supabase `profiles` table
2. Implement: update name, phone, avatar_url
3. Address management: connect `user_addresses` CRUD to `AddressModal`
4. Remove all hardcoded placeholder values (replace with empty fields + loading states)

#### 6D — Dashboard Usability on Tablets
1. Admin sidebar: add collapse behavior on `< lg` (< 1024px)
2. Admin overview stats grid: `grid-cols-2` on tablet
3. All admin tables: horizontal scroll with sticky first column on mobile

---

### Feature 7: Cart "Buy" Button — Affiliate Links
**Root Cause:** Cart's `OrderSummary` has "Process to Checkout" button with no action. Cart items stored in Redux have no `affiliate_link` field.

**Plan:**
1. Add `affiliate_link` to `CartItem` type in `redux/features/cart-slice.ts`
2. Pass `affiliate_link` from product when dispatching `addItemToCart` in all 6 dispatcher components
3. In `Cart/OrderSummary.tsx`: rename button to **"Buy All Items"**
4. On click: loop through `cartItems`, open each `affiliate_link` in a new tab
5. Mobile consideration: mobile browsers block `window.open` calls not in direct event handlers → gather all links and open sequentially in the click handler, or show a confirmation modal listing all links before opening

---

### Feature 8: Admin Dashboard — Full Overhaul

#### 8A — Split Coupons and Offers
1. Add `type` column to `offers` table OR create a separate `coupons` table
2. Create `/admin/coupons` route with its own page and CRUD
3. Keep `/admin/offers` for percentage/fixed discounts without a code
4. Update admin sidebar navigation to show both sections separately

#### 8B — Homepage Control Section
1. Create `/admin/homepage` route
2. Manage: Hero slides (image, title, subtitle, CTA), BestSeller toggle, NewArrivals toggle, section order
3. Store in `homepage_slides` and `homepage_sections` Supabase tables

#### 8C — Overview Analytics
1. Connect all `StatsCard` components to real Supabase `.count()` data
2. Add analytics charts using `recharts` or `react-chartjs-2` library:
   - **Revenue Graph:** Line chart — clicks × avg commission over 30 days
   - **User Growth:** Bar chart — new registrations per week
   - **Top Categories:** Horizontal bar chart — product count per category
   - **AI Styling Usage:** Simple counter card with trend arrow
   - **Conversion Rate:** Products clicked vs wishlist vs cart add
   - **Top Affiliate Products:** Table sorted by click count (`views_count`)
3. Use mock data seeded in DB initially; replace with `analytics_events` table data later
4. All charts must be `width: 100%` and responsive via container queries

---

## 8. Execution Phases

### Phase 1 — Critical Fixes (Week 1) 🔴
| Task | File |
|:---|:---|
| ✅ Fix Cart table mobile overflow (`min-w-[1170px]` → responsive) | `Cart/index.tsx` |
| ✅ Fix Shop sidebar categories (replace hardcoded with Supabase fetch) | `ShopWithSidebar/index.tsx` |
| ✅ Add Sign Up button to Navbar | `Header/index.tsx` |
| ✅ Add profile avatar/state to Navbar for logged-in users | `Header/index.tsx` |
| ✅ Fix signup redirect to homepage | `Auth/Signup/index.tsx` |
| ✅ Add `affiliate_link` to Redux CartItem and all dispatchers | `cart-slice.ts` + 6 components |
| ✅ Rename "Process to Checkout" → "Buy All Items" with affiliate link opener | `Cart/OrderSummary.tsx` |
| ✅ Connect Admin overview stats to live Supabase count queries | `app/admin/page.tsx` |

### Phase 2 — Feature Completion (Week 2) 🟡
| Task | File |
|:---|:---|
| ✅ Create `homepage_slides` Supabase table + admin UI | New files |
| ✅ Refactor HeroCarousel to fetch slides from Supabase | `HeroCarousel.tsx` |
| ✅ Connect StyleHub save to Supabase `saved_style_worlds` | `StyleHubContext.tsx` |
| ✅ Implement StyleHub filter display from Supabase on mount | `StyleHubContext.tsx` |
| ✅ Create Lookbook user creation flow (modal + Supabase insert) | `Lookbook/index.tsx` + new modal |
| ✅ Connect Lookbook display to Supabase `collections` + `user_lookbooks` | `Lookbook/index.tsx` |
| ✅ Connect MyAccount profile form to Supabase `profiles` | `MyAccount/index.tsx` |
| Connect AddressModal to Supabase `user_addresses` CRUD | `AddressModal.tsx` |
| ✅ **[BUG FIX]** Fix Lookbook creation error — unique slug + RLS policy fix + SQL migration | `CreateLookbookModal.tsx` + `docs/sql/phase2_fixes.sql` |
| ✅ **[BUG FIX]** Restore Lookbook card UI to original design with real Supabase data | `Lookbook/index.tsx` |
| ✅ **[BUG FIX]** Fix navbar z-index covering Lookbook — filter bar now `top-[72px]` below nav | `Lookbook/index.tsx` |
| ✅ **[FEATURE]** Replace StyleHub "Save World" with modal popup (name + image + Save/Cancel) | `SaveWorldModal.tsx` + `StyleHub/index.tsx` |
| ✅ **[FEATURE]** Add `image_url` to `saved_style_worlds` + upload to Supabase Storage `world-images` | `SaveWorldModal.tsx` + `phase2_fixes.sql` |
| ✅ **[FEATURE]** Display saved worlds in StyleHub panel with thumbnails; clicking applies filters | `StyleHub/index.tsx` + `StyleHubContext.tsx` |
| **[FEATURE]** Connect StyleHub filter state to Shop page product listing | `StyleHubContext.tsx` + `ShopWithSidebar` |
| ✅ **[FEATURE]** Admin StyleHub control page `/admin/style-hub` with world list + delete | `app/admin/style-hub/page.tsx` + `AdminSidebar.tsx` |
| ✅ **[BUG FIX]** Fix images not showing — added Supabase Storage domain to `next.config.js` remotePatterns | `next.config.js` |
| ✅ **[BUG FIX]** Fix strange numbers under worlds — now shows "3 filters" text instead of raw count | `StyleHub/index.tsx` |
| ✅ **[FEATURE]** World detail view: click world → see selected filters + Apply & Delete buttons | `StyleHub/index.tsx` |
| ✅ **[FEATURE]** Admin filter option control — add/hide/delete filter options per category via `style_hub_filters` table | `admin/style-hub/page.tsx` + `StyleHubContext.tsx` + `style_hub_filters.sql` |

### Phase 3 — Admin Dashboard (Week 3) 🟡
| Task | Files |
|:---|:---|
| ✅ Split Coupons/Offers into separate admin sections | `app/admin/coupons/`, `app/admin/offers/` |
| ✅ Add Homepage Control admin section | `app/admin/homepage/` |
| ✅ Add analytics charts to admin overview | `app/admin/page.tsx` |
| ✅ Replace admin StatsCards with live Supabase counts | `app/admin/page.tsx` |
| ✅ Add color wheel to product form | `app/admin/products/` |
| ✅ Add editable categories: Women/Men/Kids | `app/admin/categories/` |

### Phase 4 — Responsiveness & Polish (Week 4) 🟢
| Task |
|:---|
| ✅ Full mobile audit of all pages |
| ✅ Admin sidebar: collapse on tablet |
| ✅ Fix z-index navbar overlap on Lookbook, Deals, Coupons, AI, Home |
| ✅ Cart: convert table to responsive card layout on mobile |
| ✅ Shop sidebar: convert to slide-in drawer on mobile |
| ✅ StyleHub modal: constrain width/height on 375px screens |
| ✅ Lookbook grid: responsive 1/2/3/4 column breakpoints |
| ✅ Check all pages for `overflow-x: hidden` fixes |

---

## 9. Priority Levels

| Priority | Items |
|:---|:---|
| 🔴 **High** | Cart mobile overflow, Shop filters, Navbar, Affiliate link cart, Admin live data |
| 🟡 **Medium** | Hero slides admin control, StyleHub persistence, Lookbook user creation, Admin charts, Address CRUD |
| 🟢 **Low** | Global polish, color picker in forms, typography consistency audit |

---

## 10. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|:---|:---|:---|:---|
| Supabase RLS blocks StyleHub inserts for anonymous users | Medium | High | Ensure user is authenticated before saving; show login prompt if not |
| Mobile browser blocks multiple `window.open()` calls from cart "Buy" button | High | Medium | Use a confirmation modal that lists links, open one at a time with user gesture |
| Admin overview Supabase count queries are slow | Low | Medium | Add `.count()` with `head: true` for performance; cache result |
| Lookbook user images in Supabase Storage need bucket permissions | Medium | High | Configure bucket policy: authenticated upload, public read |
| HeroCarousel has no fallback if Supabase `homepage_slides` table is empty | Low | High | Keep current static images as fallback |
| Admin layout running in isolated `<html>` tree breaks CSS inheritance | Low | Medium | Already fixed by adding global CSS import to admin layout |

---

## 11. Suggested Refactors

1. **Product type unification:** `Product` in `lib/queries/products.ts` returns `product_images[]` join, but components (`SingleGridItem`, `ProductItem`, `BestSeller/SingleItem`) expect `imgs.previews[]`. Create a mapper function `mapProductFromDB(raw)` → consistent `ProductUI` type used by all components.

2. **Auth-aware components:** Create a `useCurrentUser()` hook wrapping `AuthContext` used consistently across Navbar, MyAccount, and protected action buttons.

3. **Filter system:** Centralize all filter state into a `useShopFilters()` hook used by both `ShopWithSidebar` and `ShopWithoutSidebar` for consistency.

4. **Admin data layer:** All Admin pages use hardcoded placeholders — create `lib/queries/admin.ts` with typed functions for: `getAdminStats()`, `getRecentProducts()`, `getTopProducts()`.

---

## 12. Performance Improvements

- Add `loading="lazy"` to all below-fold product images in `SingleGridItem` and `ProductItem`
- Use `next/image` in Admin pages (currently using `<img>` tags)
- Add `Suspense` boundaries around Supabase-fetching components to improve perceived performance
- Avoid `useEffect` + `useState` for critical above-fold data — move to Server Components where possible (BestSeller, NewArrivals)
- Memoize React components that receive stable props (`React.memo`) in product grids

---

## 13. Security Considerations

- Admin layout currently uses a **dummy user object** — must be replaced with actual Supabase session validation before production
- RLS policy on `user_lookbooks` must restrict INSERT/UPDATE/DELETE to `auth.uid() = user_id` only
- Affiliate links opened via `window.open()` must use `rel="noopener noreferrer"` to prevent tab-napping
- Admin CRUD operations must validate `is_admin = true` server-side (not just via middleware)
- Supabase Storage bucket for user lookbook images must use authenticated upload policy

---

## 14. Mobile-First Refactor Strategy

### Core Strategy
Adopt a **Mobile-First CSS approach** for all new components: start with mobile layout, then layer `sm:`, `md:`, `lg:`, `xl:` breakpoints.

### Specific Breakpoint Plan
| Screen | Breakpoint | Key Behavior |
|:---|:---|:---|
| Mobile | `< 640px` (default) | Single column, stacked layout, full-width buttons, hamburger menu |
| Small Tablet | `sm: 640px` | 2-column grids, search bar expands |
| Tablet | `md: 768px` | 2-3 column grids, condensed sidebar |
| Laptop | `lg: 1024px` | Sidebar visible, 3 column product grid, full header |
| Desktop | `xl: 1280px` | 4-5 column grids, expanded header, max-width containers |
| Ultra-wide | `2xl: 1536px` | Centered max-1170px containers don't stretch |

### Immediate Mobile Fixes Required
1. **Cart:** Replace table with stacked card layout on `< md`. Each cart item = a card with product name, price, quantity controls, subtotal, delete.
2. **Admin:** Add `md:hidden` toggle for sidebar; replace with bottom nav or hamburger drawer on mobile.
3. **Shop Sidebar:** `classes="hidden lg:block"` on desktop sidebar; dedicated "Filters" button opens a `fixed bottom-0` slide-up drawer on mobile.
4. **Navbar:** Audit all spacing gaps; add `overflow-hidden` to header on mobile; ensure hamburger toggles all navigation items.
5. **Modals:** All modals (`QuickView`, `CartSidebar`, `StyleHub`, `LookbookCreate`) must be `w-full h-full` bottom-sheet style on mobile, normal modal on desktop.

---

## 15. Feature 9 — "This Week" Trend System

### Overview

A new homepage section called **"This Week"** that aggregates:
- Trending Products (algorithm-based, 7-day rolling window)
- Best Sellers (with admin override capability)
- Recently Viewed (user-specific, persisted in DB)

**Core principle:** Homepage Trending, Homepage Best Sellers, "This Week" Trending, and "This Week" Best Sellers must all share **a single data source**. No duplicated logic. No duplicated Supabase queries.

---

### 9A — Trending Products

#### Definition of "Trending"
Trending is calculated using a **weighted score** combining:
| Signal | Weight | Source |
|:---|:---|:---|
| Product page views | 40% | `product_views` table |
| Wishlist saves | 30% | `wishlist` table |
| Cart adds | 20% | `cart_events` table (new) |
| Affiliate link clicks | 10% | `products.views_count` or `analytics_events` |

**Time Window:** Rolling last 7 days only. A row older than 7 days is excluded from score calculation.

**Tie-breaking:** If two products have equal scores → sort by `wishlist saves` descending.

#### Trending Score SQL Logic (conceptual, not implementation)
```
score = (views_7d × 0.4) + (saves_7d × 0.3) + (cart_adds_7d × 0.2) + (clicks_7d × 0.1)
```

Store the computed score either:
- **Option A (Recommended):** As a materialized view `trending_products_mv` refreshed every hour via a Supabase scheduled function (cron)
- **Option B (Simpler):** Compute on-demand at query time using Supabase SQL RPC function `get_trending_products(limit int)` — acceptable for early stage

#### Single Source of Truth
Create `lib/queries/trending.ts` with:
```
getTrendingProducts({ limit }) → calls Supabase RPC or trending_products_mv
```
Both Homepage `TrendingSection` and "This Week" section call **this same function**. No duplication.

---

### 9B — Best Sellers

#### Calculation Logic
Best Sellers are determined by a combination of:
1. **Affiliate click-through rate (CTR):** `affiliate_link_clicks ÷ product_views` over all time
2. **Admin manual override:** `is_featured = true` flag in `products` table (existing)

Priority order:
- Admin-pinned products (`is_best_seller_pinned = true`) always appear first
- Remaining slots filled by calculated CTR descending

**Both Homepage BestSeller section and "This Week" BestSeller tab call the same function:**
```
getBestSellers({ limit }) → lib/queries/bestSellers.ts
```

---

### 9C — Recently Viewed

#### Tracking Logic
- When a user navigates to any product page → log a view event
- For **logged-in users:** insert/upsert into `product_views` table
- For **anonymous users:** store last 20 viewed product IDs in `localStorage` as `fitova_rv`
- On login: merge localStorage history → `product_views` table (one-time sync)

#### Anti-Inflation Logic
To prevent view count inflation from repeated page refresh:
- **Debounce:** Record a new view only if the same product was not viewed by the same user in the last **30 minutes**
- Check: `SELECT 1 FROM product_views WHERE user_id = $1 AND product_id = $2 AND viewed_at > NOW() - INTERVAL '30 minutes'` → if row exists, skip insert
- For anonymous: debounce using localStorage timestamp per product

---

### 9D — Database Schema

#### New Tables

**`product_views`** — core tracking table
```sql
CREATE TABLE product_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL = anonymous
  session_id  TEXT,           -- browser session fingerprint (optional)
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_product_views_product_id ON product_views(product_id);
CREATE INDEX idx_product_views_user_id ON product_views(user_id);
CREATE INDEX idx_product_views_viewed_at ON product_views(viewed_at DESC);
CREATE INDEX idx_product_views_trending ON product_views(product_id, viewed_at DESC);
-- Composite for debounce check
CREATE INDEX idx_product_views_debounce ON product_views(user_id, product_id, viewed_at DESC);
```

**`cart_events`** — tracks add-to-cart actions for trending score
```sql
CREATE TABLE cart_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type  TEXT NOT NULL DEFAULT 'add', -- 'add' | 'remove'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cart_events_product_id ON cart_events(product_id);
CREATE INDEX idx_cart_events_created_at ON cart_events(created_at DESC);
```

#### Existing Table Modifications
| Table | Column to Add | Type | Purpose |
|:---|:---|:---|:---|
| `products` | `is_best_seller_pinned` | BOOLEAN DEFAULT false | Admin manual best seller override |
| `products` | `affiliate_link_clicks` | INTEGER DEFAULT 0 | Increment on affiliate click |

#### Supabase RPC Functions (to be created in SQL editor)
```sql
-- Trending products (7-day rolling window)
CREATE OR REPLACE FUNCTION get_trending_products(p_limit INT DEFAULT 10)
RETURNS TABLE(product_id UUID, score NUMERIC) AS $$
  SELECT
    pv.product_id,
    (COUNT(DISTINCT pv.id) * 0.4
     + COUNT(DISTINCT w.id) * 0.3
     + COUNT(DISTINCT ce.id) * 0.2
     + p.views_count * 0.1
    ) AS score
  FROM product_views pv
  JOIN products p ON p.id = pv.product_id
  LEFT JOIN wishlist w ON w.product_id = pv.product_id
    AND w.created_at > NOW() - INTERVAL '7 days'
  LEFT JOIN cart_events ce ON ce.product_id = pv.product_id
    AND ce.created_at > NOW() - INTERVAL '7 days'
  WHERE pv.viewed_at > NOW() - INTERVAL '7 days'
  GROUP BY pv.product_id, p.views_count
  ORDER BY score DESC
  LIMIT p_limit;
$$ LANGUAGE sql STABLE;
```

---

### 9E — API / Query Layer Plan

**Files to create in `src/lib/queries/`:**

| File | Functions | Used By |
|:---|:---|:---|
| `trending.ts` | `getTrendingProducts(limit)` | Homepage TrendingSection + This Week tab |
| `bestSellers.ts` | `getBestSellers(limit)` | Homepage BestSeller + This Week tab |
| `recentlyViewed.ts` | `getRecentlyViewed(userId, limit)` | This Week tab (logged-in only) |
| `tracking.ts` | `trackProductView(productId, userId)`, `trackCartEvent(productId, userId)`, `trackAffiliateClick(productId)` | All product pages + Cart |

**Single source of truth pattern:**
```
Homepage BestSeller → getBestSellers(6)
This Week BestSeller tab → getBestSellers(10)
Homepage TrendingSection → getTrendingProducts(6)
This Week Trending tab → getTrendingProducts(10)
```
No logic duplication, only `limit` differs.

---

### 9F — Caching Strategy

| Layer | Strategy | TTL |
|:---|:---|:---|
| Trending score | Supabase RPC called on component mount → cache result in React `useState` per session | No TTL (fresh per page load) |
| Best sellers | Same as trending | No TTL |
| Admin overview trending table | Server Component with `revalidate = 3600` (Next.js ISR) | 1 hour |
| Recently viewed | Fetched fresh on component mount (user-specific, must be current) | No cache |
| Anonymous recently viewed | `localStorage` with max 20 items, FIFO eviction | Client-side indefinite |

**Future optimization (Phase 2+):**
- Add Redis/Supabase Edge Functions to cache `get_trending_products` result once per hour
- Store cached trending array in `homepage_cache` table updated by cron job

---

### 9G — Performance & Scalability

- All tracking inserts are **fire-and-forget** (do not `await` in UI — use background fetch)
- `product_views` table: add **table partitioning by month** when rows exceed 1M
- Use `COUNT(*)` with `FILTER` (not JOINs) for trend score once data grows
- Add `VACUUM` schedule for `product_views` table (high write volume)
- Limit `product_views` retention to 90 days via a Supabase cron delete job:
  ```sql
  DELETE FROM product_views WHERE viewed_at < NOW() - INTERVAL '90 days';
  ```

---

### 9H — Frontend Component Plan

**New component:** `src/components/Home/ThisWeek/index.tsx`

Structure:
```
<ThisWeek>
  <TabBar> [Trending] [Best Sellers] [Recently Viewed*] </TabBar>
  <ProductGrid> ← renders based on active tab
  (* hidden if user is not logged in)
</ThisWeek>
```

**Responsive Layout:**
| Screen | Layout |
|:---|:---|
| Mobile (`< sm`) | Horizontal swipeable `Swiper` carousel, 1.2 items visible (peek effect) |
| Tablet (`sm–lg`) | 2-column grid |
| Desktop (`> lg`) | 4-column grid |

**Tab behavior on mobile:** Full-width scrollable tab bar with active indicator underline.

---

### 9I — Admin Dashboard Integration Plan

**New additions to `/admin/page.tsx` (overview):**

1. **Trending Products Table:**
   - Columns: Rank, Product Name, Score, Views (7d), Saves (7d), Cart Adds (7d)
   - Sortable by any column
   - Admin can "pin" a product as Best Seller via toggle

2. **Best Seller Override Panel:**
   - List of current best sellers with drag-to-reorder
   - "Pin to top" toggle per product
   - Manual add product by name search

3. **Analytics Charts (new):**
   - Line chart: Daily product views (last 14 days)
   - Bar chart: Top 10 trending products this week by score
   - Pie chart: Traffic source (brand/category breakdown)

4. **Recently Viewed Stats (read-only):**
   - Most frequently revisited products (high intent signal)
   - Table: Product name, unique visitor count, avg time between views

---

### 9J — Tracking System Anti-Abuse Plan

| Abuse Pattern | Prevention |
|:---|:---|
| Refresh inflation | 30-min debounce per user+product combo |
| Bot traffic | Check `session_id` entropy; rate-limit inserts via Supabase Edge Function |
| Self-inflated views from admin | Track `user_agent` and skip if admin is browsing own product |
| Anonymous spam | Limit anonymous views per IP to 100/hour via middleware rate limit |

---

### 9K — Implementation Checklist

> ✅ Complete each step in order. Each step builds on the previous.

#### Step 1 — Database Setup
- [ ] Create `product_views` table with all columns and indexes (SQL from §9D)
- [ ] Create `cart_events` table with indexes
- [ ] Add `is_best_seller_pinned` column to `products` table
- [ ] Add `affiliate_link_clicks` column to `products` table
- [ ] Create `get_trending_products()` RPC function in Supabase SQL editor
- [ ] Set RLS on `product_views`: allow anonymous INSERT, user can only SELECT own rows
- [ ] Set RLS on `cart_events`: allow authenticated INSERT only
- [ ] Test RPC function returns correct results in Supabase dashboard

#### Step 2 — Query Layer
- [ ] Create `src/lib/queries/trending.ts` with `getTrendingProducts(limit)`
- [ ] Create `src/lib/queries/bestSellers.ts` with `getBestSellers(limit)`
- [ ] Create `src/lib/queries/recentlyViewed.ts` with `getRecentlyViewed(userId, limit)`
- [ ] Create `src/lib/queries/tracking.ts` with `trackProductView()`, `trackCartEvent()`, `trackAffiliateClick()`
- [ ] Test each function in isolation (console.log results)

#### Step 3 — Tracking Integration
- [ ] In product detail page component: call `trackProductView(productId, userId)` on mount (fire-and-forget)
- [ ] Implement 30-min debounce check before inserting into `product_views`
- [ ] For anonymous users: save product ID + timestamp to `localStorage['fitova_rv']`
- [ ] On user login: merge `localStorage` history into `product_views` table (one-time sync in `AuthContext`)
- [ ] In cart `addItemToCart` dispatchers: call `trackCartEvent(productId, userId)` (fire-and-forget)
- [ ] In cart Buy button handler: call `trackAffiliateClick(productId)` for each item before opening affiliate link

#### Step 4 — "This Week" Component
- [ ] Create `src/components/Home/ThisWeek/index.tsx` with 3 tabs
- [ ] Add tab state: `useState<'trending' | 'bestsellers' | 'recently_viewed'>('trending')`
- [ ] "Trending" tab: call `getTrendingProducts(10)` and render `ProductGrid`
- [ ] "Best Sellers" tab: call `getBestSellers(10)` and render `ProductGrid`
- [ ] "Recently Viewed" tab: conditionally show if user is logged in, call `getRecentlyViewed(userId, 10)`
- [ ] For anonymous users: hide "Recently Viewed" tab OR show localStorage-based fallback
- [ ] Add `Swiper` carousel for mobile (1.2 peek on mobile, grid on tablet/desktop)
- [ ] Add loading skeleton placeholders for each tab

#### Step 5 — Homepage Integration
- [ ] Add `<ThisWeek />` component to `src/components/Home/index.tsx`
- [ ] Verify `TrendingSection` on homepage calls same `getTrendingProducts()` — not a separate query
- [ ] Verify `BestSeller` section on homepage calls same `getBestSellers()` — not a separate query
- [ ] Remove any duplicate trending/bestseller logic if found

#### Step 6 — Admin Dashboard
- [ ] In `app/admin/page.tsx`: add Trending Products table (Rank, Score, Views, Saves)
- [ ] Add "Pin as Best Seller" toggle per product row
- [ ] Add Best Seller override panel with drag-to-reorder (or simple sort_order input)
- [ ] Add line chart for daily views (last 14 days) using `recharts`
- [ ] Add bar chart for top 10 trending products using `recharts`
- [ ] Connect `StatsCard` for "Views This Week" to live `product_views` count

#### Step 7 — Testing & Validation
- [ ] Browse product pages as logged-in user → verify rows appear in `product_views` table
- [ ] Browse as anonymous → verify `localStorage['fitova_rv']` is populated
- [ ] Log in after anonymous browsing → verify merge happens correctly
- [ ] Refresh product page immediately → verify debounce prevents duplicate row
- [ ] Add item to cart → verify row appears in `cart_events`
- [ ] Click Buy → verify `affiliate_link_clicks` increments in `products` table
- [ ] View "This Week" section → verify Trending tab shows correct products with scores
- [ ] View "This Week" section → verify Best Sellers tab shows admin-pinned products first
- [ ] View "This Week" section as logged-in user → verify Recently Viewed matches actual browsing
- [ ] Admin dashboard → verify Trending Products table shows real data
- [ ] Test on mobile (375px): verify swipeable carousel works correctly
- [ ] Test on tablet (768px): verify 2-column grid layout
- [ ] Test on desktop (1280px): verify 4-column grid layout

