import { cx } from '../../lib/cx.ts'

type EmptyCellStateProps = {
  isTaskDragActive: boolean
  canAcceptTask: boolean
}

export function EmptyCellState({
  isTaskDragActive,
  canAcceptTask,
}: EmptyCellStateProps) {
  return (
    <div
      className={cx(
        'empty-cell-state',
        isTaskDragActive && canAcceptTask && 'empty-cell-state--ready',
      )}
    >
      {isTaskDragActive && canAcceptTask ? (
        <span className="scribble-label text-[0.98rem]">Drop task here</span>
      ) : (
        <>
          <span aria-hidden="true" className="empty-cell-state__dot" />
        </>
      )}
    </div>
  )
}
