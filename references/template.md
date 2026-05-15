# Friction Log Template

```markdown
# Friction Log: [Task Name]

**Date:** [today's date]
**Model:** [e.g. Claude Sonnet 4.6, GPT-4o]
**Harness:** [e.g. Claude Code, Cursor, DX Agent]
**Task:** [brief description of what was being attempted]
**Input:** [link or path to the input repo or project being tested — if applicable]
**Output:** [link to resulting repo, deployment, or artifact — if applicable]
**Build time:** [omit until you have run a build at least once. After each build, rewrite with the cumulative seconds, e.g. "42s". Never write "[pending]" or "[TBD]".]

---

## Prompt

> [the user's initial request, verbatim]

> **Agent:** [any clarifying questions asked before starting — only if you were genuinely unable to start without an answer]

> [user's response, if any]

---

## Summary

[2–4 sentences. What went well? What was the biggest pain point? What's the blast radius of the friction?]

## Action Items

### Docs
[Friction that can be fixed with better documentation, clearer callouts, or updated examples.]

- 🔧 [what to fix]
  Context: [what happened — the specific error, behavior, or confusion that led to this item]

### Framework
[Friction that requires a code change — error messages, warnings, scaffold defaults, tooling, or agent-layer infrastructure.]

- 🔧 [what to fix]
  Context: [what happened — the specific error, behavior, or confusion that led to this item]

### DX / Research
[Open questions or investigations worth pursuing — patterns worth validating, tooling to explore, or follow-up experiments.]

- 🔍 [what to look into]
  Context: [what happened — the specific error, behavior, or confusion that led to this item]

## Log

[Chronological account of what happened. Use severity emoji. Include what you tried, what you expected, what actually happened, searches or workarounds, and links encountered. If the harness injected an out-of-band user reply mid-run (chat-thread reply, queued message), include the exchange verbatim using blockquotes at the point in time it arrived.]

- 🟢 [step that went well]
  - [detail]

- 🔴 [friction point title]
  - [what you expected vs what actually happened]
  - 🟡 [attempted workaround or sub-step]
    - [what happened]
  - > **User:** [verbatim out-of-band reply, if one arrived at this point]
  - > **Agent:** [verbatim reply you sent back, if any]
  - **Resolution:** [what you did to fix it and why it worked — or "unresolved" if you moved on]
  - 🔧 [resulting recommendation]

## Tool Timeline (optional)

[Only include this section if your harness does NOT auto-append it. If the harness appends a tool timeline for you, do not write one — your job is the human-readable narrative. If you do write one yourself, list tool calls chronologically with timestamps:]

- `13:42:07 UTC` building app...
- `13:42:31 UTC` writing app/page.tsx...
- `13:42:34 UTC` starting dev server...

## Skill Feedback

[Meta-feedback about this skill's own behavior during the task — added after the user reviews the log. This section captures places where the agent failed to check in, asked the wrong questions, or behaved incorrectly because the skill itself lacked the right instruction. This is NOT DX feedback for the developer — it is feedback for improving the skill.

If the agent's failure was caused by the task environment (e.g. a misleading error message, missing docs), that belongs in Action Items, not here.]

- 🔁 [what the agent did wrong]
  - [why — was this a missing instruction, an unclear trigger, or a wrong default behavior?]
  - [what the skill should say instead]
```
