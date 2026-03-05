Step 2: File-by-File Analysis (Consumer-Facing Frontend)
I have reviewed the core consumer-facing layout, pages, and components. Here is the detailed breakdown:

1. File: 
src/app/(site)/layout.tsx
Purpose: The root wrapper for all consumer-facing pages. It provides the global context providers (Auth, Redux, Cart, Modals) and structural elements (
Header
, Footer).
Structure: Clean wrapper around children. Conditional rendering for PreLoader.
Issues: None structurally, but the padding-top offset for the 
Header
 might need careful management if the header height changes dramatically on mobile vs desktop.
Responsive concerns: The <body> has overflow-x-hidden, which is good for preventing horizontal scroll, but we must ensure sticky/fixed elements within it don't break touch interactions.
Suggested improvements: Ensure the space allocated for the fixed Header variables (var(--navbar-h)) is dynamically or safely set for mobile viewports, avoiding content hiding under the nav.
2. File: 
src/components/Header/index.tsx
 & 
MegaMenu.tsx
Purpose: Main site navigation, search, cart toggle, and user account actions.
Structure: 
index.tsx
 holds the top bar and mobile toggle wrapper. 
MegaMenu.tsx
 handles the complex category dropdowns.
Issues:
The dynamic transparent-to-solid header effect works well on desktop but can be jarring on mobile if scroll events lag.
MegaMenu.tsx
 uses a heavy dropdown panel (min-width: 520px; max-width: calc(100vw - 2rem)). This approach is predominantly desktop-focused.
Responsive concerns:
The 
AllCategoriesDropdown
 and GlobalSearchDropdown may cramp the header space on very small screens (under 375px).
The MegaMenu hover logic (onMouseEnter, onMouseLeave) does not translate well to touch devices. It relies on clicks for mobile but uses complex UI panels that might overflow horizontally or require awkward vertical scrolling inside the offcanvas menu.
Suggested improvements:
Refactor 
MegaMenu.tsx
 to use an Accordion or Sliding-Pane pattern exclusively on screens < 1024px.
Ensure touch targets in the header (Cart icon, Hamburger, User Profile) are at least 44x44px to meet store UX compliance for mobile.
3. File: 
src/components/Common/ProductItem.tsx
Purpose: The individual product card used in grids (shop, related products).
Structure: Standard e-commerce card: Image -> Stars -> Title -> Price. Uses ProductHoverActions for add-to-cart/wishlist.
Issues: The right-slide hover panel (ProductHoverActions) relies on hover state (group-hover). On mobile, hover states are activated on tap, which often requires a double-tap to actually navigate to the product page.
Responsive concerns: The min-h-[270px] on the image container might result in massive images on single-column mobile layouts or awkward cropping in tight 2-column mobile grids.
Suggested improvements:
Disable the complex hover-action panel on mobile (hidden md:flex). Instead, show a persistent, accessible "Add" button (like a small cart icon) directly on the card for touch devices.
Make the image container aspect ratio fluid (e.g., aspect-[3/4]) instead of a fixed minimum height.
4. File: 
src/components/ShopWithSidebar/index.tsx
 & 
outfits/page.tsx
Purpose: The primary product listing page (PLP) featuring filters and sorting.
Structure: 
outfits/page.tsx
 wraps 
