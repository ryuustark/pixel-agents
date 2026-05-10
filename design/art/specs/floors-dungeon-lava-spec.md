# floors.png — Dungeon + Lava Floor Tile Spec

**File**: `webview-ui/public/assets/floors.png`  
**Dimensions**: 112×16 px  
**Format**: PNG RGBA — R=G=B=gray value, A=255 everywhere (no transparency)  
**Layout**: 7 patterns × 16×16 px, left-to-right  
**Theme**: Dungeon stone + lava  
**Bible refs**: §1 (grid), §4 (no anti-aliasing, colorize pipeline), §6 (floor tile rules), §8 (PNG format)

---

## Gray Level Legend

| Code | Value | Role |
|------|-------|------|
| BK | 0 | Pure black — deep shadow, void |
| VD | 20 | Very dark — rock shadow, deep crack |
| DK | 50 | Dark — base stone, mortar shadow |
| MD | 90 | Medium-dark — mid rock face, crack edge |
| GY | 128 | Gray — main stone body |
| LG | 170 | Light gray — raised stone surface, highlight edge |
| LT | 200 | Light — stone face catch-light, lava edge |
| WH | 230 | Near-white — lava glow, hot edges |
| BW | 255 | Bright-white — lava hotspot core |

## Colorize Pipeline Notes

Colorize mode maps grayscale luminance → chosen HSL color:
- **BK/VD** → near-black at any hue (deep shadow, rock voids)
- **DK/MD** → darkened version of the hue (stone body, rock shadow)
- **GY** → pure target hue at chosen saturation (tile face)
- **LT/WH/BW** → lighten toward white (lava glow reads as hot regardless of hue)

---

## Pattern Slots

### FLOOR_1 — Plain Stone
**x offset in PNG**: 0px  
**Concept**: Uniform hewn stone with subtle luminance noise; no directional pattern, accepts any hue cleanly.  
**Method**: 60% GY, 20% MD, 20% LG — pure stipple variation, no lines or shapes.  
**Colorize**: h=220 s=15 → cool dungeon blue-gray | h=30 s=20 → sandy tan

```
Row  0:  GY GY MD GY GY LG GY GY MD GY LG GY GY MD GY GY
Row  1:  GY MD GY GY LG GY GY MD GY GY GY LG GY GY GY MD
Row  2:  LG GY GY MD GY GY GY GY LG GY GY GY MD GY LG GY
Row  3:  GY GY LG GY MD GY LG GY GY GY MD GY GY LG GY GY
Row  4:  MD GY GY GY GY GY GY MD GY LG GY GY GY GY MD GY
Row  5:  GY LG GY MD GY GY GY GY GY GY GY MD GY GY GY LG
Row  6:  GY GY MD GY LG GY MD GY LG GY GY GY LG GY MD GY
Row  7:  LG GY GY GY GY MD GY GY GY MD GY LG GY GY GY GY
Row  8:  GY MD GY LG GY GY GY LG GY GY MD GY GY MD GY LG
Row  9:  GY GY GY GY MD GY LG GY GY GY GY GY LG GY GY GY
Row 10:  MD GY LG GY GY GY GY GY MD GY LG GY GY GY GY MD
Row 11:  GY GY GY MD GY LG GY MD GY GY GY MD GY LG GY GY
Row 12:  LG GY GY GY GY GY LG GY GY LG GY GY GY GY MD GY
Row 13:  GY MD GY GY MD GY GY GY GY GY MD GY GY GY GY LG
Row 14:  GY GY LG GY GY LG GY MD GY GY GY GY LG MD GY GY
Row 15:  MD GY GY GY MD GY GY LG GY MD GY LG GY GY GY MD
```

---

### FLOOR_2 — Cracked Stone
**x offset in PNG**: 16px  
**Concept**: Flat stone surface with two diagonal hairline cracks; dark crack shadows with lighter raised edges.  
**Method**: Same stipple base as FLOOR_1. Two 1px crack paths (staircase diagonals), crack pixels: BK center, VD width, LG on upper-left edge (raised catch-light).  
**Colorize**: h=220 s=15 → standard dungeon gray with visible dark cracks

