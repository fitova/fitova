# FITOVA V8 — Full Technical Plan

> **PLANNING ONLY** — No implementation code. Each task includes: Problem Breakdown, Root Cause, UI Plan, UX Logic, DB Impact, API Impact, Edge Cases, Responsive Behavior, Performance.

---

## 📋 DB Summary (Current State)

| Table | Key Fields | Relevance |
|-------|-----------|-----------|
| `products` | `id, name, slug, gender, piece_type, category_id, colors, tags, styles, price, discounted_price, brand, material, size, is_featured, is_deal, is_bestseller, is_new_arrival, is_trending` | Core product data |
| `categories` | `id, name, slug, parent_id, piece_type, gender[], image_url, sort_order` | Hierarchical: parents = Men/Women/Kids, children = subcategories |
| `category_images` | `id, gender_id, image_url, alt_text, sort_order` | MegaMenu slider images per gender |
| `genders` | `id, name, slug` | Gender lookup table |
| `product_images` | `id, product_id, url, type, sort_order` | Product gallery images |
| `cart_items` | `id, user_id, product_id, quantity, size, color` | Server-side cart |
| `wishlist` | `id, user_id, item_id, item_type, product_id, collection_id` | Wishlist (product + lookbook) |
| `coupons` | `id, store_name, code, discount_percent, image_url` | Coupon search target |
| `collections` / `lookbooks` | Various | Lookbook search target |

### Key Existing Patterns
- **Queries layer**: `src/lib/queries/*.ts` — all Supabase calls go here.
- **Hooks**: `src/hooks/useShopFilters.ts` — reads URL params (`?gender=&category=&style=`) and fetches products.
- **Redux slices**: `cart-slice.ts`, `wishlist-slice.ts`, `quickView-slice.ts`, `product-details.ts`.
- **Components**: `MegaMenu.tsx` groups children by `piece_type` into Clothing/Footwear/Accessories/Fragrances columns using `groupChildren()` + `CategoryColumn`.
- **Product Pages**: `/products/[slug]/page.tsx` + `ProductDetailsClient.tsx`.
- **Shop/Outfits**: `ShopWithSidebar` uses `useShopFilters` → `getProducts()`.

---

---

# 🏠 SECTION 1 — HOMEPAGE NAVBAR & HERO

---

## TASK 1 — Fix Non-Clickable Category Items

### Problem Breakdown
In the MegaMenu, when hovering Men/Women/Kids, the group headers (Clothing, Footwear, Accessories, Fragrances) are plain `<p>` or `<span>` text inside `CategoryColumn`. They must become clickable links redirecting to `/outfits` with correct filter params.

### Root Cause
`CategoryColumn` in `MegaMenu.tsx` renders the `label` prop as a non-interactive heading (`<p className="...">{label}</p>`). No `<Link>` wrapper or click handler exists for these group headers.

### UI Plan
- Wrap each group header (Clothing, Footwear, Accessories, Fragrances) in a `<Link>` component.
- Link target: `/outfits?gender={genderSlug}&piece_type={groupKey}`
- Style: underline on hover, cursor pointer, same font weight but add hover color transition.
- Add a subtle right arrow icon (→) on hover to indicate clickability.

### UX Logic
- **URL param structure**: `/outfits?gender=men&piece_type=clothing`
  - `gender` = the parent category slug (men/women/kids)
  - `piece_type` = the group key (clothing/footwear/accessories/fragrances)
- Clicking "Clothing" under "Men" → `/outfits?gender=men&piece_type=clothing`
- Clicking "Fragrances" under "Women" → `/outfits?gender=women&piece_type=fragrances`
- MegaMenu should close after click (`onClose()` callback).

### DB Impact
- ✅ **No schema changes needed.** The `products` table already has `gender` and `piece_type` fields.
- ✅ The `categories.piece_type` field exists and `MegaMenu.tsx` already infers piece_type via `inferType()` + `SLUG_TO_TYPE` mapping.
- ⚠️ Need to validate that `piece_type` values in `products` match the grouping keys used in MegaMenu (`clothing`, `footwear`, `accessories`, `fragrances`). The `groupChildren()` function uses a `TYPE_TO_GROUP` mapping — the outfits page filter must use the same mapping.

