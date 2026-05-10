/**
 * Generate ene_amongo.png — Amongo Cat enemy sprite in 4×5 stream avatar format.
 *
 * The source (Amongo Cat.png, 360×280) is NOT a uniform grid — individual cat frames
 * are ~26-32px wide, separated by gaps, within 5 row bands of ~56px each.
 * This script detects frame positions via X-gap scanning per band, extracts each
 * frame's tight bounding box, scales to fill 48×48 (aspect-ratio preserved, upscale
 * allowed), and centers in the output cell.
 *
 * Detected band layout (from analyse-amongo.ts):
 *   Band 0 : 4 walk frames  (x: 7-32, 47-72, 87-113, 127-153; y: 11-55)
 *   Band 1 : 4 walk frames  (x: 4-35, 47-73, 87-115, 127-153; y: 56-111)
 *   Band 2 : 1 crouch frame (x: 4-32; y: 112-159)
 *   Band 3 : 1 sit frame    (x: 7-35; y: 169-223)
 *   Band 4 : 9 misc frames  (skipped — complex/inconsistent content)
 *
 * Output row semantics (matches streamAvatarController ANIM_ROW):
 *   Row 0 — idle  : band 0, frames 0-1  (2-frame calm loop)
 *   Row 1 — walk  : band 0, frames 0-3  (4-frame walk cycle)
 *   Row 2 — fight : band 1, frames 0-3  (4-frame alternate walk = fight energy)
 *   Row 3 — sleep : band 2, frame 0     (crouched/sleeping pose)
 *   Row 4 — sit   : band 3, frame 0     (upright sitting pose)
 *
 * Run: npx tsx scripts/generate-amongo-circus.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { PNG } from 'pngjs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ASSETS_DIR = path.join(__dirname, '../webview-ui/public/assets/characters')

const SRC_FILE  = 'Amongo Cat.png'
const OUT_FILE  = 'ene_amongo.png'
const ALPHA     = 128
const OUT_FW    = 48
const OUT_FH    = 48
const OUT_COLS  = 4
const OUT_ROWS  = 5
const OUT_W     = OUT_COLS * OUT_FW   // 192
const OUT_H     = OUT_ROWS * OUT_FH   // 240

type Pixels = number[]  // flat RGBA, OUT_FW × OUT_FH × 4

// ── Source band detection ────────────────────────────────────────────────────

interface Segment { x0: number; x1: number }

/**
 * Within a horizontal Y band [y0, y1), find contiguous X runs of opaque pixels,
 * merging gaps ≤ maxGap pixels (smooths over anti-aliasing noise between frames).
 */
function detectSegments(png: PNG, y0: number, y1: number, maxGap = 4): Segment[] {
  const hasOpaque = new Uint8Array(png.width)
  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < png.width; x++) {
      if (png.data[(y * png.width + x) * 4 + 3] >= ALPHA) hasOpaque[x] = 1
    }
  }

  const segs: Segment[] = []
  let inRun = false
  let runStart = 0
  for (let x = 0; x < png.width; x++) {
    if (hasOpaque[x] && !inRun) { inRun = true; runStart = x }
    else if (!hasOpaque[x] && inRun) {
      // peek ahead to see if this gap is short enough to bridge
      let gap = 0
      while (x + gap < png.width && !hasOpaque[x + gap]) gap++
      if (gap > maxGap) { segs.push({ x0: runStart, x1: x - 1 }); inRun = false }
    }
  }
  if (inRun) segs.push({ x0: runStart, x1: png.width - 1 })
  return segs
}

// ── Frame extraction ─────────────────────────────────────────────────────────

/**
 * Extract a single frame from the source PNG within the rectangle [x0,x1] × [y0,y1].
 * Finds the tight bounding box of opaque pixels, scales to fit OUT_FW × OUT_FH
 * (preserving aspect ratio, upscaling allowed), centers in output.
 * Returns null if the region has no opaque pixels.
 */
