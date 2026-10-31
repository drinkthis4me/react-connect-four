import ThemeToggle from '../ThemeToggle'

export default function GameHeader() {
  return (
    <div className="w-full px-2 py-4 lg:px-4 flex justify-between items-center">
      <h1 className="text-3xl font-bold text-center dark:text-white">
        Connect Four
      </h1>
      <ThemeToggle />
    </div>
  )
}