### API Impact
- **Modify `useShopFilters`**: Add `piece_type` to `ShopFilters` interface and `readInitialFilters()`.
- **Modify `getProducts()`**: Add `pieceType` filter → `.eq("piece_type", pieceType)` or filter by categories that match the piece_type group.
- Since `piece_type` in products is granular (e.g., "jacket", "t-shirt", "pants") but the MegaMenu groups are aggregate ("clothing"), we need to filter by the **group** — meaning we filter where `piece_type IN [all piece_types belonging to "clothing"]`.
- **Better approach**: Use the `categories` table. Filter products where `category_id` belongs to categories whose `piece_type` maps to the clicked group. This requires a two-step query or a Supabase RPC.

### Edge Cases
- Filter returns empty → Show "No products found" state with suggestion to browse all.
- Invalid URL params → Fall back to showing all products (ignore invalid param).
- `piece_type` is null for some categories → Already handled by `inferType()` in MegaMenu, but the outfits page also needs a similar mapping.
- Kids + Fragrances → Shouldn't exist per prompt; defensively hide if no results.

### Responsive Behavior
- On mobile, MegaMenu renders differently (likely a drawer/accordion). The group headers should still be clickable links in mobile view.
- Touch targets must be ≥44px height.

### Performance
- No extra API calls — filter is applied at the existing `getProducts()` call via URL params.
- SEO: Links are real `<Link>` elements with semantic `href`, so crawlable.

---

## TASK 2 — Hover Image Switching per Subcategory

### Problem Breakdown
When hovering over the group headers (Clothing, Footwear, Accessories, Fragrances) inside the MegaMenu, the sidebar image(s) should dynamically switch to show images relevant to the hovered group.

### Root Cause
Currently `NavSlider` in `MegaMenu.tsx` shows images from `category_images` table filtered by `gender_id`. There's no distinction per piece_type/group — all images for a gender are shown regardless of which group is hovered.

### UI Plan
- Add `onGroupHover` state to track which group header is being hovered.
- Default state: show all images for the gender (current behavior).
- On hover: filter `NavSlider` images to only show those matching the hovered group.
- Transition: crossfade or slide animation (300ms ease) when switching image set.

### UX Logic
- Hover on "Clothing" → show clothing-relevant images.
- Hover on "Footwear" → show footwear images.
- Mouse leaves group header → revert to default (all images) or persist last hovered.
- Debounce hover: 150ms to prevent flickering when moving between items quickly.

### DB Impact
- ⚠️ **Schema change needed**: `category_images` currently only has `gender_id`. Need to add a `piece_type_group` column (or `group_key` varchar) to tag each image with its group (clothing/footwear/accessories/fragrances).
  ```sql
  ALTER TABLE category_images ADD COLUMN piece_type_group varchar DEFAULT NULL;
  ```
- Alternative (no schema change): Use a naming convention in `image_url` or `alt_text` to encode the group. Less clean but avoids migration.
- **Recommended**: Add the column. It's simple and explicit.

### API Impact
- **Modify `getCategoryImages()`**: Return the `piece_type_group` field in the select.
- **Update `CategoryImage` type**: Add `piece_type_group: string | null`.
- No new endpoints needed — filtering happens client-side from the already-fetched images array.

### Edge Cases
- A group has no images → Fall back to showing all images for the gender.
- Images not yet tagged with `piece_type_group` → Show all (backward compatible default).
- Rapid hover between groups → Debounce prevents stutter.

### Responsive Behavior
- On mobile, the image slider is typically hidden (MegaMenu is a drawer). No hover behavior needed.
- If tablet shows images: use tap-to-switch instead of hover.

### Performance
- Images are already fetched in bulk. Filtering is client-side array filter — negligible cost.
- **Preload**: Consider `<link rel="preload">` for all group images when MegaMenu opens.
- **Lazy load**: Not needed since MegaMenu images are above the fold when open.

---

## TASK 3 — "This Week" Section Layout Consistency

### Problem Breakdown
The "This Week" section on the homepage must include category images and use the same layout system as other homepage sections (like Categories, BestSeller, etc.).

### Root Cause
`src/components/Home/ThisWeek/` uses a different layout structure that doesn't include category-linked images like the Categories section does.

### UI Plan
- Adopt the same card-based layout used by `Categories` component.
- Each card: category image + title overlay + link to filtered `/outfits` page.
- Grid: 3–4 columns on desktop, 2 on tablet, 1–2 on mobile.
- Cards should have hover zoom effect on image + title underline animation.

### UX Logic
- Cards link to `/outfits?gender={gender}&piece_type={group}` or specific category.
- Content driven by DB — admin can change which categories appear in "This Week".
- Reuse a shared `CategoryCard` component if one exists, or create one.

