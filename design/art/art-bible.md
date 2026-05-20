# Pixel Circus — Art Bible
*Visual source of truth for all Pixel Agents / Pixel Circus assets*

---

## §1 — Visual Identity Statement

**"A pixel-perfect retro office that feels alive — part cozy workspace, part digital circus, always readable at any zoom."**

Supporting principles:
1. **Grid discipline above all.** Every pixel snaps to 16×16. No sub-pixel rendering, no anti-aliasing, no gradients on sprites.
2. **Readable at 1×.** A character must be recognizable as a character at 16px wide. A desk must read as a desk at 16px.
3. **Circus energy through color and character, not noise.** The office structure is calm and gridded; personality comes from palette diversity, accessories, and animation — not visual clutter.

---

## §2 — Mood & Atmosphere

| State | Mood | Visual Signal |
|-------|------|---------------|
| **Idle / wandering** | Cozy, inhabited, alive | Soft wander animation, warm office palette, characters at rest |
| **Agent active / typing** | Focused, productive | Character in TYPE state at desk, electronics flip ON (auto-state), activity bubble above |
| **Permission waiting** | Tense, expectant | Amber "..." bubble, waiting sound chime, bubble persists until clicked |
| **Matrix spawn / despawn** | Digital, uncanny | Green rain columns sweep top-to-bottom over 0.3s, staggered per-column with random seeds |
| **Sub-agent working** | Bustle, parallel activity | Multiple characters animate simultaneously, permission bubbles can chain to parent |

Lighting metaphor: the office uses no dynamic lighting. Color warmth and palette diversity carry mood. The matrix effect is the only moment of "otherworldly" energy.

---

## §3 — Shape Language

- **Chunky, blocky forms.** Characters are 16px wide — every limb and accessory must read in 1–2 pixel widths.
- **Silhouette clarity.** Each character must have a unique silhouette readable at 1× zoom. Accessories (hats, wands, halos) live in the 8px top padding zone and are the primary differentiator.
- **No circles — use pixel-octagons.** Heads are ~8×8 blocky ovals. Eyes are 1–2 pixel dots.
- **Furniture is boxy and sturdy.** Desks, shelves, chairs use hard 90° corners. Rounded decor (plants, mugs) uses 1-pixel chamfers only.
- **Z-depth via shading, not perspective lines.** Dark edge pixels on the south/east face of furniture suggest depth without isometric distortion.
- **16×16 tile grid is sacred.** All furniture footprints are multiples of 16. Characters occupy a 16×24 sprite body within a 16×32 frame cell.

---

## §4 — Color System

### Base Character Palettes
Six pre-colored character PNGs. Each is a distinct skin tone + outfit color story:

| Palette | File | Skin | Shirt | Pants | Hair | Shoes |
|---------|------|------|-------|-------|------|-------|
| 0 | `char_0.png` | `#FFCC99` (beige) | `#4488CC` (blue) | `#334466` (dark blue) | `#553322` (brown) | `#222222` |
| 1 | `char_1.png` | `#FFCC99` (beige) | `#CC4444` (red) | `#333333` (dark gray) | `#FFD700` (gold) | `#222222` |
| 2 | `char_2.png` | `#DEB887` (tan) | `#44AA66` (green) | `#334444` (dark teal) | `#222222` (black) | `#333333` |
| 3 | `char_3.png` | `#FFCC99` (beige) | `#AA55CC` (purple) | `#443355` (dark purple) | `#AA4422` (auburn) | `#222222` |
| 4 | `char_4.png` | `#DEB887` (tan) | `#CCAA33` (gold) | `#444433` (khaki) | `#553322` (brown) | `#333333` |
| 5 | `char_5.png` | `#FFCC99` (beige) | `#FF8844` (orange) | `#443322` (dark brown) | `#111111` (near-black) | `#222222` |

Source of truth: `CHARACTER_PALETTES` in `webview-ui/src/office/sprites/spriteData.ts` lines 325–332.

