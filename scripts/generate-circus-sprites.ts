/**
 * Generate circus spritesheets for Caine and Bubble.
 *
 * New sheet layout: 192×240 (4 cols × 5 rows, 48×48 per frame)
 *
 *   Row 0 — IDLE      : 2 frames  — front-facing, gentle hover (cols 2-3 empty)
 *   Row 1 — WALK/RUN  : 4 frames  — right-facing walk cycle (same frames used for all movement)
 *   Row 2 — SIT       : 2 frames  — right-facing at-desk pose; also used for receive-hit
 *                                   (knockback + red flash applied by renderer, not animation)
 *   Row 3 — ATTACK    : 3 frames  — right-facing: wind-up → strike → recoil (col 3 empty)
 *   Row 4 — CELEBRATE : 3 frames  — front-facing: base → victory jump → wave (col 3 empty)
 *
 * Source frame mapping (from existing 7×3 sheets):
 *   col 0 = walk1,  col 1 = walk2/idle,  col 2 = walk3
 *   col 3 = type1,  col 4 = type2
 *   col 5 = read1,  col 6 = read2
 *   row 0 = down,   row 1 = up,   row 2 = right
 *
 * Run: npx tsx scripts/generate-circus-sprites.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { PNG } from 'pngjs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ASSETS_DIR = path.join(__dirname, '../webview-ui/public/assets/characters')

const FW = 48
const FH = 48
const OUT_COLS = 4
const OUT_ROWS = 5
const OUT_W = OUT_COLS * FW  // 192
const OUT_H = OUT_ROWS * FH  // 240

type Pixels = number[]  // flat RGBA, length = FW*FH*4

// ── Frame extraction ────────────────────────────────────────────────────────

function extractFrame(png: PNG, col: number, row: number): Pixels {
  const px: Pixels = new Array(FW * FH * 4).fill(0)
  for (let y = 0; y < FH; y++) {
    for (let x = 0; x < FW; x++) {
      const sx = col * FW + x
      const sy = row * FH + y
      if (sx >= png.width || sy >= png.height) continue
      const si = (sy * png.width + sx) * 4
      const di = (y * FW + x) * 4
      px[di] = png.data[si]; px[di+1] = png.data[si+1]
      px[di+2] = png.data[si+2]; px[di+3] = png.data[si+3]
    }
  }
  return px
}

function isEmpty(px: Pixels): boolean {
  for (let i = 3; i < px.length; i += 4) if (px[i] >= 128) return false
  return true
}

// Fallback: if preferred row is empty, try the other row
function getFrame(png: PNG, col: number, preferRow: number, fallbackRow: number): Pixels {
  const f = extractFrame(png, col, preferRow)
  return isEmpty(f) ? extractFrame(png, col, fallbackRow) : f
}

// ── Pixel transforms ────────────────────────────────────────────────────────

/** Shift all pixels vertically. Positive dy moves pixels down (character appears to fly up). */
function shiftY(px: Pixels, dy: number): Pixels {
  const r: Pixels = new Array(FW * FH * 4).fill(0)
  for (let y = 0; y < FH; y++) {
    const ny = y + dy
    if (ny < 0 || ny >= FH) continue
    for (let x = 0; x < FW; x++) {
      const si = (y * FW + x) * 4
      const di = (ny * FW + x) * 4
      r[di] = px[si]; r[di+1] = px[si+1]; r[di+2] = px[si+2]; r[di+3] = px[si+3]
    }
  }
  return r
}

/** Shift all pixels horizontally. */
function shiftX(px: Pixels, dx: number): Pixels {
  const r: Pixels = new Array(FW * FH * 4).fill(0)
  for (let y = 0; y < FH; y++) {
    for (let x = 0; x < FW; x++) {
      const nx = x + dx
      if (nx < 0 || nx >= FW) continue
      const si = (y * FW + x) * 4
      const di = (y * FW + nx) * 4
      r[di] = px[si]; r[di+1] = px[si+1]; r[di+2] = px[si+2]; r[di+3] = px[si+3]
    }
  }
  return r
}

