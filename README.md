# friction-log SKILL

A skill for **AI agents** to document agentic developer experience friction as they encounter it during a task. The output is a structured friction log that captures where agents get stuck, go wrong, or need better tooling — and what would fix it.

## What it does

1. Agent attempts the task the user specifies
2. Logs friction in real time as it's encountered — what was tried, what happened, how it resolved
3. Folds any out-of-band user replies the harness surfaces mid-run (chat-thread messages, queued instructions) into the log as they arrive
4. Produces a structured friction log in markdown

## Output format

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

## Viewing logs

Paste a finished friction log into **[agent-friction-skill.vercel.app](https://agent-friction-skill.vercel.app/)** to render it in a collapsible, severity-coded layout. Nothing leaves your browser — encoded logs travel as a URL fragment for shareable links. The viewer's source lives under [`visualizer/`](visualizer/).

## References

- `references/reading-the-log.md` — how a **human** should read the output (severity, action-item priority, source tags)
- `references/agent-behavior.md` — how the **agent** should behave while this skill is active
- `references/template.md` — friction log output template
- `references/example.md` — real friction log from an actual agent run ([source repo](https://github.com/aurorascharff/fl-view-transition-morph))
