import type { GameConfig, AiDifficulty } from '@/types/connect-four/config'

export const DEFAULT_GAME_CONFIG: GameConfig = {
  aiMode: false,
  aiPlayerId: null,
  aiFirst: false,
  aiDifficulty: 4,
}

interface AiDifficultyOption {
  label: string
  value: AiDifficulty
}

export const aiDifficultyOptions: AiDifficultyOption[] = [
  {
    label: 'Easy',
    value: 1,
  },
  {
    label: 'Medium',
    value: 4,
  },
  {
    label: 'Hard',
    value: 6,
  },
]
