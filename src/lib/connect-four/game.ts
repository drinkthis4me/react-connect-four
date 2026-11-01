import { INITIAL_PLAYERS } from '@/constants/connect-four/player'
import { canDrop, clearCell, createBoard, dropDisc, findWinningPositions, isBoardFull } from './board'

import type { Player, PlayerId } from '@/types/connect-four/player'
import type { DrawState, GameData, GameState, PlayingState, WonState } from '@/types/connect-four/game'

export function createGame(): GameState {
  return {
    board: createBoard(),
    players: structuredClone(INITIAL_PLAYERS),
    moveHistory: [],
    status: 'playing',
    currentPlayerId: INITIAL_PLAYERS[0].id,
  }
}

function getPlayer(state: GameState, playerId: PlayerId): Player {
  const player = state.players.find(p => p.id === playerId)

  if (!player) {
    throw new Error(`Player ${playerId} not found.`)
  }

  return player
}

export function makeMove(state: GameState, column: number): GameState {
  if (state.status !== 'playing') {
    throw new Error('The game has already ended.')
  }

  if (!canDrop(state.board, column)) {
    throw new Error(`Illegal move. Cannot drop disc at column ${column}`)
  }

  const currentPlayerId = state.currentPlayerId
  const currentPlayer = getPlayer(state, currentPlayerId)
  const currentColor = currentPlayer.color

  const { board, position } = dropDisc(state.board, column, currentColor)

  const moveHistory = state.moveHistory.slice()
  moveHistory.push({
    ...position,
    playerId: currentPlayerId,
  })

  const winningPositions = findWinningPositions(board, position, currentColor)

  const nextGameData: GameData = {
    board,
    players: state.players,
    moveHistory,
  }

  if (winningPositions.length > 0) {
    const wonState: WonState = {
      status: 'won',
      winnerId: currentPlayerId,
      winningPositions: winningPositions,
    }
    return {
      ...nextGameData,
      ...wonState,
    }
  } else if (isBoardFull(board)) {
    const drawState: DrawState = {
      status: 'draw',
    }
    return {
      ...nextGameData,
      ...drawState,
    }
  } else {
    const opponent = state.players.find(p => p.id !== currentPlayerId)

    if (!opponent) {
      throw new Error('Could not find the opposing player.')
    }

    const playingState: PlayingState = {
      status: 'playing',
      currentPlayerId: opponent.id,
    }

    return {
      ...nextGameData,
      ...playingState,
    }
  }
}

export function undoMove(state: GameState): GameState {
  const lastMove = state.moveHistory.at(-1)

  if (!lastMove) {
    throw new Error('History is empty. Nothing to undo.')
  }

  const previousBoard = clearCell(state.board, lastMove.row, lastMove.column)

  const previousMoveHistory = state.moveHistory.slice(0, -1)

  return {
    board: previousBoard,
    players: state.players,
    moveHistory: previousMoveHistory,
    status: 'playing',
    currentPlayerId: lastMove.playerId,
  }
}
