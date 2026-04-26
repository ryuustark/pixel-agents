# Character Animations — System Design & Extension Guide

## How the animation system works (current)

Every character runs through three layers each game tick:

```
updateCharacter()           ← advances ch.frame and ch.state (FSM)
  └─ getCharacterSprite()   ← picks one SpriteData from the loaded sprite atlas
       └─ getCachedSprite() ← renders SpriteData to an offscreen canvas at current zoom
            └─ ctx.drawImage() ← paints to the office canvas
```

### Layer 1 — FSM state (`ch.state`)

Three states, each with its own frame cadence:

| State | Trigger | Frame cadence | Duration constant |
|---|---|---|---|
| `TYPE` | agent becomes active (tool running) | `frame % 2` → 2 frames alternating | `TYPE_FRAME_DURATION_SEC = 0.3s` |
| `WALK` | pathfinding to seat | `frame % 4` → 4-step ping-pong | `WALK_FRAME_DURATION_SEC = 0.15s` |
| `IDLE` | agent inactive, wandering | static frame 1 (no animation) | — |

`frameTimer` accumulates delta-time each tick; when it exceeds the duration threshold, `frame` increments and `frameTimer` wraps.

### Layer 2 — Direction (`ch.dir`)

Four values: `DOWN=0, LEFT=1, RIGHT=2, UP=3`.

- **During WALK**: recalculated every frame by `directionBetween()` — the direction toward the next pathfinding tile.
- **During TYPE/IDLE**: fixed at the seat's `facingDir` (set when the character sits down).
- **UP is geometry-only**: the UP sprite is not drawn — `getCharacterSprite()` substitutes the RIGHT-facing side view (`ch.dir === Direction.UP ? Direction.RIGHT : ch.dir`). This preserves desk-detection and seat-facing geometry without needing a back-view sprite.

### Layer 3 — Sub-animation (tool type)

Inside TYPE state, the tool name decides which 2-frame pair plays:

```
isReadingTool(ch.currentTool) → sprites.reading[dir]   (frames 5-6 in PNG)
otherwise                     → sprites.typing[dir]    (frames 3-4 in PNG)
```

`isReadingTool` matches: `Read, Grep, Glob, WebFetch, WebSearch`.

---

## Current sprite sheet layout (char_cc.png — 336×144px)

```
         F0        F1        F2        F3        F4        F5        F6
       walk1     walk2     walk3     jump1     jump2    sleep1    sleep2
      ┌────────┬────────┬────────┬────────┬────────┬────────┬────────┐
DOWN  │        │        │        │        │        │        │        │  y: 0–47
      ├────────┼────────┼────────┼────────┼────────┼────────┼────────┤
UP    │(unused)│(unused)│(unused)│(unused)│(unused)│(unused)│(unused)│  y: 48–95
      ├────────┼────────┼────────┼────────┼────────┼────────┼────────┤
RIGHT │        │        │        │        │        │        │        │  y: 96–143
      └────────┴────────┴────────┴────────┴────────┴────────┴────────┘
      ◄─ 48px ►◄──────────────── 7 × 48 = 336px wide ─────────────────►
      ◄──────────────────── 3 × 48 = 144px tall ─────────────────────►
```

- LEFT is auto-generated at runtime by flipping RIGHT horizontally.
- Row 1 (UP direction) is loaded but never rendered (see Layer 2 above).

---

## Animation vocabulary → current code mapping

| Animation intent | Current state | Frames used | Speed |
|---|---|---|---|
| **walking** | `WALK` | F0→F1→F2→F1 (ping-pong) | `WALK_FRAME_DURATION_SEC` |
| **running** | `WALK` | same frames, faster timer | halve `WALK_FRAME_DURATION_SEC` |
| **sitting/typing** | `TYPE` + non-reading tool | F3→F4 alternating | `TYPE_FRAME_DURATION_SEC` |
| **sleeping/reading** | `TYPE` + reading tool | F5→F6 alternating | `TYPE_FRAME_DURATION_SEC` |
| **idle** | `IDLE` | static F1 | none |
| **jumping** | could reuse F3-F4 at faster speed | F3→F4 | faster timer |
| **special** | future — needs new frames | F7-F8 (not yet in sheet) | TBD |