Palette assignment: `pickDiversePalette()` distributes palettes 0–5 evenly across active non-sub-agents. Beyond 6 agents: random hue shift (45°–315°) applied via `adjustSprite()`.

### Colorize Pipeline
Two modes in `colorize.ts`:

**Colorize mode** (floor tiles, wall tiles):
- Source must be grayscale
- Applies: contrast → brightness → fixed HSL colorize
- Photoshop-style: luminance preserved, hue/saturation locked to slider values

**Adjust mode** (furniture tinting, character hue shifts):
- Source can be any color
- H: rotates hue ±180°
- S: shifts saturation ±100
- B/C: shifts lightness/contrast
- Used by `adjustSprite()` for hue-shifted palette variants

### UI Color Variables (`index.css` `:root`)
```
--pixel-bg:      #1e1e2e   (panel backgrounds)
--pixel-border:  (2px solid, value in vars)
--pixel-accent:  (interactive highlights)
```
All overlays use these vars — never hardcode panel colors inline.

### Circus Theme Target (not yet applied — update `index.css :root` when UI theme task is tackled)

| Variable | Current | Circus target |
|---|---|---|
| `--pixel-bg` | `#1e1e2e` | `#0d0d1a` |
| `--pixel-border` | `#4a4a6a` | `#ffd700` (gold) |
| `--pixel-border-light` | `#6a6a8a` | `#ffea80` |
| `--pixel-accent` | `#5a8cff` | `#cc2200` (circus red) |
| `--pixel-green` | `#5ac88c` | unchanged |
| `--pixel-shadow` | `2px 2px 0px #0a0a14` | unchanged |

### Prohibited Color Behaviors
- No gradients on sprite pixels (CSS gradients on UI panels are acceptable)
- No semi-transparent sprite pixels (alpha < 128 = transparent, ≥ 128 = fully opaque)
- No color bleeding between tile neighbors

---

## §5 — Character Design Direction

### Archetypes
- **Standard agent** (`char_0`–`char_5`): Office worker, readable humanoid, outfit suggests personality via color palette
- **Custom / named character** (Caine, CC, Bubble, meowatar, Amongo Cat, Michimaru, Sinner): Unique silhouette with strong accessory story; not subject to palette assignment
- **Sub-agent**: Inherits parent's palette + hueShift; no unique design

### Sprite Sheet Standard
```
Sheet size:  112px wide × 96px tall
Frame grid:  7 columns × 16px = 112px
Direction grid: 3 rows × 32px = 96px

Row 0 — DOWN  (facing viewer, used most often)
Row 1 — UP    (facing away)
Row 2 — RIGHT (left direction = flipped right at runtime)

Columns (frame order):
  0: walk1     1: walk2 (= idle)    2: walk3
  3: type1     4: type2
  5: read1     6: read2

Sprite body: 16×24px, bottom-aligned in the 16×32 cell
Top padding: 8px transparent — use for tall accessories (hats, halos, auras)
```

### Animation Rules
- **Walk cycle**: frames 0→1→2→1 (4-frame loop, walk2 is the neutral/idle pose)
- **Type animation**: frames 3→4 alternating (keyboard/tool use)
- **Read animation**: frames 5→6 alternating (Read/Grep/Glob/WebFetch tools)
- **Idle**: frame 1 (walk2, standing pose), plus wander AI
- **Sitting**: character shifts down 6px visually in TYPE state (engine-applied offset)

### Two Sheet Formats
The engine supports two sheet formats depending on character type:

| Format | Used by | Sheet dims | Frame size | Frame grid |
|--------|---------|-----------|------------|------------|
| **Standard** | `char_0`–`char_5` (palette chars) | 112×96 | 16×32 px | 7 cols × 3 rows |
| **HD Custom** | `char_caine`, `char_cc`, `char_Bubble` | 336×144 | 48×48 px | 7 cols × 3 rows |

