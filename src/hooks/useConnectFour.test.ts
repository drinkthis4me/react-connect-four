// @vitest-environment happy-dom

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useConnectFour, GAME_ACTION, AI_MOVE_DELAY_MS } from './useConnectFour'
import { INITIAL_PLAYERS } from '@/constants/connect-four/player'

import type { GameConfig } from '@/types/connect-four/config'

describe('useConnectFour.ts', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('Two-Player Mode', () => {
    it('should initialize correctly with default options', () => {
      const { result } = renderHook(() => useConnectFour())

      expect(result.current.state.status).toBe('playing')
      expect(result.current.lastAction).toBeNull()
      expect(result.current.moveId).toBe(0)
      expect(result.current.state.moveHistory).toEqual([])

      if (result.current.state.status === 'playing') {
        expect(result.current.state.currentPlayerId).toBe(INITIAL_PLAYERS[0].id)
      }
    })

    it('should alternate turns between players after each move', () => {
      const { result } = renderHook(() => useConnectFour())
      const p1Id = INITIAL_PLAYERS[0].id
      const p2Id = INITIAL_PLAYERS[1].id

      if (result.current.state.status === 'playing') {
        expect(result.current.state.currentPlayerId).toBe(p1Id)
      }

      act(() => {
        result.current.playMove(3)
      })

      expect(result.current.lastAction).toBe(GAME_ACTION.PLAY_MOVE)
      expect(result.current.moveId).toBe(1)
      expect(result.current.state.moveHistory.length).toBe(1)

      if (result.current.state.status === 'playing') {
        expect(result.current.state.currentPlayerId).toBe(p2Id)
      }
    })

    it('should support undo functionality', () => {
      const { result } = renderHook(() => useConnectFour())

      act(() => {
        result.current.playMove(2)
      })
      expect(result.current.state.moveHistory.length).toBe(1)

      act(() => {
        result.current.undo()
      })
      expect(result.current.lastAction).toBe(GAME_ACTION.UNDO)
      expect(result.current.state.moveHistory.length).toBe(0)
    })

    it('should restart the game', () => {
      const { result } = renderHook(() => useConnectFour())

      act(() => {
        result.current.playMove(0)
        result.current.playMove(1)
      })
      expect(result.current.state.moveHistory.length).toBe(2)

      act(() => {
        result.current.restart()
      })
      expect(result.current.state.moveHistory.length).toBe(0)
      expect(result.current.state.status).toBe('playing')
    })
  })

  describe('AI Mode', () => {
    const aiPlayerId = INITIAL_PLAYERS[1].id // Player 2 is AI
    const aiConfig: GameConfig = {
      aiMode: true,
      aiPlayerId,
      aiFirst: false,
      aiDifficulty: 1,
    }

    it('should automatically trigger AI move when it is AI turn', () => {
      const { result } = renderHook(() => useConnectFour(aiConfig))

      // Human (Player 1) plays column 3
      act(() => {
        result.current.playMove(3)
      })

      expect(result.current.state.moveHistory.length).toBe(1)

      // Fast-forward timers to fire the AI timeout
      act(() => {
        vi.advanceTimersByTime(AI_MOVE_DELAY_MS)
      })

      // AI should have played its turn automatically (Total 2 moves)
      expect(result.current.state.moveHistory.length).toBe(2)
      expect(result.current.state.moveHistory[1].playerId).toBe(aiPlayerId)
    })

    it('should allow AI to go first if aiFirst is true', () => {
      const firstAiConfig: GameConfig = {
        ...aiConfig,
        aiFirst: true,
      }

      const { result } = renderHook(() => useConnectFour(firstAiConfig))

      if (result.current.state.status === 'playing') {
        expect(result.current.state.currentPlayerId).toBe(aiPlayerId)
      }

      // Fast-forward timers for AI's initial turn
      act(() => {
        vi.advanceTimersByTime(AI_MOVE_DELAY_MS)
      })

      expect(result.current.state.moveHistory.length).toBe(1)
      expect(result.current.state.moveHistory[0].playerId).toBe(aiPlayerId)
    })

    it('should undo both human and AI moves together in AI mode', () => {
      const { result } = renderHook(() => useConnectFour(aiConfig))

      // Human plays
      act(() => {
        result.current.playMove(3)
      })

      // AI responds
      act(() => {
        vi.advanceTimersByTime(AI_MOVE_DELAY_MS)
      })

      expect(result.current.state.moveHistory.length).toBe(2)

      // Call undo (should clear both human and AI turns)
      act(() => {
        result.current.undo()
      })

      expect(result.current.state.moveHistory.length).toBe(0)
    })

    it('should restart the game with the existing config', () => {
      const aiFirstConfig: GameConfig = {
        aiMode: true,
        aiPlayerId: INITIAL_PLAYERS[1].id,
        aiFirst: true,
        aiDifficulty: 1,
      }

      const { result } = renderHook(() => useConnectFour(aiFirstConfig))

      // AI goes first automatically
      act(() => {
        vi.advanceTimersByTime(AI_MOVE_DELAY_MS)
      })
      expect(result.current.state.moveHistory.length).toBe(1)

      // Play another move
      act(() => {
        result.current.playMove(3)
      })
      act(() => {
        vi.advanceTimersByTime(AI_MOVE_DELAY_MS) // AI responds
      })
      expect(result.current.state.moveHistory.length).toBe(3)

      // Restart the game
      act(() => {
        result.current.restart()
      })

      expect(result.current.lastAction).toBe(GAME_ACTION.RESTART)
      expect(result.current.config).toEqual(aiFirstConfig) // Config is preserved
      expect(result.current.state.moveHistory.length).toBe(0) // Board is cleared

      // Because aiFirst was true, it should immediately queue up AI's turn again on restart
      act(() => {
        vi.advanceTimersByTime(AI_MOVE_DELAY_MS)
      })
      expect(result.current.state.moveHistory.length).toBe(1)
      expect(result.current.state.moveHistory[0].playerId).toBe(aiFirstConfig.aiPlayerId)
    })

    it('should start a new game with a brand new configuration', () => {
      const { result } = renderHook(() => useConnectFour())

      expect(result.current.config.aiMode).toBe(false)

      const newConfig: GameConfig = {
        aiMode: true,
        aiPlayerId: INITIAL_PLAYERS[0].id,
        aiFirst: false,
        aiDifficulty: 4,
      }

      act(() => {
        result.current.startNewGame(newConfig)
      })

      expect(result.current.lastAction).toBe(GAME_ACTION.NEW_GAME)
      expect(result.current.config).toEqual(newConfig)
      expect(result.current.state.moveHistory.length).toBe(0)
    })
  })
})
