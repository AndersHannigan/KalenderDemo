import { useDroppable } from '@dnd-kit/core'
import { motion } from 'framer-motion'

import { type PlannerDragItem } from '../../domain/schedule/dnd.ts'
import { selectUnscheduledTaskIds } from '../../domain/schedule/selectors.ts'
import { cx } from '../../lib/cx.ts'
import {
  isTaskSelection,
  type PlannerSelection,
} from '../layout/plannerSelection.ts'
import { useSchedule } from '../schedule/useSchedule.ts'
import { PanelFrame } from '../shared/PanelFrame.tsx'
import { TaskCard } from '../shared/TaskCard.tsx'

type TasksPanelProps = {
  activeDrag: PlannerDragItem | null
  selection: PlannerSelection | null
  onOpenSelection: (selection: PlannerSelection) => void
  onSuppressSelection: () => void
}

export function TasksPanel({
  activeDrag,
  selection,
  onOpenSelection,
  onSuppressSelection,
}: TasksPanelProps) {
  const { state } = useSchedule()
  const taskIds = selectUnscheduledTaskIds(state)
  const { isOver, setNodeRef } = useDroppable({
    id: 'task-inventory',
    data: {
      type: 'task-inventory',
    },
  })

  return (
    <PanelFrame
      title="Fagkort"
      kicker={null}
      tilt="left"
      className="overflow-hidden"
    >
      <div
        ref={setNodeRef}
        className={cx(
          'inventory-dropzone flex-1 overflow-hidden',
          activeDrag?.type === 'task' && isOver && 'drop-target-valid',
        )}
      >
        <div className="inventory-scroll flex max-h-[34rem] flex-col gap-3 overflow-y-auto pr-1">
          {taskIds.length > 0 ? (
            taskIds.map((taskId) => (
              <TaskCard
                key={taskId}
                task={state.tasks[taskId]}
                activeDrag={activeDrag}
                isSelected={isTaskSelection(selection, taskId)}
                onOpenDetails={onOpenSelection}
                onSuppressSelection={onSuppressSelection}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="empty-panel-state"
            >
              <p className="scribble-label text-[1.2rem]">Alle fag er planlagt</p>
              <p className="mt-2 text-[0.95rem] text-[color:var(--foreground-soft)]">
                Dra et kort tilbake hit hvis planen endrer seg.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </PanelFrame>
  )
}
