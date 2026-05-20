# Asset Spec — Ponmi

**Type:** Character — named custom  
**Status:** APPROVED — ready for production  
**Date:** 2026-05-15  
**Specced by:** Ponmi (art director) via `/asset-spec ponmi`

---

## Identity

| Field | Value |
|-------|-------|
| **Character** | Ponmi |
| **Role** | Art Director, pixel art owner |
| **Archetype** | Meticulous circus aesthete — sees every misaligned pixel |
| **Sheet format** | HD Custom — 336×144 px, 48×48 cells, 7 cols × 3 rows |
| **Output file** | `webview-ui/public/assets/characters/char_ponmi.png` |
| **Palette type** | Custom / hardcoded — NOT subject to `pickDiversePalette()` |
| **hueShift** | NOT supported — unique design, palette 3 base with custom overrides |
| **Minimum viable** | Row 0, cols 0–2 (down walk cycle) |

---

## Palette Anchors

| Region | Color name | Hex | Notes |
|--------|-----------|-----|-------|
| Skin | Beige | `#FFCC99` | Palette 3 base skin |
| Hair | Auburn | `#AA4422` | Visible below beret edge |
| Coat outer | Deep purple-grey | `#3D2A4A` | Darker than shirt, paint-splashed |
| Coat inner / lining | Purple | `#AA55CC` | Palette 3 shirt color, shows at lapels/cuffs |
| Pants | Dark purple | `#443355` | Palette 3 pants |
| Shoes | Near-black | `#222222` | Palette 3 shoes |
| Beret body | Dark plum | `#2A1A35` | Signature accessory — no glow, flat |
| Beret band | Gold | `#CCAA33` | 1px band around base of beret |
| Glasses frames | Silver-grey | `#888899` | 1px arc on face sides, front view only |
| Pencil body | Yellow | `#FFDD44` | Primary animation driver |
| Pencil tip | Near-black | `#1A1A1A` | Graphite tip |
| Paint splatter 1 | Red | `#CC4444` | 1px dot, coat chest |
| Paint splatter 2 | Teal | `#44AAAA` | 1px dot, coat shoulder |
| Paint splatter 3 | White | `#FFFFFF` | 1px dot, coat sleeve |

---

## Shape Language (§3)

- Body: 16px wide max, ~38px tall within 48px cell, **bottom-aligned** (6px floor clearance)
- Top 8px hat zone: beret dome (~10px wide, 6px tall) + paintbrush tip extending 2px above beret peak
- Head: ~8×8px, blocky oval — glasses are 2 arcs (1px each, left and right face sides in DOWN view)
- Coat: 16px wide at widest, hem slightly flared (1px per side at bottom)
- No anti-aliasing, no sub-pixel, no gradients (§9)
- Paint splatters: 3 fixed 1px dots on coat — same positions across all animation frames

---

## Frame Spec — Row 0 (DOWN, facing viewer)

| Frame | Col | Pose | Animation note | Pencil state | §ref |
|-------|-----|------|---------------|-------------|------|
| walk1 | 0 | Right foot forward +2px, left arm swings forward with pencil at ~45° angle, coat hem shifts right 1px | Mid-stride, slight forward lean | 45° forward, tip up-left | §3, §5 |
| walk2 / idle | 1 | Feet together, arms at sides, pencil pointing down alongside left leg | Default idle/neutral — this is the standing pose wander AI uses | Vertical at left hip | §3, §5 |
| walk3 | 2 | Left foot forward +2px, right arm swings, pencil trails behind at ~135° | Mirror of walk1, coat hem shifts left | 135° trailing, tip up-right | §3, §5 |
| type1 | 3 | Leaning forward 2px, right arm bent, pencil-hand descending toward surface, glasses get 1px highlight glint on left lens | Work pose — pencil is the stroke tool, body over surface | 60° angled down-right | §3, §5 |
| type2 | 4 | Same lean, pencil hand 2px lower (mid-stroke), left hand rests on surface edge, head tilts 1px down | Stroke completion frame — head bows toward work | 80° steep, tip near surface | §3, §5 |
| read1 | 5 | Standing upright, both arms raised, holding clipboard at eye level (clipboard = 4px wide `#CCCCCC` rect) | Reading pose — clipboard replaces pencil as primary prop; pencil tucked at hip | Tucked at left hip | §3, §5 |
| read2 | 6 | Same clipboard hold, head tilts 1px right, left hand shifts 1px lower | Natural reading sway — subtle motion keeps it alive | Same as read1 | §3, §5 |

---

## Frame Spec — Row 1 (UP, back view)

