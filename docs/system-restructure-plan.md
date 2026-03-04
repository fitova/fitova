# FITOVA — System Restructure Plan v5

> **Author:** Senior Software Architect, Database Engineer, UI Systems Designer  
> **Date:** 2026-03-03  
> **Status:** 🟡 PLANNING — Not yet implemented  
> **Stack:** Next.js 14 App Router · TypeScript (strict) · Tailwind CSS · Supabase · Redux · Framer Motion  
> **Legend:** ⬜ Pending · ✅ Done

---

## Executive Summary

FITOVA v5 is a major cross-system restructure targeting:
1. Full mobile-first rewrite of all responsive layouts
2. Complete category hierarchy overhaul (Men / Women / Kids → nested subcategories)
3. Product detail page overhaul: real ratings, reviews, "Complete Your Look", Add to Lookbook
4. Lookbook system upgrade: creation flow, product grid, color swatches, hover previews
5. Style Hub improvements: gender filter, world activate/deactivate
6. Profile page redesign: all sections connected to DB
7. Wishlist page: connect to real DB, fix 404
8. This Week navbar: New Arrivals replaces Recently Viewed
9. Scroll animations (lightweight, GPU-safe, Framer Motion)
10. Unified hover system across all product cards

---

## Architecture Problems

| # | Problem | Severity | Area |
|---|---------|----------|------|
| 1 | Categories flat structure — no parent/child hierarchy in DB | Critical | Database |
| 2 | Product page has navbar overlap at top | High | UI |
| 3 | Wishlist page shows placeholder data instead of real DB data | High | Frontend |
| 4 | Lookbook creation has no image upload or product selection flow | High | Feature |
| 5 | Style Hub gender filter missing | Medium | Feature |
| 6 | Profile page not connected to all DB tables | High | Frontend |
| 7 | `product_reviews` table exists but not rendered on product page | High | Frontend |
| 8 | "Recently Viewed" tab in This Week navbar — business irrelevant section | Medium | UX |
| 9 | Hover system has 3+ different implementations across components | Medium | Frontend |
| 10 | No scroll-based animations | Low | UX |
| 11 | Admin dashboard hidden behind `is_admin` flag but no UI gateway | Medium | Feature |
| 12 | Color values stored as hex strings — displayed as text not swatches | Low | UI |

---

## UI & UX Issues

### Global
- Missing scroll-based reveal animations for product sections
- No unified animation system defined
- CLS risk on lookbook card images (no aspect-ratio container)

### Homepage
- Product cards: 3 different hover implementations (bottom slide, right slide, none)
- No cart badge feedback for Add to Cart

### Product Details Page
- Navbar overlapping content (missing `pt-[navbar-height]`)
- Color selector renders as dropdown — should be tag pills
- No "Complete Your Look" section
- No comments/reviews rendered
- "Add to Lookbook" is disabled placeholder only

### Lookbook
- Card hover shows nothing — spec requires product preview grid
- Creator name not shown when `type = 'user'`
- Color shown as hex text not swatch
- No creation flow

### Style Hub
- No gender filter
- World filter doesn't persist or affect Lookbooks
- "Save World" button alignment broken

### Profile
- Not fully connected to DB tables (coupons, deals, lookbook contributions missing)
- No admin dashboard link for admin email

### Wishlist
- Shows placeholder data
- 404 on some routes

---

## Category Refactor Plan

### Target Hierarchy

```
categories (parent_id = null)        — root level
├── Men   (slug: men)
│   ├── T-Shirts   (piece_type: tshirt)
│   ├── Shirts     (piece_type: shirt)
│   ├── Jackets    (piece_type: jacket)
│   ├── Pants      (piece_type: pants)
│   ├── Shoes      (piece_type: shoes)
│   ├── Accessories (piece_type: accessories)
│   └── Perfumes   (piece_type: perfume)
├── Women  (slug: women)
│   ├── Dresses    (piece_type: dress)
│   ├── Tops       (piece_type: top)
│   ├── Skirts     (piece_type: skirt)
│   ├── Jackets    (piece_type: jacket)
│   ├── Pants      (piece_type: pants)
│   ├── Shoes      (piece_type: shoes)
│   ├── Accessories (piece_type: accessories)
│   └── Perfumes   (piece_type: perfume)
└── Kids   (slug: kids)
    ├── Tops       (piece_type: top)
    ├── Pants      (piece_type: pants)
    ├── Shoes      (piece_type: shoes)
    └── Accessories (piece_type: accessories)
```