### DB Impact
- ✅ `homepage_sections` table exists with `section_identifier` and `content` (JSON). "This Week" content can store category references.
- ✅ `categories.image_url` exists — images can come from here.
- ⚠️ Verify that categories referenced by "This Week" have `image_url` populated. If not, use `category_images` table or require admin to upload.

### API Impact
- May need a query to fetch "This Week" section config from `homepage_sections` where `section_identifier = 'this-week'`.
- Parse the JSON `content` field to get category IDs → fetch those categories with images.
- Or simplify: just fetch featured categories directly.

### Edge Cases
- No categories marked for "This Week" → show empty state or hide section.
- Category image missing → show placeholder/gradient with text.
- Section disabled (`is_active = false`) → don't render.

### Responsive Behavior
- Desktop: 3–4 columns grid.
- Tablet (768px): 2 columns.
- Mobile (< 640px): full-width stacked or 2-column compact.
- Images maintain aspect ratio via `object-cover`.

### Performance
- Use Next.js `<Image>` with `sizes` and `priority` for above-fold images.
- Limit to 4–6 category cards max.

---

## TASK 4 — Navbar Visual Enhancement

### Problem Breakdown
Improve navbar typography, icons, spacing. Add transparency over hero video with solid background on scroll.

### Root Cause
Current `Header/index.tsx` has a `handleStickyMenu` that adds a sticky class on scroll, but the visual treatment (typography, icons, transparency) needs refinement.

### UI Plan
- **Typography**: Use premium font (already using custom fonts via `src/app/fonts/`). Standardize to consistent weight/size for nav items. Likely Inter or Montserrat for clean fashion look.
- **Icons**: Replace generic icons with premium icon library (Lucide or Phosphor Icons). Ensure consistent stroke width and sizing.
- **Spacing**: Audit padding/margins across all nav items. Use consistent spacing scale (8px base).
- **Transparency**: Default state → `bg-transparent` with white text + light text-shadow for readability over hero video.
- **Solid on scroll**: On scroll past hero → transition to `bg-black/95 backdrop-blur-md` with smooth 300ms transition.

### UX Logic
- Scroll listener via `handleStickyMenu()` — already exists, needs CSS class updates.
- Transition: CSS `transition: background-color 0.3s ease, backdrop-filter 0.3s ease`.
- Text color: white on transparent, stays white on dark solid background (or switches if light bg).

### DB Impact
- ✅ **No DB changes.**

### API Impact
- ✅ **No API changes.**

### Edge Cases
- User scrolls up to top → navbar returns to transparent.
- Hero video not loaded yet → ensure nav is still readable (add subtle dark overlay on nav or use text-shadow).
- Page has no hero video (e.g., /outfits) → navbar should always be solid.
- Very fast scrolling → use `requestAnimationFrame` or throttle to prevent jank.

### Responsive Behavior
- Mobile navbar (hamburger menu) doesn't need transparency — always solid background.
- Tablet: same behavior as desktop if hero is visible.
- Logo and icons scale appropriately.

### Performance
- Use CSS transitions instead of JS animations.
- `backdrop-filter: blur()` is GPU accelerated — minimal perf impact.
- Avoid re-rendering React component on every scroll pixel — use CSS classes only.

---

---

# 🔍 SECTION 2 — GLOBAL SEARCH SYSTEM

---

## TASK 5 — Smart Global Live Search

### Problem Breakdown
Implement live search across all content types (men, lookbook, coupons, all sections) with grouped results showing image, price, brand tag, and item type tag.

### Root Cause
No global search system exists currently. The `search` param in `useShopFilters` only searches product names via `ilike`.

### UI Plan
- **Search input**: In navbar, expand on click/focus to full-width overlay or dropdown.
- **Live dropdown**: Shows results grouped by type with section headers:
  - 🏷 **Products** — image thumb, name, price, brand badge, piece_type badge.
  - 📚 **Lookbooks** — cover image, title.
  - 🎟 **Coupons** — store logo, code, discount badge.
- Max 3–5 results per group in dropdown, with "See all" link per group.
- Typing triggers search after debounce (no need to press icon).
- Clicking the search icon → navigates to `/search?q={query}` (Full Search Page — Task 7).

### UX Logic
- **Debounce**: 300ms after last keystroke.
- **Minimum query length**: 2 characters before triggering search.
- **Keyboard navigation**: Arrow keys to move between results, Enter to select.
- **ESC**: Close dropdown.
- **Click outside**: Close dropdown.
- **Empty state**: "No results found for '{query}'"
- **Loading state**: Skeleton shimmer in dropdown.