| Frame | Col | Pose | Animation note | Back detail | §ref |
|-------|-----|------|---------------|-------------|------|
| walk1 | 0 | Back view, right foot forward, left arm swings back with pencil tip visible at shoulder height | Same stride timing as row 0 walk1 | Beret dome, gold band edge, 2px auburn hair tuft below beret | §3, §5 |
| walk2 / idle | 1 | Back neutral, arms at sides | Standing back view | Auburn hair clearly visible below beret (2px wide, 1px tuft) | §3, §5 |
| walk3 | 2 | Back view, left foot forward | Mirror of back-walk1 | Same back detail | §3, §5 |
| type1 | 3 | Back view, leaning forward, coat hem spreads, head bows, beret tilts toward surface | Lean visible in coat-hem spread and beret angle | Coat back widens 1px each side at hem | §3, §5 |
| type2 | 4 | Same lean, head shifts 1px down-right | Same as type1 lean, slight head motion | Beret continues forward tilt | §3, §5 |
| read1 | 5 | Back view, arms raised, clipboard visible ABOVE head (top of frame) | Clipboard extends into top padding zone | Beret flat from behind, clipboard above it | §3, §5 |
| read2 | 6 | Same, 1px sway | Subtle weight shift | — | §3, §5 |

---

## Frame Spec — Row 2 (RIGHT, left auto-flipped at runtime)

| Frame | Col | Pose | Animation note | Profile detail | §ref |
|-------|-----|------|---------------|----------------|------|
| walk1 | 0 | Right stride, right arm forward (no pencil visible), left arm back with pencil tip behind body | Profile walk — right=viewer's left | Glasses: 1px silver arc on right face side. Beret profile: plum dome, gold band left edge | §3, §5 |
| walk2 / idle | 1 | Side neutral — pencil tucked at left hip, arms at sides | Profile neutral | Coat dark east-edge shading (1px darker at right edge for z-depth — §6) | §3, §5 |
| walk3 | 2 | Left stride, left arm forward with pencil swinging forward | Opposite from walk1 | Same profile, pencil extends forward | §3, §5 |
| type1 | 3 | Profile lean forward, right arm extended with pencil nearly horizontal toward right edge | Strong horizontal pencil gesture | Body leans forward ~2px, arm fully extended | §3, §5 |
| type2 | 4 | Same lean, pencil 1px further right, wrist slightly angled down | Mid-stroke from profile — most dynamic type frame | Wrist angle changes silhouette slightly | §3, §5 |
| read1 | 5 | Side view arms raised, clipboard = 1–2px vertical bar + hands | Profile clipboard appears thin (edge-on) | Head level, glasses visible | §3, §5 |
| read2 | 6 | Same, head nods 1px down | Reading nod | Head 1px lower on neck | §3, §5 |

---

## Pencil Animation Rules

The pencil is Ponmi's **primary animation driver** — parallel to Caine's wand rule (§5).

- Pencil **must differ** between consecutive frames in every animation row
- In type frames: pencil = stroke tool — positioned differently in type1 vs type2 (angle and proximity to surface)
- In read frames: pencil tucked at hip — clipboard is the active prop
- In walk frames: pencil swings with arm — walk1 and walk3 must have different pencil angles
- Pencil visible in all DOWN and RIGHT frames; partially obscured in UP frames (behind body)

---

## Hat Zone Spec (top 8px of 48px cell)

```
px  0: [empty]
px  1: [paintbrush tip — 1px, dark near-black #1A1A1A]
px  2: [paintbrush ferrule — 1px, silver #888899]
px  3: [beret dome peak — starts here]
px  4: [beret dome body — widest ~8px]
px  5: [beret dome body — gold band #CCAA33, 1px height]
px  6: [beret brim meets hair]
px  7: [top of head / hair]
```

Beret peak: plum `#2A1A35`, roughly octagonal (§3 "no circles"), ~8×5px visible face. Paintbrush extends 2px above beret peak into the hat zone. Readable at 1× as "beret with something sticking up."

---

## Paint Splatters (fixed, not animated)

Three 1px dots on coat — **same pixel position in every frame**:

| Splatter | Color | Approx position (within 48×48 cell, from bottom-left) |
|----------|-------|------------------------------------------------------|
| Red | `#CC4444` | x=20, y=28 (right chest, coat front) |
| Teal | `#44AAAA` | x=14, y=32 (left shoulder area) |
| White | `#FFFFFF` | x=18, y=36 (right sleeve/cuff) |

These positions are for the DOWN row. Adjust x/y naturally for UP and RIGHT views to match coat anatomy.

---

## Spritedata.ts Integration

```typescript
// In webview-ui/src/office/sprites/spriteData.ts
// Add to the named characters section:

'ponmi': {
  file: 'char_ponmi.png',
  frameW: 48,
  frameH: 48,
  hueShiftable: false,   // unique design — no hue shifting
  palette: null,          // not palette-based
},
```

---

## Checklist Before Production

- [ ] Beret + paintbrush tip readable at 1× (16px effective width at default 2×DPR zoom)
- [ ] Pencil differs between walk1 and walk3 in ALL rows
- [ ] Pencil differs between type1 and type2 in ALL rows
- [ ] Paint splatters at identical pixel positions across all frames (spot-check row0 vs row2)
- [ ] No anti-aliased edges (all alpha = 0 or 255)
- [ ] No gradients on sprite pixels
- [ ] Gold beret band visible from all three directions
- [ ] Coat east-edge shading in RIGHT row (§6 Z-depth)
- [ ] Output: 336×144 PNG, RGBA, saved to `webview-ui/public/assets/characters/char_ponmi.png`
- [ ] After placing PNG: rebuild + copy assets to `dist/` before testing (§8 Load Order)