### DB Changes
- `categories` table already has `parent_id` — populate it for the new hierarchy
- Add `gender` column to `categories` (`men | women | kids | unisex`)
- Add `piece_type` column to `categories` for filter mapping
- Add `icon_url` column to `categories` for navbar icons
- Products remain linked to leaf (child) categories only

### Navbar Mega Menu Structure

```
[Men ▼]  [Women ▼]  [Kids ▼]

Hover on "Men" → dropdown:
┌─────────────────────────────────┐
│ Clothing    │ Footwear & More   │
│ ─────────── │ ─────────────── │
│ T-Shirts    │ Shoes             │
│ Shirts      │ Accessories       │
│ Jackets     │ Perfumes          │
│ Pants       │                   │
└─────────────────────────────────┘
```

Component: `MegaMenu.tsx` in `/components/Layout/Navbar/`

### Search Category Dropdown
- Left of search box: category dropdown (parent categories + "All")
- Value passed as `categoryId` query param to `/shop`
- Single source: Categories loaded once in `NavbarProvider` (Server Component context)

### Shop Page Filters
- Left sidebar (collapsible on mobile) — powered by same categories hierarchy
- Filters: Gender (parent category) → Type (child category) → Brand → Price → Color → Size → Style

---

## Product System Improvements

### Product Details Page — Full Spec

#### Fix: Navbar Overlap
- All full-page routes inside `(site)` layout should have `pt-[navbar-height]` CSS var
- Navbar height: `64px` mobile, `80px` desktop
- Add CSS variable `--navbar-h` to `:root` in `globals.css`

#### Rating System
- `product_reviews` table already exists with `rating` (1–5) + `comment` + `user_id`
- Add `rating_cache` columns to `products`: `avg_rating NUMERIC(3,2)`, `review_count INT`
- Trigger: `refresh_product_rating()` fires on INSERT/UPDATE/DELETE on `product_reviews`
- Frontend: Stars rendered from `avg_rating`, read-only or interactive per auth state

#### Remove Color Dropdown
- Replace `<select>` color dropdown with tag pill system
- Colors stored as `text[]` in `products.colors`
- Render as clickable colored circles (CSS background from color value)
- Selected color stored in local `useState`, passed to affiliate link if applicable

#### Product Tags System
- Use `products.tags` array
- Render as `#tag` pill badges (e.g., `#Streetwear`, `#Minimal`)
- Clickable: navigate to `/shop?tag=streetwear`

#### Complete Your Look
Logic engine in `/lib/logic/completeTheLook.ts`:
```
if product.piece_type IN ('tshirt', 'top', 'shirt'):
  suggest: pants/skirt + shoes + accessories (matching gender)
if product.piece_type IN ('pants', 'skirt'):
  suggest: top/shirt + shoes (matching gender)
if product.piece_type == 'dress':
  suggest: shoes + accessories (gender = women)
if product.piece_type == 'shoes':
  suggest: top + pants/skirt + accessories (matching gender)
```
- Max 8 suggested products
- Exclude current product
- Match `product.gender`
- Optional: boost by shared `styles[]` tags

#### Reviews & Comments Section
- Display: avatar + name + stars + date + comment
- Submit: authenticated users only, one review per product per user
- Sort: newest first
- Limit: 10 per page, paginated with "Load More"

#### Add to Lookbook Modal
- Trigger: click "Add to Lookbook" button
- Modal shows: list of user's existing lookbooks (from `collections` WHERE `user_id = me`)
- Option: "Create New Lookbook" → inline form (name + optional image)
- On select: INSERT into `collection_products` (collection_id, product_id) — upsert safe

---

## Lookbook Refactor Plan

### Card Design
| Element | Spec |
|---------|------|
| Creator | Show `profiles.full_name` if `collections.user_id` is set |
| Gender | Show gender badge tag |
| Style | Show `collections.styles[]` as scrollable pill row |
| Colors | Show color swatches (circles) from `collections.colors[]` |
| Hover | Show 2×2 preview grid of first 4 products in collection |

### Lookbook Details Page
- Categorized product layout: section per `piece_type` (Tops / Pants / Shoes / Accessories / Perfume)
- All style tags rendered as clickable pills
- Color swatches shown with label on hover
- Share button (already implemented)

### Create Lookbook Flow

**Step 1 — Details**
- Name (required, text input)
- Description (optional, textarea)
- Cover image upload → stored in `lookbook-images` Supabase bucket
- Gender selection (men / women / kids / unisex)
- Style multi-select (from `style_hub_filters` table)
- Color multi-select (color wheel + preset swatches)
- Tag (text input for custom tag)

