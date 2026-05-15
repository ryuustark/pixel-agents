/**
 * create-clean-avatars.js
 *
 * Extracts clean 4×5 stream-avatar spritesheets from:
 *   - Sinner_1.png  (actually a GIF89a — decodes via omggif)
 *   - Amongo Cat.png (valid PNG, partial sheet — maps good rows)
 *
 * Output (scripts/avatar-output/):
 *   sinner-sheet.png         — 192×240 ready for characters/
 *   sinner-idle.gif  sinner-walk.gif  sinner-fight.gif
 *   sinner-sleep.gif sinner-sit.gif
 *   amongo-cat-sheet.png
 *   amongo-cat-idle.gif  …-walk.gif  …-fight.gif  …-sleep.gif  …-sit.gif
 *
 * Stream avatar format: 4 cols × 5 rows, rows = idle/walk/fight/sleep/sit
 * Frame size: 48×60 px  (matches existing ene_sinner / ene_amongo)
 * Run: node scripts/create-clean-avatars.js
 */

'use strict'

const fs   = require('fs')
const path = require('path')
const omggif = require('omggif')
const { PNG } = require('pngjs')

const CHARS_DIR = path.join(__dirname, '..', 'webview-ui', 'public', 'assets', 'characters')
const OUT_DIR   = path.join(__dirname, 'avatar-output')
fs.mkdirSync(OUT_DIR, { recursive: true })

const FRAME_W = 48, FRAME_H = 60
const COLS = 4, ROWS = 5
const GIF_DELAY = 15  // centiseconds per frame (~150 ms)

// ─── pixel utilities ──────────────────────────────────────────────────────────

/** Crop a rectangle from an RGBA flat array. */
function cropRGBA(px, srcW, srcH, x, y, w, h) {
  const dst = new Uint8Array(w * h * 4)
  for (let dy = 0; dy < h; dy++) {
    const sy = y + dy
    if (sy < 0 || sy >= srcH) continue
    for (let dx = 0; dx < w; dx++) {
      const sx = x + dx
      if (sx < 0 || sx >= srcW) continue
      const si = (sy * srcW + sx) * 4
      const di = (dy * w + dx) * 4
      dst[di]   = px[si];   dst[di+1] = px[si+1]
      dst[di+2] = px[si+2]; dst[di+3] = px[si+3]
    }
  }
  return dst
}

/** Nearest-neighbour scale. */
function scaleNN(src, sw, sh, dw, dh) {
  const dst = new Uint8Array(dw * dh * 4)
  for (let dy = 0; dy < dh; dy++) {
    const sy = Math.min(Math.floor(dy * sh / dh), sh - 1)
    for (let dx = 0; dx < dw; dx++) {
      const sx = Math.min(Math.floor(dx * sw / dw), sw - 1)
      const si = (sy * sw + sx) * 4
      const di = (dy * dw + dx) * 4
      dst[di]   = src[si];   dst[di+1] = src[si+1]
      dst[di+2] = src[si+2]; dst[di+3] = src[si+3]
    }
  }
  return dst
}

/**
 * Scale src to fit inside cellW×cellH (preserving aspect ratio),
 * align: 'center' or 'bottom'.
 */
function fitIntoCell(src, sw, sh, cw, ch, align = 'bottom') {
  const scale = Math.min(cw / sw, ch / sh)
  const nw = Math.max(1, Math.round(sw * scale))
  const nh = Math.max(1, Math.round(sh * scale))
  const scaled = scaleNN(src, sw, sh, nw, nh)
  const cell = new Uint8Array(cw * ch * 4)
  const ox = Math.floor((cw - nw) / 2)
  const oy = align === 'bottom' ? ch - nh : Math.floor((ch - nh) / 2)
  for (let y = 0; y < nh; y++) {
    for (let x = 0; x < nw; x++) {
      const si = (y * nw + x) * 4
      const di = ((oy + y) * cw + (ox + x)) * 4
      if (di + 3 < cell.length) {
        cell[di]   = scaled[si];   cell[di+1] = scaled[si+1]
        cell[di+2] = scaled[si+2]; cell[di+3] = scaled[si+3]
      }
    }
  }
  return cell
}

