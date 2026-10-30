import { describe, expect, it } from 'vitest'
import {
  createBoard,
  canDrop,
  dropDisc,
  clearCell,
  isBoardFull,
  findWinningPositions,
} from './board'
import { ROWS, COLUMNS } from '@/constants/connect-four/board'

describe('board.ts', () => {
  describe('createBoard', () => {
    it('should create a board with correct dimensions filled with null', () => {
      const board = createBoard()
      expect(board.length).toBe(ROWS)
      expect(board[0].length).toBe(COLUMNS)
      expect(board.every(row => row.every(cell => cell === null))).toBe(true)
    })
  })

  describe('canDrop', () => {
    it('should allow dropping into an empty column', () => {
      const board = createBoard()
      expect(canDrop(board, 0)).toBe(true)
      expect(canDrop(board, COLUMNS - 1)).toBe(true)
    })

    it('should disallow dropping into out-of-bound columns', () => {
      const board = createBoard()
      expect(canDrop(board, -1)).toBe(false)
      expect(canDrop(board, COLUMNS)).toBe(false)
    })

    it('should disallow dropping into a full column', () => {
      let board = createBoard()
      // Fill column 0
      for (let i = 0; i < ROWS; i++) {
        const result = dropDisc(board, 0, 'red')
        board = result.board
      }
      expect(canDrop(board, 0)).toBe(false)
    })
  })

  describe('dropDisc', () => {
    it('should drop a disc to the lowest available row in a column (gravity)', () => {
      const board = createBoard()
      const { board: newBoard, position } = dropDisc(board, 2, 'red')

      expect(position).toEqual({ row: ROWS - 1, column: 2 })
      expect(newBoard[ROWS - 1][2]).toBe('red')
    })

    it('should stack multiple discs correctly in the same column', () => {
      let board = createBoard()

      const firstDrop = dropDisc(board, 3, 'red')
      board = firstDrop.board
      expect(firstDrop.position).toEqual({ row: ROWS - 1, column: 3 })

      const secondDrop = dropDisc(board, 3, 'yellow')
      board = secondDrop.board
      expect(secondDrop.position).toEqual({ row: ROWS - 2, column: 3 })

      expect(board[ROWS - 1][3]).toBe('red')
      expect(board[ROWS - 2][3]).toBe('yellow')
    })

    it('should throw an error when trying to drop into a full column', () => {
      let board = createBoard()
      for (let i = 0; i < ROWS; i++) {
        board = dropDisc(board, 0, 'red').board
      }

      expect(() => dropDisc(board, 0, 'yellow')).toThrow(
        'Cannot drop disc. Column 0 is full.',
      )
    })
  })

  describe('clearCell', () => {
    it('should clear a valid cell position', () => {
      let board = createBoard()
      board = dropDisc(board, 0, 'red').board

      expect(board[ROWS - 1][0]).toBe('red')
      const clearedBoard = clearCell(board, ROWS - 1, 0)
      expect(clearedBoard[ROWS - 1][0]).toBeNull()
    })

    it('should throw an error for out-of-bound cell clearing', () => {
      const board = createBoard()
      expect(() => clearCell(board, -1, 0)).toThrow(/is out of bound/)
      expect(() => clearCell(board, ROWS, COLUMNS)).toThrow(/is out of bound/)
    })
  })

  describe('isBoardFull', () => {
    it('should return false for a non-full board', () => {
      const board = createBoard()
      expect(isBoardFull(board)).toBe(false)
    })

    it('should return true when the top row is entirely occupied', () => {
      let board = createBoard()
      // Fill every column up to the top row
      for (let c = 0; c < COLUMNS; c++) {
        for (let r = 0; r < ROWS; r++) {
          board = dropDisc(board, c, 'red').board
        }
      }
      expect(isBoardFull(board)).toBe(true)
    })
  })

  describe('findWinningPositions', () => {
    it('should return empty array if position has no win', () => {
      const board = createBoard()
      const { board: b2, position } = dropDisc(board, 0, 'red')
      const wins = findWinningPositions(b2, position, 'red')
      expect(wins).toEqual([])
    })

    it('should detect a horizontal win of 4 pieces', () => {
      let board = createBoard()
      // Drop 4 consecutive pieces in columns 0, 1, 2, 3 at the bottom row
      const moves = [0, 1, 2, 3]
      let lastPos = { row: 0, column: 0 }

      moves.forEach((col) => {
        const res = dropDisc(board, col, 'red')
        board = res.board
        lastPos = res.position
      })

      const winningPositions = findWinningPositions(board, lastPos, 'red')
      expect(winningPositions.length).toBeGreaterThanOrEqual(4)
    })

    it('should detect a vertical win of 4 pieces', () => {
      let board = createBoard()
      let lastPos = { row: 0, column: 0 }

      // Drop 4 red pieces in the same column
      for (let i = 0; i < 4; i++) {
        const res = dropDisc(board, 0, 'red')
        board = res.board
        lastPos = res.position
      }

      const winningPositions = findWinningPositions(board, lastPos, 'red')
      expect(winningPositions.length).toBe(4)
    })

    it('should detect a diagonal win of 4 pieces', () => {
      const board = createBoard()

      // Set up a diagonal down-right / up-left: from (5,0) to (2,3)
      board[5][0] = 'red'
      board[4][1] = 'red'
      board[3][2] = 'red'
      board[2][3] = 'red' // Last placed piece completing the diagonal

      const winningPositions = findWinningPositions(board, { row: 2, column: 3 }, 'red')
      expect(winningPositions.length).toBe(4)

      // Verify all expected coordinates are included
      expect(winningPositions).toEqual(
        expect.arrayContaining([
          { row: 5, column: 0 },
          { row: 4, column: 1 },
          { row: 3, column: 2 },
          { row: 2, column: 3 },
        ]),
      )
    })

    it('should detect multiple winning lines intersecting at a single position', () => {
      const board = createBoard()

      // Create an intersection at (3,3) that completes both a horizontal and a vertical line
      // Horizontal: (3,1), (3,2), (3,3), (3,4)
      board[3][1] = 'red'
      board[3][2] = 'red'
      board[3][3] = 'red' // Intersection point
      board[3][4] = 'red'

      // Vertical: (1,3), (2,3), (3,3), (4,3)
      board[1][3] = 'red'
      board[2][3] = 'red'
      // board[3][3] is already red
      board[4][3] = 'red'

      const winningPositions = findWinningPositions(board, { row: 3, column: 3 }, 'red')

      // Should find positions from both lines (center + 3 distinct horizontal + 3 distinct vertical = 7 positions)
      expect(winningPositions.length).toBe(7)
      expect(winningPositions).toEqual(
        expect.arrayContaining([
          { row: 3, column: 3 }, // Center
          { row: 3, column: 1 }, { row: 3, column: 2 }, { row: 3, column: 4 }, // Horizontal
          { row: 1, column: 3 }, { row: 2, column: 3 }, { row: 4, column: 3 }, // Vertical
        ]),
      )
    })
  })
})
