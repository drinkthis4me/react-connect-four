import { useState } from 'react'
import { BoardCell } from './BoardCell'
import { motion, useReducedMotion } from 'motion/react'

import type { BoardGrid } from '@/types/connect-four/board'
import type { Move, Position } from '@/types/connect-four/game'
import type { DiscColor } from '@/types/connect-four/player'

const colorClass: Record<DiscColor, string> = {
  red: 'bg-red-400',
  yellow: 'bg-yellow-400',
}

interface GameBoardProps {
  board: BoardGrid
  currentPlayerColor: DiscColor
  winningPositions?: Position[]
  disabled?: boolean
  onColumnClick: (column: number) => void

  // Animation
  lastMove?: Move
  animatedMoveId: number | null
}

export default function GameBoard({
  board,
  currentPlayerColor,
  winningPositions = [],
  disabled = false,
  onColumnClick,
  lastMove,
  animatedMoveId,
}: GameBoardProps) {
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null)
  const shouldReduceMotion = useReducedMotion()

  const animatedMove
    = !shouldReduceMotion && animatedMoveId !== null
      ? lastMove
      : null

  function isColumnFull(column: number): boolean {
    return board[0][column] !== null
  }

  function isWinningPosition(r: number, c: number) {
    return winningPositions.some(
      p => p.row === r && p.column === c,
    )
  }

  function getPreviewRow(col: number): number {
    for (let row = board.length - 1; row >= 0; row--) {
      if (board[row][col] === null) return row
    }

    return -1
  }

  function isSameMove(row: number, col: number): boolean {
    return animatedMove?.row === row && animatedMove?.column === col
  }

  const animatedColor = animatedMove
    ? board[animatedMove.row][animatedMove.column]
    : null

  return (
    <div
      id="board-container"
      className="relative w-full max-w-5xl mx-auto"
      onMouseLeave={() => setHoveredColumn(null)}
    >
      {/* Static board */}
      <div
        id="board-grid"
        className="grid grid-cols-7 gap-2 p-4 bg-blue-600 rounded-lg"
      >
        {
          board[0].map((_el, colIdx) => {
            const isFull = isColumnFull(colIdx)

            const previewRow
              = !disabled && !isFull && hoveredColumn === colIdx
                ? getPreviewRow(colIdx)
                : -1

            return (
              <button
                id={`board-column-${colIdx}`}
                key={colIdx}
                disabled={disabled || isFull}
                onMouseEnter={() => setHoveredColumn(colIdx)}
                onClick={() => onColumnClick(colIdx)}
                className="w-full p-2 flex flex-col gap-2 items-center cursor-pointer disabled:cursor-not-allowed hover:bg-gray-500/30 rounded-xl"
                aria-label={`Drop disc in column ${colIdx + 1}`}
              >
                {
                  board.map((row, rowIdx) => {
                    const cell = row[colIdx]

                    // const isPreview
                    //   = rowIdx === previewRow && cell === null
                    const isAnimated = isSameMove(rowIdx, colIdx)

                    return (
                      <div
                        key={rowIdx}
                        className="relative"
                      >
                        <BoardCell
                          color={isAnimated ? null : cell}
                          isWinning={isWinningPosition(rowIdx, colIdx)}
                        />

                        {
                          previewRow === rowIdx && cell === null && (
                            <div className={`absolute inset-0 rounded-full ${colorClass[currentPlayerColor]} opacity-80`} />
                          )
                        }
                      </div>
                    )
                  })
                }
              </button>
            )
          })
        }
      </div>

      {/* Animation layer */}
      {
        animatedMove && animatedColor && (
          <div
            id="animation-game-board"
            className="absolute inset-0 grid grid-cols-7 gap-2 p-4 pointer-events-none"
          >
            <div
              id="animation-column"
              className="w-full p-2 flex flex-col items-center"
              style={{ gridColumn: animatedMove.column + 1 }}
            >
              <motion.div
                id="animation-disc"
                key={`${animatedMove.row}-${animatedMove.column}-${animatedMove.playerId}`}
                initial={{ y: 0 }}
                animate={{
                  y: [
                    0,
                    `calc(${animatedMove.row} * (100% + 8px))`,
                    `calc(${animatedMove.row} * (100% + 8px) - 24px)`,
                    `calc(${animatedMove.row} * (100% + 8px)`,
                    `calc(${animatedMove.row} * (100% + 8px) - 15px)`,
                    `calc(${animatedMove.row} * (100% + 8px))`,
                  ],
                }}
                transition={{
                  duration: 0.55,
                  times: [0, 0.72, 0.82, 0.9, 0.95, 1],
                  ease: 'easeIn',
                }}
                className={`aspect-square size-8 rounded-full border border-slate-900 ${colorClass[animatedColor]}`}
              />
            </div>
          </div>
        )
      }
    </div>
  )
}
