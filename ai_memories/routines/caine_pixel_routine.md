---
type: routine
project: "[[Project - PixelCircus]]"
status: active
version: 1
tags: [pixel-circus, routine, caine, workflow]
updated: 2026-05-09
---

# Caine Pixel Routine — v1

> Trigger this routine manually by starting a Claude Code session and saying:
> **"run pixel routine"** or **"caine routine"**
>
> Caine will follow these steps each session to make one small, verified improvement.

---

## Step 1 — Read Context (always, before anything else)

Read in order:
1. `ai_memories/bubble_handoff.md` — what Bubble decided or flagged last session
2. `TASKS.md` — current task board (priorities and status)
3. `design/art/art-bible.md` — visual rules (only the relevant section for today's task)
4. `CLAUDE.md` — architecture reference (only if touching a file not recently read)

**Output**: In one sentence, state what was found in the handoff file and what the obvious next task is.

---

## Step 2 — Pick Task (confirm with user)

Criteria (in order):
- Priority: 🔴 Critical before 🟠 Characters before 🟡 Furniture before 🟢 Polish
- Size: prefer tasks that fit in one session (single file change or one new asset)
- Skill match: code tasks don't need user approval mid-way; asset tasks need shape approval first

**Output**: One sentence naming the chosen task. Wait for user to confirm or redirect before proceeding.

---

## Step 3 — Asset Tasks: Spec First, Then Create

If the task involves a new sprite/PNG:

1. Invoke `/art-bible` skill — verify the asset rules before speccing
2. Invoke `/asset-spec` skill — write the formal spec:
   - Dimensions, format, color palette
   - Per-frame description (what each frame depicts, pixel-level if needed)
   - How it connects to existing code
3. **Show the user the spec and shape description. Wait for approval.**
4. Only after approval: generate the pixel data / run the script / write the file

If the task is code only → skip to Step 4 directly.

---

## Step 4 — Implement & Verify

**Code tasks:**
- Read the critical files (use file paths from CLAUDE.md)
- Make the minimum change needed
- Run `npm run build` from the project root and confirm it passes
- No extra refactoring, no extra comments

**Asset tasks (post-approval):**
- Write the PNG file to `webview-ui/public/assets/` (correct subfolder)
- Confirm dimensions match spec
- Describe the result in one sentence so user can visually check

---

## Step 5 — Update TASKS.md

- Mark the completed item `- [x]`
- Add any new sub-tasks discovered during implementation
- Do NOT commit — user decides when to commit

---

## Step 6 — Write Session Notes to Bubble Handoff

Update `ai_memories/bubble_handoff.md`:
- What was done this session (file changed, asset created, etc.)
- What's next (the next 🔴/🟠 task to tackle)
- Any open questions for Bubble to review (visual approval, direction decisions)
- Do NOT overwrite Bubble's sections — append a new dated session block

---

## Bubble ↔ Caine Split

| Who | Does what |
|-----|-----------|
| **Bubble** (claude.ai) | Visual review, palette decisions, shape approval, writing `bubble_handoff.md` |
| **Caine** (Claude Code) | Code implementation, asset generation, TypeScript build, task tracking |

Bubble's instructions to Caine go in `ai_memories/bubble_handoff.md`.
Caine's questions for Bubble go in the same file's "Open Questions" section.

---

## Asset Skills Reference

| Skill | When to use |
|-------|-------------|
| `/art-bible` | Before speccing any new sprite — checks visual rules |
| `/asset-spec` | When writing a formal spec for a new asset |

Always invoke `/art-bible` before `/asset-spec`. Never create an asset without a user-approved spec.

---

## Parallel Agent Permissions

To let Caine spawn sub-agents without confirmation prompts, add to `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": ["Task", "Agent", "Bash(*)", "Read(*)", "Write(*)", "Edit(*)", "Glob(*)", "Grep(*)"]
  }
}
```

Or run: `/fewer-permission-prompts` to auto-generate the allowlist from past sessions.
