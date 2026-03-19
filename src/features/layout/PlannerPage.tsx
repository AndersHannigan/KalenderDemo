import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useEffect, useRef, useState } from 'react'

import {
  getPlannerDragItem,
  getPlannerDropTarget,
  plannerCollisionDetection,
  resolveDrop,
  type PlannerDragItem,
} from '../../domain/schedule/dnd.ts'
import { useSchedule } from '../schedule/useSchedule.ts'
import { CalendarGrid } from '../calendar/CalendarGrid.tsx'
import type { PlannerSelection } from './plannerSelection.ts'
import { PeoplePanel } from '../people/PeoplePanel.tsx'
import { DragOverlayCard } from '../shared/DragOverlayCard.tsx'
import { TasksPanel } from '../tasks/TasksPanel.tsx'

type RowAssignmentTransition = {
  kind: 'assign' | 'clear'
  personId: string
  key: number
}

export function PlannerPage() {
  const { state, dispatch } = useSchedule()
  const [activeDrag, setActiveDrag] = useState<PlannerDragItem | null>(null)
  const [selection, setSelection] = useState<PlannerSelection | null>(null)
  const [rowAssignmentTransitions, setRowAssignmentTransitions] = useState<
    Record<string, RowAssignmentTransition>
  >({})
  const suppressSelectionRef = useRef(false)
  const selectionResetTimerRef = useRef<number | null>(null)
  const rowTransitionTimeoutsRef = useRef<Record<string, number>>({})
  const rowTransitionSequenceRef = useRef(0)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  )

  useEffect(() => {
    const rowTransitionTimeouts = rowTransitionTimeoutsRef.current

    return () => {
      if (selectionResetTimerRef.current !== null) {
        window.clearTimeout(selectionResetTimerRef.current)
      }

      Object.values(rowTransitionTimeouts).forEach((timeoutId) => {
        window.clearTimeout(timeoutId)
      })
    }
  }, [])

  const suppressSelectionTemporarily = (duration = 140) => {
    suppressSelectionRef.current = true

    if (selectionResetTimerRef.current !== null) {
      window.clearTimeout(selectionResetTimerRef.current)
    }

    selectionResetTimerRef.current = window.setTimeout(() => {
      suppressSelectionRef.current = false
      selectionResetTimerRef.current = null
    }, duration)
  }

  const openSelection = (nextSelection: PlannerSelection) => {
    if (suppressSelectionRef.current) {
      return
    }

    setSelection(nextSelection)
  }

  const queueRowAssignmentTransition = (
    rowId: string,
    kind: RowAssignmentTransition['kind'],
    personId: string,
  ) => {
    const key = ++rowTransitionSequenceRef.current

    setRowAssignmentTransitions((currentTransitions) => ({
      ...currentTransitions,
      [rowId]: {
        kind,
        personId,
        key,
      },
    }))

    if (rowTransitionTimeoutsRef.current[rowId] !== undefined) {
      window.clearTimeout(rowTransitionTimeoutsRef.current[rowId])
    }

    rowTransitionTimeoutsRef.current[rowId] = window.setTimeout(() => {
      setRowAssignmentTransitions((currentTransitions) => {
        if (!currentTransitions[rowId] || currentTransitions[rowId].key !== key) {
          return currentTransitions
        }

        const nextTransitions = { ...currentTransitions }
        delete nextTransitions[rowId]
        return nextTransitions
      })
      delete rowTransitionTimeoutsRef.current[rowId]
    }, 480)
  }

  const clearRowAssignee = (rowId: string) => {
    const personId = state.rows[rowId]?.assignedPersonId

    if (!personId) {
      return
    }

    queueRowAssignmentTransition(rowId, 'clear', personId)
    dispatch({ type: 'clearRowAssignee', rowId })
  }

  const handleDragStart = (event: DragStartEvent) => {
    suppressSelectionTemporarily(180)
    setSelection(null)
    setActiveDrag(getPlannerDragItem(event.active))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const action = resolveDrop(
      state,
      getPlannerDragItem(event.active),
      getPlannerDropTarget(event.over),
    )

    if (action) {
      if (action.type === 'assignPersonToRow') {
        queueRowAssignmentTransition(action.rowId, 'assign', action.personId)
      }

      dispatch(action)
    }

    setActiveDrag(null)
    suppressSelectionTemporarily(160)
  }

  const overlayTask =
    activeDrag?.type === 'task' ? state.tasks[activeDrag.taskId] : undefined
  const overlayPerson =
    activeDrag?.type === 'person' ? state.people[activeDrag.personId] : undefined

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={plannerCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveDrag(null)
        suppressSelectionTemporarily(160)
      }}
    >
      <main className="paper-shell min-h-screen px-4 py-5 md:px-6 md:py-7">
        <div className="mx-auto grid w-full max-w-[120rem] gap-6 xl:grid-cols-[18rem_minmax(0,1fr)_16rem]">
          <TasksPanel
            activeDrag={activeDrag}
            selection={selection}
            onOpenSelection={openSelection}
            onSuppressSelection={() => suppressSelectionTemporarily(160)}
          />
          <CalendarGrid
            activeDrag={activeDrag}
            selection={selection}
            rowAssignmentTransitions={rowAssignmentTransitions}
            onClearRowAssignee={clearRowAssignee}
            onOpenSelection={openSelection}
            onCloseSelection={() => setSelection(null)}
            onSuppressSelection={() => suppressSelectionTemporarily(160)}
          />
          <PeoplePanel activeDrag={activeDrag} />
        </div>
      </main>

      <DragOverlay>
        {overlayTask ? <DragOverlayCard task={overlayTask} /> : null}
        {overlayPerson ? <DragOverlayCard person={overlayPerson} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
