import { evaluate } from './evaluate'
import { canDrop, dropDisc, findWinningPositions, isBoardFull } from '../board'
import { getOpponentColor } from './utils'

import type { Position } from '@/types/connect-four/game'
import type { DiscColor } from '@/types/connect-four/player'
import type { BoardGrid } from '@/types/connect-four/board'

const WIN_SCORE = 1_000_000
// Easy: depth=1; mid: depth=4; hard: depth=6;
export const DEFAULT_DEPTH = 4

/**
 * Return legal columns ordered from the center outward.
 *
 * Center-first ordering improves Alpha-Beta pruning.
 */
export function getOrderedColumns(board: BoardGrid): number[] {
  const columnCount = board[0].length
  const center = Math.floor(columnCount / 2)

  return Array.from({ length: columnCount }, (_, column) => column)
    .filter(column => canDrop(board, column))
    .sort((a, b) => Math.abs(a - center) - Math.abs(b - center))
}

export function minimax(
  board: BoardGrid,
  depth: number,
  alpha: number,
  beta: number,
  currentColor: DiscColor,
  aiColor: DiscColor,
  lastMove: Position,
  lastMoveColor: DiscColor,
  ply: number,
): number {
  // Check whether the previous move won the game.
  const winningPositions = findWinningPositions(
    board,
    lastMove,
    lastMoveColor,
  )

  if (winningPositions.length > 0) {
    // `ply` (a move / half a turn) as turn weight.
    // If is winning, win ASAP.
    // If is losing (opp winning), delay losing and hope the opp makes a mistake.
    return lastMoveColor === aiColor
      ? WIN_SCORE - ply
      : -WIN_SCORE + ply
  }

  // A full board without a winner is a draw.
  if (isBoardFull(board)) return 0

  // Stop searching when we reach the depth limit.
  if (depth === 0) {
    return evaluate(board, aiColor)
  }

  const legalColumns = getOrderedColumns(board)

  if (legalColumns.length === 0) return 0

  const isMaximizing = currentColor === aiColor

  let bestScore = isMaximizing ? -Infinity : Infinity

  for (const column of legalColumns) {
    const { board: nextBoard, position } = dropDisc(
      board,
      column,
      currentColor,
    )

    const score = minimax(
      nextBoard,
      depth - 1,
      alpha,
      beta,
      getOpponentColor(currentColor),
      aiColor,
      position,
      currentColor,
      ply + 1,
    )

    if (isMaximizing) {
      bestScore = Math.max(bestScore, score)
      alpha = Math.max(alpha, bestScore)
    } else {
      bestScore = Math.min(bestScore, score)
      beta = Math.min(beta, bestScore)
    }

    // Alpha-Beta pruning
    if (alpha >= beta) break
  }

  return bestScore
}

/**
 * Find the best column for AI to play.
 *
 * Return null when there are no legal moves.
 */
export function getBestMove(
  board: BoardGrid,
  aiColor: DiscColor,
  depth = DEFAULT_DEPTH,
): number | null {
  const legalColumns = getOrderedColumns(board)

  if (legalColumns.length === 0) return null

  const opponentColor = getOpponentColor(aiColor)

  let bestColumn: number | null = null
  let bestScore = -Infinity
  let alpha = -Infinity
  const beta = Infinity

  for (const column of legalColumns) {
    const { board: nextBoard, position } = dropDisc(
      board,
      column,
      aiColor,
    )

    const score = minimax(
      nextBoard,
      Math.max(0, depth - 1),
      alpha,
      beta,
      opponentColor,
      aiColor,
      position,
      aiColor,
      1,
    )

    if (score > bestScore) {
      bestScore = score
      bestColumn = column
    }

    alpha = Math.max(alpha, bestScore)
  }

  return bestColumn
}