ShopWithSidebar
. Features a top bar (Sort/View toggles), an off-canvas mobile filter sidebar, and the product grid.
Issues: Mobile filters require opening a full-screen or half-screen modal. The "Sort" dropdown uses default OS styling which can look wildly different across iOS/Android.
Responsive concerns:
The grid changes from 2-col to 3-col (grid-cols-2 lg:grid-cols-3). 2-col on very small mobiles (like iPhone SE) might squeeze product titles and prices too much.
The mobile filter toggle is well placed, but the drawer UI inside HierarchicalShopFilters needs to ensure smooth vertical scrolling without locking the main page scroll entirely.
Suggested improvements:
Introduce a "Sticky Filter/Sort Bar" at the bottom or just below the header on mobile scrolling, a common high-converting e-commerce pattern.
Optimize the 2-column mobile grid typography so titles truncate efficiently at 1-2 lines.
5. File: 
src/components/Common/QuickViewModal.tsx
Purpose: Modal to view product details and add to cart directly from the PLP without navigating.
Structure: Fixed overlay (z-[10000]), flex-col on mobile, flex-row on desktop.
Issues: The modal is quite tall. On mobile devices with short viewports (in horizontal mode or with virtual keyboards open), the "Add to Cart" button might get pushed below the fold.
Responsive concerns:
The thumbnail row is horizontally scrollable but might be hard to swipe if the modal body itself intercepts the touch events.
max-h-[90vh] is good, but mobile browsers have dynamic toolbars that change vh.
Suggested improvements:
For mobile, consider rendering QuickView as a Bottom Sheet component (snapping from the bottom) rather than a centered modal, or simply redirect to the PDP on mobile (disabling QuickView for mobile entirely is often better UX).
6. File: 
src/components/Cart/index.tsx
Purpose: The dedicated Cart page.
Structure: Table-based layout on desktop, stacked layout on mobile.
Issues: Desktop uses hidden table headers. Mobile falls back to a stacked list layout inside 
SingleItem.tsx
.
Responsive concerns: We must ensure the quantity adjusters inside the cart are easily tappable. Often, the +/- buttons are too small.
Suggested improvements: Increase padding on quantity adjusters and ensure the "Proceed to Checkout" button is "sticky" at the bottom of the viewport on mobile so it's always accessible.
7. File: 
src/components/Checkout/index.tsx
Purpose: The multi-step checkout view.
Structure: Dual columns on desktop (lg:flex-row). Forms on the left, order summary on the right. Stacked on mobile.
Issues: Long scrolling on mobile (Forms + Summary + Payment). Users might lose context of what they are buying by the time they hit the bottom form.
Responsive concerns: Native input zoom on iOS: if input fonts are < 16px, iOS Safari auto-zooms, which breaks the mobile layout experience.
Suggested improvements:
Ensure all form inputs have text-base or text-[16px] on mobile to prevent iOS zoom.
Move a condensed "Order Summary Total" to sticky-top or sticky-bottom on mobile so the user always sees the price while filling out forms.


Step 3: Responsiveness Audit
I have reviewed the grid behaviors, global styling, and structural components across the consumer-facing frontend to assess behavior on Mobile, Tablet, and Desktop displays. Here is the audit:

1. Global CSS (
style.css
 & globals.css)
Behavior: Built with Tailwind CSS, meaning almost all responsive behavior is handled inline via utility classes (sm:, md:, lg:, xl:).
Mobile Layouts: The base CSS uses overflow-x-hidden on the body and overflow-x-clip on main. This is excellent for preventing accidental horizontal scrolling, a common issue on mobile web apps.
Touch Interactions: Buttons and links utilize hover: states extensively. iOS and Android interpret hover by requiring a tap to trigger the hover state, and a second tap to trigger the click.
Problems: The reliance on group-hover:translate-x-0 (seen in 
ProductGridCard
 and 
ProductFullWidthCard
 image swapping and action buttons) is problematic for mobile. It requires users to "hover" over a product to see the "Add to Cart" button or secondary image.
Improvement: Implement CSS media queries (e.g., @media (hover: none)) or use JS to detect touch devices to display these action buttons persistently rather than hiding them behind a hover state.
2. Grid Behavior (Shop/Outfits Page)
Mobile Layout: The grid on the Shop page (
ShopWithSidebar
) transitions from grid-cols-2 down to small screens.
Tablet Layout: sm:grid-cols-2 lg:grid-cols-3.
Desktop Layout: xl:grid-cols-3 or xl:grid-cols-4 depending on the view toggle.
Problems: A rigid grid-cols-2 on very small screens (like iPhone SE - 320px to 375px width) can make the product cards incredibly narrow. Since Fitova cards contain Brand, Title, Prices, Tags, and Color Swatches, these elements will overlap, truncate improperly, or stretch the card vertically.
Improvement: Update grids to use auto-fitting or ensure text truncation (truncate or line-clamp-1) is strictly applied to Titles and Tags on screens < 400px. The Color Swatches should be restricted to showing a maximum of 3-4 on mobile grids.
3. Image Scaling
Behavior: Next.js <Image> component is used effectively with fill and object-cover. Product card image containers use CSS aspect ratios (e.g., aspect-[3/4], aspect-[4/5]).
Problems: The min-h-[270px] class found in some older components (like 
ProductItem.tsx
) overrides natural aspect ratios, leading to distorted or unnecessarily tall images on mobile.
Improvement: Standardize all product image containers to use strictly aspect-[3/4] or aspect-[4/5] without hardcoded minimum heights, allowing them to scale naturally with the grid column width.
4. Touch Interactions & Navigation Usability
Behavior: The 
MegaMenu
 handles complex navigation. The 
SearchPageClient
 uses standard inputs.
Problems:
The Header's 
MegaMenu
 uses an absolute positioned dropdown that is min-width: 520px. This will break entirely or cause immense layout shift/scrolling issues on mobile.