function extractTight(png: PNG, x0: number, x1: number, y0: number, y1: number): Pixels | null {
  // Tight bounding box
  let minX = x1, maxX = x0 - 1, minY = y1, maxY = y0 - 1
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (x < 0 || x >= png.width || y < 0 || y >= png.height) continue
      if (png.data[(y * png.width + x) * 4 + 3] >= ALPHA) {
        if (x < minX) minX = x; if (x > maxX) maxX = x
        if (y < minY) minY = y; if (y > maxY) maxY = y
      }
    }
  }
  if (maxX < minX) return null

  const cW = maxX - minX + 1
  const cH = maxY - minY + 1

  // Scale to fit OUT_FW × OUT_FH, preserving aspect ratio
  const scale = Math.min(OUT_FW / cW, OUT_FH / cH)
  const sW = Math.round(cW * scale)
  const sH = Math.round(cH * scale)
  const offX = Math.floor((OUT_FW - sW) / 2)
  const offY = Math.floor((OUT_FH - sH) / 2)

  const out: Pixels = new Array(OUT_FW * OUT_FH * 4).fill(0)
  for (let dy = 0; dy < sH; dy++) {
    for (let dx = 0; dx < sW; dx++) {
      const sx = minX + Math.floor((dx / sW) * cW)
      const sy = minY + Math.floor((dy / sH) * cH)
      if (sx >= png.width || sy >= png.height) continue
      const si = (sy * png.width + sx) * 4
      const di = ((offY + dy) * OUT_FW + (offX + dx)) * 4
      out[di]     = png.data[si]
      out[di + 1] = png.data[si + 1]
      out[di + 2] = png.data[si + 2]
      out[di + 3] = png.data[si + 3]
    }
  }
  return out
}

// ── Frame output ─────────────────────────────────────────────────────────────

function writeFrame(outPng: PNG, px: Pixels, outCol: number, outRow: number): void {
  for (let y = 0; y < OUT_FH; y++) {
    for (let x = 0; x < OUT_FW; x++) {
      const si = (y * OUT_FW + x) * 4
      const di = ((outRow * OUT_FH + y) * OUT_W + (outCol * OUT_FW + x)) * 4
      outPng.data[di]     = px[si]
      outPng.data[di + 1] = px[si + 1]
      outPng.data[di + 2] = px[si + 2]
      outPng.data[di + 3] = px[si + 3]
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

const srcPath = path.join(ASSETS_DIR, SRC_FILE)
if (!fs.existsSync(srcPath)) {
  console.error(`Source not found: ${srcPath}`)
  process.exit(1)
}

const src = PNG.sync.read(fs.readFileSync(srcPath))
console.log(`Source: ${SRC_FILE} (${src.width}×${src.height})`)

const BANDS = 5
const bandH = src.height / BANDS  // 56

// Detect segments and Y extents for each band
interface Band { segs: Segment[]; y0: number; y1: number }
const bands: Band[] = []
for (let b = 0; b < BANDS; b++) {
  const y0 = Math.round(b * bandH)
  const y1 = Math.round((b + 1) * bandH) - 1
  const segs = detectSegments(src, y0, y1 + 1)

  // Compute tight Y extent within this band
  let minY = y1, maxY = y0
  for (let y = y0; y <= y1; y++) {
    for (const seg of segs) {
      for (let x = seg.x0; x <= seg.x1; x++) {
        if (src.data[(y * src.width + x) * 4 + 3] >= ALPHA) {
          if (y < minY) minY = y; if (y > maxY) maxY = y
        }
      }
    }
  }
  bands.push({ segs, y0: minY <= maxY ? minY : y0, y1: minY <= maxY ? maxY : y1 })
  console.log(`Band ${b}: ${segs.length} segment(s)  Y:${bands[b].y0}-${bands[b].y1}`, segs.map(s => `[${s.x0}-${s.x1}]`).join(' '))
}

// Output row spec: [bandIdx, frameIndices[]]
const OUTPUT_ROWS: Array<{ label: string; band: number; frames: number[] }> = [
  { label: 'idle',  band: 0, frames: [0, 1] },
  { label: 'walk',  band: 0, frames: [0, 1, 2, 3] },
  { label: 'fight', band: 1, frames: [0, 1, 2, 3] },
  { label: 'sleep', band: 2, frames: [0] },
  { label: 'sit',   band: 3, frames: [0] },
]

const outPng = new PNG({ width: OUT_W, height: OUT_H, filterType: -1 })
outPng.data.fill(0)

for (let outRow = 0; outRow < OUTPUT_ROWS.length; outRow++) {
  const { label, band, frames } = OUTPUT_ROWS[outRow]
  const { segs, y0, y1 } = bands[band]
  let written = 0

  for (let i = 0; i < frames.length; i++) {
    const segIdx = frames[i]
    if (segIdx >= segs.length) {
      console.log(`  [${label}] frame ${i}: segment ${segIdx} missing — skipped`)
      continue
    }
    const seg = segs[segIdx]
    const px = extractTight(src, seg.x0, seg.x1, y0, y1)
    if (px) {
      writeFrame(outPng, px, i, outRow)
      written++
    }
  }
  console.log(`Row ${outRow} (${label}): ${written}/${frames.length} frames written`)
}

const outPath = path.join(ASSETS_DIR, OUT_FILE)
fs.writeFileSync(outPath, PNG.sync.write(outPng))
console.log(`\nWritten: ${OUT_FILE} (${OUT_W}×${OUT_H}, ${OUT_COLS}×${OUT_ROWS} grid, ${OUT_FW}×${OUT_FH}px per frame)`)