**Step 2 — Add Products**
- Gender filter applied first (from Step 1 selection)
- Display products grouped by `piece_type`
- Sections: Tops · Pants · Shoes · Accessories · Perfume
- Search input inside modal (debounced, queries `products.name`)
- Max recommended: 20 products per lookbook
- Selected products stored as `collection_products` rows

**Step 3 — Confirm & Save**
- Preview card
- Publish / Save Draft

**Route:** `/lookbook/create` (authenticated only)

### Save Button Fix
- Current: noop
- Fix: POST to `/api/v1/lookbooks` → INSERT into `collections` + `collection_products`
- Auth guard: redirect to signin if not authenticated

---

## Style Hub Logic Plan

### Gender Filter
- Add gender pill buttons at top of Style Hub: `All | Men | Women | Kids`
- Default: `All`
- Affects: all product results in Style Hub view
- Stored in local `useStyleHubFilters` store (Zustand or Redux slice)

### World Filter
- "Save World" → stores current active filters as JSON in `saved_style_worlds`
- World is "activated" when user selects it from their profile Worlds list
- Active world: persists in `localStorage` + Redux `worldSlice`
- Active world affects: Products shown in Style Hub, Lookbook cards filtered by matching styles

### Button Alignment Fix
- `Shop Now` and `Save World` buttons: use `flex gap-3 items-center justify-between` pattern
- Match established button style: `border border-dark px-6 py-2.5 text-xs tracking-[0.15em] uppercase`

---

## This Week Navbar Section

### Change
- Remove: "Recently Viewed" tab
- Add: "New Arrivals" tab
- Data source: `getNewArrivals()` query (already exists in `lib/queries/products.ts`)
- Component: new `NewArrivalsTab.tsx` inside `/components/Layout/Header/`

---

## Profile System Plan

### Layout
- Left sidebar: avatar + name + email + nav links
- Right content: active section

### Sections
| Section | DB Source | Notes |
|---------|-----------|-------|
| Edit Profile | `profiles` | full_name, avatar_url (upload), phone |
| Change Password | Supabase Auth API | `supabase.auth.updateUser({ password })` |
| Wishlist | `wishlist` | Join products + collections |
| Saved Coupons | `offers` + new `user_saved_offers` join table | |
| Saved Deals | `offers` WHERE `type = 'deal'` + user_saved_offers | |
| Lookbook Contributions | `collections` WHERE `user_id = me` | |
| Saved Worlds | `saved_style_worlds` WHERE `user_id = me` | |
| Admin Dashboard | Visible only if `profiles.is_admin = true` OR email = `Fitova.style@gmail.com` | |

### Admin Logic
```typescript
const isAdmin = profile?.is_admin || user?.email === 'Fitova.style@gmail.com';
if (isAdmin) show <AdminDashboardButton />
```

---

## Dashboard Requirements

- Route: `/admin` (protected by `is_admin` middleware)
- Sections:
  - Products CRUD
  - Categories CRUD
  - Offers CRUD
  - Users list
  - Lookbooks moderation
  - Analytics overview (affiliate clicks, views)

---

## Storage Buckets Plan

See: `/docs/supabase-storage-buckets.md`

Summary:
| Bucket | Access | Purpose |
|--------|--------|---------|
| `product-images` | Public | Product card + detail images |
| `lookbook-images` | Public | Lookbook cover images |
| `user-avatars` | Public (per user path) | Profile avatars |
| `world-images` | Public | Style world cover images |
| `review-attachments` | Public (optional) | User review photo uploads |

---

## Database Refactor Plan

See: `/docs/database-updates.sql`

Summary of changes:
| Change | Table | Type |
|--------|-------|------|
| Add `gender` column | `categories` | ALTER TABLE |
| Add `piece_type` column | `categories` | ALTER TABLE |
| Add `icon_url` column | `categories` | ALTER TABLE |
| Add `avg_rating`, `review_count` | `products` | ALTER TABLE |
| Add `is_verified` to reviews | `product_reviews` | ALTER TABLE |
| Create trigger `refresh_product_rating` | — | TRIGGER |
| Create `user_saved_offers` join table | new | CREATE TABLE |
| Create `cart_items` table | new | CREATE TABLE |
| Create `lookbook_comments` table | new | CREATE TABLE |
| Add index on `products(gender, piece_type)` | — | CREATE INDEX |
| Add UNIQUE constraint on `product_reviews(product_id, user_id)` | — | ALTER TABLE |

---

## Animation & Interaction Plan

### Scroll Animations (Framer Motion)

**Principle:** Lightweight, GPU-composited transforms only (`opacity`, `transform: translateX/Y`). No `width`, `height`, or `top/left` animations.

