# friction-log SKILL

A skill for **AI agents** to document agentic developer experience friction as they encounter it during a task. The output is a structured friction log that captures where agents get stuck, go wrong, or need better tooling — and what would fix it.

## What it does

1. Agent attempts the task the user specifies
2. Logs friction in real time as it's encountered — what was tried, what happened, how it resolved
3. Pushes uncertainty into the log as friction rather than parking the run to ask the user. If the harness injects an out-of-band user reply mid-run (chat-thread reply, queued message), the agent folds it into the log and continues
4. Produces a structured friction log in markdown

## Output format

- **Header** — date, model, harness, task description, repo link, output link, cumulative build time
- **Prompt** — the user's initial request verbatim, plus any clarifying exchanges
- **Summary** — overall experience, biggest pain point, blast radius
- **Action Items** — split into three subsections:
  - **Docs** — 🔧-prefixed, friction fixable with better documentation, clearer callouts, or updated examples
  - **Framework** — 🔧-prefixed, friction requiring a code change (error messages, warnings, scaffold defaults, tooling)
  - **DX / Research** — 🔍-prefixed, open questions or investigations worth pursuing
- **Log** — chronological, severity-coded with 🟢 🟡 🔴
- **Tool Timeline** — optional; only written by the agent if the harness doesn't auto-append one
- **Skill Feedback** — 🔁-prefixed, added after user review; captures places where the skill itself caused the agent to behave incorrectly

## References

- `references/agent-behavior.md` — how the agent should behave while this skill is active
- `references/template.md` — friction log output template
- `references/example.md` — real friction log from an actual agent run
