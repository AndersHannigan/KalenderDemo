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
                ? `${rowDisplayName ?? 'Raden'} · ${getTimeBlockLabel(scheduledLocation.timeKey)}`
                : 'Ligger i faglisten'}
            </p>
          </div>

          {isScheduled ? (
            <div className="detail-sheet__block">
              <p className="panel-kicker">Tildeling</p>
              <AssigneeBadge person={effectiveAssignee} scope={detailScope} />
              <p className="detail-sheet__copy">
                {assignmentMode === 'row'
                  ? `Dette kortet arver ansvarlig person fra ${rowDisplayName ?? 'raden'}.`
                  : assignmentMode === 'task'
                    ? 'Dette kortet er tildelt direkte.'
                    : 'Ingen person er tildelt dette kortet ennå.'}
              </p>
              {assignmentMode === 'task' ? (
                <button
                  type="button"
                  className="detail-sheet__action"
                  onClick={() => dispatch({ type: 'clearTaskAssignee', taskId: task.id })}
                >
                  Fjern ansvarlig
                </button>
              ) : null}
            </div>
          ) : (
            <div className="detail-sheet__block">
              <p className="panel-kicker">Neste steg</p>
              <p className="detail-sheet__copy">
                Dra dette kortet inn i en tom celle for å planlegge det.
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
            <p className="panel-kicker">Radtildeling</p>
            <AssigneeBadge person={rowAssignee} scope={rowAssignee ? 'row' : 'empty'} />
            <p className="detail-sheet__copy">
              {rowAssignee
                ? 'Denne personen styrer alle kortene i raden til radtildelingen fjernes.'
                : 'Slipp en person på radoverskriften for å tildele hele raden.'}
            </p>
            {rowAssignee ? (
              <button
                type="button"
                className="detail-sheet__action"
                onClick={() => onClearRowAssignee(row.id)}
              >
                Fjern radansvarlig
              </button>
            ) : null}
          </div>

          <div className="detail-sheet__block">
            <p className="panel-kicker">Planlagte fag</p>
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
              <p className="detail-sheet__copy">Ingen fag er planlagt på denne raden.</p>
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
            aria-label="Lukk detaljer"
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
                <p className="panel-kicker">Detaljer</p>
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
                Lukk
              </button>
            </div>
            {body}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}
