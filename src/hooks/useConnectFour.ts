import { useReducer } from 'react'
import { createGame, makeMove, restartGame, undoMove } from '@/lib/connect-four/game'

import type { GameState } from '@/types/connect-four/game'

export const LAST_ACTION = {
  PLAY_MOVE: 'PLAY_MOVE',
  UNDO: 'UNDO',
  RESTART: 'RESTART',
} as const

export type LastAction = (typeof LAST_ACTION)[keyof typeof LAST_ACTION] | null

interface ConnectFourState {
  game: GameState
  lastAction: LastAction
  moveId: number
}

type GameReducerAction
  = | { type: 'PLAY_MOVE', column: number }
    | { type: 'UNDO' }
    | { type: 'RESTART' }

function gameReducer(state: ConnectFourState, action: GameReducerAction): ConnectFourState {
  switch (action.type) {
    case LAST_ACTION.PLAY_MOVE: {
      return {
        game: makeMove(state.game, action.column),
        lastAction: LAST_ACTION.PLAY_MOVE,
        moveId: state.moveId + 1,
      }
    }

    case LAST_ACTION.UNDO: {
      return {
        game: undoMove(state.game),
        lastAction: LAST_ACTION.RESTART,
        moveId: state.moveId,
      }
    }

    case LAST_ACTION.RESTART: {
      return {
        game: restartGame(state.game),
        lastAction: LAST_ACTION.RESTART,
        moveId: state.moveId,
      }
    }
  }
}

interface UseConnectFourReturn {
  state: GameState
  lastAction: LastAction
  moveId: number

  playMove: (column: number) => void
  undo: () => void
  restart: () => void
}

export function useConnectFour(): UseConnectFourReturn {
  const [state, dispatch] = useReducer(gameReducer, {
    game: createGame(),
    lastAction: null,
    moveId: 0,
  })

  function playMove(column: number) {
    dispatch({
      type: LAST_ACTION.PLAY_MOVE,
      column,
    })
  }

  function undo() {
    dispatch({ type: LAST_ACTION.UNDO })
  }

  function restart() {
    dispatch({ type: LAST_ACTION.RESTART })
  }

  return {
    state: state.game,
    lastAction: state.lastAction,
    moveId: state.moveId,

    playMove,
    undo,
    restart,
  }
}
