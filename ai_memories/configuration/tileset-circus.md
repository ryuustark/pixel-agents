# Tileset & Map System — Reference + Circus Theme Guide

## How the Visual Layers Work

The office renders four stacked layers (back to front):

```
1. Floor      — flat 16×16 pixel patterns, one per tile, colorized per-tile
2. Walls      — 16×32 tall auto-tiled sprites, z-sorted with furniture
3. Furniture  — sprites of arbitrary size, sorted by Y (back-to-front painter's algorithm)
4. Characters — 48×48 sprites (current), anchored bottom-center
```

---

## Layer 1 — Floor Tiles

### How it works

`floors.png` should be **112×16 px** — 7 patterns side by side, each **16×16 px** grayscale.

| Pattern index | `TileType` | Default color | Notes |
|---|---|---|---|
| 0 | (VOID) | transparent | not walkable, no sprite |
| 1 | FLOOR_1 | h=35 s=30 b=15 (warm beige) | main left room |
| 2 | FLOOR_2 | h=25 s=45 b=5 (warm brown) | main right room |
| 3 | FLOOR_3 | h=280 s=40 b=-5 (purple) | carpet area |
| 4 | FLOOR_4 | h=35 s=25 b=10 (tan) | doorway/transition |
| 5 | FLOOR_5 | unassigned | available |
| 6 | FLOOR_6 | unassigned | available |
| 7 | FLOOR_7 | unassigned | available |

**floors.png does not exist yet** — the code falls back to a solid gray tile. Creating this file unlocks all floor pattern rendering.

**Colorization**: Photoshop-style HSB with contrast. Grayscale source → any hue. Per-tile `FloorColor { h, s, b, c }` stored in `layout.json → tileColors[]`. The editor lets you paint color directly on tiles with HSBC sliders.

### Circus floor ideas

| Pattern | Circus use | HSBC suggestion |
|---|---|---|
| FLOOR_1 — solid/flat | Sawdust ring floor | h=35 s=50 b=10 (warm yellow-tan) |
| FLOOR_2 — planks | Wooden stage planks | h=30 s=40 b=-5 (dark wood) |
| FLOOR_3 — carpet/dots | Velvet-red VIP seating area | h=0 s=60 b=0 (deep red) |
| FLOOR_4 — transition | Entrance mat / spotlight circle | h=55 s=80 b=30 (golden yellow) |
| FLOOR_5 — crosshatch | Net / metal grating backstage | h=220 s=10 b=-20 (steel) |
| FLOOR_6 — rough | Dirt/gravel outside ring | h=30 s=20 b=-10 |
| FLOOR_7 — fine dots | Confetti scatter | h=0 s=0 b=20 (sparkly white-gray) |

---

## Layer 2 — Wall Auto-Tiles

### How it works

`walls.png` is **64×128 px** — a 4×4 grid of **16×32 px** pieces.

```
Wall piece layout (4 cols × 4 rows = 16 pieces):

col:  0      1      2      3
    ┌──────┬──────┬──────┬──────┐
row0│ m=0  │ m=1  │ m=2  │ m=3  │  bitmask 0–3
    ├──────┼──────┼──────┼──────┤
row1│ m=4  │ m=5  │ m=6  │ m=7  │  bitmask 4–7
    ├──────┼──────┼──────┼──────┤
row2│ m=8  │ m=9  │ m=10 │ m=11 │  bitmask 8–11
    ├──────┼──────┼──────┼──────┤
row3│ m=12 │ m=13 │ m=14 │ m=15 │  bitmask 12–15
    └──────┴──────┴──────┴──────┘

Bitmask bits: N=1 E=2 S=4 W=8
```

The correct sprite is chosen at render time from the 4 cardinal neighbors. Sprites extend 16px above the tile footprint (a 3D face), so they're 32px tall even though the tile is 16px.

**Color** is controlled by a single `tileColors` entry that applies to all walls — HSBC slider in the editor.