/** Blit a FRAME_W×FRAME_H cell into the full sheet. */
function blit(sheet, col, row, cell) {
  const shW = COLS * FRAME_W
  const ox = col * FRAME_W, oy = row * FRAME_H
  for (let y = 0; y < FRAME_H; y++) {
    for (let x = 0; x < FRAME_W; x++) {
      const si = (y * FRAME_W + x) * 4
      const di = ((oy + y) * shW + (ox + x)) * 4
      sheet[di]   = cell[si];   sheet[di+1] = cell[si+1]
      sheet[di+2] = cell[si+2]; sheet[di+3] = cell[si+3]
    }
  }
}

// ─── Color quantization (median cut, max 255 colors) ─────────────────────────

function medianCutQuantize(frames4, maxColors) {
  // Collect all unique RGBA pixels (opaque only)
  const colorSet = new Set()
  for (const f of frames4) {
    for (let i = 0; i < f.length; i += 4) {
      if (f[i+3] < 128) continue
      colorSet.add((f[i] << 16) | (f[i+1] << 8) | f[i+2])
    }
  }
  // If already within budget, return as-is
  if (colorSet.size <= maxColors) {
    return [...colorSet].map(c => `${(c>>16)&255},${(c>>8)&255},${c&255}`)
  }
  // Simple uniform quantization: reduce each channel to nearest step
  const bits = Math.ceil(Math.log2(maxColors) / 3)  // bits per channel
  const step = 256 >> bits
  const quantSet = new Set()
  for (const c of colorSet) {
    const r = Math.round(((c>>16)&255) / step) * step
    const g = Math.round(((c>>8)&255)  / step) * step
    const b = Math.round((c&255)        / step) * step
    quantSet.add(`${Math.min(r,255)},${Math.min(g,255)},${Math.min(b,255)}`)
  }
  return [...quantSet].slice(0, maxColors)
}

/** Find nearest palette color (packed int palette) by RGB Euclidean distance. */
function nearestPaletteIdx(r, g, b, palette, colorMap) {
  const key = `${r},${g},${b}`
  if (colorMap.has(key)) return colorMap.get(key)
  let best = 1, bestDist = Infinity
  for (let i = 1; i < palette.length; i++) {
    const pr = (palette[i] >> 16) & 0xff
    const pg = (palette[i] >> 8) & 0xff
    const pb = palette[i] & 0xff
    const dist = (r-pr)**2 + (g-pg)**2 + (b-pb)**2
    if (dist < bestDist) { bestDist = dist; best = i }
  }
  return best
}

// ─── PNG + GIF output ─────────────────────────────────────────────────────────

function saveSpritesheet(rows5x4, name) {
  const shW = COLS * FRAME_W, shH = ROWS * FRAME_H
  const sheet = new Uint8Array(shW * shH * 4)
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      blit(sheet, c, r, rows5x4[r][c])
    }
  }
  const png = new PNG({ width: shW, height: shH })
  png.data = Buffer.from(sheet)
  const outPath = path.join(OUT_DIR, name + '-sheet.png')
  fs.writeFileSync(outPath, PNG.sync.write(png))
  console.log('  →', path.basename(outPath))
}

