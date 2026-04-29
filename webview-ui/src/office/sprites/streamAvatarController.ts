import type { SpriteData } from '../types.js'

export type StreamAvatarAnimType = 'idle' | 'walk' | 'fight' | 'sleep' | 'sit'

// Row index mapping for each animation slot
const ANIM_ROW: Record<StreamAvatarAnimType, number> = {
  idle:  0,
  walk:  1,
  fight: 2,
  sleep: 3,
  sit:   4,
}

export interface StreamAvatarSheetData {
  /** rows[rowIdx][frameIdx] = SpriteData */
  rows: SpriteData[][]
  frameW: number
  frameH: number
}

const avatarMap = new Map<string, StreamAvatarSheetData>()

/** Load stream avatar data received from the extension backend */
export function loadStreamAvatars(
  data: Record<string, { rows: string[][][][]; frameW: number; frameH: number; cols: number }>,
): void {
  avatarMap.clear()
  for (const [key, val] of Object.entries(data)) {
    avatarMap.set(key, { rows: val.rows, frameW: val.frameW, frameH: val.frameH })
  }
}

export function getAvatarKeys(): string[] {
  return Array.from(avatarMap.keys())
}

export function pickRandom(): string | null {
  const keys = getAvatarKeys()
  if (keys.length === 0) return null
  return keys[Math.floor(Math.random() * keys.length)]
}

/** Return the frame sprite for a given avatar, animation type, and frame index.
 *  Falls back to idle row if the requested animation row doesn't exist. */
export function getFrame(
  key: string,
  animType: StreamAvatarAnimType,
  frameIdx: number,
): SpriteData | null {
  const avatar = avatarMap.get(key)
  if (!avatar) return null
  const rowIdx = ANIM_ROW[animType]
  const row = avatar.rows[rowIdx]
  if (row && row.length > 0) {
    return row[frameIdx % row.length]
  }
  // Fall back to idle
  const idleRow = avatar.rows[ANIM_ROW.idle]
  if (!idleRow || idleRow.length === 0) return null
  return idleRow[frameIdx % idleRow.length]
}

/** Number of frames in an animation row for a given avatar */
export function getFrameCount(key: string, animType: StreamAvatarAnimType): number {
  const avatar = avatarMap.get(key)
  if (!avatar) return 0
  const rowIdx = ANIM_ROW[animType]
  return avatar.rows[rowIdx]?.length ?? 0
}
