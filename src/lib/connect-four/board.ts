import { COLUMNS, ROWS } from '@/constants/connect-four/board'

import type { BoardGrid } from '@/types/connect-four/board'
import type { DiscColor } from '@/types/connect-four/player'
import type { Position } from '@/types/connect-four/game'

export function createBoard(rows = ROWS, columns = COLUMNS): BoardGrid {
  return Array.from({ length: rows },
    () => Array.from({ length: columns }, () => null),
  )
}

export function canDrop(
  board: BoardGrid,
  column: number,
): boolean {
  if (board.length === 0 || board[0].length === 0) return false

  if (column < 0 || column >= board[0].length) return false

  return board[0][column] === null
}

export function dropDisc(
  board: BoardGrid,
  column: number,
  color: DiscColor,
): {
  board: BoardGrid
  position: Position
} {
  if (!canDrop(board, column)) {
    throw new Error(`Cannot drop disc. Column ${column} is full.`)
  }

  for (let row = board.length - 1; row >= 0; row--) {
    if (board[row][column] === null) {
      const newBoard = structuredClone(board)
      newBoard[row][column] = color

      return {
        board: newBoard,
        position: { row, column },
      }
    }
  }

  throw new Error('Board is inconsistent. Column has no available cell.')
}

function isInBounds(row: number, column: number, rows: number, columns: number): boolean {
  return (
    row >= 0
    && row < rows
    && column >= 0
    && column < columns
  )
}

/**
 * Only clear top cells. Bottom cells need to consider gravity.
 */
export function clearCell(
  board: BoardGrid,
  row: number,
  column: number,
): BoardGrid {
  if (!isInBounds(row, column, board.length, board[0].length)) {
    throw new Error(`Position at (${row}, ${column}) is out of bound.`)
  }

  if (board[row][column] === null) return board

  const newBoard = structuredClone(board)
  newBoard[row][column] = null

  return newBoard
}

export function isBoardFull(
  board: BoardGrid,
): boolean {
  return board[0].every(cell => cell !== null)
}

const DIRECTIONS = [
  [0, 1], // Horizontal
  [1, 0], // Vertical
  [1, 1], // Diagonal down-right
  [-1, 1], // Diagonal up-right
] as const

/**
 * @returns Every winning lines
 */
export function findWinningPositions(
  board: BoardGrid,
  position: Position,
  color: DiscColor,
): Position[] {
  const ROWS = board.length
  const COLS = board[0].length

  const { row, column } = position

  if (
    !isInBounds(row, column, ROWS, COLS)
    || board[row][column] !== color
  ) {
    return []
  }

  const winningPositions: Position[] = []
  winningPositions.push(position)

  function countInDirection(dr: number, dc: number): number {
    let count = 0
    let r = row + dr
    let c = column + dc

    while (isInBounds(r, c, ROWS, COLS) && board[r][c] === color) {
      count++
      r += dr
      c += dc
    }

    return count
  }

  for (const [dr, dc] of DIRECTIONS) {
    const appendCount = countInDirection(dr, dc)
    const prependCount = countInDirection(-dr, -dc)

    if (appendCount + prependCount + 1 >= 4) {
      for (let i = 1; i <= appendCount; i++) {
        winningPositions.push({
          row: row + dr * i,
          column: column + dc * i,
        })
      }

      for (let i = 1; i <= prependCount; i++) {
        winningPositions.push({
          row: row - dr * i,
          column: column - dc * i,
        })
      }
    }
  }

  return winningPositions.length >= 4 ? winningPositions : []
}