**Product Sections — Slide In from Right:**
```typescript
// useScrollReveal custom hook
const variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};
// Applied to: NewArrivals, BestSeller, TrendingSection section wrappers
// trigger: whileInView with once: true + viewport: { margin: '-100px' }
```

**Background Ornaments (Fashion Minimal):**
- Thin diagonal lines that shift on scroll (CSS `transform: translateY(var(--scroll-y) * 0.15)`)
- Pure CSS, no JS scroll listener — use `@supports (animation-timeline: scroll)`
- Fallback: static decorative SVG lines for non-supporting browsers
- Opacity: 0.04 (extremely subtle)

**Card Hover Transitions:**
- `transition: transform 400ms ease-out, opacity 200ms ease`
- scale(1.04) on image hover only
- Hover panel: `translateX(100%) → translateX(0)` — right slide only

### Unified Hover System (Single Source of Truth)

All product cards must use `<ProductHoverActions />` exclusively:
- Eye icon → `router.push(/products/${slug})`
- Wishlist → toggle (outlined/filled black heart)
- Cart → toggle (outlined/filled cart icon)

**Cart toggle behavior:**
- On add: dispatch `addItemToCart`, icon becomes filled
- On remove (click again): dispatch `removeItemFromCart`, icon becomes outlined
- State read from Redux `cartSlice` per `item.id`

---

## Responsiveness Strategy

### Breakpoints

| Breakpoint | px Range | Strategy |
|-----------|----------|----------|
| xs | 0–639 | Single column, mobile nav, horizontal scroll for products |
| sm | 640–767 | 2-column grids, side-by-side hero elements |
| md | 768–1023 | 3-column grids, expanded navbar, sidebar visible |
| lg | 1024–1279 | 4-column grids, full mega menu |
| xl | 1280–1535 | Max container 1170px, content capped |
| 2xl | ≥1536 | Container 1170px, full-bleed backgrounds |

### Per-Section Mobile Behavior

**Navbar:**
- Mobile: hamburger → sliding drawer from left (full viewport height)
- Mega menu: full-screen accordion on mobile
- Category dropdown: bottom sheet on mobile

**Hero Section:**
- Mobile: carousel → AI Styling card → Lookbook card (stacked)
- Desktop: CSS grid side-by-side

**Product Sections:**
- Mobile `<640px`: Horizontal Swiper (`slidesPerView: 1.2`, `freeMode: true`)
- Tablet `640–1023px`: 2-column CSS grid
- Desktop `≥1024px`: 3–4 column CSS grid

**Shop Page Filters:**
- Mobile: bottom sheet with close button
- Tablet: collapsible sidebar
- Desktop: sticky left sidebar (fixed, scrolls with page)

**Product Details Page:**
- Mobile: image stack → info below → reviews below
- Desktop: image left (60%) + info right (40%)

**Lookbook Create Flow:**
- Mobile: full-screen step wizard (step 1 → 2 → 3)
- Desktop: multi-column form

**Profile Page:**
- Mobile: tab navigation (top tabs or bottom nav)
- Desktop: left sidebar + content panel

### Scroll Snap for Product Rows
```css
.product-row-mobile {
  scroll-snap-type: x mandatory;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.product-row-mobile > * {
  scroll-snap-align: start;
}
```

### Image Scaling Strategy
- All images: `next/image` with responsive `sizes` prop
- Product cards: `sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"`
- Hero: `sizes="(max-width: 640px) 100vw, 65vw"`
- Lookbook cards: `sizes="(max-width: 640px) 50vw, 25vw"`
- Enforce `aspect-ratio` containers to prevent CLS

### Prevent CLS
- All image containers: explicit `aspect-ratio` or `paddingTop` trick
- Skeleton cards match exact card dimensions
- Fonts: preload critical fonts via `<link rel="preload">`
- Navbar: fixed height via CSS var `--navbar-h`

---

## Performance Strategy

| Concern | Solution |
|---------|----------|
| Scroll animation on low-end devices | `prefers-reduced-motion` media query disables all animations |
| Framer Motion bundle size | Import only `motion.div` — avoid `import * from framer-motion` |
| Lookbook product preview hover | Load preview products lazily only on hover (intersection observer) |
| Category mega menu data | Fetch once server-side, pass as props to client navbar via layout |
| Product images | Next Image with `priority` on above-fold only |
| Supabase queries | TanStack Query caching with `staleTime: 5 * 60 * 1000` |
| Wishlist page | Paginate 20 per load + "Load More" pattern |

---

## Security Considerations

