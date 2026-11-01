import type { PlayerId } from './player'

export type AiDifficulty = 1 | 4 | 6

export interface GameConfig {
  aiMode: boolean
  aiPlayerId: PlayerId | null
  aiFirst: boolean
  aiDifficulty: AiDifficulty
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  aiMode: false,
  aiPlayerId: null,
  aiFirst: false,
  aiDifficulty: 4,
}
