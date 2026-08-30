---
name: friction-report
description: >
  Invoke at the end of every dev session, including when the user
  signals they're wrapping up. Scans the conversation for framework
  friction and drafts a report if any was found. Silent exit otherwise.
  Don't defer to later.
---

# friction-report

End-of-session friction reporter. Scans the conversation you just had for build failures, doc gaps, SDK surprises, misleading errors, and training-data fallbacks. If anything worth reporting was found, drafts a structured report for human review. If the session was clean, exits silently.

No buffer, no per-turn tracking, no initialization step. Your conversation history is the source of truth.

## When to run

- At the end of a dev session — when the user says "done", "thanks", "that's it", or when the task is clearly complete
- When the user explicitly asks: "report your friction", "what friction did you hit?", "give me the friction report"
- When the harness invokes this skill by name

If the user explicitly invoked the `friction-log` skill during this session, **do not run** — that skill already produced a detailed log.

## Payload

Matches the same schema the visualizer validates. All top-level fields:

- **`schema_version`** — always `1`.
- **`framework`** — what was being used (e.g. `next`, `vite`, `remix`). Required.
- **`framework_version`** — exact version from `package.json` or CLI. Required.
- **`summary`** — one sentence, biggest pain point. No user prompt verbatim, no code. Required.
- **`model`** — your model id (e.g. `claude-opus-4-7`). Optional.
- **`harness`** — what you're running in (e.g. `VS Code agent`, `Claude Code`). Optional.
- **`scaffold_flags`** — flags used when scaffolding (e.g. `["--typescript", "--app"]`). Optional.
- **`build_count`** — how many builds ran during the session. Optional.
- **`cumulative_build_ms`** — total build time in ms. Optional.
- **`friction_points[]`** — each one has:
  - `severity`: `red` (blocked/broken) or `yellow` (extra steps/guesswork). Do NOT include greens.
  - `title`: one-line description, ≤200 chars.
  - `expected`: what you thought would happen. Strongly recommended, not optional in practice — without it, the report can't be reproduced.
  - `actual`: what actually happened. Strongly recommended, include the full causal chain when one symptom was caused by a separate upstream mistake (e.g. "page omitted Suspense because feature pre-wrapped its own, contradicting the architecture skill").
  - `resolution`: how it was fixed, or "unresolved". Strongly recommended.
  - `source_tag`: one of `agents.md`, `docs`, `url`, `web search`, `training data`, `error output`, `sandbox`, `skill`.
  - `file_kind`: what kind of file (e.g. `route handler`, `next.config`). Never an absolute path. Optional.
  - `redacted_snippet`: one redacted line of error output, ≤200 chars. Optional.
- **`action_items[]`** — each one has:
  - `bucket`: `docs`, `framework`, or `research`.
  - `title`: what should be fixed or investigated.
  - `context`: the specific friction that led to this item, including upstream causes when relevant.

A friction report with only a `title` and a one-line `action_items[].title` is a placeholder, not a report. Fill in `expected`, `actual`, and `resolution` for every point. If a session had multiple frictions (e.g. one wrong stack trace + one architecture violation that caused it), file them as separate points and reference each other in `actual`.

**Sanitize.** Strip anything identifying the user, their project, or containing secrets/PII. Can't describe it without leaking? Drop it.

## How to scan

Scan the **whole conversation**, not just the most recent error. The same friction often has a tail: the first symptom, the dead ends, the things the user had to correct, the architectural mistake that compounded into the visible error. Read backward through the session and collect every contributing factor before drafting.

For each candidate friction, before writing it up, ask:

- **What was the first thing the user noticed?** That's the visible symptom for `title`.
- **What was the actual root cause?** That's the `actual` field.
- **What did the agent (you) believe before realizing the root cause?** That's the `expected`.
- **Did the user have to redirect you, ask you to look deeper, or reject your first answer?** Each of those is its own friction point and belongs as a separate entry, not collapsed into one.
- **Was there an architectural pattern violation upstream that made the surface error harder to diagnose?** Name it explicitly in the `context` field of the action item.

