import { useDroppable } from '@dnd-kit/core'
import { AnimatePresence, motion } from 'framer-motion'
import type { KeyboardEvent } from 'react'

import { canDropOnTarget, type PlannerDragItem } from '../../domain/schedule/dnd.ts'
import {
  selectPersonById,
  selectRowDisplayName,
} from '../../domain/schedule/selectors.ts'
import { cx } from '../../lib/cx.ts'
import { useSchedule } from '../schedule/useSchedule.ts'
import type { PlannerSelection } from '../layout/plannerSelection.ts'

type RowHeaderDropZoneProps = {
  rowId: string
  activeDrag: PlannerDragItem | null
  rowAssignmentTransition: {
    kind: 'assign' | 'clear'
    personId: string
    key: number
  } | null
  onClearRowAssignee: (rowId: string) => void
  isSelected: boolean
  onOpenDetails: (selection: PlannerSelection) => void
}

export function RowHeaderDropZone({
  rowId,
  activeDrag,
  rowAssignmentTransition,
  onClearRowAssignee,
  isSelected,
  onOpenDetails,
}: RowHeaderDropZoneProps) {
  const { state } = useSchedule()
  const row = state.rows[rowId]
  const assignedPerson = selectPersonById(state, row.assignedPersonId)
  const transitionPerson = selectPersonById(state, rowAssignmentTransition?.personId ?? null)
  const displayName = selectRowDisplayName(state, row.id)
  const { isOver, setNodeRef } = useDroppable({
    id: `row-header:${row.id}`,
    data: {
      type: 'row-header',
      rowId: row.id,
    },
  })

  const canAcceptPerson =
    activeDrag?.type === 'person' &&
    canDropOnTarget(state, activeDrag, { type: 'row-header', rowId: row.id })
  const showPersonDropReady = Boolean(canAcceptPerson)

  const openDetails = () => {
    onOpenDetails({ kind: 'row', rowId: row.id })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    openDetails()
  }

  const animatedPerson =
    rowAssignmentTransition?.kind === 'clear' ? transitionPerson : assignedPerson
  const shouldAnimateAssignment =
    rowAssignmentTransition?.kind === 'assign' &&
    Boolean(assignedPerson) &&
    rowAssignmentTransition.personId === assignedPerson?.id
  const shouldAnimateClear =
    rowAssignmentTransition?.kind === 'clear' &&
    Boolean(transitionPerson)

  const avatar = animatedPerson ? (
    <motion.div
      key={`${row.id}-${animatedPerson.id}`}
      layout
      layoutId={`row-owner-${row.id}`}
      className="row-owner-avatar-shell"
      title={animatedPerson.name}
      role="img"
      aria-label={`Lane owner: ${animatedPerson.name}`}
      initial={
        shouldAnimateAssignment
          ? { x: 88, opacity: 0.92, scale: 0.92, rotate: 5 }
          : { x: 0, opacity: 1, scale: 1, rotate: 0 }
      }
      animate={
        shouldAnimateClear
          ? { x: 88, opacity: 0, scale: 0.92, rotate: -5 }
          : { x: 0, opacity: 1, scale: 1, rotate: 0 }
      }
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
    >
      <span className="row-owner-avatar">{animatedPerson.avatarInitials}</span>
      {assignedPerson ? (
        <button
          type="button"
          className="row-owner-avatar__clear"
          onPointerDown={(event) => {
            event.preventDefault()
            event.stopPropagation()
          }}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onClearRowAssignee(row.id)
          }}
          aria-label="Clear row assignee"
        >
          <span aria-hidden="true">x</span>
        </button>
      ) : null}
    </motion.div>
  ) : null

  return (
    <motion.div
      layout
      ref={setNodeRef}
      className={cx(
        'row-header-dropzone',
        row.assignedPersonId && 'row-header-dropzone--owned',
        showPersonDropReady && 'drop-target-ready',
        canAcceptPerson && isOver && 'drop-target-valid',
        isSelected && 'selection-active',
      )}
      aria-label={`Assign person to ${displayName}`}
    >
      <motion.div
        layout
        role="button"
        tabIndex={0}
        className="row-header-button"
        onClick={openDetails}
        onKeyDown={handleKeyDown}
        aria-label={`Open ${displayName} details`}
        aria-haspopup="dialog"
        aria-expanded={isSelected}
      >
        <div className="row-header-main">
          <div className="row-header-avatar-slot row-header-avatar-slot--lead">
            {avatar}
          </div>
          <div className="min-w-0 flex-1">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={displayName}
                layout
                initial={{ opacity: 0, y: 8, rotate: -1.2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -8, rotate: 1.2 }}
                transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                className="scribble-label row-header-title truncate"
                title={displayName}
              >
                {displayName}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
        <div className="row-header-avatar-slot row-header-avatar-slot--trail">
          {!animatedPerson ? (
            <span
              className={cx(
                'row-drop-hint',
                showPersonDropReady && 'row-drop-hint--ready',
                canAcceptPerson && isOver && 'row-drop-hint--active',
              )}
            >
              {showPersonDropReady ? 'Drop person' : '+ Assign'}
            </span>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  )
}
