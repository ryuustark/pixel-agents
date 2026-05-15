/**
 * Asset Pipeline Orchestrator
 *
 * Spawns 3 algorithmic candidate generators, vision-scores each against the
 * art bible via Claude API, and writes the winner into floors.png.
 *
 * Usage:
 *   npx tsx scripts/asset-pipeline.ts --desc "cracked lava crust" --slot 7 --apply
 *   npx tsx scripts/asset-pipeline.ts --desc "lava mortar" --slot 4
 *
 * Flags:
 *   --desc <text>   Natural-language description of the desired tile (default: "lava floor tile")
 *   --slot <n>      1-indexed slot in floors.png to target (default: 8)
 *   --apply         Write the winner into floors.png after scoring
 *   --no-vote       Skip vision scoring, just generate candidates
 */

import * as fs from 'fs'
import * as path from 'path'
import { PNG } from 'pngjs'
import Anthropic from '@anthropic-ai/sdk'

const WORK_DIR = path.join(__dirname, '.pipeline-work')
const FLOORS_PNG = path.join(__dirname, '..', 'webview-ui', 'public', 'assets', 'floors.png')
const ART_BIBLE  = path.join(__dirname, '..', 'design', 'art', 'art-bible.md')

// Grayscale level constants — MUST match generate-floors.ts and the colorize pipeline
const BK = 0, VD = 20, DK = 50, MD = 90
const _GY = 128, _LG = 170, LT = 200, WH = 230, BW = 255

// ── Candidate Generators ──────────────────────────────────────────────────────
//
// Each produces a 16×16 number[][] of gray values.
// Values are used raw by the Colorize pipeline: low = rock/shadow, high = lava core.

/**
 * Approach A — "X Crack": two diagonal lava veins crossing at the tile center.
 * Mathematical distance-from-diagonal determines brightness.
 * Tiles seamlessly (cracks exit at 4 corners, enter at same corners on neighbors).
 */
function genXCrack(): number[][] {
  return Array.from({ length: 16 }, (_, r) =>
    Array.from({ length: 16 }, (_, c) => {
      const d1 = Math.abs(r - c)           // NW→SE diagonal
      const d2 = Math.abs(r - (15 - c))    // NE→SW diagonal
      const d  = Math.min(d1, d2)
      if (d === 0) return BW               // crack centerline: hottest lava
      if (d === 1) return WH               // first ring: lava glow
      if (d === 2) return LT               // second ring: fading edge
      if (d === 3) return MD               // heat shadow
      // Volcanic rock base with deterministic texture noise
      return ((r * 7 + c * 13) % 3 === 0) ? VD : DK
    })
  )
}

/**
 * Approach B — "Lava Pools": 6 circular lava hotspots dotted across dark rock.
 * Pool positions are hand-placed for even visual distribution at 16×16.
 * Nearest-pool distance drives the brightness gradient.
 */
function genLavaPools(): number[][] {
  const centers: [number, number][] = [
    [1, 4], [2, 12], [7, 7], [11, 1], [12, 13], [8, 14],
  ]
  return Array.from({ length: 16 }, (_, r) =>
    Array.from({ length: 16 }, (_, c) => {
      let minD = Infinity
      for (const [pr, pc] of centers) {
        minD = Math.min(minD, Math.sqrt((r - pr) ** 2 + (c - pc) ** 2))
      }
      if (minD < 1.0) return BW
      if (minD < 1.8) return WH
      if (minD < 2.6) return LT
      if (minD < 3.5) return MD
      return ((r * 7 + c * 13) % 3 === 0) ? VD : DK
    })
  )
}

/**
 * Approach C — "Lava Mortar": 4×4 px dark rock cells with lava in the joints.
 * Regular grid structure — reads as gridded cobble filled with lava at any hue.
 * Joint crossings are hottest; adjacent pixels have heat gradient.
 */
function genLavaGrid(): number[][] {
  const CELL = 4
  return Array.from({ length: 16 }, (_, r) =>
    Array.from({ length: 16 }, (_, c) => {
      const mr = r % CELL
      const mc = c % CELL
      const inJointR  = mr === CELL - 1
      const inJointC  = mc === CELL - 1
      const nearJointR = mr === CELL - 2
      const nearJointC = mc === CELL - 2
      if (inJointR  && inJointC)  return BW    // joint crossing: hotspot
      if (inJointR  || inJointC)  return LT    // lava in joint
      if (nearJointR || nearJointC) return MD  // heat gradient at rock edge
      // Rock cell interior with subtle texture
      return ((r * 7 + c * 13 + r * c) % 5 < 2) ? VD : DK
    })
  )
}

