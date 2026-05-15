# Friction Log Viewer

A standalone Next.js app for viewing a `friction-log.md` file in a clean, collapsible layout.

Live at **<https://agent-friction-skill.vercel.app/>**.

## Routes

- **`/`** — centered paste box plus a "Fill with example" button. Paste a log or click "View" to navigate to `/view#log=…`.
- **`/view#log=<payload>`** — render a log from a URL hash. Click "Copy share link" to build one. The log never leaves the browser; the fragment is gzip+base64-encoded client-side.

## Local development

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm typecheck
pnpm build
```

## What it renders

- `# / ## / ###` headings become collapsible sections (Summary, Action Items, Log).
- Bullets prefixed with 🔴/🟡/🟢 render as colored dots.
- Action items prefixed with 🔧 / 🔍 get a wrench / magnifier icon.
- Source tags like `[web search]`, `[docs]`, `[sandbox]` render as colored pills.
- Backticked spans and code-like paths (`/path/to/file.ts`, `next.config`, `proxy.ts`, `cookies()`) auto-format as inline code.
- `**bold**` survives.

No backend, no database, no auth. Everything is client-side.
