import { useReducer } from 'react'
import { createGame, makeMove, restartGame, undoMove } from '@/lib/connect-four/game'

import type { GameState } from '@/types/connect-four/game'

type GameAction
  = | { type: 'PLAY_MOVE', column: number }
    | { type: 'UNDO' }
    | { type: 'RESTART' }

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'PLAY_MOVE': {
      return makeMove(state, action.column)
    }

    case 'UNDO': {
      return undoMove(state)
    }

    case 'RESTART': {
      return restartGame(state)
    }
  }
}

interface UseConnectFourReturn {
  state: GameState
  playMove: (column: number) => void
  undo: () => void
  restart: () => void
}

export function useConnectFour(): UseConnectFourReturn {
  const [state, dispatch] = useReducer(gameReducer, undefined, createGame)

  function playMove(column: number) {
    dispatch({
      type: 'PLAY_MOVE',
      column,
    })
  }

  function undo() {
    dispatch({ type: 'UNDO' })
  }

  function restart() {
    dispatch({ type: 'RESTART' })
  }

  return {
    state,
    playMove,
    undo,
    restart,
  }
}