function saveAnimGIF(frames4, name) {
  // omggif palette = array of packed 0xRRGGBB integers, length = num colors (power of 2, 2–256)
  const palette = [0x000000]  // index 0 = transparent (magenta-free black)
  const colorMap = new Map()  // 'r,g,b' → palette index
  colorMap.set('transparent', 0)

  // Collect unique opaque colors across all frames
  const allColors = new Set()
  for (const f of frames4) {
    for (let i = 0; i < f.length; i += 4) {
      if (f[i + 3] < 128) continue
      allColors.add(`${f[i]},${f[i+1]},${f[i+2]}`)
    }
  }

  // Quantize if over budget
  let colorList = [...allColors]
  if (colorList.length > 255) colorList = medianCutQuantize(frames4, 255)

  for (const key of colorList) {
    const [r, g, b] = key.split(',').map(Number)
    colorMap.set(key, palette.length)
    palette.push((r << 16) | (g << 8) | b)
  }

  // Pad to nearest power-of-2 in [2, 256]
  let palPow = 2
  while (palPow < palette.length) palPow *= 2
  palPow = Math.min(palPow, 256)
  while (palette.length < palPow) palette.push(0)

  const buf = Buffer.alloc(FRAME_W * FRAME_H * palPow + 2048)
  const gw = new omggif.GifWriter(buf, FRAME_W, FRAME_H, {
    loop: 0,
    palette
  })

  for (const f of frames4) {
    const indexed = new Uint8Array(FRAME_W * FRAME_H)
    for (let i = 0; i < FRAME_W * FRAME_H; i++) {
      if (f[i * 4 + 3] < 128) {
        indexed[i] = 0  // transparent
      } else {
        indexed[i] = nearestPaletteIdx(f[i*4], f[i*4+1], f[i*4+2], palette, colorMap)
      }
    }
    gw.addFrame(0, 0, FRAME_W, FRAME_H, indexed, {
      delay: GIF_DELAY,
      transparent_index: 0,
      disposal: 2
    })
  }

  const outPath = path.join(OUT_DIR, name + '.gif')
  fs.writeFileSync(outPath, buf.slice(0, gw.end()))
  console.log('  →', path.basename(outPath))
}

// ─── Sinner (GIF89a source 652×905) ──────────────────────────────────────────
console.log('\nProcessing Sinner…')

const sinnerBuf = fs.readFileSync(path.join(CHARS_DIR, 'Sinner_1.png'))
const gr = new omggif.GifReader(sinnerBuf)
const SW = gr.width, SH = gr.height
const sinnerPx = new Uint8Array(SW * SH * 4)
gr.decodeAndBlitFrameRGBA(0, sinnerPx)

/** Crop + fit a region from the Sinner sheet. */
function sf(x, y, w, h, align = 'bottom') {
  return fitIntoCell(cropRGBA(sinnerPx, SW, SH, x, y, w, h), w, h, FRAME_W, FRAME_H, align)
}

//  Source analysis (auto-detected groups):
//  Group 0  y  4-105  — walk front (3 frames: f0 9-64, f1 74-129, f2 148-203)
//  Group 1  y113-212  — walk back/side (3 frames: f0 11-73, f1 87-152, f2 157-231)
//  Group 2  y275-372  — crouch / ready (f0 6-106, f1 124-203)
//  Group 3  y395-519  — attack swing   (f0 16-93, f1 129-218, f2 270-344)
//  Group 4  y538-637  — throw/projectile (6 fragments — skip)
//  Group 5  y670-768  — prone/knockdown  (f0 18-84, f1 102-199, f2 225-322, f3 346-449)
//  Group 6  y799-893  — recovery (f0 22-88, f1 104-169)

const sinnerRows = [
  // Row 0: idle — front walk frames looped as a stand-bob
  [ sf(9,4,56,102),   sf(74,4,56,102),   sf(148,4,56,102),  sf(74,4,56,102) ],
  // Row 1: walk — side-facing walk cycle
  [ sf(11,113,63,100), sf(87,113,66,100), sf(157,113,75,100), sf(87,113,66,100) ],
  // Row 2: fight — attack swing (3 distinct poses, repeat start)
  [ sf(16,395,78,125),  sf(129,395,90,125), sf(270,395,75,125), sf(16,395,78,125) ],
  // Row 3: sleep — full prone sequence (4 frames)
  [ sf(18,670,67,99,'center'), sf(102,670,98,99,'center'),
    sf(225,670,98,99,'center'), sf(346,670,104,99,'center') ],
  // Row 4: sit — crouch/ready pose (2 frames alternating)
  [ sf(6,275,101,98),  sf(124,275,80,98), sf(6,275,101,98),  sf(124,275,80,98) ],
]

saveSpritesheet(sinnerRows, 'sinner')
const animNames = ['idle','walk','fight','sleep','sit']
sinnerRows.forEach((row, i) => saveAnimGIF(row, `sinner-${animNames[i]}`))

