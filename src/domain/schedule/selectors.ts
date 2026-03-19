import { TIME_KEY_ORDER } from './constants.ts'
import type { Person, PlannerState, Task, TimeKey } from './types.ts'

type ScheduledTask = Task & {
  location: {
    kind: 'calendar'
    rowId: string
    timeKey: TimeKey
  }
}

function isScheduledTask(task: Task): task is ScheduledTask {
  return task.location.kind === 'calendar'
}

function toFirstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? ''
}

function toPossessiveTasksLabel(firstName: string) {
  if (!firstName) {
    return 'Tildelte timer'
  }

  const suffix = /s$/i.test(firstName) ? "'" : 's'
  return `${firstName}${suffix} timer`
}

export function buildCellKey(rowId: string, timeKey: TimeKey) {
  return `${rowId}::${timeKey}`
}

export function selectUnscheduledTaskIds(state: PlannerState) {
  return state.taskOrder.filter(
    (taskId) => state.tasks[taskId]?.location.kind === 'inventory',
  )
}

export function selectCellTaskIdMap(state: PlannerState) {
  const map = new Map<string, string>()

  Object.values(state.tasks).forEach((task) => {
    if (task.location.kind !== 'calendar') {
      return
    }

    map.set(buildCellKey(task.location.rowId, task.location.timeKey), task.id)
  })

  return map
}

export function selectTaskIdAtCell(
  state: PlannerState,
  rowId: string,
  timeKey: TimeKey,
) {
  return selectCellTaskIdMap(state).get(buildCellKey(rowId, timeKey)) ?? null
}

export function selectTasksForRow(state: PlannerState, rowId: string) {
  return Object.values(state.tasks)
    .filter(isScheduledTask)
    .filter((task) => task.location.rowId === rowId)
    .sort(
      (left, right) =>
        TIME_KEY_ORDER[left.location.timeKey] - TIME_KEY_ORDER[right.location.timeKey],
    )
}

export function selectPersonById(state: PlannerState, personId: string | null): Person | null {
  if (!personId) {
    return null
  }

  return state.people[personId] ?? null
}

export function selectRowAssigneeFirstName(state: PlannerState, rowId: string) {
  const row = state.rows[rowId]
  const person = row ? selectPersonById(state, row.assignedPersonId) : null

  return person ? toFirstName(person.name) : null
}

export function selectRowDisplayName(state: PlannerState, rowId: string) {
  const row = state.rows[rowId]

  if (!row) {
    return ''
  }

  const firstName = selectRowAssigneeFirstName(state, rowId)
  return firstName ? toPossessiveTasksLabel(firstName) : row.name
}

export function selectEffectiveTaskAssignee(state: PlannerState, taskId: string) {
  const task = state.tasks[taskId]

  if (!task || task.location.kind !== 'calendar') {
    return null
  }

  const rowAssignee = selectPersonById(
    state,
    state.rows[task.location.rowId]?.assignedPersonId ?? null,
  )

  if (rowAssignee) {
    return rowAssignee
  }

  return selectPersonById(state, task.assignedPersonId)
}

export function selectEffectiveTaskAssignmentMode(
  state: PlannerState,
  taskId: string,
): 'row' | 'task' | 'none' {
  const task = state.tasks[taskId]

  if (!task || task.location.kind !== 'calendar') {
    return 'none'
  }

  const row = state.rows[task.location.rowId]

  if (row?.assignedPersonId) {
    return 'row'
  }

  if (task.assignedPersonId) {
    return 'task'
  }

  return 'none'
}

export function selectCanAssignPersonToTask(state: PlannerState, taskId: string) {
  const task = state.tasks[taskId]

  if (!task || task.location.kind !== 'calendar') {
    return false
  }

  const row = state.rows[task.location.rowId]

  return Boolean(row) && row.assignedPersonId === null
}

export function selectCanDropTaskInCell(
  state: PlannerState,
  taskId: string,
  rowId: string,
  timeKey: TimeKey,
) {
  const task = state.tasks[taskId]

  if (!task || !state.rows[rowId]) {
    return false
  }

  return Object.values(state.tasks).every((candidate) => {
    if (candidate.id === task.id || candidate.location.kind !== 'calendar') {
      return true
    }

    return !(
      candidate.location.rowId === rowId &&
      candidate.location.timeKey === timeKey
    )
  })
}

export function selectTaskRow(state: PlannerState, task: Task) {
  if (task.location.kind !== 'calendar') {
    return null
  }

  return state.rows[task.location.rowId] ?? null
}
