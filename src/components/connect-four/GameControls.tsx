import { aiDifficultyOptions } from '@/constants/connect-four/config'
import type { AiDifficulty } from '@/types/connect-four/config'

interface GameControlsProps {
  undoDisabled: boolean
  onUndo: () => void

  onRestart: () => void
  onNewGame: () => void

  aiMode: boolean
  onAiModeChange: (enabled: boolean) => void

  aiFirst: boolean
  onAiFirstChange: (enabled: boolean) => void

  aiDifficulty: AiDifficulty
  onAiDifficultyChange: (difficulty: AiDifficulty) => void
}

export default function GameControls({
  undoDisabled,
  onUndo,
  onRestart,
  onNewGame,
  aiMode,
  onAiModeChange,
  aiFirst,
  onAiFirstChange,
  aiDifficulty,
  onAiDifficultyChange,
}: GameControlsProps) {
  return (
    <section className="mx-auto py-4 w-full max-w-xl space-y-5">
      {/* Game actions */}
      <div className="flex gap-4">
        <button
          disabled={undoDisabled}
          onClick={onUndo}
          className="
            flex-1 rounded-lg border border-slate-300
            bg-white px-4 py-2.5 font-medium text-slate-700
            transition-colors hover:bg-slate-100
            focus-visible:outline-2 focus-visible:outline-offset-2
            focus-visible:outline-blue-600
            disabled:cursor-not-allowed disabled:opacity-40
            dark:border-slate-600 dark:bg-slate-800
            dark:text-slate-100 dark:hover:bg-slate-700
          "
        >
          Undo
        </button>

        <button
          onClick={onRestart}
          className="
            flex-1 rounded-lg bg-blue-600 px-4 py-2.5
            font-medium text-white transition-colors
            hover:bg-blue-700
            focus-visible:outline-2 focus-visible:outline-offset-2
            focus-visible:outline-blue-600
          "
        >
          Restart
        </button>

        <button
          onClick={onNewGame}
          className="
            flex-1 rounded-lg bg-blue-600 px-4 py-2.5
            font-medium text-white transition-colors
            hover:bg-blue-700
            focus-visible:outline-2 focus-visible:outline-offset-2
            focus-visible:outline-blue-600
          "
        >
          + New Game
        </button>
      </div>

      {/* AI settings */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          New Game Settings
        </h2>

        <div className="space-y-4">
          <label
            htmlFor="ai-mode"
            className="flex cursor-pointer items-center justify-between gap-4"
          >
            <span className="font-medium text-slate-800 dark:text-slate-100">
              Play against AI
            </span>

            <input
              id="ai-mode"
              type="checkbox"
              checked={aiMode}
              onChange={event =>
                onAiModeChange(event.target.checked)}
              className="size-4 accent-blue-600"
            />
          </label>

          <div className="border-t border-slate-100 dark:border-slate-700" />

          <label
            htmlFor="ai-first"
            className={`flex items-center justify-between gap-4 ${
              !aiMode ? 'opacity-50' : 'cursor-pointer'
            }`}
          >
            <span className="text-sm text-slate-700 dark:text-slate-200">
              AI goes first
            </span>

            <input
              id="ai-first"
              type="checkbox"
              checked={aiFirst}
              disabled={!aiMode}
              onChange={event =>
                onAiFirstChange(event.target.checked)}
              className="size-4 accent-blue-600"
            />
          </label>

          <label
            htmlFor="ai-difficulty"
            className={`flex items-center justify-between gap-4 ${
              !aiMode ? 'opacity-50' : ''
            }`}
          >
            <span className="text-sm text-slate-700 dark:text-slate-200">
              AI difficulty
            </span>

            <select
              id="ai-difficulty"
              value={aiDifficulty}
              disabled={!aiMode}
              onChange={event =>
                onAiDifficultyChange(
                  Number(event.target.value) as AiDifficulty,
                )}
              className="
                rounded-lg border border-slate-300 bg-white
                px-3 py-2 text-sm text-slate-800
                focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-blue-600
                disabled:cursor-not-allowed
                dark:border-slate-600 dark:bg-slate-900
                dark:text-slate-100
              "
            >
              {aiDifficultyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </section>
  )
}
