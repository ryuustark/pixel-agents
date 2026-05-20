# Caine — Circus Sheet Spec

**Asset**: `webview-ui/public/assets/characters/char_caine_circus.png`
**Format**: Circus (192×240 px, 4 cols × 5 rows, 48×48 px/frame)
**Type**: Custom named character — `custom`, not palette-assigned
**Direction**: Front-facing only (single direction). LEFT auto-generated at runtime via horizontal flip.
**hueShift supported**: No — named character, used as-is.
**Status**: [APPROVED 2026-05-15]
**Reference**: `Images/char_caine.png`
**Art bible**: `design/art/art-bible.md` §4 (color system), §5 (Caine character rules)

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
| Hat body | `#2a1a4a` | Dark purple, tall — ≥10px |
| Hat band | `#c8a020` | Gold trim, 1–2px stripe |
| Coat body | `#1a3a5c` | Dark navy/teal base |
| Diamond pattern | `#cc2200` (red) + `#ffffff` | Harlequin overlay on coat |
| Ruff collar | `#f0f0e8` | Neck area, off-white |
| Face | `#f0f0e0` base | White face paint, ≥10px wide |
| Eyes | `#cc0000` or `#000000` | 2×2px dots — larger than standard |
| Red markings | `#cc3300` | Smile, brow arches on face |
| Pants | `#0d1a2e` | Deep navy, below coat hem |
| Wand handle | `#2a1a0a` | Dark wood brown — identical across all frames |
| Orb (dim) | `#e8c040` | Gold-yellow, no highlight pixel |
| Orb (bright) | `#fff080` + `#ffffff` 1px top-left | Full glow state |
| Shoes | `#1a1212` | Near-black |
| Grimoire cover | `#1a1a3a` | Dark navy, sit frames only |
| Grimoire pages | `#f0ead8` | Warm parchment, sit frames only |
| Grimoire glow | `#fff080` 1px dot on page | sit F1 only — orb illuminating text |

---

## Per-Frame Spec

### Row 0 — Idle (2 frames)

| Frame | f[] | Pose | Wand | Orb | Notes |
|---|---|---|---|---|---|
| idle F0 | f[0] | Weight centered, arms at sides, coat hanging straight | Vertical, grounded beside right foot, orb at waist | DIM `#e8c040` | Neutral reference pose. Hat perfectly upright. |
| idle F1 | f[1] | Shoulders shift 1px right, subtle hip sway | Tilts 1–2px to the right, orb lifts 1px | BRIGHT `#fff080` + `#ffffff` highlight | Life-giving sway frame. Coat hem shifts with hip. |

---

### Row 1 — Walk (4 frames)

| Frame | f[] | Pose | Wand | Orb | Notes |
|---|---|---|---|---|---|
| walk F0 | f[4] | Mid-stride neutral. Right leg slightly forward, left slightly back. Arms loosely at sides. | Vertical, orb at waist | DIM | "Between" frame. No extremes — smooth loop anchor. |
| walk F1 | f[5] | Right leg full stride forward. Left arm swings forward, right arm (wand side) swings back. | Swings back — tip rises 2–3px above waist | DIM | Wand counter-swings with body. Max ~15° from vertical. |
| walk F2 | f[6] | Left leg full stride forward. Right arm swings forward, left arm back. | Swings forward — tip dips 2–3px below waist | BRIGHT | Forward swing peak. Orb brightens at arc extreme. |
| walk F3 | f[7] | Returning toward neutral. Legs crossing mid-point. | Returning upward to vertical | DIM | Mirror of F0 with offset leg position for clean loop. |

---

### Row 2 — Sit (2 frames)

Caine is seated at a desk, holding an open grimoire flat on the surface.
Book: ~16px wide × ~10px tall. Held with both hands gripping the edges.
Wand: leaning diagonally at right side (~45°), handle near hip, orb at shoulder height.