| Area | Risk | Mitigation |
|------|------|------------|
| `is_admin` flag | User cannot self-promote | RLS policy: only Supabase service role can update `is_admin` |
| Review submission | Spam, duplicate reviews | UNIQUE constraint `(product_id, user_id)` in `product_reviews` |
| Lookbook creation | Unauthenticated creation | RLS on `collections`: INSERT requires `auth.uid() = user_id` |
| Image uploads | Oversized or malicious files | Supabase storage policies: max 5MB, mime type `image/*` only |
| Affiliate links | Open redirect abuse | All affiliate links stored in DB, never user-supplied at runtime |
| Admin route | Unauthorized access | `/admin` layout checks `is_admin` server-side, returns 404 if false |
| Rate limiting | Brute force on reviews/wishlist | `/api/v1` routes: rate limit via `upstash/ratelimit` (10 req/min per IP) |

---

## Execution Phases

### Phase 1 — Foundation Fixes (1–2 days)
1. ⬜ Add CSS variable `--navbar-h` and fix all page top padding
2. ⬜ Fix Wishlist page: connect to real DB, remove placeholders
3. ⬜ Fix "This Week" navbar: replace Recently Viewed with New Arrivals
4. ⬜ Unify cart toggle in `ProductHoverActions` (add remove + Redux state)

### Phase 2 — Category System (2–3 days)
1. ⬜ Run category hierarchy SQL (see database-updates.sql)
2. ⬜ Build `MegaMenu.tsx` component with nested category data
3. ⬜ Replace flat category nav with mega dropdown
4. ⬜ Update shop page filters to use hierarchical categories
5. ⬜ Update category selector beside search bar

### Phase 3 — Product Details Page (3–4 days)
1. ⬜ Render real reviews from `product_reviews` table
2. ⬜ Add review submission form (authenticated)
3. ⬜ Replace color dropdown with tag pill system
4. ⬜ Implement "Complete Your Look" section
5. ⬜ Implement "Add to Lookbook" modal
6. ⬜ Add product tags rendering

### Phase 4 — Lookbook Refactor (3–4 days)
1. ⬜ Update card design (creator name, gender badge, style pills, color swatches)
2. ⬜ Implement hover product preview grid
3. ⬜ Build Lookbook creation flow (3-step wizard)
4. ⬜ Update Lookbook Details page (categorized layout, color swatches)
5. ⬜ Fix Save button to call API

### Phase 5 — Style Hub & Animations (1–2 days)
1. ⬜ Add gender filter to Style Hub
2. ⬜ Fix world activate/deactivate logic
3. ⬜ Fix button alignment
4. ⬜ Implement scroll-reveal animations with Framer Motion
5. ⬜ Add background ornaments (CSS only, no JS)

### Phase 6 — Profile & Admin (2–3 days)
1. ⬜ Redesign Profile page layout (sidebar + content)
2. ⬜ Connect all profile sections to DB
3. ⬜ Add admin dashboard button for admin email
4. ⬜ Build `user_saved_offers` (coupons/deals save)

### Phase 7 — Testing & Polish (1–2 days)
1. ⬜ Cross-browser test: Chrome, Safari, Firefox
2. ⬜ Device test: iOS Safari, Android Chrome
3. ⬜ Lighthouse audit (target: ≥90 performance, ≥95 accessibility)
4. ⬜ Fix any CLS issues found
5. ⬜ Final SQL migration run on production Supabase

---

## Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Category hierarchy SQL breaks existing product FK | Medium | High | Add new categories, migrate products by name match, then delete old flat ones — never DROP first |
| Lookbook creation image upload exceeds Supabase free tier 1GB | Low | Medium | Enforce 2MB client-side limit before upload |
| Scroll animations cause jank on mid-range Android | Medium | Medium | Test on real device; reduce motion on `prefers-reduced-motion` |
| Product rating trigger causes slow writes at scale | Low | Low | Trigger runs async; or use a materialized view with periodic refresh |
| Review UNIQUE constraint breaks existing duplicate reviews | Low | High | Run deduplication query first, keep highest-rated duplicate |
| "Complete Your Look" returns 0 products for new categories | Medium | Medium | Fallback: show trending products from same gender |
| Admin email hardcode (`Fitova.style@gmail.com`) | Low | Low | This is a bootstrap pattern; replace with `is_admin` flag properly set via Supabase dashboard |

---

> **Sign-off:** Plan reviewed and approved. Execution follows phases above.  
> All code must comply with `/docs/rules/frontend.md` and `/docs/rules/backend.md`.  
> Legend: ✅ Done · ⬜ Pending