### DB Impact
- ⚠️ **Indexing**: Ensure `products.name` has a text search index. Supabase supports `pg_trgm` (already has `show_trgm` function in DB).
  ```sql
  CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
  CREATE INDEX IF NOT EXISTS idx_collections_name_trgm ON collections USING gin (name gin_trgm_ops);
  CREATE INDEX IF NOT EXISTS idx_coupons_store_trgm ON coupons USING gin (store_name gin_trgm_ops);
  ```
- Alternatively, use Supabase `ilike` with `%query%` for simplicity (works fine for small datasets).

### API Impact
- **New query**: `src/lib/queries/search.ts`
  ```
  globalSearch(query: string): Promise<{ products: Product[], lookbooks: Collection[], coupons: Coupon[] }>
  ```
- Makes 3 parallel Supabase calls:
  1. `products` — `ilike("name", '%query%')` + select image, price, brand, piece_type. Limit 5.
  2. `collections` — `ilike("name", '%query%')` + select cover_image, title. Limit 5.
  3. `coupons` — `ilike("store_name", '%query%')` OR `ilike("code", '%query%')`. Limit 5.
- Returns grouped results.

### Edge Cases
- Query with special characters → sanitize/escape `%` and `_` in ilike.
- Very long query → truncate to 100 chars.
- API error on one group → still show results from other groups.
- No results in any group → show global empty state.
- User navigates away mid-search → abort pending requests (AbortController).

### Responsive Behavior
- Desktop: dropdown below search input, max-width 600px.
- Mobile: full-screen search overlay with results below input.
- Touch: tap to select result.

### Performance
- Debounce 300ms prevents excessive API calls.
- Parallel queries (Promise.all) minimize latency.
- Result limit (5 per group) keeps payload small.
- Consider caching recent searches in sessionStorage.

---

## TASK 6 — Dynamic "All Categories" System

### Problem Breakdown
The "All Categories" display must auto-update when the DB updates and match the navbar categories.

### Root Cause
If categories are hardcoded or fetched at build time, they won't update when admin adds/removes categories.

### UI Plan
- All Categories section fetches from `categories` table dynamically.
- Display as a grid of category cards with images.
- Must visually match MegaMenu categories (same grouping/naming).

### UX Logic
- Use the same `getCategoryHierarchy()` query that MegaMenu uses → single source of truth.
- Categories rendered in `sort_order`.
- Clicking a category → `/outfits?category={slug}` or `/outfits?gender={gender}&piece_type={group}`.

### DB Impact
- ✅ **No schema changes.** Existing `categories` table already supports this.
- Admin adds/removes categories via the admin panel → reflected immediately.

### API Impact
- ✅ Reuse `getCategoryHierarchy()` from `src/lib/queries/categories.ts`.
- Consider adding a server-side cache (revalidate every 5 minutes) via Next.js `unstable_cache` or `revalidate` on the page.

### Edge Cases
- No categories in DB → show empty state.
- Category without image → show placeholder.
- Very many categories → paginate or scroll horizontal.

### Responsive Behavior
- Desktop: 4–6 column grid.
- Tablet: 3 columns.
- Mobile: 2 columns or horizontal scroll.

### Performance
- Cache category hierarchy query (SWR or React Query `staleTime: 5min`).
- Avoid re-fetching on every page navigation.

---

## TASK 7 — Full Search Page

### Problem Breakdown
Dedicated `/search` page showing full grouped results with filters and URL query sync.

### Root Cause
No `/search` route exists currently.

### UI Plan
- **Route**: `/search?q={query}` or `/(site)/(pages)/search/page.tsx`.
- **Layout**: Search input at top (pre-filled with `q` param) + results below.
- **Groups**: Products, Lookbooks, Coupons — each in their own section with count badge.
- **Filters**: Sidebar with gender, price range, category (same as outfits page).
- **Pagination**: Infinite scroll or "Load More" per group.

### UX Logic
- URL synced: changing query updates `?q=` param via `router.push`.
- Filters also update URL: `?q=jacket&gender=men&minPrice=50`.
- Back button preserves search state.
- Results show product cards (reuse `ProductGridCard`).

### DB Impact
- ✅ No schema changes.

### API Impact
- **Extend `globalSearch()`** from Task 5 to accept pagination (offset/limit) and filter params.
- Or reuse `getProducts()` with `search` param for the Products section, plus separate queries for lookbooks and coupons.