| Frame | f[] | Pose | Grimoire | Wand | Orb | Notes |
|---|---|---|---|---|---|---|
| sit F0 | f[8] | Seated, leaning ~10° forward over desk. Face visible above book edge. Hands gripping grimoire edges. | Open, lying flat on desk. Cover `#1a1a3a`, pages `#f0ead8`. | Diagonal lean, static | DIM | Feet not visible (below desk). Hat upright. |
| sit F1 | f[9] | Identical seated pose. | Identical. 1px `#fff080` glow dot on open page. | Unchanged | BRIGHT | Only orb + grimoire glow change between F0/F1. |

---

### Row 3 — Attack (3 frames) — write/edit/bash/task tools

| Frame | f[] | Pose | Wand | Orb | Notes |
|---|---|---|---|---|---|
| attack F0 | f[12] | Pull-back: upper body leans back ~5°, right arm drawn toward body, slight crouch. | Pulled back, tip pointing upper-left, orb near face level | DIM | Wind-up. Coat hem flares from motion. |
| attack F1 | f[13] | Strike: body lunges forward, arm fully extended forward-upward. Coat hem swings back. | Extended forward/upward — orb at max reach, upper-right of sprite | BRIGHT — max brightness | Impact frame. Hat may tilt 1–2px. Orb ≤4×4px. |
| attack F2 | f[14] | Recoil: arm lowers, body returning upright. Shoulders drop 1px (exhale). | Returning toward vertical | DIM | Recovery. Smooth transition toward idle. |

---

### Row 4 — Celebrate (3 frames) — task complete

| Frame | f[] | Pose | Wand | Orb | Notes |
|---|---|---|---|---|---|
| celebrate F0 | f[16] | Arms beginning to raise. Elbows bent upward. Slight upward lean in posture. | Swings upward — orb at chest level, handle rising | DIM | Lift-off frame. Coat hem flares upward. |
| celebrate F1 | f[17] | Arms fully raised overhead. Both hands visible above head. Triumphant posture. | Fully overhead — orb at topmost point, may enter 8px top-padding zone | BRIGHT — max. Hat tilts 1–2px to one side. | Peak joy frame. Hat tilt is the personality beat. Orb at absolute apex. |
| celebrate F2 | f[18] | Arms still raised but 2–3px lower than peak. Body settled, holding triumph. | Wand 2–3px below peak | BRIGHT — still glowing, 1px lower than F17 | "Hold" frame. Sustains celebration without abrupt reset. |

---

## Art Bible Citations

| Rule | Source |
|---|---|
| Circus format sheet layout | §5 Circus Format Sheet |
| Wand animation rules | §5 Wand Animation Rules (Caine) |
| Orb glow pulse (dim/bright) | §5 Wand Animation Rules — Orb Glow Pulse |
| Face ≥10px, eyes 2×2px | §5 Caine — Character Design Rules |
| Hat ≥10px tall | §5 prohibitions |
| Orb ≤4×4px | §5 prohibitions |
| Alpha threshold ≥128 = opaque | §8 PNG Format |
| No anti-aliasing | §9 prohibitions |
| Orb = wand handle color consistent across rows | §5 prohibitions |

---

## Empty Cells

| f[] | Reason |
|---|---|
| f[2], f[3] | Idle only uses 2 frames — cells transparent |
| f[10], f[11] | Sit only uses 2 frames — cells transparent |
| f[15] | Attack uses 3 frames — cell transparent |
| f[19] | Celebrate uses 3 frames — cell transparent |

All empty cells must be fully transparent (alpha = 0 on every pixel). pngjs treats alpha < 128 as invisible.

---

## File Placement

```
webview-ui/public/assets/characters/char_caine_circus.png
dist/assets/characters/char_caine_circus.png           ← copy after rebuild
dist/webview/assets/characters/char_caine_circus.png   ← copy after rebuild
```

After replacing the PNG, run `npm run build` from `zz_PixelCircus/` to propagate to `dist/`.