/**
 * Shear the upper body: rows above splitRow shift by dx pixels.
 * Simulates a forward/backward lean: positive dx = lean forward, negative = lean back.
 */
function shearUpper(px: Pixels, dx: number, splitRow: number): Pixels {
  const r: Pixels = new Array(FW * FH * 4).fill(0)
  for (let y = 0; y < FH; y++) {
    const xOff = y < splitRow ? dx : 0
    for (let x = 0; x < FW; x++) {
      const nx = x + xOff
      if (nx < 0 || nx >= FW) continue
      const si = (y * FW + x) * 4
      const di = (y * FW + nx) * 4
      r[di] = px[si]; r[di+1] = px[si+1]; r[di+2] = px[si+2]; r[di+3] = px[si+3]
    }
  }
  return r
}

/** Blend a color tint over all opaque pixels. intensity 0=none, 1=full. */
function tint(px: Pixels, tr: number, tg: number, tb: number, intensity: number): Pixels {
  const r = [...px]
  for (let i = 0; i < r.length; i += 4) {
    if (r[i+3] < 128) continue
    r[i]   = Math.min(255, Math.round(r[i]   * (1-intensity) + tr * intensity))
    r[i+1] = Math.min(255, Math.round(r[i+1] * (1-intensity) + tg * intensity))
    r[i+2] = Math.min(255, Math.round(r[i+2] * (1-intensity) + tb * intensity))
  }
  return r
}

/** Combine two transforms. */
function pipe(...fns: Array<(px: Pixels) => Pixels>): (px: Pixels) => Pixels {
  return (px: Pixels) => fns.reduce((acc, fn) => fn(acc), px)
}

// ── Frame output ────────────────────────────────────────────────────────────

function writeFrame(out: PNG, px: Pixels, col: number, row: number): void {
  for (let y = 0; y < FH; y++) {
    for (let x = 0; x < FW; x++) {
      const si = (y * FW + x) * 4
      const dx = col * FW + x
      const dy = row * FH + y
      const di = (dy * out.width + dx) * 4
      out.data[di] = px[si]; out.data[di+1] = px[si+1]
      out.data[di+2] = px[si+2]; out.data[di+3] = px[si+3]
    }
  }
}

// ── Character configs ────────────────────────────────────────────────────────

interface CharSpec {
  srcFile: string
  outFile: string
  label: string
  sideRow: number   // source row for right-facing (walk/sit/attack)
  frontRow: number  // source row for front-facing (idle/celebrate)
  shearSplit: number // pixel row that splits upper/lower body for attack lean
}

const CHARACTERS: CharSpec[] = [
  {
    srcFile: 'char_caine.png',
    outFile: 'char_caine_circus.png',
    label: 'Caine',
    sideRow: 2,     // right-facing — wand in leading hand, clear silhouette
    frontRow: 0,    // down-facing — hat and wand tip fully visible
    shearSplit: 26, // mid-torso shear for attack lean
  },
  {
    srcFile: 'char_Bubble.png',
    outFile: 'char_bubble_circus.png',
    label: 'Bubble',
    sideRow: 0,     // sphere has no meaningful facing — down row used for all
    frontRow: 0,
    shearSplit: 20, // upper-quarter shear for headbutt
  },
]

// ── Build each character ─────────────────────────────────────────────────────