const CANDIDATES = [
  { name: 'A', label: 'X Crack (diagonal lava web)',    gen: genXCrack    },
  { name: 'B', label: 'Lava Pools (scattered hotspots)', gen: genLavaPools },
  { name: 'C', label: 'Lava Grid (mortar joints)',       gen: genLavaGrid  },
] as const

// ── PNG Utilities ─────────────────────────────────────────────────────────────

function writeGrayscalePng(filePath: string, pixels: number[][]): void {
  const H = pixels.length
  const W = pixels[0].length
  const png = new PNG({ width: W, height: H, filterType: -1 })
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      const v = pixels[r][c]
      const i = (r * W + c) * 4
      png.data[i] = png.data[i + 1] = png.data[i + 2] = v
      png.data[i + 3] = 255
    }
  }
  fs.writeFileSync(filePath, PNG.sync.write(png))
}

function scaleNearest(pixels: number[][], scale: number): number[][] {
  return pixels.flatMap(row =>
    Array.from({ length: scale }, () => row.flatMap(v => Array<number>(scale).fill(v)))
  )
}

/** 3-panel side-by-side comparison PNG for vision scoring */
function writeComparisonPng(grids: number[][][], scale: number, outPath: string): void {
  const TILE = 16 * scale
  const GAP  = 4
  const W    = grids.length * TILE + (grids.length - 1) * GAP
  const H    = TILE
  const png  = new PNG({ width: W, height: H, filterType: -1 })

  // Dark separator background
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = png.data[i + 1] = png.data[i + 2] = 30
    png.data[i + 3] = 255
  }

  grids.forEach((grid, idx) => {
    const xOff   = idx * (TILE + GAP)
    const scaled = scaleNearest(grid, scale)
    for (let r = 0; r < TILE; r++) {
      for (let c = 0; c < TILE; c++) {
        const v = scaled[r][c]
        const i = (r * W + xOff + c) * 4
        png.data[i] = png.data[i + 1] = png.data[i + 2] = v
        png.data[i + 3] = 255
      }
    }
  })

  fs.writeFileSync(outPath, PNG.sync.write(png))
}

// ── Vision Scoring ────────────────────────────────────────────────────────────

interface VisionResult {
  scores: number[]    // per-candidate total (0-30)
  winner: number      // 0-indexed
  rationale: string
}

async function scoreWithVision(
  compPngPath: string,
  desc: string,
): Promise<VisionResult> {
  const client  = new Anthropic()
  const imgData = fs.readFileSync(compPngPath).toString('base64')

  const system = `You are an art director reviewing 16×16 px grayscale floor tile candidates for a pixel art game.
The tiles are shown scaled up side-by-side (A=left, B=center, C=right).
The game's colorize pipeline maps luminance to an HSL hue at render time:
  BK/VD (near-black) → deep shadow/rock void at any hue
  DK/MD             → dark rock body
  GY                → tile face color
  LT/WH/BW          → lava glow (reads as hot at any hue, including orange lava h=20)

Score each tile 0–10 on THREE criteria (integers only):
  1. Lava readability: bright/dark contrast reads unmistakably as lava-in-rock
  2. Tileability: no obvious seam at tile edges, would look natural repeated
  3. Style compliance: hard pixel edges, no anti-aliasing, grid-discipline, pattern matches description

Respond with ONLY valid JSON — no prose, no markdown fences:
{"scores":[[a1,a2,a3],[b1,b2,b3],[c1,c2,c3]],"winner":0,"rationale":"one sentence"}`

  const user = `Tile description: "${desc}"
Score all three candidates.`

  const msg = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 300,
    system,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/png', data: imgData } },
        { type: 'text', text: user },
      ],
    }],
  })

  const raw  = (msg.content[0] as { text: string }).text.trim()
  const json = JSON.parse(raw) as {
    scores: [number, number, number][]
    winner: number
    rationale: string
  }

  const totals = json.scores.map(s => s.reduce((a, b) => a + b, 0))
  // If winner field disagrees with totals, trust the highest total
  const topIdx = totals.indexOf(Math.max(...totals))

  return {
    scores:    totals,
    winner:    topIdx,
    rationale: json.rationale,
  }
}

// ── Apply Winner to floors.png ────────────────────────────────────────────────

