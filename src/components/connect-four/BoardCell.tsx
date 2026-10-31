import type { DiscColor } from '@/types/connect-four/player'

const colorMap: Record<string, string> = {
  empty: 'bg-white dark:bg-mist-800',
  yellow: 'bg-yellow-400',
  red: 'bg-red-400',
}

interface BoardCellProps {
  color: DiscColor | null
  isWinning: boolean
  isPreview?: boolean
  previewColor?: DiscColor | null
}

export function BoardCell({
  color,
  isWinning,
  isPreview = false,
  previewColor = null,
}: BoardCellProps) {
  const discColor = isPreview ? previewColor : color

  return (
    <div className={`
      aspect-square rounded-full border border-slate-900 size-8 md:size-12
      transition-colors duration-150
      ${discColor ? colorMap[discColor] : 'bg-white dark:bg-mist-800'}
      ${isPreview ? 'opacity-80 transition-opacity' : 'opacity-100'}
      ${isWinning ? 'ring-4 ring-green-400 ring-offset-2' : ''}
    `}
    >
    </div>
  )
}
