import { cx } from '../../lib/cx.ts'

type EmptyCellStateProps = {
  isTaskDragActive: boolean
  canAcceptTask: boolean
}

export function EmptyCellState({
  isTaskDragActive,
  canAcceptTask,
}: EmptyCellStateProps) {
  const isReady = isTaskDragActive && canAcceptTask

  return (
    <div
      className={cx(
        'empty-cell-state',
        isReady && 'empty-cell-state--ready',
      )}
      data-testid="empty-cell-state"
      data-ready={isReady ? 'true' : 'false'}
    >
      <svg
        aria-hidden="true"
        data-testid="empty-cell-glyph"
        viewBox="0 0 24 24"
        className="empty-cell-state__glyph"
        focusable="false"
      >
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M16 13l6.964 4.062-2.973.85 2.125 3.681-1.732 1-2.125-3.68-2.223 2.15L16 13zm-2-7h2v2h5a1 1 0 0 1 1 1v4h-2v-3H10v10h4v2H9a1 1 0 0 1-1-1v-5H6v-2h2V9a1 1 0 0 1 1-1h5V6zM4 14v2H2v-2h2zm0-4v2H2v-2h2zm0-4v2H2V6h2zm0-4v2H2V2h2zm4 0v2H6V2h2zm4 0v2h-2V2h2zm4 0v2h-2V2h2z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  )
}
