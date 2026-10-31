import { useState } from 'react'
import { BoardCell } from './BoardCell'

import type { BoardGrid } from '@/types/connect-four/board'
import type { Position } from '@/types/connect-four/game'
import type { DiscColor } from '@/types/connect-four/player'

interface GameBoardProps {
  board: BoardGrid
  currentPlayerColor: DiscColor
  winningPositions?: Position[]
  disabled?: boolean
  onColumnClick: (column: number) => void
}

export default function GameBoard({
  board,
  currentPlayerColor,
  winningPositions = [],
  disabled = false,
  onColumnClick,
}: GameBoardProps) {
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null)

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

  return (
    <div
      className="w-full max-w-5xl mx-auto"
      onMouseLeave={() => setHoveredColumn(null)}
    >
      <div className="p-4 grid grid-cols-7 place-items-center gap-1 bg-blue-600 rounded-lg md:gap-2">
        {
          board[0].map((_el, colIdx) => {
            const isFull = isColumnFull(colIdx)
            const previewRow
              = !disabled && !isFull && hoveredColumn === colIdx
                ? getPreviewRow(colIdx)
                : -1

            return (
              <button
                key={colIdx}
                disabled={disabled || isFull}
                onMouseEnter={() => setHoveredColumn(colIdx)}
                onClick={() => onColumnClick(colIdx)}
                className="p-2 flex flex-col gap-2 cursor-pointer disabled:cursor-not-allowed hover:bg-gray-500/30 rounded-xl"
                aria-label={`Drop disc in column ${colIdx + 1}`}
              >
                {
                  board.map((row, rowIdx) => {
                    const cell = row[colIdx]

                    const isPreview
                      = rowIdx === previewRow && cell === null

                    return (
                      <BoardCell
                        key={rowIdx}
                        color={cell}
                        isWinning={isWinningPosition(rowIdx, colIdx)}
                        isPreview={isPreview}
                        previewColor={currentPlayerColor}
                      />
                    )
                  })
                }
              </button>
            )
          })
        }
      </div>
    </div>
  )
}
