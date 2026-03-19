import {
  pointerWithin,
  rectIntersection,
  type Active,
  type CollisionDetection,
  type Over,
} from '@dnd-kit/core'

import { selectCanAssignPersonToTask, selectCanDropTaskInCell } from './selectors.ts'
import type { PlannerAction, PlannerState, Task, TimeKey } from './types.ts'

export type PlannerTaskDragItem = {
  type: 'task'
  taskId: string
  from:
    | { type: 'task-inventory' }
    | { type: 'calendar-cell'; rowId: string; timeKey: TimeKey }
}

export type PlannerPersonDragItem = {
  type: 'person'
  personId: string
  from: { type: 'people-inventory' }
}

export type PlannerDragItem = PlannerTaskDragItem | PlannerPersonDragItem

export type PlannerDropTarget =
  | { type: 'task-inventory' }
  | { type: 'calendar-cell'; rowId: string; timeKey: TimeKey }
  | { type: 'row-header'; rowId: string }
  | { type: 'task-card'; taskId: string }

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function createTaskDragItem(task: Task): PlannerTaskDragItem {
  if (task.location.kind === 'inventory') {
    return {
      type: 'task',
      taskId: task.id,
      from: { type: 'task-inventory' },
    }
  }

  return {
    type: 'task',
    taskId: task.id,
    from: {
      type: 'calendar-cell',
      rowId: task.location.rowId,
      timeKey: task.location.timeKey,
    },
  }
}

export function isPlannerDragItem(value: unknown): value is PlannerDragItem {
  if (!isObject(value) || typeof value.type !== 'string') {
    return false
  }

  if (value.type === 'task') {
    return typeof value.taskId === 'string'
  }

  if (value.type === 'person') {
    return typeof value.personId === 'string'
  }

  return false
}

export function isPlannerDropTarget(value: unknown): value is PlannerDropTarget {
  if (!isObject(value) || typeof value.type !== 'string') {
    return false
  }

  switch (value.type) {
    case 'task-inventory':
      return true
    case 'calendar-cell':
      return typeof value.rowId === 'string' && typeof value.timeKey === 'string'
    case 'row-header':
      return typeof value.rowId === 'string'
    case 'task-card':
      return typeof value.taskId === 'string'
    default:
      return false
  }
}

export function getPlannerDragItem(active: Active | null) {
  const current = active?.data.current
  return isPlannerDragItem(current) ? current : null
}

export function getPlannerDropTarget(over: Over | null) {
  const current = over?.data.current
  return isPlannerDropTarget(current) ? current : null
}

export const plannerCollisionDetection: CollisionDetection = (args) => {
  const activeItem = getPlannerDragItem(args.active)

  if (!activeItem) {
    return rectIntersection(args)
  }

  const droppableContainers = args.droppableContainers.filter((container) => {
    const current = container.data.current

    if (!isPlannerDropTarget(current)) {
      return false
    }

    if (activeItem.type === 'task') {
      return current.type === 'task-inventory' || current.type === 'calendar-cell'
    }

    return current.type === 'row-header' || current.type === 'task-card'
  })

  const nextArgs = { ...args, droppableContainers }
  const pointerCollisions = pointerWithin(nextArgs)

  return pointerCollisions.length > 0 ? pointerCollisions : rectIntersection(nextArgs)
}

export function canDropOnTarget(
  state: PlannerState,
  activeItem: PlannerDragItem,
  target: PlannerDropTarget,
) {
  if (activeItem.type === 'task') {
    if (target.type === 'task-inventory') {
      return Boolean(state.tasks[activeItem.taskId])
    }

    if (target.type === 'calendar-cell') {
      return selectCanDropTaskInCell(
        state,
        activeItem.taskId,
        target.rowId,
        target.timeKey,
      )
    }

    return false
  }

  if (target.type === 'row-header') {
    return Boolean(state.rows[target.rowId] && state.people[activeItem.personId])
  }

  if (target.type === 'task-card') {
    return selectCanAssignPersonToTask(state, target.taskId)
  }

  return false
}

export function resolveDrop(
  state: PlannerState,
  activeItem: PlannerDragItem | null,
  target: PlannerDropTarget | null,
): PlannerAction | null {
  if (!activeItem || !target || !canDropOnTarget(state, activeItem, target)) {
    return null
  }

  if (activeItem.type === 'task') {
    if (target.type === 'task-inventory') {
      return {
        type: 'moveTaskToInventory',
        taskId: activeItem.taskId,
      }
    }

    if (target.type === 'calendar-cell') {
      return {
        type: 'moveTaskToCell',
        taskId: activeItem.taskId,
        rowId: target.rowId,
        timeKey: target.timeKey,
      }
    }

    return null
  }

  if (target.type === 'row-header') {
    return {
      type: 'assignPersonToRow',
      rowId: target.rowId,
      personId: activeItem.personId,
    }
  }

  if (target.type === 'task-card') {
    return {
      type: 'assignPersonToTask',
      taskId: target.taskId,
      personId: activeItem.personId,
    }
  }

  return null
}
