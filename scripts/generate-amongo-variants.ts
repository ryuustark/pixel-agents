/**
 * Generate 4 hue-shifted color variants of Amongo Cat.
 *
 * Outline pixels (luminance < 0.25) and visor pixels (luminance > 0.85) are
 * preserved exactly — only the body fill colors are shifted.
 *
 * Run: npx tsx scripts/generate-amongo-variants.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { PNG } from 'pngjs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ASSETS_DIR = path.join(__dirname, '../webview-ui/public/assets/characters')

const SOURCE_FILE = 'Amongo Cat.png'

const VARIANTS = [
  { name: 'Amongo Cat Green',  hueShift: 90  },
  { name: 'Amongo Cat Blue',   hueShift: 180 },
  { name: 'Amongo Cat Purple', hueShift: 240 },
  { name: 'Amongo Cat Pink',   hueShift: 300 },
]

// Outline: very dark pixels kept as-is
// Visor/highlight: near-white pixels kept as-is
const OUTLINE_THRESHOLD = 0.25
const HIGHLIGHT_THRESHOLD = 0.85

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rf = r / 255, gf = g / 255, bf = b / 255
  const max = Math.max(rf, gf, bf), min = Math.min(rf, gf, bf)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === rf) h = ((gf - bf) / d + (gf < bf ? 6 : 0)) * 60
  else if (max === gf) h = ((bf - rf) / d + 2) * 60
  else h = ((rf - gf) / d + 4) * 60
  return [h, s, l]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const hp = h / 60
  const x = c * (1 - Math.abs(hp % 2 - 1))
  let r1 = 0, g1 = 0, b1 = 0
  if (hp < 1) { r1 = c; g1 = x; b1 = 0 }
  else if (hp < 2) { r1 = x; g1 = c; b1 = 0 }
  else if (hp < 3) { r1 = 0; g1 = c; b1 = x }
  else if (hp < 4) { r1 = 0; g1 = x; b1 = c }
  else if (hp < 5) { r1 = x; g1 = 0; b1 = c }
  else { r1 = c; g1 = 0; b1 = x }
  const m = l - c / 2
  return [
    Math.round(Math.max(0, Math.min(255, (r1 + m) * 255))),
    Math.round(Math.max(0, Math.min(255, (g1 + m) * 255))),
    Math.round(Math.max(0, Math.min(255, (b1 + m) * 255))),
  ]
}

function shiftPixel(r: number, g: number, b: number, degrees: number): [number, number, number] {
  const luminance = 0.299 * (r / 255) + 0.587 * (g / 255) + 0.114 * (b / 255)
  if (luminance < OUTLINE_THRESHOLD || luminance > HIGHLIGHT_THRESHOLD) return [r, g, b]
  const [h, s, l] = rgbToHsl(r, g, b)
  const newH = ((h + degrees) % 360 + 360) % 360
  return hslToRgb(newH, s, l)
}

const sourcePath = path.join(ASSETS_DIR, SOURCE_FILE)
if (!fs.existsSync(sourcePath)) {
  console.error(`Source not found: ${sourcePath}`)
  process.exit(1)
}

const srcBuffer = fs.readFileSync(sourcePath)
const srcPng = PNG.sync.read(srcBuffer)
console.log(`Source: ${SOURCE_FILE} (${srcPng.width}×${srcPng.height})`)

for (const variant of VARIANTS) {
  const outPng = new PNG({ width: srcPng.width, height: srcPng.height })

  for (let y = 0; y < srcPng.height; y++) {
    for (let x = 0; x < srcPng.width; x++) {
      const i = (y * srcPng.width + x) * 4
      const a = srcPng.data[i + 3]
      if (a < 128) {
        outPng.data[i] = 0; outPng.data[i + 1] = 0; outPng.data[i + 2] = 0; outPng.data[i + 3] = 0
        continue
      }
      const [nr, ng, nb] = shiftPixel(srcPng.data[i], srcPng.data[i + 1], srcPng.data[i + 2], variant.hueShift)
      outPng.data[i] = nr; outPng.data[i + 1] = ng; outPng.data[i + 2] = nb; outPng.data[i + 3] = 255
    }
  }

  const outPath = path.join(ASSETS_DIR, `${variant.name}.png`)
  fs.writeFileSync(outPath, PNG.sync.write(outPng))
  console.log(`  Written: ${variant.name}.png (hue +${variant.hueShift}°)`)
}

console.log('Done.')
