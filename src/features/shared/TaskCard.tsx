import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

import {
  canDropOnTarget,
  createTaskDragItem,
  type PlannerDragItem,
} from '../../domain/schedule/dnd.ts'
import {
  selectCanAssignPersonToTask,
  selectEffectiveTaskAssignee,
  selectEffectiveTaskAssignmentMode,
} from '../../domain/schedule/selectors.ts'
import type { Task } from '../../domain/schedule/types.ts'
import { cx } from '../../lib/cx.ts'
import { useSchedule } from '../schedule/useSchedule.ts'
import type { PlannerSelection } from '../layout/plannerSelection.ts'
import { AssigneeBadge } from './AssigneeBadge.tsx'

type TaskCardProps = {
  task: Task
  activeDrag: PlannerDragItem | null
  isSelected: boolean
  onOpenDetails: (selection: PlannerSelection) => void
  onSuppressSelection: () => void
}

export function TaskCard({
  task,
  activeDrag,
  isSelected,
  onOpenDetails,
  onSuppressSelection,
}: TaskCardProps) {
  const { state, dispatch } = useSchedule()
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const suppressClickRef = useRef(false)
  const cleanupPointerListenersRef = useRef<(() => void) | null>(null)
  const personDropEnabled = selectCanAssignPersonToTask(state, task.id)
  const effectiveAssignee = selectEffectiveTaskAssignee(state, task.id)
  const assignmentMode = selectEffectiveTaskAssignmentMode(state, task.id)
  const isScheduled = task.location.kind === 'calendar'

  useEffect(() => {
    return () => {
      cleanupPointerListenersRef.current?.()
    }
  }, [])

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `task:${task.id}`,
    data: createTaskDragItem(task),
  })

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `task-card:${task.id}`,
    data: { type: 'task-card', taskId: task.id },
    disabled: !personDropEnabled,
  })

  const setNodeRef = (node: HTMLDivElement | null) => {
    setDraggableRef(node)
    setDroppableRef(node)
  }

  const canAcceptPerson =
    activeDrag?.type === 'person' &&
    canDropOnTarget(state, activeDrag, { type: 'task-card', taskId: task.id })
  const showPersonDropReady = Boolean(canAcceptPerson)

  const badgeScope =
    assignmentMode === 'row'
      ? 'inherited'
      : assignmentMode === 'task'
        ? 'task'
        : 'empty'
  const canClearDirectAssignee = assignmentMode === 'task'

  const markDragGesture = (clientX: number, clientY: number) => {
    if (!pointerStartRef.current) {
      return
    }

    const deltaX = Math.abs(clientX - pointerStartRef.current.x)
    const deltaY = Math.abs(clientY - pointerStartRef.current.y)

    if (deltaX > 4 || deltaY > 4) {
      if (!suppressClickRef.current) {
        onSuppressSelection()
      }
      suppressClickRef.current = true
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        touchAction: 'none',
      }}
      className={cx('h-full', isDragging && 'opacity-0')}
    >
      <motion.article
        layout
        initial={false}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        whileHover={isDragging ? undefined : { y: -2, rotate: isScheduled ? -0.8 : 0.8 }}
        whileTap={isDragging ? undefined : { x: 1, y: 1, scale: 0.99 }}
        onPointerDown={(event) => {
          suppressClickRef.current = false
          pointerStartRef.current = {
            x: event.clientX,
            y: event.clientY,
          }

          cleanupPointerListenersRef.current?.()

          const handlePointerMove = (moveEvent: PointerEvent) => {
            markDragGesture(moveEvent.clientX, moveEvent.clientY)
          }

          const handlePointerEnd = () => {
            window.removeEventListener('pointermove', handlePointerMove)
            window.removeEventListener('pointerup', handlePointerEnd)
            window.removeEventListener('pointercancel', handlePointerEnd)
            cleanupPointerListenersRef.current = null
            pointerStartRef.current = null
          }

          cleanupPointerListenersRef.current = () => {
            window.removeEventListener('pointermove', handlePointerMove)
            window.removeEventListener('pointerup', handlePointerEnd)
            window.removeEventListener('pointercancel', handlePointerEnd)
          }

          window.addEventListener('pointermove', handlePointerMove)
          window.addEventListener('pointerup', handlePointerEnd)
          window.addEventListener('pointercancel', handlePointerEnd)
        }}
        onPointerMove={(event) => {
          markDragGesture(event.clientX, event.clientY)
        }}
        onClick={(event) => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false
            event.preventDefault()
            event.stopPropagation()
            return
          }

          onOpenDetails({ kind: 'task', taskId: task.id })
        }}
        className={cx(
          'paper-card paper-card-lift task-card h-full min-h-[4.2rem] cursor-grab p-2 active:cursor-grabbing',
          isScheduled ? 'task-card--scheduled' : 'task-card--inventory',
          showPersonDropReady && 'drop-target-ready',
          canAcceptPerson && isOver && 'drop-target-valid',
          activeDrag?.type === 'person' && !personDropEnabled && isScheduled && 'assignment-locked',
          isSelected && 'selection-active',
        )}
        style={{ backgroundColor: task.color }}
        aria-label={`Task ${task.title}`}
        aria-haspopup="dialog"
        aria-expanded={isSelected}
        data-person-drop-disabled={isScheduled && !personDropEnabled ? 'true' : 'false'}
        data-assignment-mode={assignmentMode}
        {...listeners}
        {...attributes}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="task-color-swatch shrink-0"
            style={{ backgroundColor: task.color }}
          />
          <h3
            className="min-w-0 flex-1 truncate text-left text-[1rem] leading-none"
            title={task.title}
          >
            {task.title}
          </h3>
          <AssigneeBadge
            person={effectiveAssignee}
            scope={badgeScope}
            density="compact"
            labelOverride={isScheduled ? undefined : 'Open'}
            onClear={
              canClearDirectAssignee
                ? () => dispatch({ type: 'clearTaskAssignee', taskId: task.id })
                : undefined
            }
            clearLabel="Clear task assignee"
          />
        </div>
      </motion.article>
    </div>
  )
}
