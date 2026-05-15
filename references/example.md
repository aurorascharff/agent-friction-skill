# Friction Log: ViewTransition Shared Element — Product Grid to Detail Page

**Date:** 2026-05-15
**Model:** anthropic/claude-sonnet-4-6
**Harness:** DX Agent (Slack bot)
**Next.js version:** Next.js v16.2.1-canary.20
**Build time:** 14s (2 builds: 7s + 7s)
**Task:** Build a product grid and detail page where clicking a thumbnail morphs into the detail image using React's `<ViewTransition>` component, with the reverse on back navigation.

---

## Prompt

> Build a product grid and detail page. Clicking a thumbnail should morph into the detail image using React's <ViewTransition> component. Going back should reverse it.

---

## Summary

The core `<ViewTransition>` shared-element pattern was straightforward once the right docs were found — the official Next.js guide (updated 2026-05-07) is excellent and the build succeeded on the first attempt. However, there are three meaningful friction points: (1) there's a **hidden React version split** where `import { ViewTransition } from 'react'` silently works at build/runtime because Next.js aliases `react` to a canary bundle, but the user-space `react@19.2.4` package has no `ViewTransition` export — making the import feel magical; (2) `next/image` with external URLs throws a **runtime 500** instead of failing at build time; (3) the `transitionTypes` prop on `<Link>` **leaves no trace in SSR HTML**, making it impossible to verify server-side correctness without a real browser.

---

## Action Items

### Docs
- 🔧 Clarify that `import { ViewTransition } from 'react'` only works because Next.js aliases `react` to its vendored canary — not the user-space `react` package
  - Context: Running `node -e "require('react').ViewTransition"` returns `undefined` in the project. The named export only exists in `next/dist/compiled/react`, not in `react@19.2.4`. The docs show the import without explaining this dependency. A developer tracing the import in their IDE will see an unresolved export or `undefined` in the standalone `react` package.

- 🔧 Document that `transitionTypes` on `<Link>` is a client-only signal that leaves no trace in SSR HTML
  - Context: After building and confirming pages with curl/sandbox_http, grepping for `nav-forward` or `nav-back` in SSR output returns nothing. There's no way to verify the prop is wired correctly without a browser. The docs don't mention this.

- 🔧 Add a callout in the View Transitions guide that `next/image` with external hostnames requires `remotePatterns` in `next.config`
  - Context: Used Unsplash images; build succeeded but dev server threw 500 errors immediately on first request. The error message is correct (`hostname "images.unsplash.com" is not configured`), but the guide's example uses `<Image>` without noting this requirement, creating a silent trap for common image providers.

### Framework
- 🔧 `next/image` with unconfigured external hostnames should fail at build time (or at minimum lint time), not throw a 500 at runtime
  - Context: `next build` completed successfully with `✓ Compiled successfully` despite images referencing `images.unsplash.com` without `remotePatterns`. The first HTTP request to `/` returned a 500. The check exists — it just runs too late. A build-time warning or error would surface this before deployment.

- 🔧 TypeScript types for `ViewTransition` props (`share`, `enter`, `exit`, `default`) are not available in user-space `@types/react`
  - Context: The `ViewTransition` component and its props (`share="morph"`, `enter={{ "nav-forward": "slide-up", ... }}`) are only typed in `next/dist/compiled/react`. VS Code users importing from `react` may get `Property 'ViewTransition' does not exist on type 'typeof import("react")'` depending on their TypeScript config. Build still passes (likely because Next.js swaps the types), but the experience is IDE-dependent and fragile.

- 🔧 The `transitionTypes` prop on `<Link>` should have a TypeScript type that is clearly discoverable
  - Context: The prop is used as `transitionTypes={['nav-forward']}` on `<Link>`. It's not clear from types or IDE autocomplete what string values are valid. The docs show literal examples but there's no union type or enum to guard against typos.

### DX / Research
- 🔍 Investigate whether `ViewTransition` shared-element morph works correctly when `<Image>` uses `fill` inside a `position: relative` wrapper
  - Context: The implementation wraps both the grid thumbnail and the detail hero in a `position: relative / aspect-square` div inside `<ViewTransition>`. The `vt-name` attribute is applied to the wrapper div, not the `<img>` element itself. It's unclear whether the View Transitions API will correctly animate the image or the container — a browser test is needed to confirm.

- 🔍 Verify that `transitionTypes` on `<Link>` correctly reverses the shared-element morph on back navigation in a real browser
  - Context: The `nav-back` type was wired up via `transitionTypes={['nav-back']}` on the back link and mapped to slide CSS classes. Because `transitionTypes` leaves no trace in SSR HTML, the correctness of the reverse animation could not be confirmed in the sandbox. A browser-based end-to-end test is needed.

