import { useEffect, useReducer } from 'react'
import { createGame, makeMove, undoMove } from '@/lib/connect-four/game'
import { getBestMove } from '@/lib/connect-four/ai/minimax'

import type { GameData, GameState, PlayingState } from '@/types/connect-four/game'
import type { GameConfig } from '@/types/connect-four/config'
import { DEFAULT_GAME_CONFIG } from '@/constants/connect-four/config'

export const GAME_ACTION = {
  PLAY_MOVE: 'PLAY_MOVE',
  UNDO: 'UNDO',
  RESTART: 'RESTART',
  NEW_GAME: 'NEW_GAME',
} as const

export type GameAction = (typeof GAME_ACTION)[keyof typeof GAME_ACTION] | null

interface ConnectFourState {
  game: GameState
  config: GameConfig
  lastAction: GameAction
  moveId: number
}

type GameReducerAction
  = | { type: 'PLAY_MOVE', column: number }
    | { type: 'UNDO' }
    | { type: 'RESTART' }
    | { type: 'NEW_GAME', config: GameConfig }

function createGameWithConfig(config: GameConfig): GameState {
  const {
    aiMode,
    aiPlayerId,
    aiFirst,
  } = config

  const game = createGame() as (GameData & PlayingState)

  if (!aiMode) {
    return game
  }

  if (!aiPlayerId) {
    throw new Error('AI player ID is required when AI mode is enabled.')
  }

  const aiPlayer = game.players.find(p => p.id === aiPlayerId)

  if (!aiPlayer) {
    throw new Error(`AI player "${aiPlayerId}" was not found`)
  }

  if (!aiFirst) {
    return game
  }

  return {
    ...game,
    currentPlayerId: aiPlayer.id,
  }
}

function gameReducer(state: ConnectFourState, action: GameReducerAction): ConnectFourState {
  switch (action.type) {
    case GAME_ACTION.PLAY_MOVE: {
      return {
        ...state,
        game: makeMove(state.game, action.column),
        lastAction: GAME_ACTION.PLAY_MOVE,
        moveId: state.moveId + 1,
      }
    }

    case GAME_ACTION.UNDO: {
      let game = state.game

      if (game.moveHistory.length === 0) {
        return state
      }

      // Undo human move
      game = undoMove(game)

      // Undo AI move if in AI mode
      if (state.config.aiMode && game.moveHistory.length > 0) {
        game = undoMove(game)
      }

      return {
        ...state,
        game,
        lastAction: GAME_ACTION.UNDO,
      }
    }

    // Reset the current game while reserving config
    case GAME_ACTION.RESTART: {
      return {
        ...state,
        game: createGameWithConfig(state.config),
        lastAction: GAME_ACTION.RESTART,
      }
    }

    case GAME_ACTION.NEW_GAME: {
      return {
        game: createGameWithConfig(action.config),
        config: action.config,
        lastAction: GAME_ACTION.NEW_GAME,
        moveId: state.moveId,
      }
    }
  }
}

export const AI_MOVE_DELAY_MS = 400

interface UseConnectFourReturn {
  state: GameState
  config: GameConfig
  lastAction: GameAction
  moveId: number

  playMove: (column: number) => void
  undo: () => void
  restart: () => void
  startNewGame: (newConfig: GameConfig) => void
}

export function useConnectFour(initialConfig: GameConfig = DEFAULT_GAME_CONFIG): UseConnectFourReturn {
  const [snapshot, dispatch] = useReducer(
    gameReducer,
    initialConfig,
    (config): ConnectFourState => ({
      game: createGameWithConfig(config),
      config,
      lastAction: null,
      moveId: 0,
    }),
  )

  const {
    game,
    config,
    lastAction,
    moveId,
  } = snapshot

  function playMove(column: number) {
    dispatch({
      type: GAME_ACTION.PLAY_MOVE,
      column,
    })
  }

  function undo() {
    dispatch({ type: GAME_ACTION.UNDO })
  }

  function restart() {
    dispatch({ type: GAME_ACTION.RESTART })
  }

  function startNewGame(newConfig: GameConfig) {
    dispatch({
      type: GAME_ACTION.NEW_GAME,
      config: newConfig,
    })
  }

  // Auto play the AI's turn
  useEffect(() => {
    if (!config.aiMode || !config.aiPlayerId) return
    if (game.status !== 'playing') return
    if (game.currentPlayerId !== config.aiPlayerId) return

    const aiPlayer = game.players.find(p => p.id === config.aiPlayerId)

    if (!aiPlayer) return

    const bestColumn = getBestMove(game.board, aiPlayer.color, config.aiDifficulty)

    if (bestColumn === null) return

    const timeoutId = setTimeout(() => {
      dispatch({
        type: GAME_ACTION.PLAY_MOVE,
        column: bestColumn,
      })
    }, AI_MOVE_DELAY_MS)

    return () => clearTimeout(timeoutId)
  }, [game, config])

  return {
    state: game,
    config,
    lastAction,
    moveId,

    playMove,
    undo,
    restart,
    startNewGame,
  }
}
