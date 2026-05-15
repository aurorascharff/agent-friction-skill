export const EXAMPLE_LOG = `# Friction Log: ViewTransition Shared Element — Product Grid to Detail Page

**Date:** 2026-05-15
**Model:** anthropic/claude-sonnet-4-6
**Harness:** DX Agent (Slack bot)
**Stack:** Next.js v16.2.1-canary.20
**Build time:** 14s (2 builds: 7s + 7s)
**Task:** Build a product grid and detail page where clicking a thumbnail morphs into the detail image using React's \`<ViewTransition>\` component, with the reverse on back navigation.

---

## Prompt

> Build a Next.js product grid and detail page. Clicking a thumbnail should morph into the detail image using React's <ViewTransition> component. Going back should reverse it.

---

## Tool Timeline

- \`12:14:02 UTC\` — bash: \`cp -r /vercel/sandbox/base-app /vercel/sandbox/fl-viewtransition\`
- \`12:14:09 UTC\` — bash: \`npx next --version\`
- \`12:14:18 UTC\` — web_search: \`Next.js ViewTransition shared element\`
- \`12:14:24 UTC\` — fetch_url: \`https://nextjs.org/docs/app/guides/view-transitions\`
- \`12:15:01 UTC\` — write_file: \`next.config.ts\`
- \`12:15:48 UTC\` — bash: \`npx next build\` _(2.7s)_
- \`12:16:12 UTC\` — bash: \`npx next dev --port 3000\`
- \`12:16:24 UTC\` — sandbox_http: \`GET /\` _(500: hostname not configured)_
- \`12:16:31 UTC\` — write_file: \`next.config.ts\` _(add remotePatterns)_
- \`12:16:38 UTC\` — bash: \`npx next build\` _(2.5s)_
- \`12:16:51 UTC\` — sandbox_http: \`GET /\` _(200)_
- \`12:17:35 UTC\` — write_file: \`friction-log.md\`

---

## Summary

The core \`<ViewTransition>\` shared-element pattern was straightforward once the right docs were found — the official Next.js guide (updated 2026-05-07) is excellent and the build succeeded on the first attempt. However, there are three meaningful friction points: (1) there's a **hidden React version split** where \`import { ViewTransition } from 'react'\` silently works at build/runtime because Next.js aliases \`react\` to a canary bundle, but the user-space \`react@19.2.4\` package has no \`ViewTransition\` export — making the import feel magical; (2) \`next/image\` with external URLs throws a **runtime 500** instead of failing at build time; (3) the \`transitionTypes\` prop on \`<Link>\` **leaves no trace in SSR HTML**, making it impossible to verify server-side correctness without a real browser.

---

## Action Items

### Docs

- 🔧 Clarify that \`import { ViewTransition } from 'react'\` only works because Next.js aliases \`react\` to its vendored canary — not the user-space \`react\` package
  - Context: Running \`node -e "require('react').ViewTransition"\` returns \`undefined\` in the project. The named export only exists in \`next/dist/compiled/react\`, not in \`react@19.2.4\`. The docs show the import without explaining this dependency.

- 🔧 Add a callout in the View Transitions guide that \`next/image\` with external hostnames requires \`remotePatterns\` in \`next.config\`
  - Context: Used Unsplash images; build succeeded but dev server threw 500 errors immediately on first request. The guide's example uses \`<Image>\` without noting this requirement.

### Framework

- 🔧 \`next/image\` with unconfigured external hostnames should fail at build time, not throw a 500 at runtime
  - Context: \`next build\` completed successfully with \`✓ Compiled successfully\` despite images referencing \`images.unsplash.com\` without \`remotePatterns\`. The check fires too late.

- 🔧 The \`transitionTypes\` prop on \`<Link>\` should have a TypeScript type that is clearly discoverable
  - Context: The prop is used as \`transitionTypes={['nav-forward']}\` on \`<Link>\`. It's not clear from types or IDE autocomplete what string values are valid.

### DX / Research

- 🔍 Investigate whether \`ViewTransition\` shared-element morph works correctly when \`<Image>\` uses \`fill\` inside a \`position: relative\` wrapper
  - Context: The implementation wraps both the grid thumbnail and the detail hero in a wrapper div inside \`<ViewTransition>\`. A browser test is needed to confirm.

- 🔍 Evaluate whether agents need a browser automation tool (Playwright/Puppeteer) to validate animation-heavy features
  - Context: \`<ViewTransition>\` is entirely a client-side animation; correctness is invisible to curl/sandbox_http.

## Log

- 🟢 Copied base app to \`/vercel/sandbox/fl-viewtransition\` [sandbox]

- 🟢 Official Next.js docs found at \`https://nextjs.org/docs/app/guides/view-transitions\` (updated 2026-05-07)
  - Covers all four patterns: shared element morph, Suspense reveals, directional nav, same-route crossfade [docs]

- 🟡 Import path ambiguity between \`unstable_ViewTransition\` and \`ViewTransition\`
  - Web search results showed \`import { unstable_ViewTransition as ViewTransition } from 'react'\`
  - The official Next.js docs show \`import { ViewTransition } from 'react'\`
  - **Resolution:** Chose the non-prefixed form per current docs; confirmed it compiles [web search] [docs]

- 🟢 First build succeeded — \`✓ Compiled successfully in 2.7s\`, all 10 static pages generated [sandbox]

- 🔴 \`next/image\` with Unsplash URLs caused runtime 500 after a clean build pass
  - \`next build\` completed with no errors or warnings
  - Dev server returned HTTP 500: \`Invalid src prop ... hostname "images.unsplash.com" is not configured\`
  - **Resolution:** Added \`images.remotePatterns\` for \`images.unsplash.com\` in \`next.config.ts\`. Second build succeeded. [sandbox]

- 🟡 Hidden React version split — \`import { ViewTransition } from 'react'\` works only via Next.js aliasing
  - User-space \`react\` is \`19.2.4\` and does NOT export \`ViewTransition\`
  - Next.js bundles \`react@19.3.0-canary-...\` which DOES export it
  - No docs or error messages explain this indirection [sandbox]

- 🟡 \`transitionTypes\` prop on \`<Link>\` leaves no HTML trace in SSR output
  - Grepped SSR HTML for \`nav-forward\`, \`nav-back\`, \`transition-types\` — none appeared
  - Cannot verify correct wiring without a real browser [sandbox]

- 🟢 Both routes return HTTP 200, no server errors after \`remotePatterns\` fix [sandbox]
`;