- 🔍 Evaluate whether agents need a browser automation tool (Playwright/Puppeteer) to validate animation-heavy features
  - Context: `<ViewTransition>` is entirely a client-side animation. The entire implementation can be built and build-verified, but the most important part — does the morph actually look right — is invisible to curl/sandbox_http. This is a recurring gap for agent-DX tasks involving animation, scroll behavior, or user interaction.

---

## Log

- 🟢 Copied base app to `/vercel/sandbox/fl-viewtransition`
  - `cp -r /vercel/sandbox/base-app /vercel/sandbox/fl-viewtransition` — clean, no issues [sandbox]

- 🟢 Next.js version confirmed: `Next.js v16.2.1-canary.20` [sandbox]

- 🟢 Official Next.js docs found at `https://nextjs.org/docs/app/guides/view-transitions` (updated 2026-05-07)
  - Covers all four patterns: shared element morph, Suspense reveals, directional nav, same-route crossfade
  - The guide was high quality and immediately actionable [docs]

- 🟡 Import path ambiguity between `unstable_ViewTransition` and `ViewTransition`
  - Web search results (some from April 2025) showed `import { unstable_ViewTransition as ViewTransition } from 'react'`
  - The official Next.js docs (updated 2026-05-07) show `import { ViewTransition } from 'react'`
  - Chose the non-prefixed form per current docs; confirmed it compiles [web search] [docs]

- 🟢 Enabled `experimental.viewTransition: true` in `next.config.ts` — straightforward [docs]

- 🟢 Implemented product data in `lib/products.ts` with 6 items using Unsplash images [sandbox]

- 🟢 `<ViewTransition name={`product-image-${product.id}`}>` pattern applied to both the grid thumbnail (`ProductGrid.tsx`) and the detail hero (`ProductDetail.tsx`) — name-matching across pages is the key mechanism [docs]

- 🟢 Used `transitionTypes={['nav-forward']}` on forward links and `transitionTypes={['nav-back']}` on back link, per the Next.js docs Pattern 3 [docs]

- 🟢 CSS added to `globals.css` for `morph`, `slide-up`, `slide-down`, `nav-forward`, `nav-back` view transition classes, plus `prefers-reduced-motion` fallback [docs]

- 🟢 **First build succeeded** — `✓ Compiled successfully in 2.7s`, all 10 static pages generated [sandbox]
  - Build output confirmed `✓ viewTransition` experiment enabled

- 🔴 `next/image` with Unsplash URLs caused runtime 500 after a clean build pass
  - `next build` completed with no errors or warnings
  - Dev server started cleanly, but first request to `/` returned HTTP 500: `Error: Invalid src prop (https://images.unsplash.com/...) on next/image, hostname "images.unsplash.com" is not configured under images in your next.config.js`
  - Build should either warn or fail fast when `<Image src="https://...">` references a hostname not in `remotePatterns` — the check clearly exists (it fired at runtime) but runs too late
  - **Resolution:** Added `images.remotePatterns` for `images.unsplash.com` in `next.config.ts`. Second build succeeded immediately. [sandbox]

- 🟡 Hidden React version split — `import { ViewTransition } from 'react'` works only via Next.js aliasing
  - User-space `react` is `19.2.4` and does NOT export `ViewTransition`:
    `node -e "require('./node_modules/react'); console.log(Object.keys(r).filter(k => k.includes('View')))"` → `[]`
  - Next.js bundles `react@19.3.0-canary-74568e86-20260328` at `node_modules/next/dist/compiled/react/`, which DOES export `ViewTransition`
  - Next.js aliases the `react` import at build/runtime to its compiled version, so the code works — but a developer tracing the import in their IDE, or running it in a plain Node script, will get `undefined`
  - No docs or error messages explain this indirection [sandbox]

- 🟡 `transitionTypes` prop on `<Link>` leaves no HTML trace in SSR output
  - After confirming both routes at 200 OK, grepped SSR HTML for `nav-forward`, `nav-back`, `transition-types`, and `transitionTypes`
  - None appeared — the prop is consumed entirely at the React/Next.js client layer
  - Cannot verify correct wiring without a real browser running JavaScript; there's no server-rendered breadcrumb [sandbox]

- 🟢 `vt-name` and `vt-share` attributes confirmed in SSR HTML on both pages:
  - Grid page: `vt-name="product-image-1"` through `"product-image-6"` present on each card
  - Detail page: `vt-name="product-image-1"` and `vt-share="morph"` present on the hero wrapper
  - This confirms the shared-element name is correctly propagated to the DOM [sandbox]

- 🟢 Both routes return HTTP 200, no server errors in dev log after `remotePatterns` fix [sandbox]

- 🟢 Both builds passed TypeScript check (`Finished TypeScript in ~1900ms`) with no type errors [sandbox]
