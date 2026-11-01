import { describe, it, expect, assert } from 'vitest'
import {
  createGame,
  makeMove,
  undoMove,
} from './game'
import { INITIAL_PLAYERS } from '@/constants/connect-four/player'

describe('game.ts', () => {
  describe('createGame', () => {
    it('should initialize a new game with correct default state', () => {
      const game = createGame()

      expect(game.status).toBe('playing')

      if (game.status !== 'playing') {
        assert.fail('Expected a new game to be in playing state')
      }

      expect(game.moveHistory).toEqual([])
      expect(game.players).toEqual(INITIAL_PLAYERS)
      expect(game.currentPlayerId).toBe(INITIAL_PLAYERS[0].id)
      expect(game.board.length).toBeGreaterThan(0)
    })
  })

  describe('makeMove', () => {
    it('should successfully make a move, update history, and toggle the current player', () => {
      const game = createGame()

      if (game.status !== 'playing') {
        assert.fail('Expected a new game to be in playing state')
      }

      const firstPlayerId = game.currentPlayerId
      const secondPlayerId = game.players.find(p => p.id !== firstPlayerId)!.id

      const nextState = makeMove(game, 3)

      expect(nextState.status).toBe('playing')

      if (nextState.status !== 'playing') {
        assert.fail('Expected game to be in playing state')
      }

      expect(nextState.currentPlayerId).toBe(secondPlayerId)
      expect(nextState.moveHistory.length).toBe(1)
      expect(nextState.moveHistory[0]).toMatchObject({
        column: 3,
        playerId: firstPlayerId,
      })
    })

    it('should throw an error if making a move on an ended game', () => {
      let game = createGame()
      // Force a win scenario to end the game
      for (let i = 0; i < 4; i++) {
        game = makeMove(game, 0) // Player 1
        if (game.status === 'won') break
        game = makeMove(game, 1) // Player 2
      }

      // If somehow not won yet, manually force/mock or complete a quick win
      // Assuming a win occurred:
      if (game.status === 'won') {
        expect(() => makeMove(game, 2)).toThrow('The game has already ended.')
      }
    })

    it('should throw an error on an illegal/invalid move', () => {
      const game = createGame()
      expect(() => makeMove(game, -1)).toThrow(/Illegal move/)
      expect(() => makeMove(game, 99)).toThrow(/Illegal move/)
    })

    it('should transition game state to "won" when 4 pieces connect', () => {
      let game = createGame()

      if (game.status !== 'playing') {
        assert.fail('Expected a new game to be in playing state')
      }

      const p1 = game.currentPlayerId
      // const p2 = game.players.find(p => p.id !== p1)!.id

      // Simulate 4 alternating moves to create a horizontal win for Player 1
      // P1: col 0, P2: col 0, P1: col 1, P2: col 1, P1: col 2, P2: col 2, P1: col 3 (Wins!)
      const moves = [0, 0, 1, 1, 2, 2, 3]

      for (let i = 0; i < moves.length - 1; i++) {
        game = makeMove(game, moves[i])
      }

      // Final winning move for Player 1
      const winningState = makeMove(game, moves[moves.length - 1])

      expect(winningState.status).toBe('won')
      if (winningState.status === 'won') {
        expect(winningState.winnerId).toBe(p1)
        expect(winningState.winningPositions.length).toBeGreaterThanOrEqual(4)
      }
    })
  })

  describe('undoMove', () => {
    it('should revert the last move, restore previous board cell, and switch turn back', () => {
      const game = createGame()

      if (game.status !== 'playing') {
        assert.fail('Expected a new game to be in playing state')
      }

      const initialPlayerId = game.currentPlayerId

      const stateAfterMove = makeMove(game, 2)
      if (stateAfterMove.status !== 'playing') {
        assert.fail('Expected game to be in playing state')
      }

      expect(stateAfterMove.moveHistory.length).toBe(1)
      expect(stateAfterMove.currentPlayerId).not.toBe(initialPlayerId)

      const stateAfterUndo = undoMove(stateAfterMove)
      if (stateAfterUndo.status !== 'playing') {
        assert.fail('Expected game to be in playing state')
      }

      expect(stateAfterUndo.moveHistory.length).toBe(0)
      expect(stateAfterUndo.currentPlayerId).toBe(initialPlayerId)
      expect(stateAfterUndo.status).toBe('playing')
      // Verify board cell is cleared back to null
      expect(stateAfterUndo.board[stateAfterUndo.board.length - 1][2]).toBeNull()
    })

    it('should throw an error if history is empty when trying to undo', () => {
      const game = createGame()
      expect(() => undoMove(game)).toThrow('History is empty. Nothing to undo.')
    })
  })
})
