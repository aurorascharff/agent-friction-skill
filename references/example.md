# Friction Log: Performant product catalog with Cache Components

**Date:** 2026-03-21
**Model:** Claude Sonnet 4.6
**Harness:** Claude Code
**Task:** Build a performant Next.js 16.2 app using Cache Components — product catalog with `use cache`, `cacheTag`, `cacheLife`, `revalidateTag`, and `unstable_instant`
**Input:** n/a (scaffolded from scratch)
**Output:** https://github.com/aurorascharff/test-cc

---

## Prompt

> i want to build a performant app with cachecomponents in nextjs 16.2

> **Agent:** What kind of app do you want to demonstrate Cache Components with? A good demo would need some data that makes sense to cache (e.g. a product catalog) and some that should stay dynamic (e.g. a cart count or user-specific data). Do you have a preference, or should I pick something that best showcases the static shell + streaming pattern?

> sure, the product catalog

---

## Summary

Implementation was mostly smooth — the bundled docs were accurate and complete, and the caching APIs composed well. Three build failures along the way: `revalidateTag` requiring a second argument (deprecated single-arg form), `unstable_instant` requiring `prefetch: 'runtime'` with `samples` on dynamic routes, and `favicon.ico` as a file in `app/` conflicting with instant validation. The last one was the most confusing — the error message pointed to "file-based metadata" but gave no indication that removing `favicon.ico` from the `app/` directory was the fix.

## Action Items

### Docs
- 🔧 `revalidateTag` deprecation is easy to miss — needs a more prominent callout on the reference page
  Context: Called `revalidateTag('products')` and got a TypeScript error at build time — the single-arg form is deprecated but the deprecation note is buried in the docs
- 🔧 `unstable_instant` on dynamic routes needs a clear note that `prefetch: 'static'` doesn't support dynamic params and what to use instead
  Context: Used `prefetch: 'static'` on a `[slug]` route, build failed with "accessed param 'slug' which is not defined in the `samples`" — had to find the correct mode by reading TypeScript types

### Framework
- 🔧 `revalidateTag` single-arg deprecation doesn't surface during dev — only at runtime (when the action fires) or at `next build` via TypeScript, and Turbopack skips type-checking in dev
  Context: No dev-time warning was emitted when using the deprecated form — only caught at build time
- 🔧 `unstable_instant` param error doesn't hint at the correct prefetch mode for dynamic routes
  Context: Error message says params are not in `samples` but doesn't suggest switching to `prefetch: 'runtime'`
- 🔧 `unstable_instant` file-based metadata error has the conflicting filename available in context but doesn't include it in the message
  Context: Error said "file-based metadata such as icons" but didn't name `favicon.ico` — had to find it by process of elimination
- 🔧 `create-next-app` scaffolds `favicon.ico` into `app/` by default, which conflicts with `unstable_instant` validation
  Context: Default scaffold + `unstable_instant` = build failure on first try with no clear fix

### DX / Research
- 🔍 Check whether discarding available context in error messages is a broader pattern across Next.js validation — could be worth a wider audit
  Context: The `favicon.ico` filename was available at the validation site but omitted from the error — may not be an isolated case

## Log

- 🟢 Read bundled docs before writing code [agents.md]
  - Read `cacheComponents.md`, `use-cache.md`, `caching.md`, and `instant-navigation.md` before starting
  - All APIs were accurate and composed as expected
- 🟢 Scaffolded app and enabled `cacheComponents` [error output]
  - `create-next-app` 16.2.1 clean, `cacheComponents: true` added to `next.config.ts`
- 🟢 Implemented `use cache`, `cacheTag`, `cacheLife` in `lib/products.ts` [agents.md]
  - `getProducts()` and `getProduct(slug)` cached with `cacheTag` and `cacheLife('hours')`
  - `getInventory(slug)` left uncached — fresh per request, wrapped in `<Suspense>` on the detail page
- 🔴 `revalidateTag` TypeScript error at build time [error output]
  - Called `revalidateTag('products')` — TypeScript error: "Expected 2 arguments, but got 1"
  - 🟡 Checked bundled docs — single-argument form is deprecated, correct call is `revalidateTag('products', 'max')` [agents.md]
  - The deprecation is noted in the docs but easy to miss; no dev-time warning
  - **Resolution:** Changed to `revalidateTag('products', 'max')` — build passed. Fix was documented in bundled docs but not prominent.
  - 🔧 Dev-time warning when using deprecated single-arg form
- 🔴 `unstable_instant` on dynamic route — wrong prefetch mode [error output]
  - Used `prefetch: 'static'` on `/products/[slug]` — build failed: "accessed param 'slug' which is not defined in the `samples` of `unstable_instant`"
  - 🟡 Checked bundled `instant-navigation.md` TypeScript types — found `prefetch: 'runtime'` with `samples: RuntimeSample[]` [agents.md]
  - > **Agent:** This error points to Google Fonts in the layout as the likely cause of dynamic metadata access during build-time validation. Should I swap to a local or system font, or would you prefer I remove `unstable_instant` from `/products` and only demonstrate it on the detail page?
  - > where did you find unstable instant
  - > **Agent:** From the bundled docs — `node_modules/next/dist/docs/`. Specifically the hint at the top of the caching guide pointing to `instant-navigation.md`
  - > no, use instant. thats great. try to solve this
  - **Resolution:** Changed to `prefetch: 'runtime'` with three example slugs in `samples` — build passed.
  - 🔧 Error should state which prefetch mode is needed for dynamic routes
- 🔴 Build failed — `favicon.ico` in `app/` conflicts with `unstable_instant` validation [error output]
  - Error: "Runtime data... or you have file-based metadata such as icons that depend on dynamic params segments"
  - 🟡 Error message was generic — no filename, no suggested fix
  - 🟡 No relevant bundled docs found for this specific error [agents.md]
  - Identified `favicon.ico` as the file-based metadata by process of elimination — it's the only icon file in the project
  - **Resolution:** Removed `favicon.ico` from `app/`, moved icon reference to `metadata.icons` in layout — build passed. Required process of elimination; error message didn't name the file.
  - 🔧 Error should name the specific file and suggest the fix
- 🟢 Build passed — correct output [error output]
  - `/products` — `○ Static` with 15m revalidate / 1d expire (matches `cacheLife('hours')`)
  - `/products/[slug]` — `◐ Partial Prerender` with dynamic inventory streaming

## Skill Feedback

- 🔁 Agent misidentified the cause of the `unstable_instant` build failure
  - Initially blamed Google Fonts in the layout instead of `favicon.ico` — proposed removing fonts rather than investigating file-based metadata
  - Skill should instruct the agent to enumerate all possible causes before proposing a fix when a build error is ambiguous
