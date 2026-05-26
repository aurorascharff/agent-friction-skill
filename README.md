# friction-log SKILL

A pair of skills for **AI agents** to document agentic developer experience friction. Same vocabulary, opposite control flow:

- **`friction-log`** (active) — the user explicitly asks for a friction log. The agent does the task, narrates friction as it happens, and writes a markdown file in the workspace.
- **`friction-observe`** (passive) — runs in the background of any task. The agent silently collects friction, then at end-of-task opens a pre-filled review page so the human can decide whether to share the report with the framework team. No data is sent without human approval.

## Install

Active skill (`friction-log`):

```bash
npx skills add aurorascharff/agent-friction-skill
```

Passive skill (`friction-observe`):

```bash
npx skills add aurorascharff/agent-friction-skill/passive
```

## Active (`friction-log`) — explicit, on demand

### What it does

1. Agent attempts the task the user specifies
2. Logs friction in real time as it's encountered — what was tried, what happened, how it resolved
3. Folds any out-of-band user replies the harness surfaces mid-run (chat-thread messages, queued instructions) into the log as they arrive
4. Produces a structured friction log in markdown

### Example prompt

> Build a Next.js product grid and detail page. Clicking a thumbnail should morph into the detail image using React's <ViewTransition> component. Going back should reverse it. Use this skill: https://github.com/aurorascharff/agent-friction-skill

### Output format

- **Header** — date, model, harness, task description, repo link, output link, cumulative build time
- **Prompt** — the user's initial request verbatim, plus any clarifying exchanges
- **Tool Timeline** — chronological list of every tool call the agent made (terse one-liners); always written
- **Summary** — overall experience, biggest pain point, blast radius
- **Action Items** — split into three subsections:
  - **Docs** — 🔧-prefixed, friction fixable with better documentation, clearer callouts, or updated examples
  - **Framework** — 🔧-prefixed, friction requiring a code change (error messages, warnings, scaffold defaults, tooling)
  - **DX / Research** — 🔍-prefixed, open questions or investigations worth pursuing
- **Log** — chronological, severity-coded with 🟢 🟡 🔴
- **Skill Feedback** — 🔁-prefixed, added after user review; captures places where the skill itself caused the agent to behave incorrectly

### Viewing logs

Paste a finished friction log into **[agent-friction-skill.vercel.app](https://agent-friction-skill.vercel.app/)** to render it in a collapsible, severity-coded layout. Nothing leaves your browser — encoded logs travel as a URL fragment for shareable links. The viewer's source lives under [`agent-friction-skill-visualizer/`](https://github.com/aurorascharff/agent-friction-skill-visualizer).

## Passive (`friction-observe`) — always-on, silent

### What it does

1. The user asks for some task (not a friction log)
2. Agent does the task normally — no narration, no markdown file, no intervention in what the agent would otherwise do
3. While working, the agent buffers any 🟡/🔴 friction in memory using the same vocabulary as the active skill
4. At end-of-task, if anything was observed, the agent `POST`s a structured draft to `https://agent-friction-skill.vercel.app/api/draft` and opens the returned `review_url` in the agent browser
5. The human reviews the report (rendered with the same viewer as a hand-written log) and clicks **Submit** to send it to the framework team — or just closes the tab to discard it
6. On submit, the report is stored as markdown at `reports/YYYY-MM/<id>.md` in private Blob storage

### What the agent submits (and what it does NOT)

The payload is intentionally narrow — schema enforced server-side, unknown fields rejected:

- **Allowed:** framework + version, severity (🟡/🔴), short title, expected/actual/resolution prose, source tag, optional `file_kind` label (`"route handler"`, `"next.config"`, etc.), optional one-line redacted snippet (max 200 chars), action items.
- **Forbidden:** the user's prompt verbatim, absolute paths, hostnames, full file contents, environment variables, tokens, snippets longer than one line.

Greens (🟢) are dropped at collection time — only 🟡/🔴 are eligible for submission. If nothing was observed, the agent submits nothing.

### Trigger

`friction-observe` runs whenever an agent has it loaded as a skill in the current session. How that happens depends on the harness:

- Some agentic harnesses auto-discover any `SKILL.md` they find in a project — drop the repo in and you're done.
- Others require an explicit `AGENTS.md` entry pointing at `passive/SKILL.md`, or a user invocation.

Either way, the skill defers entirely if the user explicitly invokes the active `friction-log` skill in the same run.

## References

- `SKILL.md` — active `friction-log` skill instructions
- `passive/SKILL.md` — passive `friction-observe` skill instructions
- `references/reading-the-log.md` — how a **human** should read the output (severity, action-item priority, source tags)
- `references/agent-behavior.md` — how the **agent** should behave while the active skill is running
- `references/template.md` — friction log output template
- `references/example.md` — real friction log from an actual agent run ([source repo](https://github.com/aurorascharff/fl-view-transition-morph))

