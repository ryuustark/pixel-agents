"""
Generate char_sinner_circus.png — Sinner mapped to the 5-row circus format (192×240).

Source: Sinner_1_clean.png (652×905, converted from GIF via generate step)
Source frame layout discovered via pixel analysis:

  Band 0 (rows 4-105,  h=102): Walk row A — 3 walk frames + Caine icon (skip)
  Band 1 (rows 113-212,h=100): Walk row B — 3 walk frames (detected as 2 groups, manual split)
  Band 2 (rows 275-372, h=98): Wrench swing   — 3 frames (wind-up, reach, strike)
  Band 3 (rows 395-519,h=125): Upright attacks — 3 frames (stance, wind-up, overhead)
  Band 4 (rows 538-637,h=100): Charge/throw    — 4 frames
  Band 5 (rows 670-768, h=99): Knocked down    — 5 frames (fall, prone, get-up)
  Band 6 (rows 799-893, h=95): Crouch          — 2 frames

Circus output layout (192×240, 48×48 per frame):
  Row 0 — IDLE      : 2 frames (neutral stance, slight shift)   [cols 2-3 empty]
  Row 1 — WALK/RUN  : 4 frames (walk cycle from Band 0+1)
  Row 2 — SIT       : 2 frames (crouch from Band 6)             [cols 2-3 empty]
  Row 3 — ATTACK    : 3 frames (wrench swing from Band 2)       [col 3 empty]
  Row 4 — CELEBRATE : 3 frames (upright attacks from Band 3)    [col 3 empty]

Run: python scripts/generate-sinner-circus.py
"""

import os
from PIL import Image

ASSETS_DIR = os.path.join(os.path.dirname(__file__), '..', 'webview-ui', 'public', 'assets', 'characters')
SRC = os.path.join(ASSETS_DIR, 'Sinner_1_clean.png')
OUT = os.path.join(ASSETS_DIR, 'char_sinner.png')

FW = 48  # output frame width
FH = 48  # output frame height
OUT_COLS = 4
OUT_ROWS = 5
OUT_W = OUT_COLS * FW  # 192
OUT_H = OUT_ROWS * FH  # 240

src = Image.open(SRC).convert('RGBA')
out = Image.new('RGBA', (OUT_W, OUT_H), (0, 0, 0, 0))

# ── Source region definitions ───────────────────────────────────────────────
# Each tuple: (x, y, w, h) — source rectangle from Sinner_1_clean.png.
# Frames are extracted, tight-cropped, then composited bottom-center into 48×48.

# Band 0 — Walk row A (rows 4-105, h=102)
# Detected frames: x=9-64, x=74-129, x=148-203
WALK_A = [
    (3, 3, 67, 104),    # walk step 1 — extended left foot
    (68, 3, 67, 104),   # walk step 2 — neutral/mid
    (140, 3, 72, 104),  # walk step 3 — right foot forward
]

# Band 1 — Walk row B (rows 113-212, h=100)
# Detected as 2 groups but visually 3 frames; use manual x splits
WALK_B = [
    (5, 112, 73, 101),   # walk step 4 — reaching forward with arm
    (83, 112, 80, 101),  # walk step 5 — stride recovery
    (168, 112, 70, 101), # walk step 6 — step complete
]

# Band 2 — Wrench swing (rows 275-372, h=98)
# Detected: x=6-106, x=124-203, x=229-362
ATTACK = [
    (0, 270, 115, 105),   # wind-up: crouched, wrench behind
    (118, 270, 95, 105),  # reach: straightening, wrench mid
    (222, 270, 145, 105), # strike: wrench fully extended forward
]

# Band 3 — Upright attacks (rows 395-519, h=125)
# Detected: x=16-93, x=129-218, x=270-344
CELEBRATE = [
    (10, 390, 93, 132),  # stance: upright with wrench low
    (122, 390, 103, 132), # raise: wrench raised overhead
    (262, 390, 90, 132), # slam: overhead strike position
]

# Band 6 — Crouch (rows 799-893, h=95)
# Detected: x=22-88, x=104-169
SIT = [
    (16, 795, 80, 100),  # crouch-A: forward lean
    (98, 795, 78, 100),  # crouch-B: upright crouch
]

