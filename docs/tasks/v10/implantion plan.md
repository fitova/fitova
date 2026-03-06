# FITOVA v10 — Implementation Plan

> **Stack Confirmed:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase (PostgreSQL) · Redux · TanStack Query · Framer Motion
> **Standard:** All API calls via `/lib/queries` → Supabase client. Server Components by default. Client Components only when needed.

---

## Schema Findings (Based on `supabase-schema.ts`)

| Table | Status | Notes |
|---|---|---|
| `products` | ✅ Exists | Has `piece_type`, `styles`, `tags`, `colors`, `gender`, `material`, `season`, `brand` |
| `cart_items` | ✅ Exists | FK → `products`, FK → `profiles` |
| `wishlist` | ✅ Exists | Has `item_type`, `product_id`, `collection_id` — may have mock data bug |
| `lookbooks` | ⚠️ Partial | Only: `id, title, cover_image, slug, created_at` — **missing** `user_id`, `is_copy`, `original_lookbook_id`, `tags[]`, `colors[]`, `mood`, `occasion`, `season` |
| `lookbook_products` | ⚠️ Partial | Only: `lookbook_id, product_id, sort_order` — **missing** `category` (top/pants/shoes/accessories/perfumes) |
| `coupons` | ✅ Exists | System-managed only (no `user_id`). User-generated needs new table or column |
| `product_views` | ✅ Exists | Has `user_id, product_id, viewed_at` — can power "Recently Viewed" |
| `profiles` | ✅ Exists | Has `is_admin`, `avatar_url`, `full_name`, `email` |
| `outfits / outfit_tags` | ❌ Missing | No outfits table found — Issue #3 needs investigation |
| `recently_viewed` | ✅ Covered | By `product_views` table (already exists!) |
| `user_coupons` | ❌ Missing | Needed for Issue #17 — user-generated coupons |

---

## Required Database Migrations (Before Code Work)

### Migration 1 — Lookbook Schema Overhaul
```sql
-- Add missing columns to lookbooks
ALTER TABLE lookbooks
  ADD COLUMN user_id uuid REFERENCES profiles(id),
  ADD COLUMN description text,
  ADD COLUMN is_copy boolean DEFAULT false,
  ADD COLUMN original_lookbook_id uuid REFERENCES lookbooks(id),
  ADD COLUMN tags text[],
  ADD COLUMN colors text[],
  ADD COLUMN mood text,
  ADD COLUMN occasion text,
  ADD COLUMN season text;

-- Add category column to lookbook_products
ALTER TABLE lookbook_products
  ADD COLUMN id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ADD COLUMN category text CHECK (category IN ('top','pants','shoes','accessories','perfumes'));
```

### Migration 2 — User Coupons Table
```sql
CREATE TABLE user_coupons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id),
  code text NOT NULL UNIQUE,
  title text,
  discount_type text CHECK (discount_type IN ('percentage','fixed')) DEFAULT 'percentage',
  discount_value numeric NOT NULL,
  min_order_value numeric,
  expiry_date timestamptz,
  usage_limit integer,
  current_uses integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

---

## Implementation Roadmap

---

## Phase 1 — Data & Session Bugs (CRITICAL)

### Issue #5 — Fix `getCartItems` Console Error
**Risk:** Low | **Area:** `/lib/queries/cart.ts` (or similar)

**Likely cause:** Product deleted but cart item remains (orphaned FK), or cart queried while user is unauthenticated.

**Files to modify:**
- `src/lib/queries/cart.ts` — Add null-safety, `.maybeSingle()` instead of `.single()`, handle orphaned products
- `src/components/Cart/` — Add defensive fallback `data?.items ?? []`

**Fix:**
```ts
// Defensive fetch with left join safety
const { data, error } = await supabase
  .from('cart_items')
  .select('*, products(*)')
  .eq('user_id', userId)
  .not('products', 'is', null) // skip orphaned items