The `parseCharacterPng()` function in `src/assetLoader.ts` auto-detects frame size from file dimensions — both formats are valid named character sheets. Stream avatars (non-`char_` prefix) use a separate auto-detected frame grid.

### Minimum Viable Sheet
A custom character must have at minimum: **Row 0, columns 0–2** (down walk cycle). Missing frames render as blank/transparent without crashing.

### Circus Format Sheet (named characters with circus animations)

Used by: `char_caine_circus.png`, `char_bubble_circus.png`. Detected by `buildCircusSprites()` in `spriteData.ts`.

```
Sheet size: 192×240 px
Frame grid: 4 columns × 5 rows, 48×48 px per frame

Row 0 — idle      cols 0–1 (2 frames)   IDLE — wandering pause
Row 1 — walk      cols 0–3 (4 frames)   WALK
Row 2 — sit       cols 0–1 (2 frames)   TYPE — any tool, seated
Row 3 — attack    cols 0–2 (3 frames)   TYPE — write/edit/bash/task tools
Row 4 — celebrate cols 0–2 (3 frames)   TYPE — celebrate / task complete
```

LEFT direction auto-generated at runtime (horizontal flip of RIGHT). UP direction aliases to RIGHT for this format.

---

### Caine — Character Design Rules [APPROVED 2026-05-15]

**Reference**: `Images/char_caine.png` is the definitive silhouette and palette source. Match hat proportions, coat diamond pattern, and wand handle position from this sheet.

**Silhouette rule**: Tall top hat must read as the crown at a glance. Long coat adds vertical weight below. Wand/staff extends reach rightward. All three must be legible in silhouette at 2× zoom.

- **Hat**: ≥10px tall on a 48px frame. Dark purple/midnight blue body, contrasting brim.
- **Coat**: long body, diamond/harlequin pattern. Red + teal/blue primary colors with white ruff collar.
- **Face**: white base, red markings/smile. High contrast — readable at 1× zoom.
- **Wand/staff**: dark handle with round glowing orb at tip. Orb is the animation anchor.

#### Wand Animation Rules ("the stick") [APPROVED 2026-05-15]

The wand is the **primary animation driver** — it must never be static across two consecutive frames in any animation row.

**Orb Glow Pulse**: every two-frame animation must alternate between bright and dim states.
- Bright state: full orb color pixel(s) + 1px lighter highlight at top-left.
- Dim state: orb color only, no highlight pixel.

**Per-animation behavior:**

| Row | Wand motion | Orb state |
|---|---|---|
| `idle` F0 | vertical, grounded | dim |
| `idle` F1 | 1–2px tilt right | bright |
| `walk` F0 | neutral (vertical) | dim |
| `walk` F1 | swings back, tip +2–3px | dim |
| `walk` F2 | swings forward, tip −2–3px | **bright** |
| `walk` F3 | returns to neutral | dim |
| `sit` F0 | diagonal lean, static | dim |
| `sit` F1 | unchanged position | **bright** |
| `attack` F0 | pulled back toward body | dim |
| `attack` F1 | extended forward/up (strike) | **bright** |
| `attack` F2 | recoil to neutral | dim |
| `celebrate` F0 | halfway raised | dim |
| `celebrate` F1 | fully overhead (peak) | **bright** — hat may tilt |
| `celebrate` F2 | slightly below peak, float | bright |

**Caine face proportions (overrides default §3 shape language for this character):**
- Face minimum width: ≥10px on a 48×48 frame (standard is ~6–8px).
- Eyes: 2×2px dots (not 1px) — size reads as personality, not error.

**Prohibitions (Caine-specific):**
- Wand handle color must be identical across all rows.
- Orb must not exceed 4×4px on a 48×48 frame.
- Hat must never be shorter than 10px.

### Silhouette Rules
- Head: ~6–8px wide, distinct from body
- Accessories occupy 8px top-padding zone — hat, halo, ears, etc.
- Body: 16px wide max, ~14px tall
- Must be recognizable when rendered at 2×DPR (the default zoom)