**Replacement**: swap `walls.png` to change all walls at once. Must keep the same 4×4 bitmask grid layout. The `generate-walls.js` script + `wall-tile-editor.html` let you draw a new one.

### Circus wall ideas

| Variant | Description |
|---|---|
| **Big top tent stripe** | Red+white vertical stripes on each piece — the classic circus look |
| **Curtain backdrop** | Heavy velvet draping with gold trim at the top edge |
| **Backstage brick** | Exposed brick with circus poster texture |
| **Rope border** | Thick twisted rope running along the wall base |

**To create**: edit `wall-tile-editor.html` visually, then export → overwrite `walls.png` and rebuild.

---

## Layer 3 — Furniture Sprites

### Current hardcoded sprites (in `spriteData.ts`)

All are pixel arrays defined in TypeScript. Size = footprint tiles × 16.

| Item | Sprite size | Footprint | Category | Notes |
|---|---|---|---|---|
| Desk | 32×32 px | 2×2 tiles | desks | Brown wood surface, legs |
| Bookshelf | 16×32 px | 1×2 tiles | storage | Tall item |
| Plant | 16×24 px | 1×1 tile | decor | Pot + leafy top |
| Cooler | 16×24 px | 1×1 tile | misc | Water cooler |
| Whiteboard | 32×16 px | 2×1 tiles | decor | Horizontal banner |
| Chair | 16×16 px | 1×1 tile | chairs | Simple seat |
| PC Monitor | 16×16 px | 1×1 tile | electronics | Screen on desk |
| Lamp | 16×16 px | 1×1 tile | decor | Standing lamp |
| Pixel Text | 16×16 px | 1×1 tile | decor | Dynamic text sign |

### Dynamic asset-pipeline furniture

A separate set of sprites loaded via the 7-stage script pipeline (`scripts/` folder) → `furniture-catalog.json`. These use arbitrary PNGs extracted from a source tileset. The catalog supports:
- `orientation` (front/back/left/right) → rotation groups
- `state` (on/off) → toggle pairs
- `canPlaceOnWalls` → paintings, windows, clocks
- `canPlaceOnSurfaces` → monitors, mugs, laptops
- `backgroundTiles` → items like bookshelves where characters can walk behind

**Enhancement status of existing sprites:**

| Sprite | Enhanceable? | Replaceable? | Method |
|---|---|---|---|
| Desk | Yes — circus theme: ringmaster's podium | Yes | Edit `DESK_SQUARE_SPRITE` in `spriteData.ts` |
| Bookshelf | Yes — prop cabinet | Yes | Edit `BOOKSHELF_SPRITE` |
| Chair | Yes — circus bleacher seat | Yes | Edit `CHAIR_SPRITE` |
| Plant | Yes — potted palm | Partially | Edit `PLANT_SPRITE` |
| Cooler | Yes — acrobat water bucket | Yes | Edit `COOLER_SPRITE` |
| Whiteboard | Yes — circus marquee banner | Yes | Edit `WHITEBOARD_SPRITE` |
| Lamp | Yes — spotlight / torch | Yes | Edit `LAMP_SPRITE` |
| PC Monitor | Neutral — keep or replace | Yes | Edit `PC_SPRITE` |
| Dynamic assets | Fully replaceable | Yes | Re-run extraction pipeline with new tileset |

---

## Circus Theme — Proposed Sprite List

### New furniture sprites to add (via dynamic catalog or hardcoded)