```

---

### Issue #6 — Wishlist Shows Random Default Items
**Risk:** Low | **Area:** `/components/Wishlist/`

**Likely cause:** Hardcoded mock data initializing Redux slice before real fetch arrives, or wishlist query missing `WHERE user_id = auth.uid`.

**Files to modify:**
- `src/redux/` — locate wishlist slice, remove any hardcoded initial `items` array
- `src/lib/queries/wishlist.ts` — confirm `.eq('user_id', userId)` is applied
- `src/components/Wishlist/` — show skeleton while loading, empty state when no items

---

## Phase 2 — Product & Filter System (HIGH)

### Issue #2 — Product Visibility Bug (Intermittent Empty List)
**Risk:** Medium | **Area:** `/components/Shop/` or `/components/ShopWithSidebar/`

**Investigate:**
- Check if `useEffect` that fetches products fires before filter defaults are set
- Check pagination: if `page` state starts at 0 instead of 1
- Confirm API response path: `data?.products ?? []` pattern

**Files to modify:**
- `src/lib/queries/products.ts` — add defensive fallback and confirm query conditions
- `src/components/ShopWithSidebar/` — fix race condition, ensure loading state prevents empty flash
- Add `?? []` fallback to every product array consumption

---

### Issue #14 — Category Filters Not Updating Correctly
**Risk:** Low | **Area:** `/components/ShopWithSidebar/`

**Investigate:**
- Is gender filter in URL params or local state?
- Does changing gender trigger a `refetch()` or just client-side filter?

**Files to modify:**
- `src/lib/queries/products.ts` — ensure gender param is applied server-side
- `src/components/ShopWithSidebar/` — add `useEffect` dependency on gender filter to re-fetch
- Confirm DB values: `men` / `women` / `kids` (lowercase) vs. what's stored

---

## Phase 3 — UI & Layout Bugs (HIGH)

### Issue #4 — Filter Sidebar Overlaps Navbar on Scroll
**Risk:** Low | **Area:** `/components/ShopWithSidebar/`

**Fix:**
```css
/* Sticky sidebar — set top equal to navbar height */
.filter-sidebar {
  position: sticky;
  top: 80px; /* match navbar height */
  z-index: 10; /* must be LOWER than navbar z-index */
}
/* Navbar must remain z-index: 50 */
```

**Files to modify:**
- `src/components/ShopWithSidebar/` — sidebar wrapper class
- `src/components/Header/` — confirm `z-50` is set

---

### Issue #16 — Navbar Layout (Content Behind Navbar)
**Risk:** Low | **Area:** Root layout

**Fix:**
- Confirm `<main>` has `pt-[80px]` or equivalent padding-top matching navbar height
- If background is a fixed `<div>`, set its `z-index: -1`

**Files to modify:**
- `src/app/(site)/layout.tsx` or root layout wrapper

---

## Phase 4 — Multi-Entity Search (HIGH)

### Issue #1 — Search Only Returns Products
**Risk:** Medium | **Area:** Search component + lib

**Approach:** Parallel Supabase queries with result merging + debounce.

**Files to modify / create:**
- `src/lib/queries/search.ts` — **NEW** — multi-entity search function
  ```ts
  export async function multiSearch(query: string) {
    const [products, lookbooks, coupons] = await Promise.all([
      supabase.from('products').select('id,name,slug,price').ilike('name', `%${query}%`).limit(4),
      supabase.from('lookbooks').select('id,title,slug,cover_image').ilike('title', `%${query}%`).limit(3),
      supabase.from('coupons').select('id,code,store_name,discount_percent').ilike('store_name', `%${query}%`).limit(3),
    ])
    return { products: products.data ?? [], lookbooks: lookbooks.data ?? [], coupons: coupons.data ?? [] }
  }
  ```
- `src/components/Header/SearchBar` (or wherever search UI is) — update to render grouped results by type
- Debounce to 300ms (use existing `useDebounce` hook if present, else create one)

---

## Phase 5 — Outfit Tag Counts (MEDIUM)

### Issue #3 — Show Tag Counts on Outfit Filters
**Risk:** Low | **Area:** Outfits page

> ⚠️ **Note:** No `outfits` table found in schema. Must locate the actual data source first (may be `collections` table with a `tag` column, or a custom view).

**Investigation first:**
- Search for "outfits" in `src/` to find the data source
- If it's the `collections` table: query `SELECT tag, COUNT(*) FROM collections GROUP BY tag`

**Files to modify:**
- `src/lib/queries/outfits.ts` — add count aggregation
- Outfits filter component — show `(12)` count next to each tag in muted text

---

## Phase 6 — Global Background System (MEDIUM)

### Issue #15 — Apply Lookbook Background to All Pages Except Homepage
**Risk:** Low | **Area:** Layout

**Approach:**
- Extract lookbook page background CSS into a shared class (e.g., `.page-bg`)
- Apply in root layout, skip on `/` route using `usePathname()`

**Files to modify:**
- `src/app/(site)/layout.tsx` — conditional background class
- `src/app/css/` — add `.page-bg` class

---

## Phase 7-13 — Lookbook System (HIGH / MEDIUM)

> These issues are tightly coupled. Execute in strict order.

### Issue #7 — Lookbook Schema Audit ✅ Done Above
Apply **Migration 1** from the Database Migrations section above.

---

### Issue #8 — Lookbook Creation Flow (3 Steps)
**Risk:** High | **New Feature**

**Files to create:**
```
src/app/(site)/lookbooks/create/
  page.tsx                    ← Step router (client component)
