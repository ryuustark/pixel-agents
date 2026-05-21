# Kinger — Circus Sheet Spec

**Asset**: `webview-ui/public/assets/characters/char_kinger_circus.png`
**Format**: Circus (192×240 px, 4 cols × 5 rows, 48×48 px/frame)
**Type**: Custom named character — `custom`, not palette-assigned
**Direction**: Front-facing only (single direction). LEFT auto-generated at runtime via horizontal flip.
**hueShift supported**: No — named character, used as-is.
**Status**: [PENDING — not yet created]
**Reference**: The Amazing Digital Circus — Kinger (chess king piece character)
**Art bible**: `design/art/art-bible.md` §3 (shape language), §4 (color system)

---

## Character Design

Kinger is a **walking chess king piece**. His body IS the chess piece — no separate torso/limbs in the traditional sense. He reads as a tall crowned block with tiny peeking eyes and stubby arms/legs.

Key silhouette markers:
- **Crown**: The chess king's cross-top crown (cross finial + battlements) rises above the head zone into the 8px top padding
- **Body**: Squat rectangular chess-piece body, wider at base, narrowing to neck, then flaring slightly at the crown base
- **Arms**: Tiny stub arms barely visible at mid-body sides — barely 2px wide
- **Legs**: Two short rectangular legs below the piece base, 4px wide each
- **Eyes**: Two small dot eyes on the front face of the piece, mid-body

---

## Sheet Layout

```
         Col 0     Col 1     Col 2     Col 3
Row 0  [ idle F0 ][ idle F1 ][ EMPTY  ][ EMPTY  ]
Row 1  [ walk F0 ][ walk F1 ][ walk F2][ walk F3]
Row 2  [  sit F0 ][  sit F1 ][ EMPTY  ][ EMPTY  ]
Row 3  [atk  F0  ][ atk  F1 ][ atk F2 ][ EMPTY  ]
Row 4  [cel  F0  ][ cel  F1 ][ cel F2 ][ EMPTY  ]
```

Flat indices used by `buildCircusSprites()`:
- idle: f[0], f[1]
- walk: f[4], f[5], f[6], f[7]
- sit:  f[8], f[9]
- attack: f[12], f[13], f[14]
- celebrate: f[16], f[17], f[18]

---

## Palette Anchors

| Region | Color | Notes |
|---|---|---|
| Body main | `#5C3A1E` | Warm dark brown — chess piece body |
| Body highlight | `#8B5E3C` | 1px highlight on top-left face edge |
| Body shadow | `#3A2210` | Bottom-right edge shading |
| Crown base ring | `#D4AF37` | Gold ring at crown base, 2–3px tall |
| Crown battlements | `#D4AF37` | 3 gold teeth at top (2px wide each, separated by 1px gaps) |
| Crown finial (cross) | `#F0CC50` | Brighter gold cross finial, 1px wide vertical + 1px horizontal |
| Eyes | `#F5E6C8` | Cream/ivory — slightly wide, expressive, 2×2px |
| Eye pupils | `#1A0A00` | Near-black dots, 1×1px inside each eye |
| Stub arms | `#5C3A1E` | Same as body — barely distinct stubs at sides |
| Legs | `#4A2E15` | Slightly darker than body, 4px wide, 4–6px tall |
| Leg highlight | `#7A4E2A` | 1px inner highlight on each leg |
| Base platform | `#3A2210` | Dark base rim where piece meets ground, 1–2px |

---

## Per-Frame Spec

### Row 0 — Idle (2 frames)

| Frame | f[] | Pose | Crown | Eyes | Notes |
|---|---|---|---|---|---|
| idle F0 | f[0] | Upright, weight centered. Legs straight. Arms pinned at sides. | Perfectly upright | Open, looking forward | Neutral reference. Solid and stable. |
| idle F1 | f[1] | Subtle 1px rightward lean. Body rocks slightly. | Tilts 1px right with body | Shifts 1px right | Anxious fidget. The paranoid micro-movement. |

---

### Row 1 — Walk (4 frames)

Kinger "waddles" — his chess-piece body rocks side to side as his stubby legs alternate. His legs are so short the motion is mostly body-sway.

