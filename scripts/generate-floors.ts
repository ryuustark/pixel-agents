/**
 * Generate floors.png — 112×16 px, 7 grayscale 16×16 patterns (multi-theme)
 *
 * Patterns are orientation-aware: colorize with HSBC sliders to theme them.
 *   FLOOR_1 — Horizontal Fine Ripple  → calm water (blue), smooth sand (tan)
 *   FLOOR_2 — Horizontal Bold Wave    → ocean waves (blue), dunes (orange)
 *   FLOOR_3 — Dungeon Floor Tile        → stone dungeon (gray), sandstone (warm), dark keep (dark)
 *   FLOOR_4 — Vertical Thin Streams   → lava rivulets (orange), waterfall (blue)
 *   FLOOR_5 — Vertical Bold Rivers    → lava rivers (orange/red), curtain falls (blue)
 *   FLOOR_6 — Rock Texture             → granite/cave (gray), cliff (brown), obsidian (dark)
 *   FLOOR_7 — Cracked Surface         → cracked lava crust (orange), dry earth (tan)
 *
 * Output: webview-ui/public/assets/floors.png
 * Run:    npx tsx scripts/generate-floors.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { PNG } from 'pngjs'

const OUT_PATH = path.join(__dirname, '..', 'webview-ui', 'public', 'assets', 'floors.png')

// Gray level constants
const BK = 0
const VD = 20
const DK = 50
const MD = 90
const GY = 128
const LG = 170
const LT = 200
const WH = 230
const BW = 255

// Each pattern: 16 rows × 16 cols of gray values
const PATTERNS: number[][][] = [

  // ── FLOOR_1 — Horizontal Fine Ripple ────────────────────────
  // Subtle wave bands, period 4 rows. Low contrast GY↔LG↔LT.
  // Blue colorize → calm water / shallow pool
  // Sandy colorize → smooth sand surface
  [
    [GY, GY, MD, GY, GY, GY, MD, GY, GY, MD, GY, GY, GY, MD, GY, GY],
    [LG, GY, LG, LG, MD, LG, LG, GY, LG, LG, MD, LG, LG, GY, LG, LG],
    [LT, LG, LT, LT, LG, LT, LT, LG, LT, LT, LG, LT, LT, LG, LT, LT],
    [LG, LT, LG, LG, LT, LG, LG, LT, LG, LG, LT, LG, LG, LT, LG, LG],
    [GY, LG, GY, GY, LG, GY, GY, LG, GY, GY, LG, GY, GY, LG, GY, GY],
    [LG, GY, LG, LG, GY, LG, LG, GY, LG, LG, GY, LG, LG, GY, LG, LG],
    [LT, LG, LT, LT, LG, LT, LT, LG, LT, LT, LG, LT, LT, LG, LT, LT],
    [LG, LT, LG, LG, LT, LG, LG, LT, LG, LG, LT, LG, LG, LT, LG, LG],
    [MD, GY, GY, MD, GY, GY, MD, GY, GY, MD, GY, GY, GY, MD, GY, GY],
    [LG, LG, MD, LG, LG, GY, LG, LG, MD, LG, LG, GY, LG, LG, MD, LG],
    [LT, LT, LG, LT, LT, LG, LT, LT, LG, LT, LT, LG, LT, LT, LG, LT],
    [LG, LG, LT, LG, LG, LT, LG, LG, LT, LG, LG, LT, LG, LG, LT, LG],
    [GY, GY, LG, GY, MD, GY, GY, GY, LG, GY, GY, MD, GY, GY, LG, GY],
    [LG, GY, LG, LG, GY, LG, LG, GY, LG, LG, GY, LG, LG, GY, LG, LG],
    [LT, LG, LT, LT, LG, LT, LT, LG, LT, LT, LG, LT, LT, LG, LT, LT],
    [LG, LT, LG, LG, LT, LG, LG, LT, LG, LG, LT, LG, LG, LT, LG, LG],
  ],

  // ── FLOOR_2 — Horizontal Bold Wave ──────────────────────────
  // Strong bands, period 8 rows. High contrast DK↔LG↔WH.
  // Blue colorize → ocean waves
  // Tan/orange colorize → sand dunes
  [
    [DK, DK, VD, DK, DK, DK, VD, DK, DK, VD, DK, DK, DK, VD, DK, DK],
    [MD, DK, MD, MD, DK, MD, MD, DK, MD, MD, DK, MD, MD, DK, MD, MD],
    [GY, MD, GY, GY, MD, GY, GY, MD, GY, GY, MD, GY, GY, MD, GY, GY],
    [LG, GY, LG, LG, GY, LG, LG, GY, LG, LG, GY, LG, LG, GY, LG, LG],
    [LT, LG, LT, LT, LG, LT, LT, LG, LT, LT, LG, LT, LT, LG, LT, LT],
    [WH, LT, WH, WH, LT, WH, LT, WH, LT, WH, LT, WH, WH, LT, WH, LT],
    [LT, WH, LT, LT, WH, LT, WH, LT, WH, LT, WH, LT, LT, WH, LT, LT],
    [LG, LT, LG, LG, LT, LG, LT, LG, LT, LG, LT, LG, LG, LT, LG, LG],
    [DK, DK, VD, DK, DK, VD, DK, DK, VD, DK, DK, DK, VD, DK, DK, VD],
    [MD, DK, MD, MD, DK, MD, DK, MD, DK, MD, DK, MD, MD, DK, MD, DK],
    [GY, MD, GY, GY, MD, GY, MD, GY, MD, GY, MD, GY, GY, MD, GY, MD],
    [LG, GY, LG, LG, GY, LG, GY, LG, GY, LG, GY, LG, LG, GY, LG, GY],
    [LT, LG, LT, LT, LG, LT, LG, LT, LG, LT, LG, LT, LT, LG, LT, LG],
    [WH, LT, WH, WH, LT, WH, LT, WH, LT, WH, LT, WH, WH, LT, WH, LT],
    [LT, WH, LT, LT, WH, LT, WH, LT, WH, LT, WH, LT, LT, WH, LT, WH],
    [LG, LT, LG, LG, LT, LG, LT, LG, LT, LG, LT, LG, LG, LT, LG, LT],
  ],

  // ── FLOOR_3 — Dungeon Floor Tile ────────────────────────────
  // 2×2 grid of stone blocks (7px each) with 2px mortar lines.
  // Each block: LT top-left highlight, GY center, MD/DK bottom-right shadow.
  // Gray colorize → classic stone dungeon
  // Warm colorize → sandstone / brick
  // Dark colorize → dark stone keep
  [
    [LT, LG, LG, LG, LG, LG, MD, DK, VD, LT, LG, LG, LG, LG, LG, MD],
    [LG, LG, LG, LG, LG, LG, MD, DK, VD, LG, LG, LG, LG, LG, LG, MD],
    [LG, LG, GY, LG, LG, LG, MD, DK, VD, LG, LG, GY, LG, LG, LG, MD],
    [LG, LG, LG, LG, LG, MD, MD, DK, VD, LG, LG, LG, LG, LG, MD, MD],
    [LG, LG, LG, LG, MD, GY, MD, DK, VD, LG, LG, LG, LG, MD, GY, MD],
    [LG, LG, LG, MD, GY, GY, MD, DK, VD, LG, LG, LG, MD, GY, GY, MD],
    [MD, MD, MD, MD, MD, MD, MD, DK, VD, MD, MD, MD, MD, MD, MD, MD],
    [DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK],
    [VD, VD, VD, VD, VD, VD, VD, DK, DK, VD, VD, VD, VD, VD, VD, VD],
    [LT, LG, LG, LG, LG, LG, MD, DK, VD, LT, LG, LG, LG, LG, LG, MD],
    [LG, LG, LG, LG, LG, LG, MD, DK, VD, LG, LG, LG, LG, LG, LG, MD],
    [LG, LG, GY, LG, LG, LG, MD, DK, VD, LG, LG, GY, LG, LG, LG, MD],
    [LG, LG, LG, LG, LG, MD, MD, DK, VD, LG, LG, LG, LG, LG, MD, MD],
    [LG, LG, LG, LG, MD, GY, MD, DK, VD, LG, LG, LG, LG, MD, GY, MD],
    [LG, LG, LG, MD, GY, GY, MD, DK, VD, LG, LG, LG, MD, GY, GY, MD],
    [MD, MD, MD, MD, MD, MD, MD, DK, VD, MD, MD, MD, MD, MD, MD, MD],
  ],

  // ── FLOOR_4 — Vertical Thin Streams ─────────────────────────
  // Dark background (DK/VD), three narrow bright columns (~2px).
  // Row variation gives flowing shimmer effect.
  // Orange colorize → thin lava rivulets
  // Blue colorize → narrow waterfall
  [
    [VD, DK, LG, LT, DK, DK, VD, LG, LT, DK, DK, VD, LG, LT, DK, DK],
    [DK, VD, LT, WH, DK, VD, DK, LT, WH, DK, VD, DK, LT, WH, VD, DK],
    [VD, DK, LG, LT, DK, DK, VD, LG, LT, DK, DK, VD, LG, LT, DK, VD],
    [DK, VD, MD, LG, VD, DK, DK, MD, LG, VD, DK, DK, MD, LG, DK, DK],
    [VD, DK, LT, WH, DK, VD, DK, LT, WH, DK, VD, DK, LT, WH, VD, DK],
    [DK, VD, LG, LT, DK, DK, VD, LG, LT, DK, DK, VD, LG, LT, DK, VD],
    [VD, DK, LT, WH, VD, DK, DK, LT, WH, VD, DK, DK, LT, WH, DK, DK],
    [DK, DK, LG, LT, DK, VD, DK, LG, LT, DK, VD, DK, LG, LT, VD, DK],
    [VD, DK, MD, LG, DK, DK, VD, MD, LG, DK, DK, VD, MD, LG, DK, VD],
    [DK, VD, LT, WH, VD, DK, DK, LT, WH, VD, DK, DK, LT, WH, DK, DK],
    [VD, DK, LG, LT, DK, VD, DK, LG, LT, DK, VD, DK, LG, LT, DK, DK],
    [DK, DK, LT, WH, DK, DK, VD, LT, WH, DK, DK, VD, LT, WH, VD, DK],
    [VD, DK, LG, LT, VD, DK, DK, LG, LT, VD, DK, DK, LG, LT, DK, VD],
    [DK, VD, MD, LG, DK, VD, DK, MD, LG, DK, VD, DK, MD, LG, DK, DK],
    [VD, DK, LT, WH, DK, DK, VD, LT, WH, DK, DK, VD, LT, WH, VD, DK],
    [DK, DK, LG, LT, DK, VD, DK, LG, LT, DK, VD, DK, LG, LT, DK, VD],
  ],

  // ── FLOOR_5 — Vertical Bold Rivers ──────────────────────────
  // Two wide bright rivers (cols 1-5 and 9-13), dark edges, BW center highlights.
  // Orange/red colorize → lava rivers
  // Bright blue colorize → curtain waterfall
  [
    [VD, DK, LG, WH, LG, DK, VD, VD, DK, LG, WH, LG, DK, VD, VD, DK],
    [VD, DK, LT, BW, LT, DK, VD, VD, DK, LT, BW, LT, DK, VD, VD, DK],
    [DK, MD, LT, WH, LT, MD, DK, DK, MD, LT, WH, LT, MD, DK, DK, MD],
    [VD, DK, LG, WH, LG, DK, VD, VD, DK, LG, WH, LG, DK, VD, VD, DK],
    [DK, MD, MD, LT, MD, MD, DK, DK, MD, MD, LT, MD, MD, DK, DK, MD],
    [VD, DK, LT, BW, LT, DK, VD, VD, DK, LT, BW, LT, DK, VD, VD, DK],
    [VD, DK, LG, WH, LG, DK, VD, VD, DK, LG, WH, LG, DK, VD, VD, DK],
    [DK, MD, LT, BW, LT, MD, DK, DK, MD, LT, BW, LT, MD, DK, DK, MD],
    [VD, DK, LG, WH, LG, DK, VD, VD, DK, LG, WH, LG, DK, VD, VD, DK],
    [DK, MD, MD, WH, MD, MD, DK, DK, MD, MD, WH, MD, MD, DK, DK, MD],
    [VD, DK, LG, LT, LG, DK, VD, VD, DK, LG, LT, LG, DK, VD, VD, DK],
    [VD, DK, LT, BW, LT, DK, VD, VD, DK, LT, BW, LT, DK, VD, VD, DK],
    [DK, MD, LT, WH, LT, MD, DK, DK, MD, LT, WH, LT, MD, DK, DK, MD],
    [VD, DK, LG, WH, LG, DK, VD, VD, DK, LG, WH, LG, DK, VD, VD, DK],
    [DK, MD, MD, LT, MD, MD, DK, DK, MD, MD, LT, MD, MD, DK, DK, MD],
    [VD, DK, LT, BW, LT, DK, VD, VD, DK, LT, BW, LT, DK, VD, VD, DK],
  ],

  // ── FLOOR_6 — Rock Texture ───────────────────────────────────
  // Organic rocky surface: irregular light faces (LG/LT) and dark crevices (DK/VD).
  // No regular pattern — clusters of raised rock and shadowed gaps.
  // Gray colorize → granite / cave rock
  // Brown colorize → earth rock / cliff face
  // Dark colorize → obsidian / volcanic rock
  [
    [GY, LG, LG, LG, GY, DK, GY, LG, LT, LG, GY, DK, GY, LG, LG, GY],
    [LG, LT, LG, LG, DK, VD, DK, LG, LG, GY, DK, VD, DK, LG, LG, LG],
    [LG, LG, LG, GY, VD, DK, VD, GY, LG, DK, VD, DK, VD, GY, LG, LG],
    [GY, LG, GY, DK, DK, GY, DK, DK, GY, DK, DK, GY, DK, DK, GY, GY],
    [DK, GY, DK, GY, LG, LG, LG, GY, LG, LG, LG, LG, GY, LG, GY, DK],
    [VD, DK, GY, LG, LT, LG, LG, LG, GY, LG, LT, LG, LG, GY, DK, VD],
    [DK, VD, DK, LG, LG, GY, LG, LG, LG, GY, LG, LG, GY, LG, VD, DK],
    [GY, DK, LG, LG, GY, LG, LT, LG, GY, LG, LT, LG, LG, LG, DK, GY],
    [LG, GY, LG, GY, LG, LG, LG, GY, LG, LG, LG, GY, LG, LG, GY, LG],
    [LG, LG, GY, DK, DK, GY, GY, DK, DK, GY, GY, DK, DK, GY, LG, LG],
    [GY, LG, DK, VD, DK, LG, DK, VD, DK, LG, DK, VD, DK, LG, LG, GY],
    [DK, GY, DK, DK, GY, LG, VD, DK, GY, LG, VD, DK, GY, LG, GY, DK],
    [VD, DK, GY, LG, LG, LG, DK, GY, LG, LG, DK, GY, LG, LG, DK, VD],
    [DK, VD, LG, LT, LG, LG, GY, LG, LT, LG, GY, LG, LT, LG, VD, DK],
    [GY, DK, LG, LG, GY, LG, LG, GY, LG, LG, GY, LG, LG, GY, DK, GY],
    [LG, GY, GY, LG, LG, GY, LG, LG, GY, LG, LG, GY, LG, GY, LG, LG],
  ],

  // ── FLOOR_7 — Lava Crust (X-Crack) ──────────────────────────
  // Dark volcanic rock base (VD/DK) with two diagonal lava veins crossing
  // at the tile center (an X pattern). Distance from each diagonal determines
  // brightness: BW core → WH → LT → MD → rock.
  // Generated by asset-pipeline.ts (winner of 3-candidate vision-scored race).
  // Orange colorize h=20 s=85 → glowing lava cracks
  // Blue colorize h=200 s=70 → ice-vein dark crystal
  [
    [BW, WH, LT, MD, DK, DK, DK, DK, DK, DK, DK, DK, MD, LT, WH, BW],
    [WH, BW, WH, LT, MD, DK, DK, DK, DK, DK, DK, MD, LT, WH, BW, WH],
    [LT, WH, BW, WH, LT, MD, DK, DK, DK, DK, MD, LT, WH, BW, WH, LT],
    [MD, LT, WH, BW, WH, LT, MD, DK, DK, MD, LT, WH, BW, WH, LT, MD],
    [DK, MD, LT, WH, BW, WH, LT, MD, MD, LT, WH, BW, WH, LT, MD, DK],
    [DK, DK, MD, LT, WH, BW, WH, LT, LT, WH, BW, WH, LT, MD, DK, DK],
    [DK, DK, DK, MD, LT, WH, BW, WH, WH, BW, WH, LT, MD, DK, DK, DK],
    [DK, DK, DK, DK, MD, LT, WH, BW, BW, WH, LT, MD, DK, DK, DK, DK],
    [DK, DK, DK, DK, MD, LT, WH, BW, BW, WH, LT, MD, DK, DK, DK, DK],
    [DK, DK, DK, MD, LT, WH, BW, WH, WH, BW, WH, LT, MD, DK, DK, DK],
    [DK, DK, MD, LT, WH, BW, WH, LT, LT, WH, BW, WH, LT, MD, DK, DK],
    [DK, MD, LT, WH, BW, WH, LT, MD, MD, LT, WH, BW, WH, LT, MD, DK],
    [MD, LT, WH, BW, WH, LT, MD, DK, DK, MD, LT, WH, BW, WH, LT, MD],
    [LT, WH, BW, WH, LT, MD, DK, DK, DK, DK, MD, LT, WH, BW, WH, LT],
    [WH, BW, WH, LT, MD, DK, DK, DK, DK, DK, DK, MD, LT, WH, BW, WH],
    [BW, WH, LT, MD, DK, DK, DK, DK, DK, DK, DK, DK, MD, LT, WH, BW],
  ],
]

function generateFloorsPng(): void {
  const TILE = 16
  const COUNT = PATTERNS.length
  const WIDTH = COUNT * TILE
  const HEIGHT = TILE

  const png = new PNG({ width: WIDTH, height: HEIGHT, filterType: -1 })

  for (let slot = 0; slot < COUNT; slot++) {
    const pattern = PATTERNS[slot]
    const xOffset = slot * TILE
    for (let row = 0; row < TILE; row++) {
      for (let col = 0; col < TILE; col++) {
        const gray = pattern[row][col]
        const idx = ((row * WIDTH) + xOffset + col) * 4
        png.data[idx + 0] = gray
        png.data[idx + 1] = gray
        png.data[idx + 2] = gray
        png.data[idx + 3] = 255
      }
    }
  }

  const outDir = path.dirname(OUT_PATH)
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  const buf = PNG.sync.write(png)
  fs.writeFileSync(OUT_PATH, buf)
  console.log(`✅ floors.png written → ${OUT_PATH}`)
  console.log(`   ${WIDTH}×${HEIGHT} px, ${COUNT} patterns`)
  console.log(`   Open in any image viewer at 8× zoom to inspect pixels.`)
}

generateFloorsPng()
