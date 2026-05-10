/**
 * Patch default-layout.json floor patterns for the two top rooms.
 *
 * Left room  (cols 1-9,  rows 1-10): FLOOR_1 (Horizontal Fine Ripple), calm water  h=210 s=80 b=-5 c=10
 * Right room (cols 11-19, rows 1-10): FLOOR_5 (Vertical Bold Rivers),  lava rivers h=15  s=90 b=-10 c=15
 * Bottom room: unchanged
 *
 * Run: npx tsx scripts/patch-layout-floors.ts
 */

import * as fs from 'fs'
import * as path from 'path'

const LAYOUT_PATH = path.join(
  __dirname, '..', 'webview-ui', 'public', 'assets', 'default-layout.json'
)

interface FloorColor {
  h: number; s: number; b: number; c: number; colorize: boolean
}

interface Layout {
  version: number
  cols: number
  rows: number
  tiles: number[]
  tileColors: (FloorColor | null)[]
  furniture: unknown[]
}

// TileType values
const FLOOR_1 = 1  // Horizontal Fine Ripple → calm water (blue)
const FLOOR_5 = 5  // Vertical Bold Rivers   → lava rivers (orange)

const WATER_COLOR: FloorColor = { h: 210, s: 80, b:  -5, c: 10, colorize: true }
const LAVA_COLOR: FloorColor  = { h:  15, s: 90, b: -10, c: 15, colorize: true }

const layout: Layout = JSON.parse(fs.readFileSync(LAYOUT_PATH, 'utf-8'))
const COLS = layout.cols  // 21

let leftCount = 0
let rightCount = 0

for (let row = 1; row <= 10; row++) {
  for (let col = 1; col <= 19; col++) {
    const idx = row * COLS + col
    const isLeft  = col >= 1 && col <= 9
    const isRight = col >= 11 && col <= 19

    if (isLeft) {
      layout.tiles[idx] = FLOOR_1
      layout.tileColors[idx] = WATER_COLOR
      leftCount++
    } else if (isRight) {
      layout.tiles[idx] = FLOOR_5
      layout.tileColors[idx] = LAVA_COLOR
      rightCount++
    }
    // col 10 (separator) is VOID — skip
  }
}

fs.writeFileSync(LAYOUT_PATH, JSON.stringify(layout, null, 2))

console.log(`✅ Layout patched → ${LAYOUT_PATH}`)
console.log(`   Left room:  ${leftCount} tiles → FLOOR_1 (Fine Ripple / water) h=210 s=80`)
console.log(`   Right room: ${rightCount} tiles → FLOOR_5 (Bold Rivers / lava) h=15 s=90`)
console.log(`   Bottom room: unchanged`)
