---
type: tasks
project: "[[Project - PixelCircus]]"
status: active
tags: [pixel-circus, tasks, development]
updated: 2026-04-27
---

# PixelCircus — Task Board

> Live task list for the `zz_PixelCircus/` extension project.
> Full context: [[Project - PixelCircus]] · Config docs: `ai_memories/configuration/`

---

## ✅ Done

- [x] Switch all agents to `char_cc.png` (48×48 px per frame, 336×144 sheet)
- [x] Update all size constants — `CHAR_FRAME_W/H`, matrix effect, hit box, bubbles, overlay
- [x] Remove UP-facing sprite — characters now use RIGHT side-view when moving upward
- [x] Write `ai_memories/configuration/character-sprites.md` — PNG layout reference
- [x] Write `ai_memories/configuration/character-animations.md` — FSM explainer + behavior map
- [x] Write `ai_memories/configuration/character-formats.md` — 3 format design + stream-avatar loader spec
- [x] Write `ai_memories/configuration/tileset-circus.md` — full tileset inventory + circus theme guide

---

## 🔴 Critical / Foundational

- [ ] **Create `floors.png`** — currently missing, everything renders as solid gray
  - 112×16 px, 7 grayscale 16×16 patterns side by side
  - See pattern suggestions in `ai_memories/configuration/tileset-circus.md`
  - Place at `webview-ui/public/assets/floors.png` → rebuild
  BUGS: 
  ![alt text]({B3D4C6E1-F211-4EDA-A280-5BFCA7A4EC3E}.png)
  from the latest build it differentiated correctly. but now lets not waste the whole 7 tiles in lava. 

  lets rething them so it can be tile from lava or  water orsand or other options. see also the floor pattern down, is not looking too bad, if we have longer horizonral patterns it can be used for water and sand, and the more vertical patterns can be used for lava.

- [ ] **Replace `walls.png` with circus tent stripe** — current walls are plain
  - Keep same 4×4 bitmask grid layout (64×128 px, 16 pieces of 16×32)
  - Use `scripts/wall-tile-editor.html` to draw; `node scripts/generate-walls.js` to export
  - Red+white vertical stripes, gold trim at top edge

---

## 🟠 Characters

- [ ] **Verify `char_cc.png` animation frames visually**
  - Confirm F0–F2 are walk, F3–F4 are jump/type, F5–F6 are sleep/read
  - Check UP row (row 1, y: 48–95) — still loaded but never rendered; can be repurposed

- [ ] **Add companion manifest `char_cc_meta.json`**
  - Documents frame labels, fps per animation, directions mode
  - Template in `ai_memories/configuration/character-formats.md`
  - Place alongside PNG at `webview-ui/public/assets/characters/char_cc_meta.json`

- [ ] **Implement running animation** (no new sprite frames needed)
  - In `updateCharacter()` WALK branch: if `ch.isActive`, use `RUN_FRAME_DURATION_SEC` (≈0.08s) instead of normal walk speed
  - Add `RUN_FRAME_DURATION_SEC` constant to `webview-ui/src/constants.ts`
  - File: `webview-ui/src/office/engine/characters.ts`

- [ ] **Implement Format B (stream-avatar) loader**
  - Support row-per-animation sheets with companion JSON manifest
  - Detection: check for `char_NAME_meta.json` alongside PNG
  - Full spec in `ai_memories/configuration/character-formats.md`
  - Files: `src/assetLoader.ts`, `webview-ui/src/office/sprites/spriteData.ts`

- [ ] **Add circus character roster sprites** (6 sheets)
  - Slot 0 → Caine (rune/hood), slot 1 → Bubble, slot 2 → Task Agent (clown lite)
  - Slot 3 → Ringmaster (top hat), slot 4 → Acrobat, slot 5 → Stagehand
  - Format A2: 336×144 px per sheet (48×48 frames, 7×3 grid)
  - Or Format B if using stream-avatar sheets

---

## 🟡 Furniture & Layout

- [ ] **Replace hardcoded furniture sprites** in `webview-ui/src/office/sprites/spriteData.ts`
  - [ ] `DESK_SQUARE_SPRITE` → Ringmaster's Podium / circus desk
  - [ ] `CHAIR_SPRITE` → Bleacher stool / circus seat
  - [ ] `BOOKSHELF_SPRITE` → Prop cabinet
  - [ ] `WHITEBOARD_SPRITE` → Circus marquee banner
  - [ ] `LAMP_SPRITE` → Spotlight / torch
  - [ ] `PLANT_SPRITE` → Potted palm / prop plant
  - [ ] `COOLER_SPRITE` → Acrobat water bucket

- [ ] **Create new circus furniture via asset pipeline**
  - [ ] Big Top Pole — 1×3, `backgroundTiles=2`
  - [ ] Ring Rope — 2×1, low perimeter fence
  - [ ] Spotlight — 1×2 electronics, `on/off` state
  - [ ] Bleacher Row — 4×2, audience seating
  - [ ] Ticket Booth — 2×3 misc
  - [ ] Cannon — 2×2 misc
  - [ ] Tent Curtain — 1×2 wall, `canPlaceOnWalls=true`
  - [ ] Circus Poster — 2×2 wall, `canPlaceOnWalls=true`
  - [ ] Fire Torch (wall) — 1×1 wall, `on/off` state

- [ ] **Design circus default layout**
  - Main ring (sawdust FLOOR_1), bleachers around ring, backstage area, entrance with ticket booth
  - After designing in editor: command palette → "Pixel Agents: Export Layout as Default"
  - Suggested size: 40×28 tiles

---

## 🟢 Polish & Theme

- [ ] **UI color theme** — `webview-ui/src/index.css` `:root`
  - `--pixel-bg` → deep circus night `#0d0d1a`
  - `--pixel-border` → gold accent `#ffd700`
  - `--pixel-accent` → circus red `#cc2200`

- [ ] **Notification sound** — `webview-ui/src/notificationSound.ts`
  - Current: two-note chime E5→E6
  - Target: short 3-note fanfare (circus ta-da)

- [ ] **Animated IDLE state** (needs 1 new sprite frame)
  - Add a breathing/subtle pose as frame F7 (or reuse UP row in char_cc)
  - In `updateCharacter()` IDLE branch: cycle frame % 2 at `IDLE_FRAME_DURATION_SEC`

- [ ] **Special animation slot**
  - Repurpose UP row (rows 48–95 in char_cc, currently unused) as special animation frames
  - Or extend sheet to 10 frames (add F7–F9 columns)
  - Trigger on `Agent` / `Task` tool start for a "boss call" reaction

---

## 🔵 Architecture / Future

- [ ] Update `Project - PixelCircus.md` milestones to reflect current state (48×48 done, Node 20 working)
- [ ] Auto-discover all `char_*.png` + companion `_meta.json` files in the characters folder

---

## Reference

| Config doc | Path |
|---|---|
| Sprite formats (3 types + stream-avatar) | `ai_memories/configuration/character-formats.md` |
| Animation FSM + behavior map | `ai_memories/configuration/character-animations.md` |
| Tileset layers + circus theme guide | `ai_memories/configuration/tileset-circus.md` |
| PNG layout reference | `ai_memories/configuration/character-sprites.md` |
| Full architecture | `CLAUDE.md` |