```
Row  0:  GY GY MD GY GY LG GY GY MD GY LG GY GY MD GY GY
Row  1:  VD GY GY LG GY GY MD GY GY GY LG GY GY GY MD GY
Row  2:  LG BK GY MD GY GY GY GY LG GY GY GY MD VD LG GY
Row  3:  GY LG VD GY MD GY LG GY GY GY MD GY LG BK GY GY
Row  4:  MD GY LG BK GY GY GY MD GY LG GY GY VD LG MD GY
Row  5:  GY LG GY MD VD GY GY GY GY GY GY BK GY GY GY LG
Row  6:  GY GY MD GY LG BK MD GY LG GY GY VD LG GY MD GY
Row  7:  LG GY GY GY GY MD VD GY GY MD LG BK GY GY GY GY
Row  8:  GY MD GY LG GY GY LG BK GY GY MD VD GY MD GY LG
Row  9:  GY GY GY GY MD GY LG VD GY GY GY LG BK GY GY GY
Row 10:  MD GY LG GY GY GY GY LG BK GY LG GY VD GY GY MD
Row 11:  GY GY GY MD GY LG GY MD VD GY GY MD LG BK GY GY
Row 12:  LG GY GY GY GY GY LG GY LG BK GY GY GY VD MD GY
Row 13:  GY MD GY GY MD GY GY GY GY LG VD GY GY LG GY LG
Row 14:  GY GY LG GY GY LG GY MD GY GY LG BK GY MD GY GY
Row 15:  MD GY GY GY MD GY GY LG GY MD GY LG VD GY GY MD
```

---

### FLOOR_3 — Cobblestone
**x offset in PNG**: 32px  
**Concept**: Regular grid of rounded cobblestones separated by 1px mortar joints.  
**Method**: Mortar lines at col/row 4, 9, 14 (value DK). Each 4×4 stone cell: LG top-left highlight, GY body, MD bottom-right shadow. Tiles seamlessly at 5px stone interval within 16px tile.  
**Colorize**: h=30 s=25 → warm tan cobble | h=220 s=20 → blue-gray dungeon cobble

```
Row  0:  LG GY GY GY DK LG GY GY GY DK LG GY GY GY DK LG
Row  1:  GY GY GY GY DK GY GY GY GY DK GY GY GY GY DK GY
Row  2:  GY GY GY GY DK GY GY GY GY DK GY GY GY GY DK GY
Row  3:  GY GY GY MD DK GY GY GY MD DK GY GY GY MD DK GY
Row  4:  DK DK DK DK DK DK DK DK DK DK DK DK DK DK DK DK
Row  5:  LG GY GY GY DK LG GY GY GY DK LG GY GY GY DK LG
Row  6:  GY GY GY GY DK GY GY GY GY DK GY GY GY GY DK GY
Row  7:  GY GY GY GY DK GY GY GY GY DK GY GY GY GY DK GY
Row  8:  GY GY GY MD DK GY GY GY MD DK GY GY GY MD DK GY
Row  9:  DK DK DK DK DK DK DK DK DK DK DK DK DK DK DK DK
Row 10:  LG GY GY GY DK LG GY GY GY DK LG GY GY GY DK LG
Row 11:  GY GY GY GY DK GY GY GY GY DK GY GY GY GY DK GY
Row 12:  GY GY GY GY DK GY GY GY GY DK GY GY GY GY DK GY
Row 13:  GY GY GY MD DK GY GY GY MD DK GY GY GY MD DK GY
Row 14:  DK DK DK DK DK DK DK DK DK DK DK DK DK DK DK DK
Row 15:  LG GY GY GY DK LG GY GY GY DK LG GY GY GY DK LG
```

---

### FLOOR_4 — Lava Glow
**x offset in PNG**: 48px  
**Concept**: Mostly dark volcanic rock with two bright lava channels weaving through the tile.  
**Method**: Rock base VD/DK with MD specks. Two organic channel paths: BW center (1px), WH ±1px, LT ±2px, MD at margins. Everything else is DK/VD rock.  
**Colorize**: h=20 s=85 → orange-red lava | h=45 s=90 → yellow-orange magma

