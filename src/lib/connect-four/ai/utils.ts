import type { DiscColor } from '@/types/connect-four/player'

export function getOpponentColor(selfColor: DiscColor): DiscColor {
  return selfColor === 'red' ? 'yellow' : 'red'
}