src/components/Lookbook/
  CreateLookbook/
    Step1BasicInfo.tsx        ← name, description, cover image upload
    Step2ProductSelection.tsx ← 5 category slots + product modal
    Step3TagGeneration.tsx    ← auto-tags + color chips
    ProductPickerModal.tsx    ← filter panel + product grid
    StepIndicator.tsx         ← 1-2-3 progress bar
src/lib/queries/lookbooks.ts  ← createLookbook(), addLookbookProduct()
```

**Step 2 product slots:** Top · Pants · Shoes · Accessories · Perfumes
- Each slot has one product max
- Modal pre-filters `products` by `piece_type` column
- Reuse any existing filter panel component from `/ShopWithSidebar/`

---

### Issue #9 — Auto-Tag Generation (Step 3)
**Logic (runs client-side after product selection):**
```ts
const autoTags = [
  ...selectedProducts.flatMap(p => p.styles ?? []),
  ...selectedProducts.flatMap(p => p.tags ?? []),
  ...selectedProducts.map(p => p.material).filter(Boolean),
  ...selectedProducts.map(p => p.brand).filter(Boolean),
]
const autoColors = selectedProducts.flatMap(p => p.colors ?? [])
```
- Render tags as removable chips
- Allow custom tag input (press Enter to add)
- Colors shown as filled color swatches (no hex strings)

---

### Issue #10 — Lookbook Card Hover Behavior
**Risk:** Low | **Area:** `/components/Lookbook/`

**Files to modify:**
- `src/components/Lookbook/LookbookCard.tsx` (or equivalent)
  - On hover: show 2×3 grid of product images from `lookbook_products`
  - Creator avatar + name underneath
  - Style tags as small badges
  - Color dot indicators

Use `group-hover:` Tailwind classes + Framer Motion `AnimatePresence` for smooth entry.

---

### Issue #11 — Add Lookbook to Cart
**Risk:** Low | **Area:** `/components/Lookbook/`

**Files to modify:**
- `src/components/Lookbook/LookbookCard.tsx` — add "Add All to Cart" button
- `src/lib/queries/cart.ts` — batch `addToCart()` call for each product

```ts
async function addLookbookToCart(lookbookId: string, userId: string) {
  const { data: products } = await supabase
    .from('lookbook_products')
    .select('product_id, products(name, stock_status)')
    .eq('lookbook_id', lookbookId)

  const available = products?.filter(p => p.products.stock_status !== 'out_of_stock') ?? []
  const skipped = products?.filter(p => p.products.stock_status === 'out_of_stock') ?? []

  await Promise.all(available.map(p => addToCart(userId, p.product_id)))
  return { added: available.length, skipped: skipped.map(p => p.products.name) }
}
```

Show toast with added items count + skipped items list.

---

### Issue #12 — Lookbook Details Page
**Risk:** Medium | **New Page**

**Files to create:**
```
src/app/(site)/lookbooks/[slug]/page.tsx   ← Server Component, fetch lookbook + products
src/components/Lookbook/
  LookbookDetailHeader.tsx               ← name, creator info, cover image
  LookbookDetailMeta.tsx                 ← tags, mood, colors, materials
  LookbookProductSection.tsx             ← per-category section with Add to Cart
  LookbookProductSlider.tsx              ← mobile horizontal scroll version