Inputs on the checkout page and search page use text-sm (14px). On iOS Safari, any input with a font size less than 16px will cause the browser to force-zoom into the input when focused, ruining the mobile app-like experience.
Improvement:
Ensure all form inputs (input, select, textarea) have at least text-base (16px) applied on mobile breakpoints.
The 
MegaMenu
 must be completely replaced with a native-feeling Accordion Drawer for mobile users (the hamburger menu triggers a sidebar, and categories expand downwards, not outwards in a 520px pane).
End of Step 3 Report.


Step 4: Store UX Compliance
I have audited the core store flows (Search, Filter, Product Viewing, Cart, and Checkout) against high-converting e-commerce Mobile UX principles. Here is the analysis:

1. Product Cards & Quick View
Behavior: Product Cards rely on dual-image hover logic and an absolute-positioned action panel. 
QuickViewModal
 overlays the PLP.
Store UX Compliance Issues:
As noted in Step 3, forcing touch-users to "tap to hover" just to see an "Add to Cart" or "Wishlist" button is a major UX anti-pattern in modern mobile stores.
The 
QuickViewModal
 is an interruption. On mobile, modals that cover 90% of the screen often trap the user or frustrate them if they accidentally close it while trying to scroll (especially vertically constrained devices).
Recommendations:
Product Cards (Mobile): The "Wishlist" heart should be permanently visible in the top right. A small, persistent shopping cart icon should be visible in the bottom right, allowing instant 1-tap addition without triggering hover states.
Quick View (Mobile): Disable Quick View on mobile breakpoints entirely (hidden sm:flex). On mobile, tapping the product card should navigate directly to the Product Details Page (PDP) instead.
2. Filters & Search
Behavior: Filtering is currently handled by HierarchicalShopFilters in an off-canvas drawer (productSidebar), which toggles well from the 
ShopWithSidebar
 top bar. Search is a dedicated page (
SearchPageClient
).
Store UX Compliance Issues:
The search page input does not autofocus on iOS if triggered programmatically, which adds friction.
In the filter drawer, applying a filter currently seems to trigger a full page update. Standard store UX requires either asynchronous (AJAX) updates to the product count in real-time, or a sticky "Apply Filters (XX Products)" button at the bottom of the drawer.
Recommendations:
Add a sticky "Apply" button to the bottom of the mobile filter drawer to prevent filtering logic from firing repeatedly on every checkbox click (unless it is highly optimized).
Add an expanding search bar directly in the mobile header, rather than forcing users to navigate to a /search page first just to type their query.
3. Cart & Wishlist
Behavior: The site has a standalone 
Cart
 page (/cart) and uses a Sidebar Modal (CartSidebarModal) for immediate feedback.
Store UX Compliance Issues:
In /cart, the fallback list layout for mobile often lacks padding between the plus/minus quantity adjusters, leading to misclicks.
Proceeding to checkout requires scrolling past the entire cart contents to find the summary panel at the bottom.
Recommendations:
For mobile /cart, make the "Order Summary" total and the "Proceed to Checkout" button sticky at the very bottom of the viewport so users don't have to scroll past 10 items to checkout.
Ensure the quantity increment/decrement buttons (+ / -) have a minimum touch target size of 44x44px.
4. Checkout Flow
Behavior: A single-page checkout (/checkout) consisting of Login, Billing, Shipping, Coupon, and Payment methods stacked vertically.
Store UX Compliance Issues:
"Accordion" or vertical stacking can be confusing on mobile if validation errors occur off-screen.
The total price (Order Summary widget) gets buried underneath the inputs. Users often forget their total or applied discounts by the time they reach the "Buy All Items" button at the very bottom.
Recommendations:
Implement an Accordion-style step process (1. Shipping -> 2. Payment -> 3. Review) where only one section is expanded at a time on mobile.
Keep the total price and "Pay Now" button persistently visible in a fixed footer bar at the bottom of the mobile screen throughout the checkout process.
Implement numeric keyboards for Credit Card, Zip Code, and Phone Number inputs (using type="tel" or inputmode="numeric").
End of Step 4 Report.


Final Frontend Architecture & UX Improvement Plan (FITOVA v8)
Based on the comprehensive file-by-file audit of the FITOVA frontend, this structured plan outlines the necessary steps to achieve a seamless, high-converting, mobile-first e-commerce experience.

Note: As requested, this is purely an architectural plan with no code implementation.

Phase 1: Header, Navigation & Search Architecture
Goal: Guarantee a flawlessly fluid navigation experience on touch devices, preventing layout shifts and enhancing immediate product discovery.

