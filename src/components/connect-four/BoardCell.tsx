import type { DiscColor } from '@/types/connect-four/player'

const colorMap: Record<string, string> = {
  empty: 'bg-white dark:bg-mist-800',
  red: 'bg-red-400',
  yellow: 'bg-yellow-400',
}

interface BoardCellProps {
  color: DiscColor | null
  isWinning: boolean
}

export function BoardCell({
  color,
  isWinning,
}: BoardCellProps) {
  return (
    <div
      className={`
      aspect-square rounded-full border border-slate-900 size-8
      ${color ? colorMap[color] : colorMap.empty}
      ${isWinning ? 'ring-4 ring-green-400 ring-offset-2' : ''}
    `}
    >
    </div>
  )
}
