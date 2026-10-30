// @vitest-environment happy-dom

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useConnectFour } from './useConnectFour'
import { INITIAL_PLAYERS } from '@/constants/connect-four/player'

describe('useConnectFour.ts', () => {
  it('should initialize with a fresh game state', () => {
    const { result } = renderHook(() => useConnectFour())

    expect(result.current.state.status).toBe('playing')
    expect(result.current.state.moveHistory).toEqual([])

    // Use type assertion or status check for currentPlayerId
    if (result.current.state.status === 'playing') {
      expect(result.current.state.currentPlayerId).toBe(INITIAL_PLAYERS[0].id)
    }
  })

  it('should play a move successfully and update state', () => {
    const { result } = renderHook(() => useConnectFour())

    // Wrap state-updating functions in `act`
    act(() => {
      result.current.playMove(3)
    })

    expect(result.current.state.moveHistory.length).toBe(1)
    expect(result.current.state.moveHistory[0].column).toBe(3)
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
