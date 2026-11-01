import { describe, it, expect } from 'vitest'
import { getOrderedColumns, minimax, getBestMove } from './minimax'
import { createBoard, dropDisc } from '../board'

import type { DiscColor } from '@/types/connect-four/player'
import type { Position } from '@/types/connect-four/game'

describe('minimax.ts (Connect Four Minimax AI)', () => {
  const AI_COLOR: DiscColor = 'red'
  const OPP_COLOR: DiscColor = 'yellow'

  describe('getOrderedColumns', () => {
    it('should order columns starting from the center outward on a 7-column board', () => {
      const board = createBoard(6, 7)
      const ordered = getOrderedColumns(board)

      // Center is index 3. Distances from 3: [3 (dist 0), 2 & 4 (dist 1), 1 & 5 (dist 2), 0 & 6 (dist 3)]
      expect(ordered[0]).toBe(3)
      expect([ordered[1], ordered[2]]).toEqual(expect.arrayContaining([2, 4]))
      expect([ordered[3], ordered[4]]).toEqual(expect.arrayContaining([1, 5]))
      expect([ordered[5], ordered[6]]).toEqual(expect.arrayContaining([0, 6]))
      expect(ordered.length).toBe(7)
    })

    it('should exclude full columns from the ordered array', () => {
      let board = createBoard(6, 7)
      // Fill the center column (col 3) completely
      for (let r = 0; r < 6; r++) {
        board = dropDisc(board, 3, AI_COLOR).board
      }

      const ordered = getOrderedColumns(board)

      expect(ordered).not.toContain(3)
      expect(ordered.length).toBe(6)
    })

    it('should return an empty array when all columns are full', () => {
      let board = createBoard(6, 7)
      for (let c = 0; c < 7; c++) {
        for (let r = 0; r < 6; r++) {
          board = dropDisc(board, c, AI_COLOR).board
        }
      }

      const ordered = getOrderedColumns(board)
      expect(ordered).toEqual([])
    })
  })

  describe('minimax', () => {
    const dummyPosition: Position = { row: 5, column: 3 }

    it('should return a high positive score when AI completes a winning move', () => {
      let board = createBoard()
      // Drop 4 AI pieces in column 0 (vertical win)
      let lastPos: Position = dummyPosition
      for (let i = 0; i < 4; i++) {
        const res = dropDisc(board, 0, AI_COLOR)
        board = res.board
        lastPos = res.position
      }

      const score = minimax(
        board,
        4, // depth
        -Infinity, // alpha
        Infinity, // beta
        OPP_COLOR, // currentColor
        AI_COLOR, // aiColor
        lastPos, // lastMove
        AI_COLOR, // lastMoveColor
        4, // ply
      )

      // Score for AI win = WIN_SCORE (1,000,000) - ply (4) = 999,996
      expect(score).toBe(1_000_000 - 4)
    })

    it('should return a high negative score when Opponent completes a winning move', () => {
      let board = createBoard()
      // Opponent forms a winning line
      let lastPos: Position = dummyPosition
      for (let i = 0; i < 4; i++) {
        const res = dropDisc(board, 0, OPP_COLOR)
        board = res.board
        lastPos = res.position
      }

      const score = minimax(
        board,
        4,
        -Infinity,
        Infinity,
        AI_COLOR,
        AI_COLOR,
        lastPos,
        OPP_COLOR,
        3,
      )

      // Score for Opponent win = -WIN_SCORE (-1,000,000) + ply (3) = -999,997
      expect(score).toBe(-1_000_000 + 3)
    })

    it('should evaluate non-terminal state when depth reaches 0', () => {
      const board = createBoard()
      const score = minimax(
        board,
        0, // Depth 0 -> should evaluate static heuristic directly
        -Infinity,
        Infinity,
        AI_COLOR,
        AI_COLOR,
        dummyPosition,
        OPP_COLOR,
        1,
      )

      expect(typeof score).toBe('number')
    })

    it('should return 0 for a full board draw', () => {
      const board = createBoard(6, 7)
      // Fill board without a winner pattern (alternating pattern)
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 7; c++) {
          board[r][c] = (r + c) % 2 === 0 ? AI_COLOR : OPP_COLOR
        }
      }

      const score = minimax(
        board,
        3,
        -Infinity,
        Infinity,
        AI_COLOR,
        AI_COLOR,
        { row: 0, column: 0 },
        OPP_COLOR,
        10,
      )

      expect(score).toBe(0)
    })
  })

  describe('getBestMove', () => {
    it('should return null when there are no legal moves (full board)', () => {
      const board = createBoard()
      // Fill every cell
      for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[0].length; c++) {
          board[r][c] = (r + c) % 2 === 0 ? AI_COLOR : OPP_COLOR
        }
      }

      const bestCol = getBestMove(board, AI_COLOR, 2)
      expect(bestCol).toBeNull()
    })

    it('should take an immediate winning move if available', () => {
      const board = createBoard()
      // AI ('red') already has 3-in-a-row horizontally at the bottom row: columns 0, 1, 2
      board[5][0] = AI_COLOR
      board[5][1] = AI_COLOR
      board[5][2] = AI_COLOR
      // Column 3 is the winning slot

      // Depth 1 is enough to spot an immediate win
      const bestCol = getBestMove(board, AI_COLOR, 1)
      expect(bestCol).toBe(3)
    })

    it('should block an immediate opponent win', () => {
      const board = createBoard()
      // Opponent ('yellow') has 3-in-a-row horizontally at columns 0, 1, 2
      board[5][0] = OPP_COLOR
      board[5][1] = OPP_COLOR
      board[5][2] = OPP_COLOR
      // Column 3 is the critical block for AI

      // Depth 1 or 2 should spot and block the threat
      const bestCol = getBestMove(board, AI_COLOR, 2)
      expect(bestCol).toBe(3)
    })

    it('should favor the center column on an empty or neutral board', () => {
      const board = createBoard()
      const centerCol = Math.floor(board[0].length / 2) // Column 3

      // At low depth on an empty board, center-first ordering/heuristic should pick the center
      const bestCol = getBestMove(board, AI_COLOR, 2)
      expect(bestCol).toBe(centerCol)
    })
  })
})
