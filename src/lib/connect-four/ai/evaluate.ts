import { getOpponentColor } from './utils'

import type { BoardGrid, Cell } from '@/types/connect-four/board'
import type { DiscColor } from '@/types/connect-four/player'

const SCORES = {
  win: 100_000,
  three: 100,
  two: 10,
  center: 6,
} as const

const WINNING_CELLS = 4

/**
 * Given a starting cell of (row, col) and direction, return a window of four cells.
 */
export function getWindow(
  board: BoardGrid,
  startRow: number,
  startCol: number,
  rowDirection: number,
  colDirection: number,
): Cell[] {
  return Array.from({ length: WINNING_CELLS }, (_, idx) => {
    const row = startRow + idx * rowDirection
    const col = startCol + idx * colDirection

    return board[row][col]
  })
}

/**
 * Given a window (line) of cells, score based on the connection count.
 */
export function evaluateWindow(window: Cell[], aiColor: DiscColor): number {
  const oppColor = getOpponentColor(aiColor)

  let aiCount = 0
  let oppCount = 0
  let emptyCount = 0

  for (const cell of window) {
    if (cell === aiColor) aiCount++
    else if (cell === oppColor) oppCount++
    else emptyCount++
  }

  // Window contains both colors -> Blocked. No win.
  if (aiCount > 0 && oppCount > 0) {
    return 0
  }

  // Winning window
  if (aiCount === WINNING_CELLS) return SCORES.win
  if (oppCount === WINNING_CELLS) return -SCORES.win

  // Possible winning window of 3 cells
  if (aiCount === 3 && emptyCount === 1) {
    return SCORES.three
  }
  if (oppCount === 3 && emptyCount === 1) {
    return -SCORES.three
  }

  // Possible winning window of 2 cells
  if (aiCount === 2 && emptyCount === 2) {
    return SCORES.two
  }
  if (oppCount === 2 && emptyCount === 2) {
    return -SCORES.two
  }

  return 0
}

/**
 * Score a board position based on winning opportunities, threats, and center control.
 *
 * @return Board score. Positive: Favorable to AI; negative: Favorable to opponent.
 */
export function evaluate(board: BoardGrid, aiColor: DiscColor): number {
  const ROWS = board.length
  const COLS = board[0].length

  const oppColor = getOpponentColor(aiColor)

  let score = 0

  // Check center column
  const centerCol = Math.floor(COLS / 2)
  for (let row = 0; row < ROWS; row++) {
    const centerCell = board[row][centerCol]
    if (centerCell === aiColor) {
      score += SCORES.center
    } else if (centerCell === oppColor) {
      score -= SCORES.center
    }
  }

  // Evaluate every possible group of four cells
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      // Horizontal window
      if (c <= COLS - WINNING_CELLS) {
        const window = getWindow(board, r, c, 0, 1)
        score += evaluateWindow(window, aiColor)
      }

      // Vertical window
      if (r <= ROWS - WINNING_CELLS) {
        const window = getWindow(board, r, c, 1, 0)
        score += evaluateWindow(window, aiColor)
      }

      // Diagonal window (top-left to bottom-right)
      if (r <= ROWS - WINNING_CELLS && c <= COLS - WINNING_CELLS) {
        const window = getWindow(board, r, c, 1, 1)
        score += evaluateWindow(window, aiColor)
      }

      // Diagonal window (top-right to bottom-left)
      if (r >= WINNING_CELLS - 1 && c <= WINNING_CELLS - 1) {
        const window = getWindow(board, r, c, -1, -1)
        score += evaluateWindow(window, aiColor)
      }
    }
  }

  return score
}