```
Row  0:  DK VD DK DK VD DK DK VD DK DK VD DK DK VD DK DK
Row  1:  VD DK VD DK DK VD DK DK VD DK DK DK VD DK VD DK
Row  2:  DK DK DK MD DK DK DK DK DK DK LT WH BW WH LT MD
Row  3:  DK VD DK DK LT WH BW WH LT MD DK DK DK DK DK DK
Row  4:  VD DK VD DK MD DK DK DK DK VD DK VD DK DK VD DK
Row  5:  DK DK DK VD DK DK VD DK DK DK VD DK DK DK DK VD
Row  6:  DK VD DK DK VD DK DK VD DK VD DK DK VD DK VD DK
Row  7:  VD DK DK DK DK VD DK DK DK DK DK VD DK DK DK DK
Row  8:  DK DK VD DK DK DK DK VD DK DK DK DK VD DK DK VD
Row  9:  DK VD DK DK VD DK VD DK DK VD DK DK DK VD DK DK
Row 10:  LT WH BW WH LT MD DK DK VD DK DK DK DK DK VD DK
Row 11:  MD DK DK DK DK DK LT WH BW WH LT MD DK VD DK DK
Row 12:  DK VD DK DK VD DK MD DK DK DK DK DK LT WH BW WH
Row 13:  VD DK DK VD DK DK DK VD DK VD DK DK MD DK DK DK
Row 14:  DK DK VD DK DK DK VD DK DK DK VD DK DK DK VD DK
Row 15:  DK VD DK DK VD DK DK DK DK DK DK VD DK DK DK VD
```

---

### FLOOR_5 — Lava + Rocks
**x offset in PNG**: 64px  
**Concept**: Distinct dark rock masses floating in a lava field; hard-edged rock chunks with lava filling the gaps.  
**Method**: 4 irregular rock blobs ~4×4px at quadrant corners (VD body, DK interior, MD top-left catch-light). Non-rock = lava: MD main body, LT edges, WH flow concentration points, BW at 3 hotspot pixels.  
**Colorize**: h=18 s=90 → lava field (rock stays near-black at any hue)

```
Row  0:  MD VD VD VD DK LT MD LT MD LT DK VD VD VD MD LT
Row  1:  VD BK VD VD LT WH LT WH LT WH LT VD BK VD LT WH
Row  2:  VD VD BK MD LT MD LT MD LT MD LT MD BK VD WH LT
Row  3:  DK VD VD MD LT LT MD LT MD LT LT MD VD VD LT MD
Row  4:  LT LT LT LT MD LT LT LT LT LT MD LT LT LT MD LT
Row  5:  WH LT WH MD LT WH BW WH LT WH LT MD WH LT WH LT
Row  6:  LT MD LT LT MD LT WH LT MD LT LT LT LT MD LT LT
Row  7:  MD LT MD MD LT MD LT MD LT MD BW MD MD LT MD MD
Row  8:  LT LT LT LT MD LT MD LT LT MD LT LT LT LT LT MD
Row  9:  WH LT WH MD LT LT LT LT MD LT WH LT MD VD VD VD
Row 10:  LT MD LT LT MD WH LT WH MD LT LT MD VD BK VD VD
Row 11:  MD LT MD MD LT LT MD LT LT MD MD LT VD VD BK MD
Row 12:  LT WH LT LT LT MD LT MD LT LT WH LT DK VD VD MD
Row 13:  MD LT MD VD VD VD MD LT MD MD LT LT LT LT LT LT
Row 14:  LT MD LT VD BK VD LT MD LT LT BW MD WH LT WH LT
Row 15:  LT LT LT DK VD DK MD LT MD LT LT LT LT MD LT LT
```

---

### FLOOR_6 — Rough Rubble
**x offset in PNG**: 80px  
**Concept**: Coarse pebble texture with high contrast; irregular pebble bodies against a dark base.  
**Method**: ~12 pebble cells of 2×2 or 1×2 px scattered organically. Each pebble: GY or MD top pixel, VD shadow to south-east. Background DK/BK. Highest contrast of all 7 patterns.  
**Colorize**: h=220 s=20 → dark gray rubble | h=35 s=30 → reddish-brown rubble

```
Row  0:  DK DK DK DK DK DK DK BK DK DK GY DK DK DK DK DK
Row  1:  DK GY MD DK DK DK DK DK DK VD MD DK DK GY DK DK
Row  2:  BK MD GY DK DK BK GY DK DK DK VD DK VD GY MD DK
Row  3:  DK VD VD DK DK DK MD DK GY DK DK DK DK VD VD BK
Row  4:  DK DK DK DK BK DK VD DK MD DK DK GY DK DK DK DK
Row  5:  DK DK GY DK DK DK DK BK VD DK DK MD DK DK DK DK
Row  6:  GY MD GY DK DK GY MD DK DK DK VD VD DK DK BK DK
Row  7:  VD GY VD DK DK VD GY DK DK DK DK DK DK GY MD DK
Row  8:  DK VD DK DK DK DK VD DK DK BK DK DK VD MD GY DK
Row  9:  DK DK DK DK GY DK DK DK DK DK GY DK DK VD VD DK
Row 10:  DK DK DK VD MD DK DK BK DK DK MD DK DK DK DK DK
Row 11:  BK GY DK DK VD DK DK DK DK VD VD DK GY DK DK DK
Row 12:  DK MD DK DK DK GY MD DK DK DK DK DK MD DK DK BK
Row 13:  DK VD DK DK DK VD GY DK DK GY DK DK VD DK DK DK
Row 14:  DK DK DK GY DK DK VD DK VD MD DK DK DK GY MD DK
Row 15:  DK DK BK MD DK DK DK DK DK VD DK GY DK VD GY DK
```