1. Mobile Menu Drawer (
components/Header/MegaMenu.tsx
)
Issue: Current desktop-focused MegaMenu (520px+ width) breaks mobile constraints. Relying on hover effects is incompatible with touch.
Action Plan:
Refactor the MegaMenu for viewports < 1024px into a native vertical Accordion or sliding-pane drawer.
Bind interactions strictly to taps.
Ensure the drawer has its own isolated vertical scrolling (overflow-y-auto) to prevent the background body from scrolling simultaneously.
2. Search Accessibility (
components/Header/index.tsx
 & 
SearchPageClient.tsx
)
Issue: Users must navigate to a separate /search page to type queries, which adds friction. Input font sizes < 16px cause auto-zoom issues on iOS.
Action Plan:
Integrate a persistent or expanding sticky search bar directly into the mobile header.
Enforce a minimum font size of 16px (text-base) for all mobile search inputs to disable iOS Safari's native zoom.
Phase 2: Product Listing Pages (PLP) & Product Cards
Goal: Optimize grids for extreme small screens (iPhone SE, etc.) and convert hover-based interactions to touch-native UX.

1. Flexible Product Grids (
components/ShopWithSidebar/index.tsx
)
Issue: A rigid grid-cols-2 layout on 320px - 375px screens causes text clipping and vertical stretching on product cards.
Action Plan:
Implement fluid grids or strict text truncation (line-clamp-1 or line-clamp-2) for all product titles on screens < 400px.
Limit the display of color swatches on mobile cards to a maximum of 3, replacing the rest with a +X indicator.
2. Touch-Native Product Cards (
components/Common/ProductItem.tsx
 & 
ProductFullWidthCard.tsx
)
Issue: Add-to-Cart and Wishlist buttons are hidden behind group-hover states, requiring a double-tap on mobile.
Action Plan:
Extract quick-action buttons from the hover state on mobile breakpoints (max-w-md).
Place a persistent "Wishlist Heart" in the top-right corner over the image.
Place a persistent, circular "Quick Add" (Cart Icon) button in the bottom-right of the card to allow 1-tap cart additions.
Remove hardcoded min-h-[270px] on image containers; strictly enforce responsive aspect ratios (e.g., aspect-[3/4]).
3. Mobile Filtering (HierarchicalShopFilters.tsx)
Issue: Filtering frequently causes full-page jumps, and the drawer lacks a clear bottom action structure.
Action Plan:
Add a fixed "Sticky Filter/Sort Bar" just below the header upon mobile scrolling.
Add a fixed sticky footer inside the mobile filter drawer: [Clear All] [Apply Filters (X items)].
Phase 3: Product Details & Modals
Goal: Remove obtrusive overlays on mobile and optimize the checkout funnel entry points.

1. Quick View Deprecation for Mobile (
components/Common/QuickViewModal.tsx
)
Issue: The 90vh Quick View modal provides a claustrophobic and easily broken experience on small mobile screens, especially when virtual keyboards appear.
Action Plan:
Disable the 
QuickViewModal
 entirely for touch devices (hidden sm:flex).
Ensure any tap on the product image or title explicitly navigates the user to the full Product Detail Page (PDP).
2. Product Detail Add-to-Cart (PDP)
Action Plan:
Implement a "Sticky Add to Cart Bar" at the bottom of the mobile viewport on the PDP once the user scrolls past the primary Add-to-Cart button. This is standard in modern e-commerce apps (e.g., Zara, ASOS).
Phase 4: Cart & Checkout Flow Funnel
Goal: Eliminate friction and excessive scrolling during the transactional phase.

1. Mobile Cart (
components/Cart/index.tsx
)
Issue: Long cart lists push the "Proceed to Checkout" button fatally beneath the fold. Quantity adjusters (+ / -) lack adequate touch-target padding.
Action Plan:
Isolate the "Order Total Summary" and "Proceed to Checkout" button into a fixed sticky-bottom container on mobile out of the scroll flow.
Increase padding on increment/decrement buttons to meet the 44x44px mobile touch standard.
2. Multi-step Checkout Layout (
components/Checkout/index.tsx
)
Issue: The stacked vertical layout hides the cart summary at the bottom, and forms auto-zoom on iOS.
Action Plan:
Enforce text-base for all input forms across Checkout.
Implement specific logical HTML input attributes (type="tel" for phone, inputmode="numeric" for ZIP/Credit Card) to trigger the correct native OS keyboards.
Convert the endless scrolling checkout into a collapsible Accordion format (1. Shipping -> 2. Payment -> 3. Review) on mobile, displaying only the active set of fields.
Phase 5: Global Layout Stabilization
Goal: Prevent page shifting and clipping.

Ensure padding applied to app/(site)/layout.tsx for the fixed navigation (var(--navbar-h)) adjusts precisely between mobile (typically 64px) and desktop breakpoints to prevent content from hiding beneath the header.
Remove all overflow-x dependencies on internal elements in favor of global overflow-x-clip at the <main> level to prevent horizontal wobble.
This concludes the Structural Mobile-First Frontend Plan.