// ─── Amongo Cat — read from existing clean sheet (ene_amongo.png, 192×300) ────
// Stream avatar sheet already generated; load pixels for circus char sheet only.
console.log('\nLoading Amongo Cat (from clean sheet)…')
const acPng = PNG.sync.read(fs.readFileSync(path.join(CHARS_DIR, 'ene_amongo.png')))
const ACW = acPng.width, ACH = acPng.height
const acPx = new Uint8Array(acPng.data.buffer, acPng.data.byteOffset, acPng.data.byteLength)

/** Crop a cell from the clean 192×300 amongo sheet (48×60 grid). */
function acf(col, row) {
  return cropRGBA(acPx, ACW, ACH, col * FRAME_W, row * FRAME_H, FRAME_W, FRAME_H)
}

// ─── Meowatar — source: meowatar_orig.png (240×300) ──────────────────────────
// Sprites are NOT grid-aligned; groups found by transparent-row gap scan:
//   idle:  y=3-48  (46px), 4 frames at x=c*60 each
//   walk:  y=53-98 (46px), 4 frames at x=c*60 each
//   sleep: y=115-149 (35px), col 0 only, bbox x=16-41 (26px wide)
//   sit:   y=153-198 (46px), col 0 only, bbox x=1-54 (54px wide)
//   skip:  y=203-248 (extra pose), y=263-299 (blue balls)
console.log('\nProcessing Meowatar…')
const mwPng = PNG.sync.read(fs.readFileSync(path.join(OUT_DIR, 'meowatar_orig.png')))
const MWW = mwPng.width, MWH = mwPng.height
const mwPx = new Uint8Array(mwPng.data.buffer, mwPng.data.byteOffset, mwPng.data.byteLength)

function mwCell(x, y, w, h, cw, ch, align = 'center') {
  return fitIntoCell(cropRGBA(mwPx, MWW, MWH, x, y, w, h), w, h, cw, ch, align)
}
function mwFrame(col, y0, fh, cw, ch) {
  return mwCell(col * 60, y0, 60, fh, cw, ch)
}

const mwIdleFrames = [0,1,2,3].map(c => mwFrame(c, 3,  46, FRAME_W, FRAME_H))
const mwWalkFrames = [0,1,2,3].map(c => mwFrame(c, 53, 46, FRAME_W, FRAME_H))
const mwSleepFrame = mwCell(16, 115, 26, 35, FRAME_W, FRAME_H)
const mwSitFrame   = mwCell(1,  153, 54, 46, FRAME_W, FRAME_H)

const mwRows = [
  mwIdleFrames,
  mwWalkFrames,
  mwIdleFrames,
  [mwSleepFrame, mwSleepFrame, mwSleepFrame, mwSleepFrame],
  [mwSitFrame,   mwSitFrame,   mwSitFrame,   mwSitFrame],
]
saveSpritesheet(mwRows, 'meowatar')
mwRows.forEach((row, i) => saveAnimGIF(row, `meowatar-${animNames[i]}`))

// ─── Michimaru — source: michimaru_orig.png (160×300) ────────────────────────
// Sprites are NOT grid-aligned; groups found by transparent-row gap scan:
//   idle:  y=2-48  (47px), 4 frames at x=c*40 each
//   walk:  y=51-97 (47px), 4 frames at x=c*40 each (col 0 content extends to y=149
//          but y=98-149 is the blue minion figure — skip that range)
//   sleep: y=152-198 (47px), col 0 only (warrior single pose)
//   sit:   y=202-249 (48px), col 0 only (warrior alternate pose)
//   skip:  y=98-149 col 0 (blue minion), y=251-299 (blue minion anim all cols)
console.log('\nProcessing Michimaru…')
const miPng = PNG.sync.read(fs.readFileSync(path.join(OUT_DIR, 'michimaru_orig.png')))
const MIW = miPng.width, MIH = miPng.height
const miPx = new Uint8Array(miPng.data.buffer, miPng.data.byteOffset, miPng.data.byteLength)

