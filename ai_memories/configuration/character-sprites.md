# Character Sprites — Structure & Configuration

## PNG Layout

Each character is one PNG file (`assets/characters/char_0.png` through `char_5.png`).

**Current size: 112×96 pixels** — 7 frames wide × 3 direction rows tall.

```
         F0        F1        F2        F3        F4        F5        F6
       walk1     walk2     walk3     type1     type2     read1     read2
      ┌────────┬────────┬────────┬────────┬────────┬────────┬────────┐
DOWN  │ x:0    │ x:16   │ x:32   │ x:48   │ x:64   │ x:80   │ x:96   │  y: 0–31
      ├────────┼────────┼────────┼────────┼────────┼────────┼────────┤
UP    │        │        │        │        │        │        │        │  y: 32–63
      ├────────┼────────┼────────┼────────┼────────┼────────┼────────┤
RIGHT │        │        │        │        │        │        │        │  y: 64–95
      └────────┴────────┴────────┴────────┴────────┴────────┴────────┘
      ◄─ 16px ►◄──────────── 7 × 16 = 112px wide ──────────────────►
      ◄──────────────── 3 × 32 = 96px tall ───────────────────────►
```

- **Frame size**: 16×32px per cell
- **Character art**: 24px tall, bottom-aligned within the 32px cell (8px transparent top padding)
- **LEFT direction**: never stored — generated at runtime by horizontally flipping RIGHT

---

## Frame Usage by State

| State | Tool | Frame cycle | PNG frames used |
|---|---|---|---|
| **WALK** | — | `[F0, F1, F2, F1]` (ping-pong loop) | walk1, walk2, walk3 |
| **IDLE** | — | static `F1` | walk2 (neutral standing pose) |
| **TYPE** | Write, Edit, Bash, Task, etc. | `[F3, F4]` alternating | type1, type2 |
| **TYPE** | Read, Grep, Glob, WebFetch, WebSearch | `[F5, F6]` alternating | read1, read2 |

The WALK cycle is 4 logical steps but only 3 unique images: F0→F1→F2→F1. No dedicated idle frame exists — idle borrows the walk2 standing pose.

---

## Rendering

Characters are drawn **anchor bottom-center** at their world position:

```
drawX = ch.x * zoom - sprite.width / 2
drawY = (ch.y + sittingOffset) * zoom - sprite.height
```

- Feet land at `ch.y`, head reaches up `sprite.height` pixels.
- When seated (TYPE state): `CHARACTER_SITTING_OFFSET_PX = 6` shifts the character down so they visually sit in the chair.

---

## Where the Constants Live

### Backend — `src/constants.ts`

```ts
export const CHAR_FRAME_W = 16          // sprite cell width in pixels
export const CHAR_FRAME_H = 32          // sprite cell height in pixels
export const CHAR_FRAMES_PER_ROW = 7    // number of animation frames
export const CHAR_COUNT = 6             // number of palette variants
export const CHARACTER_DIRECTIONS = ['down', 'up', 'right'] as const
```

These drive the PNG parser in `src/assetLoader.ts:loadCharacterSprites()`. Changing them tells the loader how to slice the PNG into individual frame sprites.

### Webview — `webview-ui/src/constants.ts`

```ts
export const MATRIX_SPRITE_COLS = 16    // character pixel width (for matrix spawn/despawn effect)
export const MATRIX_SPRITE_ROWS = 24    // character body height (excludes top padding)
export const CHARACTER_SITTING_OFFSET_PX = 6   // px to shift down when seated
export const BUBBLE_SITTING_OFFSET_PX = 10     // speech bubble adjustment when seated
export const BUBBLE_VERTICAL_OFFSET_PX = 24    // speech bubble height above character top
```

---

## Changing Sprite Size

### Hard change — single fixed size

To switch every character to a new frame size (e.g. 48×48):

1. **Regenerate PNGs** — new total size: `7 × newW` wide, `3 × newH` tall.
   - Example for 48×48: 336×144px per character PNG.

2. **Update backend constants** (`src/constants.ts`):
   ```ts
   export const CHAR_FRAME_W = 48
   export const CHAR_FRAME_H = 48
   ```

3. **Update webview constants** (`webview-ui/src/constants.ts`):
   ```ts
   export const MATRIX_SPRITE_COLS = 48
   export const MATRIX_SPRITE_ROWS = 48       // adjust if top padding changes
   export const CHARACTER_SITTING_OFFSET_PX = 9   // scale: ~19% of frame height
   export const BUBBLE_SITTING_OFFSET_PX = 16     // review visually
   export const BUBBLE_VERTICAL_OFFSET_PX = 40    // approx new sprite body height
   ```

4. **Rebuild**: `npm run build` (or F5 for Extension Dev Host).

### Backward-compatible approach — auto-detect size

Instead of hardcoding, derive frame dimensions from the actual PNG at load time. In `src/assetLoader.ts:loadCharacterSprites()`, the PNG is already parsed — `png.width` and `png.height` are available:

```ts
const frameW = png.width / CHAR_FRAMES_PER_ROW      // auto from PNG
const frameH = png.height / CHARACTER_DIRECTIONS.length  // auto from PNG
```

Then pass `frameW` and `frameH` alongside the sprite data in the `characterSpritesLoaded` message. The webview can then scale `CHARACTER_SITTING_OFFSET_PX` and bubble offsets relative to `frameH` instead of a fixed constant.

This lets old 16×32 and new 48×48 PNGs coexist without code changes — only the PNG files determine the size.

---

## File Map

| File | Role |
|---|---|
| `src/constants.ts` | `CHAR_FRAME_W`, `CHAR_FRAME_H`, `CHAR_FRAMES_PER_ROW`, `CHAR_COUNT` |
| `src/assetLoader.ts` | PNG slicing — `loadCharacterSprites()` |
| `webview-ui/src/constants.ts` | Matrix effect dims, sitting/bubble offsets |
| `webview-ui/src/office/sprites/spriteData.ts` | `getCharacterSprites()`, `setCharacterTemplates()`, hue shift |
| `webview-ui/src/office/engine/characters.ts` | FSM + `getCharacterSprite()` — frame selection logic |
| `webview-ui/src/office/engine/renderer.ts` | Draw call — anchor, sitting offset, z-sort |
| `webview-ui/src/office/engine/matrixEffect.ts` | Spawn/despawn effect using MATRIX_SPRITE_COLS/ROWS |
| `scripts/export-characters.ts` | Generates the character PNGs from templates |
