import { TIME_BLOCKS } from '../../domain/schedule/constants.ts'
import { buildCellKey, selectPersonById } from '../../domain/schedule/selectors.ts'
import type { PlannerDragItem } from '../../domain/schedule/dnd.ts'
import {
  isRowSelection,
  isTaskSelection,
  type PlannerSelection,
} from '../layout/plannerSelection.ts'
import { useSchedule } from '../schedule/useSchedule.ts'
import { CalendarCell } from './CalendarCell.tsx'
import { RowHeaderDropZone } from './RowHeaderDropZone.tsx'

type RowLaneProps = {
  rowId: string
  cellTaskMap: Map<string, string>
  activeDrag: PlannerDragItem | null
  selection: PlannerSelection | null
  rowAssignmentTransition: {
    kind: 'assign' | 'clear'
    personId: string
    key: number
  } | null
  onClearRowAssignee: (rowId: string) => void
  onOpenSelection: (selection: PlannerSelection) => void
  onSuppressSelection: () => void
}

export function RowLane({
  rowId,
  cellTaskMap,
  activeDrag,
  selection,
  rowAssignmentTransition,
  onClearRowAssignee,
  onOpenSelection,
  onSuppressSelection,
}: RowLaneProps) {
  const { state } = useSchedule()
  const row = state.rows[rowId]
  const rowOwner = selectPersonById(state, row.assignedPersonId)

  return (
    <div className="calendar-row-grid">
      <RowHeaderDropZone
        rowId={rowId}
        activeDrag={activeDrag}
        rowAssignmentTransition={rowAssignmentTransition}
        onClearRowAssignee={onClearRowAssignee}
        isSelected={isRowSelection(selection, rowId)}
        onOpenDetails={onOpenSelection}
      />
      {TIME_BLOCKS.map((block) => (
        <CalendarCell
          key={block.key}
          rowId={rowId}
          timeKey={block.key}
          taskId={cellTaskMap.get(buildCellKey(rowId, block.key)) ?? null}
          activeDrag={activeDrag}
          rowOwned={Boolean(rowOwner)}
          isSelected={
            Boolean(cellTaskMap.get(buildCellKey(rowId, block.key))) &&
            isTaskSelection(selection, cellTaskMap.get(buildCellKey(rowId, block.key)) ?? '')
          }
          onOpenTask={onOpenSelection}
          onSuppressSelection={onSuppressSelection}
        />
      ))}
    </div>
  )
}