### Edge Cases
- Empty query → show "Enter a search term" prompt.
- No results → show "No products match your search" with clear search button.
- Direct URL access with `?q=` → works via SSR or CSR depending on implementation.

### Responsive Behavior
- Desktop: sidebar filters + main content.
- Mobile: filters in collapsible drawer/sheet.
- Search input full-width on mobile.

### Performance
- Server-side initial load for SEO.
- Client-side pagination for subsequent loads.
- Debounce search input (300ms).

---

---

# 👕 SECTION 3 — OUTFITS PAGE

---

## TASK 8 — Filter System Redesign

### Problem Breakdown
- Category filter needs deeper breakdown: Clothing → Jackets, T-shirts, etc.
- Fragrances excluded for Kids.
- Price filter design inconsistent.
- Product count per filter missing.
- Filter sidebar overlaps navbar on scroll.

### Root Cause
- `HierarchicalShopFilters.tsx` exists but may not group by piece_type groups properly.
- No count aggregation per filter value.
- Sticky sidebar CSS conflicts with navbar z-index.

### UI Plan
- **Hierarchical filter**: 
  - Level 1: Clothing / Footwear / Accessories / Fragrances (accordion)
  - Level 2: Subcategories under each (checkboxes with count badges)
  - e.g., Clothing → Jackets (12) / T-Shirts (8) / Pants (15)
- **Price filter**: Replace with dual-handle range slider (consistent with site design). Show min/max labels.
- **Count badges**: Each filter value shows `(N)` count dynamically.
- **Sidebar**: `position: sticky; top: navbar-height` to avoid overlap. `z-index` below navbar.

### UX Logic
- Selecting a group (e.g., "Clothing") selects all subcategories within.
- Deselecting individual subcategories within a group is possible.
- Counts update reactively based on current filters (cross-filtering).
- For Kids: hide Fragrances group entirely.

### DB Impact
- ✅ `categories.piece_type` already maps subcats to groups.
- ⚠️ For accurate counts, need a Supabase RPC or client-side aggregation:
  ```sql
  -- Option A: Client-side — fetch all products matching base filters, count per category.
  -- Option B: RPC — get_filter_counts(gender, piece_type_group) returns counts.
  ```
- **Recommended**: Client-side count from the fetched product set (simpler, no DB changes).

### API Impact
- **Modify `getProducts()`**: Support array of category IDs (`category_ids: string[]`) for multi-select.
- Or filter by `piece_type IN [...]` for group-level filtering.
- Add count computation: after fetching products with base filters, group by category_id/piece_type to compute counts.

### Edge Cases
- All filters cleared → show all products.
- Count is 0 → show "(0)" and optionally grey out the filter.
- Mobile filter drawer → must close on "Apply" and show active filter count badge on trigger button.

### Responsive Behavior
- Desktop: fixed sidebar (280px) + scrollable product grid.
- Mobile: bottom sheet or slide-in drawer for filters.
- Sticky top offset = navbar height (~64px desktop, ~56px mobile).

### Performance
- Counts computed client-side from already-fetched data — no extra API call.
- Debounce filter changes (200ms) to avoid re-fetching on every click.
- Use `useMemo` for count computations.

---

---

# 🛍 SECTION 4 — PRODUCT CARDS

---

## TASK 9 — Grid View Improvements

### Problem Breakdown
Keep existing image animations but fix button styles and add metadata tags (gender, item type, main color) under the brand name.

### Root Cause
`ProductGridCard.tsx` and `SingleGridItem.tsx` display price and brand but don't show gender, piece_type, or color tags.

### UI Plan
- Below brand name, add a single line of tags:
  - Gender badge (e.g., "Men") — subtle, capsule-shaped.
  - Item type badge (e.g., "Jacket") — from `piece_type`.
  - Main color dot/badge (e.g., "🔵 Blue") — from `colors[0]`.
- All on one line, separated by small dots (·) or spacing.
- Buttons: adopt site theme (black/dark) with hover state matching site palette.
- Keep image hover animation (currently working).

### UX Logic
- Tags sourced from product DB fields: `gender`, `piece_type`, `colors[0]`.
- Tag priority (if space limited): Gender > Type > Color.
- Overflow handling: truncate with ellipsis if line is too long.

### DB Impact
- ✅ **No schema changes.** `products.gender`, `products.piece_type`, `products.colors` already exist.
- ⚠️ Validate that `piece_type` and `gender` are populated for all products. If null, don't render that tag.