| Name | Footprint | Category | Notes |
|---|---|---|---|
| Big Top Pole | 1×3 | decor | Tall center pole with flag, `backgroundTiles=2` |
| Ring Rope | 2×1 | misc | Low circular fence segment |
| Trapeze Bar | 3×1 | decor | Suspended horizontal bar |
| Cannon | 2×2 | misc | Human-cannon prop |
| Juggling Table | 2×1 | desks | Working surface, isDesk=true |
| Ticket Booth | 2×3 | misc | Entry booth with window |
| Bleacher Row | 4×2 | misc | Audience seating, backgroundTiles=1 |
| Spotlight | 1×2 | electronics | Directional light, on/off state |
| Costume Rack | 1×2 | storage | Hanging costumes |
| Ringmaster Podium | 1×2 | desks | Elevated speaking platform, isDesk=true |
| Acrobat Mat | 2×2 | misc | Padded landing mat |
| Strongman Bell | 1×1 | misc | High striker prop |
| Mirror Ball | 1×1 | decor | Disco/circus mirror ball |
| Tent Curtain | 1×2 | wall | `canPlaceOnWalls=true`, draped fabric |
| Circus Poster | 2×2 | wall | `canPlaceOnWalls=true`, framed poster |
| Fire Torch (wall) | 1×1 | wall | `canPlaceOnWalls=true`, flickering torch, on/off state |

### Floor pattern recommendations (new `floors.png`)

Create `webview-ui/public/assets/floors.png` (112×16 px, 7 grayscale patterns):

| Slot | Pattern design | Usage |
|---|---|---|
| FLOOR_1 | Fine stipple / sand | Sawdust ring |
| FLOOR_2 | Diagonal wood planks | Stage floor |
| FLOOR_3 | Checkerboard 4×4 | Circus entrance tile |
| FLOOR_4 | Concentric rings (subtle) | Spotlight ring center |
| FLOOR_5 | Crosshatch | Metal grating backstage |
| FLOOR_6 | Random coarse dots | Dirt / outdoor area |
| FLOOR_7 | Smooth (blank) | Clean VIP area |

---

## Map Layout Considerations

### Current default layout

- **21×21 tile grid** — two rooms split by a wall at col=10
- Doorway at rows 4–6
- Left room: warm beige (main workspace)
- Right room: warm brown (second workspace)
- Carpet zone: purple (cols 15–18, rows 7–9)

### Circus tent layout concept

```
Cols: 0─────────────────────────────────────40
      │  ENTRANCE      │  RING      │ BACK  │
 r0   │ Ticket booth   │            │ Stage │
      │ Bleachers ↓    │ MAIN RING  │ Costume│
      │                │ (sawdust)  │ racks │
      │                │            │       │
 r10  │ Prop storage   │ Spotlight  │ Green │
      │ Cannon         │   area     │ room  │
      │                │            │       │
 r20  │───────────────────────────────────── │
```

Key map rules for circus:
- **Ring**: circular FLOOR_1 (sawdust) area, no walls, rope furniture at perimeter
- **Big top poles**: placed at ring perimeter corners, backgroundTiles=2 so characters walk past
- **Bleachers**: back rows, audience-facing chairs pointing toward ring
- **Backstage**: separate walled area, costume racks + acrobat mats
- **Spotlight floor**: FLOOR_4 (golden) under the main ring center

### Grid size recommendation

| Use | Size | Notes |
|---|---|---|
| Minimal circus | 24×16 | Fits one ring + backstage |
| Full big top | 40×28 | Ring + bleachers + backstage + entrance |
| Max supported | 64×64 | Editor limit |

---

## Files to Modify for Circus Theme

| File | What to change |
|---|---|
| `webview-ui/public/assets/floors.png` | **CREATE** — 7 grayscale 16×16 patterns |
| `webview-ui/public/assets/walls.png` | Replace with tent-stripe pattern (keep same 4×4 bitmask layout) |
| `webview-ui/src/office/sprites/spriteData.ts` | Replace hardcoded sprites (desk, chair, etc.) with circus versions |
| `webview-ui/public/assets/default-layout.json` | New circus default layout (run "Export as Default" after editing in UI) |
| `webview-ui/src/constants.ts` | `DEFAULT_FLOOR_COLOR` — set to sawdust h=35 s=50 b=10 |
| Dynamic catalog assets | Run script pipeline with circus tileset PNG |
