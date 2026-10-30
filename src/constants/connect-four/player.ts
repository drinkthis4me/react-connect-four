import type { Player } from '@/types/connect-four/player'

export const INITIAL_PLAYERS: [Player, Player] = [
  {
    id: 'p1',
    name: 'Player 1',
    color: 'red',
  },
  {
    id: 'p2',
    name: 'Player 2',
    color: 'yellow',
  },
]
