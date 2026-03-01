# Mobile Responsiveness Fix Plan — Fitova

## 1. Root Cause Analysis

### 🔴 Problem 1: 3D Section (ThreeDSection) is broken on mobile

**File:** `src/components/Home/ThreeDSection/index.tsx`

#### Root Causes Identified:

| Issue | Code Location | Effect |
|---|---|---|
| `height: "100vh"` with no mobile override | `<section>` style on L214-215 | Forces 100vh even on mobile where address bar eats space |
| `minHeight: "100vh"` on the section | Same location | Guarantees the section never shrinks below full viewport |
| `flex-col` layout on mobile stacks text + canvas vertically | `div` on L219 | Text block + canvas both take full height = 2x viewport height |
| Canvas container has `min-h-[55vh]` on mobile | `div` on L312 | Canvas area alone is 55vh, plus text block = >100vh of content |
| Three.js renders at 60fps always | `frameloop="always"` on Canvas | Drains mobile battery and creates lag |
| WebGL `antialias: true` + `dpr={[1, 1.5]}` | Canvas props | Forces high-res rendering even on low-powered mobile GPUs |
| No conditional rendering on mobile | All code | Loads GLTF models, lights, shadows on mobile unnecessarily |
| Scroll-based camera animation tied to `useFrame` always | `Camera` component | CPU/GPU waste when section is barely visible |

#### Why it breaks the layout:
On mobile, the flex column stacks text panel + 3D canvas panel. Text panel takes ~50vh, canvas takes 55vh minimum → total is `~105vh+`. The section overflows outside its bounds. Since it has `overflow-hidden`, the Canvas itself clips, but the section still pushes down below the viewport, breaking surrounding sections and creating a large dead white area.

---

### 🟡 Problem 2: StyleHub not visible on mobile

**File:** `src/components/StyleHub/index.tsx`

#### Root Causes Identified:

| Issue | Code Location | Effect |
|---|---|---|
| `if (!isOpen) return null` | L47 | The entire panel only renders when `isOpen === true` |
| No persistent mobile entry point visible on homepage | Header/Home layout | Users may not know where to tap to open StyleHub |
| Panel is `fixed bottom-0` on mobile, `fixed right-0` on sm+ | L62 | Works correctly when triggered — but if the open button is hidden it never appears |

The StyleHub itself is technically correct (bottom drawer on mobile, side panel on tablet+). The issue is likely that the **trigger button** (wherever it lives in the Header or elsewhere) may be hidden on mobile.

---

### 🟢 Global Issues

| Issue | Impact |
|---|---|
| BrandMarquee uses nested `flex` with `min-width: 100%` children | Potential horizontal bleed if container has no clip |
| `overflow-x: hidden` is on `html` and `body` — but does NOT prevent fixed/absolute children from extending viewport width | Child elements can still cause scroll on mobile |
| Components using `max-w-[1170px]` without `px-4` on mobile | Content touches screen edges |
| ThreeDSection typography uses `text-4xl md:text-5xl xl:text-6xl` — no `text-2xl` for <640px | Headline may overflow on small screens |

---

## 2. Responsive Strategy

### Framework Used
- **Tailwind CSS** for all utility classes (already in use)
- **CSS custom properties** (via inline styles) where Tailwind isn't expressive enough
- **`useWindowSize` hook** for conditional JS rendering

### Breakpoints (aligned with Tailwind defaults)
| Name | Width | Fix approach |
|---|---|---|
| Mobile | `< 640px` (sm) | Mobile-first, simplify or hide heavy 3D |
| Tablet | `640px – 1024px` | Reduced model scale, limited canvas height |
| Desktop | `> 1024px` | Full 3D experience |

### Strategy per Problem

#### 3D Section — Strategy
1. **Conditional rendering**: Hide the entire `<Scene>` (Three.js Canvas) below 768px. Show a high-quality static image of the fashion models instead.
2. **If 3D must show on mobile**: Cap canvas height to `300px`, switch `frameloop` to `"demand"` on mobile, reduce `dpr` to `[1,1]`, disable shadows.
3. **Fix layout**: On mobile, stack layout should use fixed `minHeight` limited to max `60dvh` not `100vh`.
4. **Prevent overflow**: Add `overflow: hidden` + `contain: strict` to the section on mobile.

#### StyleHub — Strategy  
1. Find the trigger button (header icon) and ensure it is **always visible on mobile** — remove any `hidden sm:flex` or `hidden md:block` blocking it.
2. The panel itself (bottom drawer) is already responsive — no change needed there.

#### Global — Strategy
1. Add `overflow-x: clip` to `<main>` to prevent any child from causing horizontal scroll.
2. Ensure all section containers have `px-4 sm:px-8` padding.
3. Fix heading sizes for mobile.

---

## 3. Step-by-Step Implementation Plan

### Step 1 — Fix ThreeDSection (High Priority)
- [ ] Add `isMobile` state hook that detects `window.innerWidth < 768`
- [ ] If mobile: render a static `<img>` fallback instead of `<Canvas>`
- [ ] If mobile & 3D is desired: limit section height to `min(100dvh, 700px)`, cap canvas height to `350px`, use `frameloop="demand"`, `dpr={[1,1]}`, remove `ContactShadows`
- [ ] Fix section container: use `min-h-[auto]` on mobile, `100vh` only on `lg:`
- [ ] Fix text panel padding to use `px-5` on mobile instead of `clamp()` which may misbehave
- [ ] Fix headline: add `text-3xl` as base (mobile), `md:text-4xl`, `lg:text-5xl`

### Step 2 — Fix StyleHub trigger visibility (Medium Priority)
- [ ] Find all places the StyleHub open button is rendered
- [ ] Ensure it has no `hidden sm:flex` or similar classes blocking mobile visibility
- [ ] Confirm the drawer opens to `85dvh` on mobile correctly

### Step 3 — Global Overflow Fix (Medium Priority)
- [ ] Add `overflow-x: clip` to the `<main>` wrapper in site layout
- [ ] Confirm all section wrappers have proper `px-4 sm:px-6 lg:px-8` padding

### Step 4 — Typography Scaling (Low Priority)
- [ ] Review large headings across homepage components
- [ ] Ensure minimum `text-2xl` or `text-3xl` base size with responsive scaling

---

## 4. Performance Optimization Suggestions

| Suggestion | Impact |
|---|---|
| Conditionally skip Three.js Canvas on mobile (`< 768px`) | 🔥 Highest — saves ~2MB bundle load on mobile |
| Use `frameloop="demand"` instead of `"always"` when section is not in view | 🔥 High — stops rendering loop when invisible |
| Reduce `dpr` to `[1,1]` on mobile | 🟡 Medium — halves GPU texture memory on retina |
| Remove `ContactShadows` on mobile (very expensive blur pass) | 🟡 Medium — saves one full render pass |
| Use `Suspense` + progressive loading for GLTF models | 🟡 Medium — prevents layout jank during model load |
| Lazy import Three.js only on desktop via dynamic imports | 🔥 High — excludes from mobile JS bundle entirely |

---

## 5. Files To Change

| File | Change |
|---|---|
| `src/components/Home/ThreeDSection/index.tsx` | Add mobile detection, conditional render, height fixes, frameloop optimization |
| `src/components/Home/ThreeDSection/client.tsx` | Add `isMobile` check before even loading the dynamic import |
| `src/components/Header/index.tsx` | Verify StyleHub trigger button is visible on mobile |
| `src/app/css/style.css` | Add global `main { overflow-x: clip }` |

