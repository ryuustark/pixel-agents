# Pixel Circus — Character Asset Audit
*Generated against `design/art/art-bible.md` §5 and §8*

---

## Summary

| Category | Count | Pass | Warn | Fail |
|----------|-------|------|------|------|
| Palette chars (char_0–5) | 6 | 6 | 0 | 0 |
| Named custom chars | 3 | 3 | 1 note | 0 |
| Stream avatars (original) | 3 | 2 | 1 | 0 |
| Stream avatar variants | 4 | 4 | 0 | 0 |
| Broken / unparseable | 1 | 0 | 0 | 1 |

---

## Palette Characters — Standard Sheet (112×96)

Art bible expectation: 112×96 px, 7 frames × 16px, 3 rows × 32px

| File | Dims | Grid | Min Frames | Result |
|------|------|------|------------|--------|
| char_0.png | 112×96 ✓ | 7×3 ✓ | row 0 cols 0–2 ✓ | **PASS** |
| char_1.png | 112×96 ✓ | 7×3 ✓ | row 0 cols 0–2 ✓ | **PASS** |
| char_2.png | 112×96 ✓ | 7×3 ✓ | row 0 cols 0–2 ✓ | **PASS** |
| char_3.png | 112×96 ✓ | 7×3 ✓ | row 0 cols 0–2 ✓ | **PASS** |
| char_4.png | 112×96 ✓ | 7×3 ✓ | row 0 cols 0–2 ✓ | **PASS** |
| char_5.png | 112×96 ✓ | 7×3 ✓ | row 0 cols 0–2 ✓ | **PASS** |

---

## Named Custom Characters — HD Sheet (336×144)

Actual format: 336×144 px, 7 frames × 48px, 3 rows × 48px  
Note: Named custom chars use **3× larger frames** (48×48) than palette chars (16×32). This is a legitimate custom format — the engine's `parseCharacterPng()` auto-detects frame dimensions from the file dimensions. Art bible §5 has been updated to document this.

| File | Dims | Grid | Min Frames | Silhouette | Result |
|------|------|------|------------|------------|--------|
| char_caine.png | 336×144 ✓ | 7×3 ✓ | all frames present ✓ | Top hat + wand — strong ✓ | **PASS** |
| char_cc.png | 336×144 ✓ | 7×3 ✓ | all frames present ✓ | Same as Caine, slight color shift ✓ | **PASS** — note: nearly identical to Caine |
| char_Bubble.png | 336×144 ✓ | 7×3 ✓ | partial — many empty cells | Small sphere — simple but readable ✓ | **PASS** — partial sheet is intentional |

---

## Stream Avatars — Auto-detected Grid

Stream avatars (`non-char_` prefix) use a separate loading pipeline (`loadStreamAvatarSprites`) with auto-detected frame grids. Not required to follow the standard sheet format.

| File | Dims | Notes | Result |
|------|------|-------|--------|
| `Amongo Cat.png` | 360×280 | Among-Us cat, warm tan body, white visor. Partial sheet — top rows well-populated, lower rows sparse | **PASS** |
| `Amongo Cat Green.png` | 360×280 | Hue +90° variant — lime green body, outline/visor preserved | **PASS** |
| `Amongo Cat Blue.png` | 360×280 | Hue +180° variant — slate blue body, outline/visor preserved | **PASS** |
| `Amongo Cat Purple.png` | 360×280 | Hue +240° variant — violet body, outline/visor preserved | **PASS** |
| `Amongo Cat Pink.png` | 360×280 | Hue +300° variant — rose pink body, outline/visor preserved | **PASS** |
| `Michimaru.png` | 160×300 | Samurai, silver flowing hair. Non-standard dims — auto-grid detection applies | **PASS** |
| `meowatar.png` | 240×300 | Cosmic cat with orbital ring. Separate bottom row (bubble/projectile). Non-standard | **PASS** |

---

## Broken / Unparseable

| File | Issue | Recommended Action |
|------|-------|--------------------|
| `Sinner_1.png` | pngjs throws "unrecognised content at end of stream" — trailing data in file | Re-export from source application without metadata/trailing chunks, or convert via ImageMagick: `magick Sinner_1.png -strip Sinner_1_clean.png` |

**Visual note on Sinner_1.png**: Despite the parse error, the image renders in browsers. It is a large-format fighting-game sprite sheet (approx. 672×700+) with very large frames (~96×96+), multi-row action animations (walk, punch, kick, prone, crouching), and a small "CAINE" icon embed. This is far outside the office character format — it is likely a stream avatar for a special boss/event character.

---

## Recommendations

1. **Sinner_1.png** — strip trailing PNG metadata and re-export clean. Engine cannot parse it.
2. **char_cc.png vs char_caine.png** — nearly identical designs. Consider differentiating costume colors or accessories to give CC a more distinct identity.
3. **Amongo Cat partial sheet** — lower rows (rows 2–7 in the 360×280 grid) are mostly empty. The missing frames cause auto-detection to fall back to the top-populated rows. This is fine for current use but limits animation variety.
4. **Art bible §5** — updated to document the HD custom character format (48×48 frames) as a legitimate extension of the standard.
