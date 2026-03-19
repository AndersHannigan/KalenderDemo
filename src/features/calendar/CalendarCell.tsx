import { useDroppable } from '@dnd-kit/core'

import { canDropOnTarget, type PlannerDragItem } from '../../domain/schedule/dnd.ts'
import type { TimeKey } from '../../domain/schedule/types.ts'
import { cx } from '../../lib/cx.ts'
import { useSchedule } from '../schedule/useSchedule.ts'
import type { PlannerSelection } from '../layout/plannerSelection.ts'
import { TaskCard } from '../shared/TaskCard.tsx'
import { EmptyCellState } from './EmptyCellState.tsx'

type CalendarCellProps = {
  rowId: string
  timeKey: TimeKey
  taskId: string | null
  activeDrag: PlannerDragItem | null
  rowOwned: boolean
  isSelected: boolean
  onOpenTask: (selection: PlannerSelection) => void
  onSuppressSelection: () => void
}

export function CalendarCell({
  rowId,
  timeKey,
  taskId,
  activeDrag,
  rowOwned,
  isSelected,
  onOpenTask,
  onSuppressSelection,
}: CalendarCellProps) {
  const { state } = useSchedule()
  const { isOver, setNodeRef } = useDroppable({
    id: `calendar-cell:${rowId}:${timeKey}`,
    data: {
      type: 'calendar-cell',
      rowId,
      timeKey,
    },
  })

  const canAcceptTask =
    activeDrag?.type === 'task' &&
    canDropOnTarget(state, activeDrag, {
      type: 'calendar-cell',
      rowId,
      timeKey,
    })

  const isTaskDragActive = activeDrag?.type === 'task'
  const task = taskId ? state.tasks[taskId] : null

  return (
    <div
      ref={setNodeRef}
      className={cx(
        'calendar-cell',
        rowOwned && 'calendar-cell--owned',
        !task && isSelected && 'selection-active',
        isTaskDragActive && isOver && canAcceptTask && 'drop-target-valid',
        isTaskDragActive && isOver && !canAcceptTask && 'drop-target-invalid',
      )}
    >
      {task ? (
        <TaskCard
          task={task}
          activeDrag={activeDrag}
          isSelected={isSelected}
          onOpenDetails={onOpenTask}
          onSuppressSelection={onSuppressSelection}
        />
      ) : (
        <EmptyCellState
          isTaskDragActive={Boolean(isTaskDragActive)}
          canAcceptTask={Boolean(canAcceptTask)}
        />
      )}
    </div>
  )
}