### API Impact
- ✅ **No API changes.** These fields are already included in `getProducts()` select (`*`).

### Edge Cases
- `gender` is null → skip gender tag.
- `piece_type` is null → skip type tag.
- `colors` is null or empty → skip color badge.
- Very long `piece_type` (e.g., "long-sleeve-shirt") → use display name mapping (e.g., "L/S Shirt").
- All tags null → just show brand name, no tags line.

### Responsive Behavior
- Tags font-size: 11px on mobile, 12px on desktop.
- On narrow cards (mobile 2-col), tags may wrap to max 2 lines.
- Color dot: fixed 10px circle, doesn't wrap.

### Performance
- Pure render change — no extra fetches.
- Use `useMemo` for tag formatting if needed.

---

## TASK 10 — List View Improvements

### Problem Breakdown
Add image animation (same as grid view), fix fonts/buttons, and use real DB tags instead of static text. Show all tags on one line + main color + spacing + secondary colors.

### Root Cause
`ProductFullWidthCard.tsx` / `SingleListItem.tsx` uses static dummy tags instead of real product data.

### UI Plan
- **Image animation**: Port the hover image switch animation from grid view (show second image on hover from `product_images`).
- **Tags line**: Same as grid view — gender, piece_type, main color — but more room on list view so show more:
  - Gender | Piece Type | Main Color dot | Secondary color dots
- **Fonts**: Match grid view typography (same font family, consistent sizing).
- **Buttons**: Same style as grid (dark theme, consistent sizing).

### UX Logic
- Tags are real: pulled from `product.gender`, `product.piece_type`, `product.colors[]`.
- Colors shown as small filled circles (main = larger, secondary = smaller).
- Spacing between elements: 8px.

### DB Impact
- ✅ **No schema changes.**

### API Impact
- ✅ **No API changes.** Data already available.

### Edge Cases
- Product has only 1 image → no hover switch, just static image.
- No colors → skip color dots section.
- Very many secondary colors → cap at 3 dots + "+N" indicator.

### Responsive Behavior
- List view typically not used on mobile (grid is default).
- If shown on mobile: image + info stacked vertically vs side-by-side.
- Tags may need to be on separate line on small screens.

### Performance
- Image animation: preload second image on hover via `onMouseEnter`.
- Color dots: pure CSS, no performance concern.

---

---

# 👁 SECTION 5 — PRODUCT VIEW SYSTEM

---

## TASK 11 — Quick View Redesign

### Problem Breakdown
Quick View modal doesn't match site style, needs full redesign. Clicking the product image inside Quick View should navigate to the full product page.

### Root Cause
`quickView-slice.ts` stores the selected product for modal display. The modal component likely uses basic styling that doesn't match the premium site aesthetic.

### UI Plan
- **Modal redesign**:
  - Dark theme / glassmorphism modal overlay (`backdrop-blur-lg bg-black/40`).
  - Left side: product image (main) with image gallery dots below. Clicking image → navigate to `/products/{slug}`.
  - Right side: product name, brand, price (discounted with strikethrough), tags, size selector, color selector, Add to Cart + Wishlist buttons.
  - Close button (X) top-right, premium icon.
- **Animation**: Modal slides up + fades in (300ms). Backdrop fades in.
- **Image click**: `router.push(\`/products/${product.slug}\`)` and close modal.

### UX Logic
- Open trigger: "Quick View" button on product card hover (existing).
- State: managed by `quickView-slice.ts` Redux store.
- Body scroll locked when modal open.
- ESC key closes modal.
- Click outside modal closes it.

### DB Impact
- ✅ **No schema changes.**

### API Impact
- ✅ **No API changes.** Product data is already loaded from the product card.

