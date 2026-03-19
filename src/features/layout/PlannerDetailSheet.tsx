import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'

import { TIME_BLOCKS } from '../../domain/schedule/constants.ts'
import {
  selectEffectiveTaskAssignee,
  selectEffectiveTaskAssignmentMode,
  selectPersonById,
  selectRowDisplayName,
  selectTasksForRow,
} from '../../domain/schedule/selectors.ts'
import { useSchedule } from '../schedule/useSchedule.ts'
import { AssigneeBadge } from '../shared/AssigneeBadge.tsx'
import type { PlannerSelection } from './plannerSelection.ts'

type PlannerDetailSheetProps = {
  selection: PlannerSelection | null
  onClose: () => void
  onClearRowAssignee: (rowId: string) => void
  onSelectTask: (taskId: string) => void
}

function getTimeBlockLabel(timeKey: string) {
  return TIME_BLOCKS.find((block) => block.key === timeKey)?.label ?? timeKey
}

export function PlannerDetailSheet({
  selection,
  onClose,
  onClearRowAssignee,
  onSelectTask,
}: PlannerDetailSheetProps) {
  const { state, dispatch } = useSchedule()
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!selection) {
      return
    }

    closeButtonRef.current?.focus()
  }, [selection])

  useEffect(() => {
    if (!selection) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, selection])

  let title = ''
  let body: ReactNode = null

  if (selection?.kind === 'task') {
    const task = state.tasks[selection.taskId]

    if (task) {
      const rowDisplayName =
        task.location.kind === 'calendar' ? selectRowDisplayName(state, task.location.rowId) : null
      const effectiveAssignee = selectEffectiveTaskAssignee(state, task.id)
      const assignmentMode = selectEffectiveTaskAssignmentMode(state, task.id)
      const scheduledLocation = task.location.kind === 'calendar' ? task.location : null
      const isScheduled = scheduledLocation !== null
      const detailScope =
        assignmentMode === 'row'
          ? 'inherited'
          : assignmentMode === 'task'
            ? 'task'
            : 'empty'

      title = task.title
      body = (
        <div className="detail-sheet__stack">
          <div className="detail-sheet__block">
            <p className="panel-kicker">Status</p>
            <p className="detail-sheet__lead">
              {isScheduled
                ? `${rowDisplayName ?? 'Lane'} · ${getTimeBlockLabel(scheduledLocation.timeKey)}`
                : 'Waiting in the task inventory'}
            </p>
          </div>

          {isScheduled ? (
            <div className="detail-sheet__block">
              <p className="panel-kicker">Assignment</p>
              <AssigneeBadge person={effectiveAssignee} scope={detailScope} />
              <p className="detail-sheet__copy">
                {assignmentMode === 'row'
                  ? `This task inherits its assignee from ${rowDisplayName ?? 'the row'}.`
                  : assignmentMode === 'task'
                    ? 'This task is assigned directly.'
                    : 'No person is assigned to this task yet.'}
              </p>
              {assignmentMode === 'task' ? (
                <button
                  type="button"
                  className="detail-sheet__action"
                  onClick={() => dispatch({ type: 'clearTaskAssignee', taskId: task.id })}
                >
                  Clear task assignee
                </button>
              ) : null}
            </div>
          ) : (
            <div className="detail-sheet__block">
              <p className="panel-kicker">Next move</p>
              <p className="detail-sheet__copy">
                Drag this card into any empty calendar cell to schedule it.
              </p>
            </div>
          )}
        </div>
      )
    }
  }

  if (selection?.kind === 'row') {
    const row = state.rows[selection.rowId]

    if (row) {
      const rowAssignee = selectPersonById(state, row.assignedPersonId)
      const rowTasks = selectTasksForRow(state, row.id)
      const rowDisplayName = selectRowDisplayName(state, row.id)

      title = rowDisplayName
      body = (
        <div className="detail-sheet__stack">
          <div className="detail-sheet__block">
            <p className="panel-kicker">Row assignment</p>
            <AssigneeBadge person={rowAssignee} scope={rowAssignee ? 'row' : 'empty'} />
            <p className="detail-sheet__copy">
              {rowAssignee
                ? 'This person controls every task in the row until the row assignment is cleared.'
                : 'Drop a person onto the row header to assign the entire lane.'}
            </p>
            {rowAssignee ? (
              <button
                type="button"
                className="detail-sheet__action"
                onClick={() => onClearRowAssignee(row.id)}
              >
                Clear row assignee
              </button>
            ) : null}
          </div>

          <div className="detail-sheet__block">
            <p className="panel-kicker">Scheduled tasks</p>
            {rowTasks.length > 0 ? (
              <div className="detail-sheet__list">
                {rowTasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    className="detail-sheet__list-item"
                    onClick={() => onSelectTask(task.id)}
                  >
                    <span className="detail-sheet__list-time">{task.location.timeKey}</span>
                    <span className="truncate">{task.title}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="detail-sheet__copy">No tasks are scheduled in this row.</p>
            )}
          </div>
        </div>
      )
    }
  }

  return (
    <AnimatePresence>
      {selection && body ? (
        <>
          <motion.button
            key="planner-detail-backdrop"
            type="button"
            aria-label="Close details"
            className="planner-detail-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            onClick={onClose}
          />
          <motion.aside
            key="planner-detail-sheet"
            role="dialog"
            aria-modal="false"
            aria-labelledby="planner-detail-title"
            className="planner-detail-sheet"
            initial={{ opacity: 0, x: 24, y: 18 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 18, y: 12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="detail-sheet__topbar">
              <div>
                <p className="panel-kicker">Details</p>
                <h3 id="planner-detail-title" className="scribble-label text-[1.6rem] leading-none">
                  {title}
                </h3>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                className="detail-sheet__close"
                onClick={onClose}
              >
                Close
              </button>
            </div>
            {body}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}