for (const spec of CHARACTERS) {
  const srcPath = path.join(ASSETS_DIR, spec.srcFile)
  if (!fs.existsSync(srcPath)) {
    console.error(`  SKIP ${spec.srcFile} — not found`)
    continue
  }
  const src = PNG.sync.read(fs.readFileSync(srcPath))

  const out = new PNG({ width: OUT_W, height: OUT_H, filterType: -1 })
  out.data.fill(0)

  const S = (col: number) => getFrame(src, col, spec.sideRow, spec.frontRow)   // side frame
  const Fr = (col: number) => getFrame(src, col, spec.frontRow, spec.sideRow)  // front frame

  const walk1    = S(0)   // leading foot
  const walkMid  = S(1)   // neutral / idle stance
  const walk3    = S(2)   // trailing foot
  const typeA    = S(3)   // at-desk pose A
  const typeB    = S(4)   // at-desk pose B
  const idleBase = Fr(1)  // front-facing resting stance
  const readA    = Fr(5)  // glance / wave (read1 re-purposed)
  const readB    = Fr(6)  // wave return (read2 re-purposed)
  const split    = spec.shearSplit

  // ── Row 0: IDLE (2 frames, front-facing) ───────────────────────────────────
  // Gentle breathing bob: base → inhale-up → base → inhale-up (A/B loop).
  writeFrame(out, idleBase,             0, 0)  // idle-base
  writeFrame(out, shiftY(idleBase, -2), 1, 0)  // idle-breathe (subtle up shift)
  // cols 2-3 intentionally empty

  // ── Row 1: WALK / RUN (4 frames, side-facing) ──────────────────────────────
  // Standard 4-frame walk cycle: lead → mid → trail → mid (seamless loop).
  // These frames are used for ALL movement regardless of how the character moves
  // visually (walking, running, flying — it is purely an animation choice).
  writeFrame(out, walk1,   0, 1)  // step A
  writeFrame(out, walkMid, 1, 1)  // neutral
  writeFrame(out, walk3,   2, 1)  // step B
  writeFrame(out, walkMid, 3, 1)  // neutral (loop point)

  // ── Row 2: SIT / RECEIVE HIT (2 frames, side-facing) ──────────────────────
  // Calm at-desk pose used during SIT state.
  // Also played during the HIT state — the knockback offset and red flash are
  // applied by the renderer in code, not baked into these frames.
  writeFrame(out, typeA, 0, 2)  // sit-A (also receive-hit pose A)
  writeFrame(out, typeB, 1, 2)  // sit-B (also receive-hit pose B)
  // cols 2-3 intentionally empty

  // ── Row 3: ATTACK (3 frames, side-facing) ──────────────────────────────────
  // Wind-up → strike → recoil.  Upper-body shear creates the punch lunge.
  writeFrame(out, shearUpper(typeA,   -4, split), 0, 3)  // wind-up: upper body pulls back
  writeFrame(out, shearUpper(typeB,   +7, split), 1, 3)  // strike:  upper body lunges forward
  writeFrame(out, shiftX(walkMid, -2),            2, 3)  // recoil:  body snaps back
  // col 3 intentionally empty

  // ── Row 4: CELEBRATE (3 frames, front-facing) ──────────────────────────────
  // Victory sequence: ready → jump → wave/cheer.
  writeFrame(out, idleBase,               0, 4)  // celebrate-ready (same as idle)
  writeFrame(out, shiftY(idleBase, -10),  1, 4)  // celebrate-jump (big upward leap)
  writeFrame(out, readA,                  2, 4)  // celebrate-wave (read/glance pose = waving)
  // col 3 intentionally empty

  const outPath = path.join(ASSETS_DIR, spec.outFile)
  fs.writeFileSync(outPath, PNG.sync.write(out))
  console.log(`${spec.label}: ${spec.outFile} → ${OUT_W}×${OUT_H}`)
}

console.log('\nSheet format (192×240, 4 cols × 5 rows, 48×48 per frame):')
console.log('  Row 0 — IDLE      : cols 0-1 (2-frame breathe loop, cols 2-3 empty)')
console.log('  Row 1 — WALK/RUN  : cols 0-3 (4-frame walk cycle)')
console.log('  Row 2 — SIT       : cols 0-1 (2-frame sit loop; receive-hit uses same frames + code effect)')
console.log('  Row 3 — ATTACK    : cols 0-2 (wind-up, strike, recoil; col 3 empty)')
console.log('  Row 4 — CELEBRATE : cols 0-2 (ready, jump, wave; col 3 empty)')
