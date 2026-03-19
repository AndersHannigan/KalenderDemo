import { motion } from 'framer-motion'

import { TIME_BLOCKS } from '../../domain/schedule/constants.ts'
import { selectCellTaskIdMap } from '../../domain/schedule/selectors.ts'
import type { PlannerDragItem } from '../../domain/schedule/dnd.ts'
import { PlannerDetailSheet } from '../layout/PlannerDetailSheet.tsx'
import type { PlannerSelection } from '../layout/plannerSelection.ts'
import { useSchedule } from '../schedule/useSchedule.ts'
import { RowLane } from './RowLane.tsx'
import { TimeHeader } from './TimeHeader.tsx'

type CalendarGridProps = {
  activeDrag: PlannerDragItem | null
  selection: PlannerSelection | null
  rowAssignmentTransitions: Record<
    string,
    {
      kind: 'assign' | 'clear'
      personId: string
      key: number
    }
  >
  onClearRowAssignee: (rowId: string) => void
  onOpenSelection: (selection: PlannerSelection) => void
  onCloseSelection: () => void
  onSuppressSelection: () => void
}

export function CalendarGrid({
  activeDrag,
  selection,
  rowAssignmentTransitions,
  onClearRowAssignee,
  onOpenSelection,
  onCloseSelection,
  onSuppressSelection,
}: CalendarGridProps) {
  const { state } = useSchedule()
  const cellTaskMap = selectCellTaskIdMap(state)

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className="flex min-h-[44rem] flex-col"
    >
      <div className="planner-grid-frame relative flex-1 overflow-hidden rounded-[28px] border-[2px] border-[var(--border)] bg-[var(--paper-strong)]">
        <div className="h-full overflow-auto px-3 py-3 md:px-4">
          <div className="calendar-board min-w-[72rem]">
            <div className="calendar-header-grid">
              <div aria-hidden="true" className="calendar-header-spacer" />
              {TIME_BLOCKS.map((block) => (
                <TimeHeader key={block.key} block={block} />
              ))}
            </div>

            <div className="mt-3 space-y-3">
              {state.rowOrder.map((rowId) => (
                <RowLane
                  key={rowId}
                  rowId={rowId}
                  cellTaskMap={cellTaskMap}
                  activeDrag={activeDrag}
                  selection={selection}
                  rowAssignmentTransition={rowAssignmentTransitions[rowId] ?? null}
                  onClearRowAssignee={onClearRowAssignee}
                  onOpenSelection={onOpenSelection}
                  onSuppressSelection={onSuppressSelection}
                />
              ))}
            </div>
          </div>
        </div>
        <PlannerDetailSheet
          selection={selection}
          onClose={onCloseSelection}
          onClearRowAssignee={onClearRowAssignee}
          onSelectTask={(taskId) => onOpenSelection({ kind: 'task', taskId })}
        />
      </div>
    </motion.section>
  )
}
