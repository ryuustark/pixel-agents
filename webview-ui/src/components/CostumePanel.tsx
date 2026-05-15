import { useRef, useEffect, useState, useCallback } from 'react'
import { getCharacterSprites, getNamedCharacterSprites } from '../office/sprites/spriteData.js'
import { getCachedSprite } from '../office/sprites/spriteCache.js'
import { COSTUME_PREVIEW_ZOOM, PALETTE_COUNT } from '../constants.js'

interface CostumePanelProps {
  agentId: number
  currentPalette: number
  currentHueShift: number
  currentCostume: string
  availableNamedChars: string[]
  onSelect: (palette: number, hueShift: number) => void
  onSelectCostume: (costume: string) => void
  onClose: () => void
}

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 60,
  background: 'var(--pixel-bg)',
  border: '2px solid var(--pixel-border)',
  borderRadius: 0,
  padding: '10px 14px',
  boxShadow: 'var(--pixel-shadow)',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const titleStyle: React.CSSProperties = {
  fontSize: '22px',
  color: 'var(--pixel-text)',
}

const closeBtnStyle: React.CSSProperties = {
  fontSize: '22px',
  color: 'var(--pixel-text-dim)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '2px 6px',
  borderRadius: 0,
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 6,
}

const sliderLabelStyle: React.CSSProperties = {
  fontSize: '18px',
  color: 'var(--pixel-text-dim)',
}

const DISPLAY_NAMES: Record<string, string> = {
  caine: 'Caine',
  bubble: 'Bubble',
  sinner: 'Sinner',
  amongocat: 'Amongo Cat',
  meowatar: 'Meowatar',
  michimaru: 'Michimaru',
}

function getDisplayName(key: string): string {
  return DISPLAY_NAMES[key] ?? (key.charAt(0).toUpperCase() + key.slice(1))
}

function NamedCharPreview({ name, isSelected, onClick }: {
  name: string
  isSelected: boolean
  onClick: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const sprites = getNamedCharacterSprites(name)
    if (!sprites) return
    const cached = getCachedSprite(sprites.idle[0], COSTUME_PREVIEW_ZOOM)

    canvas.width = cached.width
    canvas.height = cached.height
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(cached, 0, 0)
  }, [name])

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        cursor: 'pointer',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          border: isSelected ? '2px solid var(--pixel-accent)' : '2px solid transparent',
          borderRadius: 0,
          imageRendering: 'pixelated',
          display: 'block',
          margin: '0 auto',
        }}
      />
      <span style={{ fontSize: '16px', color: 'var(--pixel-text-dim)', whiteSpace: 'nowrap' }}>
        {getDisplayName(name)}
      </span>
    </div>
  )
}

function CharacterPreview({ palette, hueShift, isSelected, onClick }: {
  palette: number
  hueShift: number
  isSelected: boolean
  onClick: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const sprites = getCharacterSprites(palette, hueShift)
    const cached = getCachedSprite(sprites.idle[0], COSTUME_PREVIEW_ZOOM)

    canvas.width = cached.width
    canvas.height = cached.height
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(cached, 0, 0)
  }, [palette, hueShift])

  return (
    <canvas
      ref={canvasRef}
      onClick={onClick}
      style={{
        cursor: 'pointer',
        border: isSelected ? '2px solid var(--pixel-accent)' : '2px solid transparent',
        borderRadius: 0,
        imageRendering: 'pixelated',
        display: 'block',
        margin: '0 auto',
      }}
    />
  )
}

export function CostumePanel({
  currentPalette,
  currentHueShift,
  currentCostume,
  availableNamedChars,
  onSelect,
  onSelectCostume,
  onClose,
}: CostumePanelProps) {
  const [selectedCostume, setSelectedCostume] = useState(currentCostume)
  const [selectedPalette, setSelectedPalette] = useState(currentPalette)
  const [hueShift, setHueShift] = useState(currentHueShift)

  const handleNamedClick = useCallback((name: string) => {
    const next = selectedCostume === name ? '' : name
    setSelectedCostume(next)
    onSelectCostume(next)
  }, [selectedCostume, onSelectCostume])

  const handlePaletteClick = useCallback((palette: number) => {
    setSelectedCostume('')
    setSelectedPalette(palette)
    setHueShift(0)
    onSelect(palette, 0)
  }, [onSelect])

  const handleHueShiftChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    setHueShift(value)
    onSelect(selectedPalette, value)
  }, [selectedPalette, onSelect])

  const previewHueShift = (palette: number) =>
    palette === selectedPalette && selectedCostume === '' ? hueShift : 0

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <span style={titleStyle}>Choose Costume</span>
        <button style={closeBtnStyle} onClick={onClose} title="Close">X</button>
      </div>

      <div style={gridStyle}>
        {availableNamedChars.map((name) => (
          <NamedCharPreview
            key={name}
            name={name}
            isSelected={selectedCostume === name}
            onClick={() => handleNamedClick(name)}
          />
        ))}
        {Array.from({ length: PALETTE_COUNT }, (_, i) => (
          <CharacterPreview
            key={i}
            palette={i}
            hueShift={previewHueShift(i)}
            isSelected={selectedCostume === '' && i === selectedPalette}
            onClick={() => handlePaletteClick(i)}
          />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={sliderLabelStyle}>Hue Shift: {hueShift}°</span>
        <input
          type="range"
          min={0}
          max={360}
          step={15}
          value={hueShift}
          onChange={handleHueShiftChange}
          disabled={selectedCostume !== ''}
          style={{ width: '100%', cursor: selectedCostume !== '' ? 'not-allowed' : 'pointer' }}
        />
      </div>
    </div>
  )
}
