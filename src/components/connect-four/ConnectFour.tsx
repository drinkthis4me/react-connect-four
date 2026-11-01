import { useState } from 'react'
import { useConnectFour } from '@/hooks/useConnectFour'
import { INITIAL_PLAYERS } from '@/constants/connect-four/player'
import GameBoard from './GameBoard'
import GameHeader from './GameHeader'
import GameControls from './GameControls'

import type { DiscColor } from '@/types/connect-four/player'
import type { AiDifficulty, GameConfig } from '@/types/connect-four/config'

export default function ConnectFour() {
  const [aiMode, setAiMode] = useState(false)
  const [aiFirst, setAiFirst] = useState(false)
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>(4)
  const {
    state,
    lastAction,
    moveId,
    playMove,
    undo,
    restart,
    startNewGame,
  } = useConnectFour()

  const isGameOver = state.status !== 'playing'

  const winningPositions = state.status === 'won' ? state.winningPositions : []

  const currentPlayer = state.status !== 'draw'
    ? state.players.find((p) => {
      const targetPlayerId = state.status === 'playing' ? state.currentPlayerId : state.winnerId
      return p.id === targetPlayerId
    })?.color.toUpperCase() ?? 'n/a'
    : ''

  const gameInfo: string
    = state.status === 'playing'
      ? `Current player: ${currentPlayer}`
      : state.status === 'won'
        ? `Winner: ${currentPlayer}`
        : 'Draw'

  const currentPlayerColor: DiscColor
    = state.status === 'playing'
      ? state.players.find(p => p.id === state.currentPlayerId)!.color
      : state.players[0].color

  const animatedMoveId
    = lastAction === 'PLAY_MOVE'
      ? moveId
      : null

  function handleNewGame() {
    const newGameConfig: GameConfig = {
      aiMode,
      aiDifficulty,
      aiFirst,
      aiPlayerId: INITIAL_PLAYERS[aiFirst ? 0 : 1].id,
    }
    startNewGame(newGameConfig)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 lg:px-8 space-y-6">
      <GameHeader />

      <div>
        <p className="text-center dark:text-white">
          {gameInfo}
        </p>
      </div>

      <GameBoard
        board={state.board}
        currentPlayerColor={currentPlayerColor}
        winningPositions={winningPositions}
        lastMove={state.moveHistory.at(-1)}
        animatedMoveId={animatedMoveId}
        disabled={isGameOver}
        onColumnClick={playMove}
      />

      <GameControls
        undoDisabled={state.moveHistory.length === 0}
        onUndo={undo}
        onRestart={restart}
        onNewGame={handleNewGame}
        aiMode={aiMode}
        onAiModeChange={setAiMode}
        aiFirst={aiFirst}
        onAiFirstChange={setAiFirst}
        aiDifficulty={aiDifficulty}
        onAiDifficultyChange={setAiDifficulty}
      />
    </div>
  )
}