Look through the conversation for:

1. **Build/type errors that took >1 attempt** — each retry is a 🟡 at minimum
2. **Errors where the message didn't point at the fix** — "please remove it" without saying why → 🟡
3. **Errors that pointed at the wrong file** — layout error blamed on a page → 🔴
4. **Falling back to training data** — you knew the answer but couldn't find it in docs → 🟡
5. **Grepping SDK type definitions** instead of finding it in docs → 🟡
6. **API patterns that required non-obvious knowledge** — private blob reads, `server-only` splits → 🟡
7. **Tooling that silently did the wrong thing** — stale caches, version mismatches → 🔴
8. **Anything the user had to correct you on** — the correction itself is friction signal, write it as its own point
9. **Errors whose stack trace pointed at a benign location** — when the real cause was several layers up or down the JSX/call tree → 🔴

If none of these were present, **exit silently**. Do not tell the user there was nothing to report.

## Before you submit

Only submit a draft when the user has explicitly asked in the current conversation to draft the report or open its submission form. That request authorizes one report. Do not reuse it for later reports.

First tell the user what you observed and why you think it is worth reporting. They should see the reasoning before the form opens.

Format the pre-submission note as:

> **Friction noticed**: <one-line description>
>
> **Why it matters**: <one-line impact, e.g. "stack trace pointed at the wrong line, took an extra read of the file to find the actual cause">
>
> Drafting a report.

Then proceed to submit.

## Submit

POST the payload as JSON to `https://agent-friction-skill.vercel.app/api/draft`:

```text
POST /api/draft
Content-Type: application/json

{
  "schema_version": 1,
  "framework": "next",
  "framework_version": "16.3.0-canary.19",
  "model": "claude-opus-4-7",
  "harness": "VS Code agent",
  "scaffold_flags": ["--typescript", "--app", "--turbopack"],
  "build_count": 2,
  "cumulative_build_ms": 1430,
  "summary": "One sentence describing the biggest pain point.",
  "friction_points": [
    {
      "severity": "red",
      "title": "Scaffold installed a version without the required feature",
      "expected": "pnpm create installs a line that includes otelTracing",
      "actual": "Installed 0.1.x; tracing was future work",
      "resolution": "Upgraded explicitly with pnpm add @daloyjs/core@0.4.0",
      "source_tag": "error output",
      "file_kind": "package.json"
    }
  ],
  "action_items": [
    {
      "bucket": "framework",
      "title": "create-daloy starter should match the feature set advertised on daloyjs.dev",
      "context": "Scaffold installed @daloyjs/core@0.1.x where otelTracing did not exist."
    }
  ]
}
```

The response is `{ draft_id, review_url, expires_in_seconds }`.

Treat `review_url` as opaque. Use the exact string returned by the API without retyping, reconstructing, normalizing, shortening, or copying it from an earlier message.

Pass `review_url` directly to the in-app browser, or the harness's equivalent browser-opening capability, so the submission form is ready for the user. Do not make the user click a second link or confirm the browser action. If no browser capability is available, return the exact `review_url` prominently instead.

Tell the user explicitly that you drafted a friction report and that they need to take action to submit it. Use a formatted callout, not a buried inline sentence. Include:

1. A clear heading (e.g. **Friction report drafted**)
2. A one-line summary of what each friction point covers
3. An explicit instruction that the open page is the consent surface and the draft expires in 10 minutes
4. The exact review URL only when the browser could not be opened

Example format when the browser opened successfully:

> **Friction report drafted**
>
> I noticed some friction worth reporting:
> - <one-line summary of point 1>
> - <one-line summary of point 2>
>
> The submission form is open. Nothing is shared until you click Submit, and the draft expires in 10 minutes.

If the POST fails after an explicit request, report the error instead of silently falling back to the read-only viewer.
