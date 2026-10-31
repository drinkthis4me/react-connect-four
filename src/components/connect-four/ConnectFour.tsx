import type { DiscColor } from '@/types/connect-four/player'
import GameBoard from './GameBoard'
import GameHeader from './GameHeader'
import { useConnectFour } from '@/hooks/useConnectFour'

export default function ConnectFour() {
  const {
    state,
    lastAction,
    moveId,
    playMove,
    undo,
    restart,
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

  return (
    <div className="mx-auto max-w-3xl px-4 lg:px-8 space-y-6">
      <GameHeader />

      {/* Game Info */}
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

      {/* Game controls */}
      <div className="flex justify-center gap-4">
        <button
          disabled={state.moveHistory.length === 0}
          onClick={undo}
          className="rounded bg-slate-200 px-4 py-2 disabled:opacity-50"
        >
          Undo
        </button>

        <button
          onClick={restart}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Restart
        </button>
      </div>
    </div>
  )
}