# ── Extract + composite helper ───────────────────────────────────────────────

def tight_crop(img_rgba, rx, ry, rw, rh):
    """Crop region, then find tight bounding box of opaque pixels."""
    region = img_rgba.crop((rx, ry, rx + rw, ry + rh))
    # Find tight bounds
    px = region.load()
    w, h = region.size
    minx, miny, maxx, maxy = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            if px[x, y][3] > 10:
                minx = min(minx, x); miny = min(miny, y)
                maxx = max(maxx, x); maxy = max(maxy, y)
    if maxx < minx:  # empty frame
        return None
    return region.crop((minx, miny, maxx + 1, maxy + 1))

def place_frame(out_img, src_img, src_rect, col, row):
    """Extract src_rect from src_img, scale to FW×FH bottom-aligned, place at (col, row) in out."""
    rx, ry, rw, rh = src_rect
    content = tight_crop(src_img, rx, ry, rw, rh)
    if content is None:
        return

    cw, ch = content.size

    # Scale to fit within FW×FH maintaining aspect ratio
    scale = min(FW / cw, FH / ch, 1.0)  # never upscale beyond original size
    nw = max(1, round(cw * scale))
    nh = max(1, round(ch * scale))

    # Use NEAREST for pixel-art feel
    scaled = content.resize((nw, nh), Image.NEAREST)

    # Bottom-center paste position within the 48×48 cell
    paste_x = col * FW + (FW - nw) // 2
    paste_y = row * FH + (FH - nh)  # bottom-align

    out_img.paste(scaled, (paste_x, paste_y), scaled)

# ── Compose output sheet ─────────────────────────────────────────────────────

# Row 0 — IDLE (2 frames): use WALK_A[1] neutral + WALK_A[2] slight step
place_frame(out, src, WALK_A[1], 0, 0)  # idle-base: neutral stance
place_frame(out, src, WALK_A[0], 1, 0)  # idle-shift: weight on front foot
# cols 2-3 intentionally empty

# Row 1 — WALK (4 frames): best 4 from the 6 walk frames
place_frame(out, src, WALK_A[0], 0, 1)  # step A
place_frame(out, src, WALK_A[1], 1, 1)  # neutral
place_frame(out, src, WALK_A[2], 2, 1)  # step B
place_frame(out, src, WALK_B[1], 3, 1)  # neutral loop

# Row 2 — SIT (2 frames): crouch poses
place_frame(out, src, SIT[0], 0, 2)  # sit-A
place_frame(out, src, SIT[1], 1, 2)  # sit-B
# cols 2-3 intentionally empty

# Row 3 — ATTACK (3 frames): wrench swing
place_frame(out, src, ATTACK[0], 0, 3)  # wind-up
place_frame(out, src, ATTACK[1], 1, 3)  # reach
place_frame(out, src, ATTACK[2], 2, 3)  # strike
# col 3 intentionally empty

# Row 4 — CELEBRATE (3 frames): upright attack sequence repurposed as victory
place_frame(out, src, CELEBRATE[0], 0, 4)  # ready
place_frame(out, src, CELEBRATE[1], 1, 4)  # raise
place_frame(out, src, CELEBRATE[2], 2, 4)  # slam/pose
# col 3 intentionally empty

out.save(OUT)
print(f"Written: char_sinner.png ({OUT_W}×{OUT_H})")
print()
print("Sheet format (192×240, 4 cols × 5 rows, 48×48 per frame):")
print("  Row 0 — IDLE      : cols 0-1 (neutral stance breathe, cols 2-3 empty)")
print("  Row 1 — WALK/RUN  : cols 0-3 (4-frame walk cycle)")
print("  Row 2 — SIT       : cols 0-1 (crouch poses, cols 2-3 empty)")
print("  Row 3 — ATTACK    : cols 0-2 (wrench wind-up, reach, strike, col 3 empty)")
print("  Row 4 — CELEBRATE : cols 0-2 (ready, raise, slam, col 3 empty)")
