import type { BoardGrid } from './board'
import type { Player, PlayerId } from './player'

export interface Position {
  row: number
  column: number
}

export interface Move {
  playerId: PlayerId
  row: number
  column: number
}

export interface PlayingState {
  status: 'playing'
  currentPlayerId: PlayerId
}

export interface WonState {
  status: 'won'
  winnerId: PlayerId
  winningPositions: Position[]
}

export interface DrawState {
  status: 'draw'
}

export type GameOutcome = PlayingState | WonState | DrawState

export interface GameData {
  board: BoardGrid
  players: [Player, Player]
  moveHistory: Move[]
}

export type GameState = GameData & GameOutcome