### Current Custom Characters — Observed Sheet States

| Character | File | Dims | Frame size | Layout | Notable Traits |
|-----------|------|------|-----------|--------|---------------|
| Caine | `char_caine.png` | 336×144 | 48×48 | Full 7×3 | Top hat, scarf, wand — red/white/blue circus palette |
| CC | `char_cc.png` | 336×144 | 48×48 | Full 7×3 | Near-identical to Caine, slight white shift — Claude Code mascot |
| Bubble | `char_Bubble.png` | 336×144 | 48×48 | Partial (many empty frames) | Small blue sphere, compact silhouette |
| meowatar | `meowatar.png` | 240×300 | auto | Partial (stream avatar) | Cosmic cat with orbital ring, separate bottom row for projectile |
| Amongo Cat | `Amongo Cat.png` | 360×280 | auto | Partial (stream avatar) | Among-Us-style cat body, tan/orange, white visor. 4 color variants generated. |
| Amongo Cat Green | `Amongo Cat Green.png` | 360×280 | auto | Same as original | Hue +90° — lime green body, outline/visor preserved |
| Amongo Cat Blue | `Amongo Cat Blue.png` | 360×280 | auto | Same as original | Hue +180° — slate blue body, outline/visor preserved |
| Amongo Cat Purple | `Amongo Cat Purple.png` | 360×280 | auto | Same as original | Hue +240° — violet body, outline/visor preserved |
| Amongo Cat Pink | `Amongo Cat Pink.png` | 360×280 | auto | Same as original | Hue +300° — rose pink body, outline/visor preserved |
| Michimaru | `Michimaru.png` | 160×300 | auto | Partial (stream avatar) | Samurai/warrior, silver flowing hair, bottom row has companion sprite |
| Sinner | `Sinner_1.png` | unknown | auto | Large multi-action sheet | Fighting-game style brawler, wrench weapon. **PNG has trailing data — fails pngjs parse. Needs clean re-export.** |

---

## §6 — Environment Design Language

### Floor Tiles
- Source: `floors.png` (112×16, 7 patterns × 16×16, grayscale)
- 7 patterns — colorized at paint time via Colorize mode (HSBC sliders)
- Color baked per-tile into `tileColors[]` in the layout
- No two adjacent tiles should have identical hue + pattern unless intentionally uniform

### Wall Tiles
- Source: `walls.png` (64×128, 4×4 grid of 16×32 auto-tile pieces)
- Auto-tile bitmask: N=1, E=2, S=4, W=8 (16 combinations)
- Sprites extend 16px above tile for 3D face effect
- Colorized via Colorize mode (color stored per-tile in `tileColors`)
- Z-sorted with furniture: `zY = (row+1)*TILE_SIZE`
- Only the flat base color renders in the tile pass; auto-tile piece renders in entity pass

### Furniture Philosophy
- Furniture reads top-down. Dark south/east edges imply depth.
- Chair sitting surface is slightly recessed visually (implied by lighter center pixels)
- Bookshelves, tall items use `backgroundTiles` — top rows allow character walk-through
- Electronics (monitors, computers) have ON/OFF state variants; ON state triggered by adjacent active agent (auto-state, never saved to layout)
- Wall-mounted items (`canPlaceOnWalls: true`): paintings, windows, clocks — bottom row must touch wall tile

### Z-Sort Rules
- All entities sorted by Y position
- Characters: `zY = ch.y + TILE_SIZE/2 + 0.5` — in front of same-row furniture, behind lower-row furniture
- Standard furniture: `zY = (row+1)*TILE_SIZE`
- Back-facing chairs: `zY = (row+1)*TILE_SIZE + 1` (chair back renders in front of character)
- Surface items (laptops on desks): `zY = max(spriteBottom, deskZY + 0.5)`
- Wall tiles: `zY = (row+1)*TILE_SIZE` (same as furniture, sorted by position)

---

## §7 — UI/HUD Visual Direction