```

**Mobile:** Product sections become `overflow-x-auto` with `flex` row. Check if Swiper/Embla is installed — if not, use CSS scroll snap.

---

### Issue #13 — Fork / Modify Architecture
**Risk:** Medium | **Area:** Lookbook system

**Flow:**
1. User clicks "Modify" on any lookbook card
2. Fork is created silently:
   ```ts
   const fork = await supabase.from('lookbooks').insert({
     user_id: currentUser.id,
     title: `${original.title} (My Version)`,
     is_copy: true,
     original_lookbook_id: original.id,
     // copy all other metadata fields
   }).select().single()
   // copy lookbook_products
   await supabase.from('lookbook_products').insert(
     originalProducts.map(p => ({ ...p, lookbook_id: fork.id }))
   )
   ```
3. Redirect to creation flow in edit mode, pre-populated with fork data
4. Show banner: "This is your copy of **[Original]** by **[Creator]**"

**Files to modify:**
- `src/lib/queries/lookbooks.ts` — add `forkLookbook()` function
- `src/components/Lookbook/LookbookCard.tsx` — Modify button triggers fork
- `src/app/(site)/lookbooks/create/page.tsx` — accept `?fork=<id>` param for pre-population

---

## Phase 14-15 — Mobile Navigation (HIGH)

### Issue #18 — Mobile Navbar Redesign
**Risk:** Medium | **Area:** `/components/Header/`

**New layout:**

| Left | Center | Right |
|---|---|---|
| 🔍 Search · ☰ Menu | Logo | 🛒 Cart · ♡ Wishlist · ✦ Style Hub |

**Files to modify:**
- `src/components/Header/` — find mobile nav component
- Create `MobileSearchModal.tsx` — full-screen modal with input + live multi-entity results (reuses Issue #1 logic)
- Search modal: dismissible via swipe down or ✕ button

---

### Issue #19 — Mobile Slider Menu Redesign
**Risk:** Medium | **Area:** `/components/Header/`

**New structure:**
```
─── SECTION 1: Main Navigation ────────
Home · Shop · Outfits · Lookbooks · Deals · Coupons

─── SECTION 2: Discover ────────────────
New Arrivals · Trending · Style Hub · Collections

─── SECTION 3: Help ────────────────────
About · Contact · FAQ

─── BOTTOM (pinned) ────────────────────
[If logged in] Avatar + Name + Profile button
[If logged out] Sign In · Sign Up buttons
```

**Fix animation bugs:** Use `AnimatePresence` with `opacity: 0→1` transition *after* panel slides open (`onAnimationComplete` callback to render items). Ensure `z-index: 100` on the menu overlay.

**Files to modify:**
- `src/components/Header/SliderMenu.tsx` (or equivalent) — full redesign
- Auth state: read from existing Redux/Context auth slice

---

## Phase 16 — Profile Page Redesign (MEDIUM)

### Issue #20 — Profile Page Redesign
**Risk:** Low

**Changes:**
- ❌ REMOVE: Address section, Orders section
- ✅ ADD: "Recently Viewed" — query `product_views` WHERE `user_id = auth.uid`, ORDER BY `viewed_at DESC`, LIMIT 10

```ts
// Recently viewed using existing product_views table
const { data } = await supabase
  .from('product_views')
  .select('viewed_at, products(id, name, slug, price, discounted_price)')
  .eq('user_id', userId)
  .order('viewed_at', { ascending: false })
  .limit(10)
