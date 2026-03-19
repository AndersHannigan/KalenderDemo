import type { TimeBlock } from '../../domain/schedule/types.ts'

type TimeHeaderProps = {
  block: TimeBlock
}

export function TimeHeader({ block }: TimeHeaderProps) {
  return (
    <div className="time-header-cell">
      <span className="scribble-label text-[1rem] leading-none">{block.label}</span>
    </div>
  )
}