### Overlay Style Rules
- **No border-radius.** All panels, modals, tooltips use `borderRadius: 0` — hard pixel corners only.
- **No box-shadow blur.** Shadows are hard offset only: `2px 2px 0px #0a0a14`. Zero blur radius.
- **Solid backgrounds.** `#1e1e2e` for panels. No translucency on primary UI surfaces.
- **2px solid borders.** All panel borders are 2px solid, using CSS variable colors.
- **Pixel font.** FS Pixel Sans loaded via `@font-face` in `index.css`. Applied globally. Never use system sans-serif for game UI elements.

### Layout
- **ToolOverlay**: activity label above hovered/selected character — pixel font, no border-radius
- **BottomToolbar**: `+ Agent`, Layout toggle, Settings
- **ZoomControls**: top-right, +/- buttons
- **EditActionBar**: top-center when editor has unsaved changes
- **SettingsModal**: centered modal for sound, export/import, debug

### Canvas Overlay Colors
- Seat indicators, grid lines, ghost furniture, selection highlights: defined as `rgba(...)` strings in `webview-ui/src/constants.ts` — never in CSS or inline style strings

---

## §8 — Asset Standards

### PNG Format
- All character and furniture sprites: PNG, RGBA
- Alpha threshold: **≥ 128 = opaque**, < 128 = transparent (no soft edges, no anti-aliasing)
- Processed via pngjs in extension backend: PNG → RGBA buffer → `SpriteData` (2D hex array)
- Character sprites loaded as `characterSpritesLoaded` message (array of 6 sets + custom)

### Naming Conventions
**Character files**: `char_<index>.png` for standard palettes (0–5), `char_<name>.png` for customs  
**Furniture catalog IDs**: `{BASE}[_{ORIENTATION}][_{STATE}]`
- Examples: `MONITOR_FRONT_OFF`, `CRT_MONITOR_BACK`, `CHAIR_FRONT`, `BOOKSHELF`
- Orientation values: `FRONT`, `BACK`, `LEFT`, `RIGHT`
- State values: `ON`, `OFF`

**Spec files**: `design/art/specs/<name>-spec.md`

### Load Order
`characterSpritesLoaded` → `floorTilesLoaded` → `wallTilesLoaded` → `furnitureAssetsLoaded` → `layoutLoaded`

### Sprite Cache
Character sprites: `WeakMap` cache keyed by `"palette:hueShift"` per zoom level (offscreen canvas)  
Furniture sprites: `Map<string, SpriteData>` keyed by arbitrary string including colorize flag

---

## §9 — Style Reference & Prohibitions

### References — What to Draw From

| Reference | Draw From | Avoid |
|-----------|-----------|-------|
| **RPG Maker XP / VX character sheets** | 4-directional walk cycle layout, chunky readable silhouettes, tile-based movement | High-detail face work, genre-specific fantasy tropes |
| **Stardew Valley** | Warm palette, cozy office object design, readable furniture at small scale | Oval soft sprites, painterly shading |
| **Habitica pixel avatars** | Accessory variety in the head zone, distinct palette-per-character | Item complexity that breaks 16px readability |
| **Undertale / Deltarune** | Character personality through silhouette and accessory, minimal frame count with maximum expression | Hand-drawn sketch quality, non-grid proportions |

### Absolute Prohibitions
- **No anti-aliasing** on any sprite pixel (alpha must be 0 or 255, clamp at 128)
- **No sub-pixel rendering** — every sprite pixel aligns to the 16×16 grid
- **No gradients on sprite pixels** — flat colors only; shading via adjacent color steps
- **No blur on UI overlays** — `box-shadow` blur radius must be 0
- **No rotated/skewed sprites** — all rendering is axis-aligned; left direction = horizontal flip only
- **No 3D perspective** — the office is top-down 2D; depth is implied by z-sort and shading only
- **No freelance color additions** to the palette system — new colors require art bible update and `pickDiversePalette()` consideration