| Frame | f[] | Pose | Crown | Notes |
|---|---|---|---|---|
| walk F0 | f[4] | Neutral. Body upright, both legs even. | Upright | Mid-waddling anchor frame. |
| walk F1 | f[5] | Body tilts 2px left. Left leg extends 1px down (stride). Right leg slightly raised. | Tilts 2px left with body | Left-stride peak. Body rocks like a penguin. |
| walk F2 | f[6] | Body returns to neutral. Legs crossing. | Upright | Crossover frame. |
| walk F3 | f[7] | Body tilts 2px right. Right leg extends, left slightly raised. | Tilts 2px right | Right-stride peak. Mirror of F1. |

---

### Row 2 — Sit (2 frames)

Kinger is at a desk, body still upright (chess pieces don't slouch), but crown tilts forward conspiratorially. A tiny scroll/parchment sits on the desk — his architectural plans.

| Frame | f[] | Pose | Crown | Scroll | Notes |
|---|---|---|---|---|---|
| sit F0 | f[8] | Seated. Body upright but leaning 5° forward. Stub arms rest on desk edge. | Tilts forward 5° | Scroll open, flat on desk. `#F0EAD8` pages, `#8B5E3C` edges. | Studying the plans. Eyes visible above desk edge. |
| sit F1 | f[9] | Same seated pose. | Same tilt. | Same scroll. 1px `#F0CC50` glow dot at center (the key insight). | The "a-ha!" frame. One gold pixel reveals the insight. |

---

### Row 3 — Attack (3 frames) — write/edit/bash/task tools

Kinger "thinking hard" — his body vibrates with anxious energy. Crown sways as he processes.

| Frame | f[] | Pose | Crown | Notes |
|---|---|---|---|---|---|
| attack F0 | f[12] | Body leans back 3px. Arms slightly raised at sides. Eyes wide. | Leans back with body | Pull-back: the buildup of thought. |
| attack F1 | f[13] | Body snaps forward. Arms extend outward (2px each side). Eyes at maximum width. | Snaps forward, tips forward 5° | The architectural strike. Crown at maximum forward tilt. |
| attack F2 | f[14] | Body returns toward upright. Arms drop. Eyes settling. | Returns upright | Recoil/settle after the idea lands. |

---

### Row 4 — Celebrate (3 frames) — task complete

Kinger vibrates in place with contained excitement — he can't jump (chess piece) so he SHAKES.

| Frame | f[] | Pose | Crown | Notes |
|---|---|---|---|---|---|
| celebrate F0 | f[16] | Body shifts 2px left. Legs compressed (crouching 1px). | 2px left with body | Shake-left. |
| celebrate F1 | f[17] | Body shifts 2px right. Legs compressed. Crown spins (?): finial leans right. | 2px right + finial tilted | Shake-right. The hat-tilt equivalent for a chess piece. |
| celebrate F2 | f[18] | Body centers. Legs return to normal. Crown upright. | Upright — victory | Holds triumph. Settled shake. |

---

## Art Bible Citations

| Rule | Source |
|---|---|
| Circus format sheet layout | §5 Circus Format Sheet |
| Silhouette clarity via top-padding accessories | §3 Shape Language |
| No circles — pixel-octagons for eyes | §3 Shape Language |
| Alpha threshold ≥128 = opaque | §8 PNG Format |
| No anti-aliasing | §9 prohibitions |
| Custom named character — bypasses palette system | §4 Color System |

---

## Empty Cells

| f[] | Reason |
|---|---|
| f[2], f[3] | Idle only uses 2 frames — cells transparent |
| f[10], f[11] | Sit only uses 2 frames — cells transparent |
| f[15] | Attack uses 3 frames — cell transparent |
| f[19] | Celebrate uses 3 frames — cell transparent |

All empty cells must be fully transparent (alpha = 0 on every pixel).

---

## File Placement

```
webview-ui/public/assets/characters/char_kinger_circus.png
dist/assets/characters/char_kinger_circus.png           ← copy after rebuild
dist/webview/assets/characters/char_kinger_circus.png   ← copy after rebuild
```

After adding the PNG, run `npm run build` from `zz_PixelCircus/` to propagate to `dist/`.