---

### FLOOR_7 — Fine Dust
**x offset in PNG**: 96px  
**Concept**: Nearly featureless surface; softest pattern, almost disappears at 1× zoom — ideal for base coat or transition zones.  
**Method**: Base GY. Every 4th pixel in loose checkerboard dips to MD or rises to LG (~80% GY, 10% MD, 10% LG). No lines, no shapes.  
**Colorize**: h=0 s=0 → pure neutral gray | h=30 s=10 → faintest warm dust

```
Row  0:  GY GY GY GY GY GY GY GY GY GY GY GY GY GY GY GY
Row  1:  GY GY GY LG GY GY GY GY GY LG GY GY GY GY GY GY
Row  2:  GY GY GY GY GY GY GY GY GY GY GY GY GY GY GY GY
Row  3:  GY MD GY GY GY GY GY MD GY GY GY GY MD GY GY GY
Row  4:  GY GY GY GY GY GY GY GY GY GY GY GY GY GY GY GY
Row  5:  GY GY GY GY GY LG GY GY GY GY GY LG GY GY GY GY
Row  6:  GY GY GY GY GY GY GY GY GY GY GY GY GY GY GY GY
Row  7:  GY GY MD GY GY GY GY GY MD GY GY GY GY GY MD GY
Row  8:  GY GY GY GY GY GY GY GY GY GY GY GY GY GY GY GY
Row  9:  GY LG GY GY GY GY GY LG GY GY GY GY GY LG GY GY
Row 10:  GY GY GY GY GY GY GY GY GY GY GY GY GY GY GY GY
Row 11:  GY GY GY MD GY GY GY GY GY MD GY GY GY GY GY MD
Row 12:  GY GY GY GY GY GY GY GY GY GY GY GY GY GY GY GY
Row 13:  GY GY GY GY LG GY GY GY GY GY LG GY GY GY GY GY
Row 14:  GY GY GY GY GY GY GY GY GY GY GY GY GY GY GY GY
Row 15:  GY MD GY GY GY GY GY MD GY GY GY GY MD GY GY GY
```

---

## Slot Summary

| Slot | TileType | Name | Best hue for dungeon/lava |
|------|----------|------|--------------------------|
| 1 | FLOOR_1 | Plain Stone | h=220 s=15 (stone) |
| 2 | FLOOR_2 | Cracked Stone | h=220 s=15 (cracked stone) |
| 3 | FLOOR_3 | Cobblestone | h=30 s=25 (warm cobble) |
| 4 | FLOOR_4 | Lava Glow | h=20 s=85 (orange lava) |
| 5 | FLOOR_5 | Lava + Rocks | h=18 s=90 (lava field) |
| 6 | FLOOR_6 | Rough Rubble | h=35 s=30 (rubble) |
| 7 | FLOOR_7 | Fine Dust | h=0 s=0 (neutral) |

## Hue Per Room — How It Works

The hue is NOT baked into the PNG. Each tile in the layout stores its own `FloorColor { h, s, b, c }` in `tileColors[]`. You can paint Room A with lava at h=20 and Room B with lava at h=180 (blue ice) using the exact same FLOOR_4 pattern. Use the Layout editor's HSBC sliders to paint each zone.

## Code Changes Required?

**For exactly 7 patterns → NO code changes needed.**  
`FLOOR_PATTERN_COUNT = 7` in `src/constants.ts` and `TileType` FLOOR_1–FLOOR_7 in `webview-ui/src/office/types.ts` already match.

**To add more than 7 patterns → 2 changes needed:**
1. `src/constants.ts` line 32: change `FLOOR_PATTERN_COUNT = 7` to new count
2. `webview-ui/src/office/types.ts` lines 12–18: add `FLOOR_8: 8`, `FLOOR_9: 9`, etc.
3. Widen the PNG: `count × 16` pixels wide

## Implementation

After user approval, generate `floors.png` via a Node.js script at `scripts/generate-floors.ts` using pngjs. Place output at `webview-ui/public/assets/floors.png`. Then `npm run build`.
