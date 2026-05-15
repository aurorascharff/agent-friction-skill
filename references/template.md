# Friction Log Template

```markdown
# Friction Log: [Task Name]

**Date:** [today's date]
**Model:** [e.g. anthropic/claude-sonnet-4-6, GPT-4o]
**Harness:** [e.g. DX Agent (Slack bot), Claude Code, Cursor]
**Stack:** [framework + exact version, e.g. "Next.js v16.2.1-canary.20", "Vite 6.0.1", "Remix 2.14.0". Fetch from the running project (package.json, CLI `--version`, etc.) — never hand-write a placeholder. Omit this line only if the task is not framework-specific.]
**Build time:** [omit this line until you have run a build at least once. After each build, rewrite with the cumulative seconds and an attempt breakdown, e.g. "14s (2 builds: 7s + 7s)". Never write "[pending]" or "[TBD]". Omit if the task has no build step.]
**Task:** [one-sentence description of what was being attempted]
**Input:** [link or path to the input repo or project being tested — include only if the task started from an existing project]
**Output:** [link to resulting repo, deployment, or artifact — include only if applicable]

---

## Prompt

> [the user's initial request, verbatim]

> **Agent:** [a clarifying question, if one was needed before starting]

> [user's response, if any]

---

## Summary

[2–4 sentences. What went well? What was the biggest pain point? What's the blast radius of the friction?]

## Action Items

### Docs
[Friction that can be fixed with better documentation, clearer callouts, or updated examples.]

- 🔧 [what to fix]
  - Context: [what happened — the specific error, behavior, or confusion that led to this item. Include enough detail that the item makes sense without reading the full log.]

### Framework
[Friction that requires a code change — error messages, warnings, scaffold defaults, tooling, or agent-layer infrastructure.]

- 🔧 [what to fix]
  - Context: [what happened — the specific error, behavior, or confusion that led to this item. Include enough detail that the item makes sense without reading the full log.]

### DX / Research
[Open questions or investigations worth pursuing — patterns worth validating, tooling to explore, or follow-up experiments.]

- 🔍 [what to look into]
  - Context: [what happened — the specific error, behavior, or confusion that led to this item]

## Log

[Chronological account of what happened. Use severity emoji. Include what you tried, what you expected, what actually happened, searches or workarounds, and links encountered. If the harness injected an out-of-band user reply mid-run (chat-thread reply, queued message), include the exchange verbatim using blockquotes at the point in time it arrived.]

- 🟢 [step that went well]
  - [detail] [source-tag]

- 🟡 [minor friction title]
  - [what you tried and how you resolved it] [source-tag]

- 🔴 [major friction title]
  - [what you expected vs what actually happened]
  - [attempted workarounds, additional evidence]
  - > **User:** [verbatim out-of-band reply from the user, if one arrived at this point]
  - > **Agent:** [verbatim reply you sent back, if any]
  - **Resolution:** [what you did to fix it and why it worked — or "unresolved" if you moved on] [source-tag]

## Tool Timeline (optional)

[Only include this section if your harness does NOT auto-append it. If the harness appends a tool timeline for you, do not write one — your job is the human-readable narrative. If you do write one yourself, list tool calls chronologically with timestamps:]

- `13:42:07 UTC` building app...
- `13:42:31 UTC` writing app/page.tsx...
- `13:42:34 UTC` starting dev server...

## Skill Feedback

[Meta-feedback about this skill's own behavior during the task — added by the user after reviewing the log. This section captures places where the agent behaved incorrectly because the skill itself lacked the right instruction — e.g. silently filled gaps with training data, missed an out-of-band reply, wrote placeholders instead of progressive logs, or skipped a required section. This is NOT DX feedback for the developer — it is feedback for improving the skill.

If the agent's failure was caused by the task environment (e.g. a misleading error message, missing docs), that belongs in Action Items, not here.]

- 🔁 [what the agent did wrong]
  - [why — was this a missing instruction, an unclear trigger, or a wrong default behavior?]
  - [what the skill should say instead]
```