---

## Extended sprite sheet format (future — for new animations)

To add running, idle breathing, and a special animation without breaking the current loader, extend the sheet **horizontally** (add more frame columns). Update `CHAR_FRAMES_PER_ROW` in `src/constants.ts`.

Proposed layout for a 10-frame sheet (480×144px per character):

```
F0–F2   walk1, walk2, walk3         (current)
F3–F4   jump1, jump2                (current — used for writing tools)
F5–F6   sleep1, sleep2              (current — used for reading tools)
F7–F8   run1, run2                  (new — faster walk pose)
F9      idle (subtle breathing)     (new — replaces static frame)
```

`CHAR_FRAMES_PER_ROW` would change from 7 → 10.

---

## Behavior design — mapping tool/state to animation

### Proposed `CharacterAnim` enum (new concept)

```typescript
const CharacterAnim = {
  WALK:    'walk',     // moving between tiles
  RUN:     'run',      // moving while active (tool just triggered)
  IDLE:    'idle',     // inactive, wandering pause
  JUMP:    'jump',     // write/edit/bash/task (active computation)
  SLEEP:   'sleep',    // read/grep/glob/webfetch (passive lookup)
  SPECIAL: 'special',  // special tool or event (future)
} as const
```

### Trigger rules

| Condition | Animation |
|---|---|
| `state === IDLE` | `IDLE` (static or subtle loop) |
| `state === WALK && !ch.isActive` | `WALK` (normal speed) |
| `state === WALK && ch.isActive` | `RUN` (faster timer, run frames) |
| `state === TYPE && isReadingTool(tool)` | `SLEEP` (F5-F6) |
| `state === TYPE && !isReadingTool(tool)` | `JUMP` (F3-F4) |
| `state === TYPE && tool === 'special'` | `SPECIAL` (F7-F8, if sheet has them) |

### Frame speed constants to add (webview-ui/src/constants.ts)

```typescript
export const RUN_FRAME_DURATION_SEC  = 0.08   // ~2× faster than walk
export const IDLE_FRAME_DURATION_SEC = 0.6    // slow breathing
export const JUMP_FRAME_DURATION_SEC = 0.2    // slightly faster than type
```

---

## Implementation roadmap

### Step 1 — Running (no new sprite frames needed)
- In `updateCharacter()` WALK branch: check `ch.isActive` and use `RUN_FRAME_DURATION_SEC` instead of `WALK_FRAME_DURATION_SEC`.
- In `getCharacterSprite()`: when running, use a different frame index range if run frames exist, otherwise reuse walk frames at faster speed.
- Character interface: add `runFrameTimer` or just change the speed threshold inline.

### Step 2 — Animated IDLE (needs 1 new frame in sheet)
- Add frame F9 to the PNG (idle/breathing pose).
- In IDLE state, cycle `frame % 2` between F1 (neutral) and F9 (exhale) at `IDLE_FRAME_DURATION_SEC`.

### Step 3 — Run frames (needs new PNG frames F7-F8)
- Add run pose frames to all 3 direction rows.
- In `getCharacterSprites()`, add `run` key alongside `walk`, `typing`, `reading`.
- Map F7→run[0], F8→run[1], use `frame % 2` at faster speed.

### Step 4 — Special animation (needs F10-F11 or similar)
- Add a `special` key to `CharacterSprites`.
- Trigger on specific tool names (e.g. `Agent`, `Task`) or on achievement events.

---

## Files to modify for each step

| File | Change |
|---|---|
| `src/constants.ts` | `CHAR_FRAMES_PER_ROW` when adding new frames |
| `webview-ui/src/constants.ts` | new `*_FRAME_DURATION_SEC` constants |
| `webview-ui/src/office/engine/characters.ts` | `updateCharacter()` frame cadence, `getCharacterSprite()` dispatch |
| `webview-ui/src/office/sprites/spriteData.ts` | `CharacterSprites` interface + `getCharacterSprites()` frame mapping |
| `webview-ui/public/assets/characters/char_cc.png` | add new animation frame columns |
