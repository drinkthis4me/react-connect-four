import { describe, it, expect } from 'vitest'
import { getWindow, evaluateWindow, evaluate } from './evaluate'
import { createBoard } from '../board'

import type { DiscColor } from '@/types/connect-four/player'

describe('evaluate.ts (Connect Four AI Evaluation Logic)', () => {
  const AI_COLOR: DiscColor = 'red'
  const OPP_COLOR: DiscColor = 'yellow'

  describe('getWindow', () => {
    it('should correctly extract a horizontal window of 4 cells', () => {
      const board = createBoard()
      board[5][0] = 'red'
      board[5][1] = 'yellow'
      board[5][2] = 'red'
      board[5][3] = null

      const window = getWindow(board, 5, 0, 0, 1)
      expect(window).toEqual(['red', 'yellow', 'red', null])
    })

    it('should correctly extract a vertical window of 4 cells', () => {
      const board = createBoard()
      board[5][2] = 'red'
      board[4][2] = 'yellow'
      board[3][2] = null
      board[2][2] = 'red'

      const window = getWindow(board, 5, 2, -1, 0)
      expect(window).toEqual(['red', 'yellow', null, 'red'])
    })
  })

  describe('evaluateWindow', () => {
    it('should return max win score for 4 AI tokens', () => {
      const window = ['red', 'red', 'red', 'red'] as const
      expect(evaluateWindow([...window], AI_COLOR)).toBe(100_000)
    })

    it('should return max loss score for 4 opponent tokens', () => {
      const window = ['yellow', 'yellow', 'yellow', 'yellow'] as const
      expect(evaluateWindow([...window], AI_COLOR)).toBe(-100_000)
    })

    it('should return 3-in-a-row score for AI with 1 empty space', () => {
      const window = ['red', 'red', 'red', null] as const
      expect(evaluateWindow([...window], AI_COLOR)).toBe(100)
    })

    it('should return negative 3-in-a-row score for opponent with 1 empty space', () => {
      const window = [null, 'yellow', 'yellow', 'yellow'] as const
      expect(evaluateWindow([...window], AI_COLOR)).toBe(-100)
    })

    it('should return 2-in-a-row score for AI with 2 empty spaces', () => {
      const window = ['red', 'red', null, null] as const
      expect(evaluateWindow([...window], AI_COLOR)).toBe(10)
    })

    it('should return 0 if the window contains both AI and opponent tokens (blocked)', () => {
      const window = ['red', 'yellow', 'red', null] as const
      expect(evaluateWindow([...window], AI_COLOR)).toBe(0)
    })

    it('should return 0 for an empty window', () => {
      const window = [null, null, null, null] as const
      expect(evaluateWindow([...window], AI_COLOR)).toBe(0)
    })
  })

  describe('evaluate', () => {
    it('should return 0 for a completely empty board', () => {
      const board = createBoard()
      expect(evaluate(board, AI_COLOR)).toBe(0)
    })

    it('should reward AI for controlling the center column', () => {
      const board = createBoard()
      const centerCol = Math.floor(board[0].length / 2) // Column 3 for a 7-col board

      // Place an AI token in the center column
      board[5][centerCol] = AI_COLOR

      // Score should at least include center control bonus (6) plus any empty/base window evaluations
      const score = evaluate(board, AI_COLOR)
      expect(score).toBeGreaterThan(0)
    })

    it('should penalize AI if opponent controls the center column', () => {
      const board = createBoard()
      const centerCol = Math.floor(board[0].length / 2)

      // Place opponent token in the center column
      board[board.length - 1][centerCol] = OPP_COLOR

      const score = evaluate(board, AI_COLOR)
      expect(score).toBeLessThan(0)
    })

    it('should properly aggregate scores for active threats/windows', () => {
      const board = createBoard()
      // Set up a 3-in-a-row horizontal threat for AI at the bottom row
      board[5][0] = AI_COLOR
      board[5][1] = AI_COLOR
      board[5][2] = AI_COLOR
      // board[5][3] is null

      const score = evaluate(board, AI_COLOR)
      // Should reflect the 3-in-a-row score (100) plus any overlapping/sub-windows
      expect(score).toBeGreaterThan(100)
    })
  })
})
