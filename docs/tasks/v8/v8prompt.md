🔧 FITOVA – Structured Planning Prompt (NO EXECUTION)

# ROLE
You are a Senior Full-Stack Architect and UI/UX System Refactor Specialist.

IMPORTANT RULES:
- This is PLANNING ONLY. Do NOT implement anything.
- Work task-by-task.
- After finishing EACH task, STOP and ask:
  "Task X planning completed. Do you want me to continue to the next task?"
- After each task, you MUST:
  1. Analyze the current database structure.
  2. Ensure alignment with the frontend instruction file.
  3. Ensure alignment with the backend instruction file.
  4. Mention explicitly what needs DB adjustment (if any).
  5. Mention explicitly what API adjustments are required (if any).

You are NOT allowed to skip validation steps.
You are NOT allowed to merge tasks.
Each task must contain:
- Problem breakdown
- Root cause analysis
- UI planning
- UX logic
- DB impact
- API impact
- Edge cases
- Responsive behavior
- Performance considerations


---

🏠 SECTION 1 — HOMEPAGE NAVBAR & HERO


---

TASK 1 — Fix Non-Clickable Category Items

Problem:

Inside:

Men

Women

Kids


The following items are TEXT ONLY:

Clothing

Footwear

Accessories

Fragrances


They must:

Become real links

Redirect to /outfits

Apply correct filters automatically based on clicked item


Planning Requirements:

Define filter query structure

Define URL param system (ex: ?gender=men&category=clothing)

Ensure DB supports:

gender

main_category


Validate consistency with navbar categories

Define fallback behavior if filter returns empty

Define SEO-safe routing

Define loading state behavior


STOP after planning.


---

TASK 2 — Hover Image Switching per Subcategory

Problem:

When hovering on:

Clothing

Footwear

Accessories

Fragrances


Images must dynamically switch depending on hovered item.

Planning Requirements:

Define hover state logic

Define image mapping structure

Define where images are stored (DB or static?)

Define animation behavior

Define mobile fallback

Performance impact (preload or lazy load?)


STOP after planning.


---

TASK 3 — “This Week” Section Layout Consistency

Problem:

"This Week" section must:

Include category images like other sections

Use same layout system


Planning Requirements:

Define reusable layout component

Define image linking logic

Define consistency rules

Validate DB structure

Responsive behavior


STOP after planning.


---

TASK 4 — Navbar Visual Enhancement

Problem:

Improve:

Typography

Icons (premium style)

Spacing

Transparency over hero video

Solid background on scroll


Planning Requirements:

Define font system

Define icon library

Define scroll listener behavior

Define transition animation

Performance impact


STOP after planning.


---

🔍 SECTION 2 — GLOBAL SEARCH SYSTEM


---

TASK 5 — Smart Global Live Search

Requirements:

Search across:

Men

Lookbook

Coupons

All sections


Show grouped results with separators

Show:

Image

Price

Brand tag

Item type tag


Live search (no need to press icon)

Clicking search icon → Full Search Page


Planning Requirements:

Define DB indexing strategy

Define search API structure

Define grouped response format

Define debounce timing

Define empty state

Define performance optimization


STOP after planning.


---

TASK 6 — Dynamic “All Categories” System

Problem:

“All Categories” must:

Auto-update when DB updates

Match navbar categories


Planning Requirements:

Define dynamic category fetch

Define caching rules

Define fallback state

Ensure backend consistency


STOP after planning.


---

TASK 7 — Full Search Page

Requirements:

Show full grouped results

Show product category references

Show filtering options

Maintain URL query sync


STOP after planning.


---

👕 SECTION 3 — OUTFITS PAGE


---

TASK 8 — Filter System Redesign

Problems:

Category filter needs deeper breakdown:

Clothing

Footwear

Accessories

Fragrances (not for kids)


Price filter design inconsistent

Product count per filter missing

Filter sidebar overlaps navbar on scroll


Planning Requirements:

Define hierarchical filter structure

Define dynamic count calculation

Define price filter redesign

Define sticky sidebar behavior

Fix z-index issue

DB validation

Performance impact


STOP after planning.


---

🛍 SECTION 4 — PRODUCT CARDS


---

TASK 9 — Grid View Improvements

Requirements:

Keep image animations

Fix button style to match site theme

Under brand name show:

Gender tag

Item type tag

Main color


All on one line


Planning:

Validate DB tags

Define tag priority logic

Define overflow handling

Define responsive collapse behavior


STOP after planning.


---

TASK 10 — List View Improvements

Requirements:

Keep layout

Add same image animation as grid

Fix fonts & buttons style

Use REAL DB tags (not static)

Show:

All real tags on one line

Main color

Small spacing

Secondary colors



STOP after planning.


---

👁 SECTION 5 — PRODUCT VIEW SYSTEM


---

TASK 11 — Quick View Redesign

Problems:

Not matching site style

Needs full redesign

Clicking image → go to full page


Planning:

Modal system redesign

Animation logic

Background blur logic

Accessibility

State persistence


STOP after planning.


---

TASK 12 — Full Product Page Fix

Problems:

Page Not Found error

Routing issue

Clicking image should navigate here


Planning:

Validate route structure

Validate dynamic slug system

Validate API fetching logic

Define fallback state


STOP after planning.


---

TASK 13 — Cart & Wishlist State Logic

Requirements:

Buttons must toggle:

Filled

Outlined


Persist after refresh

Persist after logout/login

Sync with DB


Planning:

Define state structure

Define local vs server storage

Define API endpoints

Define optimistic UI update

Define edge cases


STOP after planning.


---

TASK 14 — Product Rendering Issue

Problem:

After clicking a product and returning → products disappear.

Planning:

Analyze render lifecycle

Analyze state reset

Analyze caching

Define solution strategy


STOP after planning.


---

FINAL INSTRUCTION

You must complete:

Task by task

With full technical planning

With DB + API validation

Without writing implementation code


After each task: STOP. Ask if you should continue.