```

- Render as horizontal scroll row on profile page
- Track views: call `product_views.insert()` on every `/shop/[slug]` page visit

**Files to modify:**
- `src/components/MyAccount/` — remove address/orders tabs, add Recently Viewed section
- `src/app/(site)/shop/[slug]/page.tsx` — insert view event on page load (server action or API route)
- `src/lib/queries/profile.ts` — add `getRecentlyViewed()` function

---

## Phase 17 — User-Generated Coupons (LOW)

### Issue #17 — User Coupon Creation
**Risk:** Low | Requires **Migration 2** (see above)

**Form fields:**
- Code (auto-generate UUID short code, allow custom override)
- Discount type: `percentage` | `fixed`
- Discount value
- Min order value (optional)
- Expiry date (optional)
- Usage limit (optional)

**Files to create:**
```
src/components/Coupons/
  CreateCouponForm.tsx        ← React Hook Form + Zod validation
  MyCouponsList.tsx           ← shows user's created coupons with copy button
src/lib/queries/coupons.ts    ← createUserCoupon(), getUserCoupons()
src/app/api/coupons/create/route.ts ← POST endpoint with auth check + validation
```

**UI Entry Point:** Add "Create Coupon" button in profile page or Style Hub page.

---

## Verification Plan

### Automated Checks
```bash
# Run TypeScript type check
cd "c:\Users\seefq\OneDrive\سطح المكتب\fitova"
npx tsc --noEmit

# Run linting
npx eslint src/ --ext .ts,.tsx
```

### Manual Browser Verification (Per Phase)

| Phase | Test Steps |
|---|---|
| #5 Cart | Open DevTools Console → load Cart page → confirm zero errors |
| #6 Wishlist | Log in as user A, add 2 products to wishlist, refresh → only those 2 items should appear |
| #2 Products | Open Shop page → products appear within 2s → no empty flash |
| #14 Gender Filter | Click Men / Women / Kids → product list updates each time |
| #4 Sidebar | Scroll down on Shop with sidebar → sidebar stops below navbar, never overlaps |
| #1 Search | Type "jacket" in search → results show Products section + Deals section |
| #8 Lookbook Create | Click Create Lookbook → 3 steps flow works, data saves to Supabase |
| #12 Lookbook Detail | Open a lookbook → all 5 category sections render + Add to Cart works |
| #13 Fork | Click Modify on another user's lookbook → fork created, edit flow opens pre-populated |
| #18 Mobile Nav | On 375px viewport → search modal opens, all icons visible |
| #19 Slider Menu | Open mobile menu → all 3 sections visible, no overlapping text |
| #20 Profile | Profile loads with Recently Viewed row, no Address/Orders tabs |
| #17 Coupon | Create Coupon form submits → appears in My Coupons section |

---

## Risk Summary

| Risk | Issues | Mitigation |
|---|---|---|
| 🔴 High | #8 (Lookbook creation flow), #12 (Details page) | Large new feature — build incrementally, test each step |
| 🟠 Medium | #1 (Multi-search), #13 (Fork), #18 (Mobile nav) | Requires careful state management, reuse existing patterns |
| 🟡 Low | #2, #3, #4, #5, #6, #9, #10, #11, #14, #15, #16, #17, #19, #20 | Targeted fixes, low blast radius |

---

*FITOVA v10 — Implementation Plan · Generated 2026-03-06*
