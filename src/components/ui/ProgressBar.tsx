'use client'

interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[11px] font-medium text-gray-400 tabular-nums">{pct}%</span>
      <div className="flex-1 h-[3px] bg-[#ECECEC] rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