function miCell(x, y, w, h, cw, ch) {
  return fitIntoCell(cropRGBA(miPx, MIW, MIH, x, y, w, h), w, h, cw, ch, 'bottom')
}
function miFrame(col, y0, fh, cw, ch) {
  return miCell(col * 40, y0, 40, fh, cw, ch)
}

const miIdleFrames = [0,1,2,3].map(c => miFrame(c, 2,   47, FRAME_W, FRAME_H))
const miWalkFrames = [0,1,2,3].map(c => miFrame(c, 51,  47, FRAME_W, FRAME_H))
const miSleepFrame = miCell(0, 152, 40, 47, FRAME_W, FRAME_H)
const miSitFrame   = miCell(0, 202, 40, 48, FRAME_W, FRAME_H)

const miRows = [
  miIdleFrames,
  miWalkFrames,
  [miIdleFrames[0], miWalkFrames[1], miWalkFrames[2], miIdleFrames[3]],
  [miSleepFrame, miSleepFrame, miSleepFrame, miSleepFrame],
  [miSitFrame,   miSitFrame,   miSitFrame,   miSitFrame],
]
saveSpritesheet(miRows, 'michimaru')
miRows.forEach((row, i) => saveAnimGIF(row, `michimaru-${animNames[i]}`))

// ─── Circus-format char sheets (192×240, 4 cols × 5 rows, 48×48 per frame) ────
// Row order: idle/walk/sit/attack/celebrate — matches buildCircusSprites()
// Must be 192×240 exactly — assetLoader.ts checks width===192 && height===240.
// Row 0 idle:      [f0, f1, EMPTY, EMPTY]
// Row 1 walk:      [f0, f1, f2, f3]
// Row 2 sit:       [f0, f0, EMPTY, EMPTY]
// Row 3 attack:    [f0, f1, f2, EMPTY]
// Row 4 celebrate: [f0, f1, f2, EMPTY]

const CHAR_SZ = 48  // square frame for named circus chars (vs FRAME_H=60 for stream avatars)
const CHAR_EMPTY = new Uint8Array(CHAR_SZ * CHAR_SZ * 4)

/** Crop + fit a Sinner region into a 48×48 cell. */
function sfc(x, y, w, h, align = 'bottom') {
  return fitIntoCell(cropRGBA(sinnerPx, SW, SH, x, y, w, h), w, h, CHAR_SZ, CHAR_SZ, align)
}

/** Crop + fit a cell from the clean amongo sheet (col/row grid) into a 48×48 circus cell. */
function acfc(col, row) {
  return fitIntoCell(cropRGBA(acPx, ACW, ACH, col * FRAME_W, row * FRAME_H, FRAME_W, FRAME_H), FRAME_W, FRAME_H, CHAR_SZ, CHAR_SZ, 'center')
}

function blitChar(sheet, col, row, cell) {
  const shW = COLS * CHAR_SZ
  const ox = col * CHAR_SZ, oy = row * CHAR_SZ
  for (let y = 0; y < CHAR_SZ; y++) {
    for (let x = 0; x < CHAR_SZ; x++) {
      const si = (y * CHAR_SZ + x) * 4
      const di = ((oy + y) * shW + (ox + x)) * 4
      sheet[di] = cell[si]; sheet[di+1] = cell[si+1]
      sheet[di+2] = cell[si+2]; sheet[di+3] = cell[si+3]
    }
  }
}

function saveCircusSheet(rows5x4, charName) {
  const shW = COLS * CHAR_SZ, shH = ROWS * CHAR_SZ  // 192×240
  const sheet = new Uint8Array(shW * shH * 4)
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      blitChar(sheet, c, r, rows5x4[r][c])
    }
  }
  const png = new PNG({ width: shW, height: shH })
  png.data = Buffer.from(sheet)
  const outPath = path.join(OUT_DIR, `char_${charName}.png`)
  fs.writeFileSync(outPath, PNG.sync.write(png))
  console.log('  →', path.basename(outPath))
}