function applyWinner(pixels: number[][], slot: number): void {
  const TILE   = 16
  const xStart = (slot - 1) * TILE    // slot is 1-indexed

  const existing = PNG.sync.read(fs.readFileSync(FLOORS_PNG))
  const newWidth  = Math.max(existing.width, xStart + TILE)
  const needsGrow = newWidth > existing.width

  let target: PNG
  if (needsGrow) {
    target = new PNG({ width: newWidth, height: TILE, filterType: -1 })
    // Fill new space with transparent/black before copying
    target.data.fill(0)
    // Copy existing pixels
    for (let r = 0; r < TILE; r++) {
      for (let c = 0; c < existing.width; c++) {
        const si = (r * existing.width + c) * 4
        const di = (r * newWidth + c) * 4
        target.data[di]     = existing.data[si]
        target.data[di + 1] = existing.data[si + 1]
        target.data[di + 2] = existing.data[si + 2]
        target.data[di + 3] = existing.data[si + 3]
      }
    }
  } else {
    target = existing
  }

  // Write winning pattern into the slot
  for (let r = 0; r < TILE; r++) {
    for (let c = 0; c < TILE; c++) {
      const v = pixels[r][c]
      const i = (r * newWidth + xStart + c) * 4
      target.data[i] = target.data[i + 1] = target.data[i + 2] = v
      target.data[i + 3] = 255
    }
  }

  fs.writeFileSync(FLOORS_PNG, PNG.sync.write(target))
  const msg = needsGrow
    ? `extended to ${newWidth}×${TILE} px (+slot ${slot})`
    : `slot ${slot} overwritten`
  console.log(`  ✅ floors.png ${msg}`)
  console.log(`     → ${FLOORS_PNG}`)
}

// ── CLI Entry Point ───────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args     = process.argv.slice(2)
  const descIdx  = args.indexOf('--desc')
  const slotIdx  = args.indexOf('--slot')
  const doApply  = args.includes('--apply')
  const noVote   = args.includes('--no-vote')

  const desc = descIdx >= 0 ? args[descIdx + 1] : 'lava floor tile'
  const slot = slotIdx >= 0 ? parseInt(args[slotIdx + 1], 10) : 8

  console.log(`\n━━ Asset Pipeline: "${desc}" → slot ${slot} ━━\n`)

  fs.mkdirSync(WORK_DIR, { recursive: true })

  // ── Step 1: Generate candidates ──
  console.log('  [1/3] Generating candidates...')
  const grids = CANDIDATES.map(c => {
    const grid = c.gen()
    console.log(`        [${c.name}] ${c.label}`)
    return grid
  })

  // ── Step 2: Write comparison PNG ──
  const compPath = path.join(WORK_DIR, 'comparison.png')
  writeComparisonPng(grids, 6, compPath)
  console.log(`\n  [2/3] Comparison PNG (6× zoom, 3-panel) → ${compPath}`)

  // ── Step 3: Score with vision ──
  let winnerIdx = 0

  if (!noVote && process.env.ANTHROPIC_API_KEY) {
    console.log('\n  [3/3] Vision scoring via claude-opus-4-7...')
    try {
      const result = await scoreWithVision(compPath, desc)
      console.log('\n  ┌── Scores ─────────────────────────────────────────────')
      CANDIDATES.forEach((c, i) => {
        const arrow = i === result.winner ? ' ◄ WINNER' : ''
        console.log(`  │  [${c.name}] ${c.label.padEnd(38)} ${result.scores[i]}/30${arrow}`)
      })
      console.log(`  │`)
      console.log(`  │  Rationale: ${result.rationale}`)
      console.log(`  └───────────────────────────────────────────────────────`)
      winnerIdx = result.winner
    } catch (err) {
      console.error(`  ✗ Vision scoring failed: ${(err as Error).message}`)
      console.log('  → Defaulting to candidate A')
    }
  } else if (noVote) {
    console.log('\n  [3/3] --no-vote: skipping vision scoring (using candidate A)')
  } else {
    console.log('\n  [3/3] ANTHROPIC_API_KEY not set — skipping vision scoring')
    console.log('        Review comparison.png manually and re-run with the --slot of your choice')
  }

  const winner = CANDIDATES[winnerIdx]
  console.log(`\n  🏆 Winner: [${winner.name}] ${winner.label}`)

  // ── Step 4: Apply (optional) ──
  if (doApply) {
    console.log(`\n  Writing winner to floors.png slot ${slot}...`)
    applyWinner(grids[winnerIdx], slot)
    if (slot > 7) {
      console.log(`\n  ⚠  You added slot ${slot} — also update:`)
      console.log(`     • src/constants.ts: FLOOR_PATTERN_COUNT = ${slot}`)
      console.log(`     • webview-ui/src/office/types.ts: add FLOOR_${slot}: ${slot}`)
      console.log(`       (and shift VOID from its current value to ${slot + 1})`)
      console.log(`     Then run: npm run build`)
    } else {
      console.log(`\n  To see the change: npm run build`)
    }
  } else {
    console.log(`\n  💡 Run with --apply to commit to floors.png:`)
    console.log(`     npx tsx scripts/asset-pipeline.ts --desc "${desc}" --slot ${slot} --apply`)
  }

  console.log('\n━━ Done ━━\n')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