### Edge Cases
- Product has no images → show placeholder.
- Product out of stock → disable Add to Cart, show "Out of Stock" badge.
- Rapid open/close → ensure animations don't conflict (use `AnimatePresence`).
- Deep link: Quick View is not URL-based (it's a modal overlay), so no deep linking needed.

### Responsive Behavior
- Mobile: Full-screen modal (bottom sheet style) instead of centered modal.
- Scrollable content on mobile if product info is long.
- Image gallery: horizontal swipe on mobile instead of dots.

### Performance
- Modal component lazy-loaded (`React.lazy` or dynamic import).
- Product images already in cache from card view.
- Background blur is GPU accelerated.

### Accessibility
- Focus trap inside modal.
- `aria-modal="true"`, `role="dialog"`.
- Close button has `aria-label="Close"`.
- Return focus to trigger element on close.

---

## TASK 12 — Full Product Page Fix

### Problem Breakdown
Product pages show "Page Not Found" error. Routing issue. Clicking product image should navigate here.

### Root Cause
Route exists at `src/app/(site)/products/[slug]/page.tsx` with `ProductDetailsClient.tsx`. The 404 error could be caused by:
1. `getProductBySlug()` failing due to incorrect slug.
2. Route not matching because of layout group nesting.
3. Missing `generateStaticParams` for static generation (if using SSG).
4. Slug mismatch between the link URL and the actual slug in DB.

### UI Plan
- Ensure clicking product image (from grid, list, or Quick View) navigates to `/products/{slug}`.
- Product page renders fully with images, details, reviews, related products.
- If product not found → custom 404 with "Product not found" message and back link.

### UX Logic
- Product cards currently link to `/shop-details?slug={slug}` — need to verify and possibly redirect to `/products/{slug}`.
- OR: product cards may have `/products/{slug}` links but the route doesn't resolve.
- Need to audit all product link targets across the app.

### DB Impact
- ✅ **No schema changes.** `products.slug` exists and is unique.
- ⚠️ Verify: are all products' `slug` values URL-safe? No special characters?

### API Impact
- ✅ `getProductBySlug()` exists and works — verify error handling.
- Add `try/catch` with proper 404 redirect in the page component.

### Edge Cases
- Product is hidden (`is_hidden = true`) → return 404 or "unavailable" page.
- Slug has special characters → URL encode/decode properly.
- Direct URL access → must work (SSR/SSG).
- Product deleted after link was shared → 404 with helpful message.

### Responsive Behavior
- Product page already exists — ensure it's responsive.
- Image gallery: swipe on mobile.
- Info section: stacked below images on mobile.

### Performance
- Use `generateMetadata()` for SEO (title, description, OG image).
- Images: use Next.js `<Image>` with proper `sizes`.
- Related products: lazy load below fold.

---

## TASK 13 — Cart & Wishlist State Logic

### Problem Breakdown
Cart and Wishlist buttons must toggle (filled/outlined), persist after refresh, persist after logout/login, and sync with DB.

### Root Cause
- `wishlist-slice.ts` and `cart-slice.ts` manage state in Redux.
- Currently, wishlist sync with Supabase exists (`addToWishlist`, `removeFromWishlist` in `wishlist.ts`) but the UI state may not rehydrate on page load.
- Cart state from `cart_items` table may not be fetched on login.

### UI Plan
- **Wishlist heart icon**: Outlined (♡) when not in wishlist, Filled (❤️) when wishlisted. Toggle on click.
- **Cart button**: Similar toggle — "Add to Cart" becomes "In Cart ✓" when item is in cart.
- Animations: heart fills with scale bounce (200ms). Cart shows checkmark transition.
- Consistent across QuickView, product cards, product page.

### UX Logic
- **On page load / login**:
  1. Fetch user's wishlist IDs from Supabase → update Redux store.
  2. Fetch user's cart items from Supabase → update Redux store.
- **On toggle**:
  1. Optimistic UI: immediately toggle Redux state.
  2. Call Supabase API in background.
  3. On error: revert Redux state + show toast error.
- **On logout**:
  1. Clear Redux wishlish/cart state.
  2. Optionally persist guest cart in localStorage.
- **On login**:
  1. Merge localStorage guest cart with server cart (if applicable).
  2. Fetch fresh state from DB.

### DB Impact
- ✅ `cart_items` and `wishlist` tables already exist with proper schema.
- ✅ Relationships are correct (user_id, product_id FKs).

### API Impact
- ✅ Wishlist queries exist (`getWishlist`, `addToWishlist`, `removeFromWishlist`, `isWishlisted`).
- ⚠️ **Need cart queries**: `src/lib/queries/cart.ts` should exist or be created:
  - `getCartItems(userId)` — fetch all cart items for user.
  - `addToCart(userId, productId, quantity, size, color)`.
  - `removeFromCart(itemId)`.
  - `updateCartQuantity(itemId, quantity)`.
- ⚠️ Need a **bulk wishlist check**: Instead of calling `isWishlisted` per product, fetch all wishlist item_ids once and check client-side.

### Edge Cases
- User not logged in → show heart outline, on click prompt login.
- Duplicate add → upsert handles this (no duplicate rows).
- Network error on toggle → revert optimistic update, show error toast.
- Product deleted but still in wishlist → handle gracefully (filter out on fetch).
- Concurrent tabs → may get out of sync (acceptable, refresh resolves).

### Responsive Behavior
- Heart icon: same size across views (24px).
- Cart button: full-width on mobile product page, inline on desktop.
- Toast notifications for success/error: bottom-right desktop, bottom-center mobile.

### Performance
- Bulk wishlist fetch on auth state change (once per session).
- Optimistic updates = instant UI response.
- Redux state persists during session (no re-fetch per page).

---

## TASK 14 — Product Rendering Issue

### Problem Breakdown
After clicking a product and going back, the product list disappears.

### Root Cause Analysis
Likely causes:
1. **State reset**: Products are stored in `useShopFilters` local state. When navigating to product page and back, the component remounts and state resets. The `useEffect` refetches but during loading, the list is empty.
2. **Missing caching**: No React Query / SWR caching — every mount triggers a fresh fetch.
3. **Scroll restoration**: Browser may not restore scroll position, making it appear products disappeared.
4. **Filter state loss**: URL params may be lost on navigation, causing filters to reset to defaults → different product set.

### UI Plan
- Products should instantly appear when navigating back (no loading flicker).
- Scroll position should restore.
- Filters should persist.

### UX Logic
- **Solution 1**: Use React Query / TanStack Query for product fetching with `staleTime: 5min`. Cached data shows instantly on back navigation.
- **Solution 2**: Use `router.push` with `scroll: false` for product links and leverage Next.js client-side cache.
- **Solution 3**: Store fetched products in a context or Redux slice that survives navigation.

### DB Impact
- ✅ **No schema changes.**

### API Impact
- ✅ **No new API endpoints.** This is a client-side caching/state management fix.
- May refactor `useShopFilters` to use TanStack Query's `useQuery` instead of raw `useEffect` + `useState`.

### Edge Cases
- Stale data: if products were updated while user was on product page → risk showing outdated list. TanStack Query handles this with background refetch.
- Deep navigation (product → related → back → back → back) → each level should restore correctly.
- Memory pressure from caching too many product lists → limit cache size.

### Responsive Behavior
- No responsive-specific changes (this is a state management fix).

### Performance
- TanStack Query integration gives:
  - Automatic caching.
  - Background refetching.
  - Stale-while-revalidate.
  - Deduplication of concurrent queries.
- React Query is already in the stack (mentioned in frontend rules + `src/lib/react-query.tsx` exists).

---

---

# 📊 Summary of DB Changes Needed

| Task | DB Change | Description |
|------|-----------|-------------|
| T1 | None | Products already have `gender` + `piece_type` |
| T2 | ⚠️ ADD COLUMN | `category_images.piece_type_group varchar` |
| T3 | None | Uses existing `homepage_sections`, `categories` |
| T4 | None | CSS only |
| T5 | ⚠️ ADD INDEX | `pg_trgm` indexes on `products.name`, `collections.name`, `coupons.store_name` |
| T6 | None | Reuses existing categories query |
| T7 | None | New route, no DB changes |
| T8 | None | Client-side count computation |
| T9 | None | Uses existing product fields |
| T10 | None | Uses existing product fields |
| T11 | None | Modal redesign, no data change |
| T12 | None | Route fix, no data change |
| T13 | None | Uses existing `cart_items` + `wishlist` |
| T14 | None | Caching fix, no data change |

# 📊 Summary of API / Query Changes Needed

| Task | File | Change |
|------|------|--------|
| T1 | `useShopFilters.ts` | Add `pieceType` filter support |
| T1 | `products.ts` | Add `pieceType` filter to `getProducts()` |
| T2 | `categories.ts` | Return `piece_type_group` in `getCategoryImages()` |
| T5 | **NEW** `search.ts` | `globalSearch(query)` — parallel search across tables |
| T7 | `search.ts` | Extend with pagination + filters |
| T8 | `products.ts` | Support `category_ids[]` or `pieceTypes[]` filter |
| T13 | **NEW** `cart.ts` | CRUD for server-side cart items |
| T14 | `useShopFilters.ts` | Refactor to TanStack Query |

# 📊 Summary of New Files / Routes

| Task | Path | Type |
|------|------|------|
| T5 | `src/lib/queries/search.ts` | Query module |
| T7 | `src/app/(site)/(pages)/search/page.tsx` | New route |
| T13 | `src/lib/queries/cart.ts` | Query module (if not exists) |