// Sinner circus sheet
console.log('\nGenerating Sinner circus char sheet…')
const sinnerIdle0 = sfc(9, 4, 56, 102)
const sinnerIdle1 = sfc(74, 4, 56, 102)
const sinnerIdle2 = sfc(148, 4, 56, 102)
saveCircusSheet([
  [ sinnerIdle0,          sinnerIdle1,           CHAR_EMPTY,           CHAR_EMPTY ],
  [ sfc(11,113,63,100),   sfc(87,113,66,100),   sfc(157,113,75,100), sfc(87,113,66,100) ],
  [ sfc(6,275,101,98),    sfc(6,275,101,98),    CHAR_EMPTY,           CHAR_EMPTY ],
  [ sfc(16,395,78,125),   sfc(129,395,90,125),  sfc(270,395,75,125), CHAR_EMPTY ],
  [ sinnerIdle0,          sinnerIdle1,           sinnerIdle2,          CHAR_EMPTY ],
], 'Sinner')

// Amongo Cat circus sheet (grid coords: col, row on clean 192×300 sheet)
console.log('\nGenerating Amongo Cat circus char sheet…')
const acIdle0 = acfc(0, 0), acIdle1 = acfc(1, 0), acIdle2 = acfc(2, 0)
const acSit0  = acfc(0, 4)
saveCircusSheet([
  [ acIdle0,        acIdle1,        CHAR_EMPTY, CHAR_EMPTY ],
  [ acfc(0,1),      acfc(1,1),      acfc(2,1),  acfc(3,1) ],
  [ acSit0,         acSit0,         CHAR_EMPTY, CHAR_EMPTY ],
  [ acfc(0,1),      acfc(2,1),      acfc(3,1),  CHAR_EMPTY ],
  [ acIdle0,        acIdle1,        acIdle2,    CHAR_EMPTY ],
], 'AmongoCat')

// Meowatar circus sheet (same crop coords, target 48×48)
console.log('\nGenerating Meowatar circus char sheet…')
const mwCIdle = [0,1,2,3].map(c => mwFrame(c, 3,  46, CHAR_SZ, CHAR_SZ))
const mwCWalk = [0,1,2,3].map(c => mwFrame(c, 53, 46, CHAR_SZ, CHAR_SZ))
const mwCSleep = mwCell(16, 115, 26, 35, CHAR_SZ, CHAR_SZ)
const mwCSit   = mwCell(1,  153, 54, 46, CHAR_SZ, CHAR_SZ)
saveCircusSheet([
  [ mwCIdle[0], mwCIdle[1], CHAR_EMPTY,  CHAR_EMPTY  ],
  [ mwCWalk[0], mwCWalk[1], mwCWalk[2],  mwCWalk[3]  ],
  [ mwCSleep,   mwCSleep,   CHAR_EMPTY,  CHAR_EMPTY  ],
  [ mwCIdle[0], mwCIdle[1], mwCSit,      CHAR_EMPTY  ],
  [ mwCWalk[0], mwCWalk[1], mwCWalk[2],  CHAR_EMPTY  ],
], 'Meowatar')

// Michimaru circus sheet (same crop coords, target 48×48)
console.log('\nGenerating Michimaru circus char sheet…')
const miCIdle  = [0,1,2,3].map(c => miFrame(c, 2,  47, CHAR_SZ, CHAR_SZ))
const miCWalk  = [0,1,2,3].map(c => miFrame(c, 51, 47, CHAR_SZ, CHAR_SZ))
const miCSleep = miCell(0, 152, 40, 47, CHAR_SZ, CHAR_SZ)
const miCSit   = miCell(0, 202, 40, 48, CHAR_SZ, CHAR_SZ)
saveCircusSheet([
  [ miCIdle[0], miCIdle[1], CHAR_EMPTY, CHAR_EMPTY ],
  [ miCWalk[0], miCWalk[1], miCWalk[2], miCWalk[3] ],
  [ miCSleep,   miCSleep,   CHAR_EMPTY, CHAR_EMPTY ],
  [ miCIdle[0], miCWalk[1], miCWalk[2], CHAR_EMPTY ],
  [ miCWalk[0], miCWalk[1], miCWalk[2], CHAR_EMPTY ],
], 'Michimaru')

console.log('\nAll done. Check scripts/avatar-output/')
