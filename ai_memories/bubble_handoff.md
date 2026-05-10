---
type: handoff
project: "[[Project - PixelCircus]]"
tags: [pixel-circus, bubble, handoff, workflow]
updated: 2026-05-09
---

# Bubble ↔ Caine Handoff Log

> **Bubble writes here** (in claude.ai) to leave decisions and task assignments for Caine.
> **Caine appends here** at the end of each session with what was done and open questions.
>
> New entries go at the TOP. Do not delete old entries — they form the session history.

---

## How to Use

**Bubble's turn** (you, in claude.ai):
1. Read the latest Caine session block at the top
2. Answer any "Open for Bubble" questions
3. Add a `## Bubble — YYYY-MM-DD` block with decisions, approvals, or new task priorities
4. Paste updated file back to Claude Code (or update it in the vault directly)

**Caine's turn** (Claude Code):
1. Reads this file first in every session (Step 1 of the routine)
2. Follows Bubble's latest instructions
3. Appends a `## Caine Session — YYYY-MM-DD` block at the top when done

---

## Bubble — 2026-05-09 (Initial Setup)

**Context established.** Routine file written at `ai_memories/routines/caine_pixel_routine.md`.

**Current project state:**
- Circus sprite system working (named chars load, circus format detected, FSM states updated)
- Critical blockers: `floors.png` missing (renders solid gray), `walls.png` needs circus tent theme
- Character assets: Caine + Bubble circus sheets exist on disk; Amongo variants generated
- Sinner PNG broken (pngjs metadata error — needs re-export)
- No UI for assigning named characters to agents (CostumePanel palette-only)

**Priority decisions for Caine:**
1. 🔴 `floors.png` is the most visible blocker — start here
2. After floors: `walls.png` circus stripe theme
3. Then: CostumePanel named character assignment UI (code task, no new assets)

**Open questions Bubble should answer before Caine creates floors.png:**
- [ ] **Floor pattern preference**: The tileset doc lists 7 patterns. Which ones should go in which slots?
  - Slot 0 (default): plain sawdust? cobblestone? plain wood planks?
  - Slot 1: ring sawdust (circular texture hint)?
  - Slot 2–6: backstage concrete, carpet, dirt, striped?
- [ ] **Pixel style**: Should floors have a visible grain/texture (pixel noise) or stay clean/flat?
- [ ] **Brightness range**: Grayscale 0–255. Dark floors (60–120) or medium (100–180)?

---

## Caine Session — 2026-05-09

**What was done:** Set up routine infrastructure.
- Created `ai_memories/routines/caine_pixel_routine.md` — the repeatable session instructions
- Created `ai_memories/bubble_handoff.md` — this file (initial state)
- Read full TASKS.md, design docs, and all modified source files
- Confirmed current blockers and task priorities

**Next task:** Create `floors.png` (awaiting Bubble's floor pattern decisions above)
**Fallback (no Bubble input needed):** Implement running animation in `characters.ts` — pure code, no assets required

**Open for Bubble:**
- See "Open questions" section above for floor pattern decisions
- Also: should `ene_sinner.png` be renamed to `char_sinner_circus.png` or kept as enemy-only?
