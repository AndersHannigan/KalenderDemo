import type { PlannerAction, PlannerState, Task } from './types.ts'

function findTaskAtCell(
  state: PlannerState,
  rowId: string,
  timeKey: string,
  excludedTaskId?: string,
) {
  return Object.values(state.tasks).find((task) => {
    if (task.id === excludedTaskId || task.location.kind !== 'calendar') {
      return false
    }

    return task.location.rowId === rowId && task.location.timeKey === timeKey
  })
}

function isTaskScheduledInRow(task: Task, rowId: string) {
  return task.location.kind === 'calendar' && task.location.rowId === rowId
}

export function plannerReducer(state: PlannerState, action: PlannerAction): PlannerState {
  switch (action.type) {
    case 'moveTaskToCell': {
      const task = state.tasks[action.taskId]
      const row = state.rows[action.rowId]

      if (!task || !row) {
        return state
      }

      const occupyingTask = findTaskAtCell(state, action.rowId, action.timeKey, task.id)

      if (occupyingTask) {
        return state
      }

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [task.id]: {
            ...task,
            location: {
              kind: 'calendar',
              rowId: action.rowId,
              timeKey: action.timeKey,
            },
            assignedPersonId: row.assignedPersonId ? null : task.assignedPersonId,
          },
        },
      }
    }

    case 'moveTaskToInventory': {
      const task = state.tasks[action.taskId]

      if (!task) {
        return state
      }

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [task.id]: {
            ...task,
            location: { kind: 'inventory' },
            assignedPersonId: null,
          },
        },
      }
    }

    case 'assignPersonToTask': {
      const task = state.tasks[action.taskId]
      const person = state.people[action.personId]

      if (!task || !person || task.location.kind !== 'calendar') {
        return state
      }

      const row = state.rows[task.location.rowId]

      if (!row || row.assignedPersonId) {
        return state
      }

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [task.id]: {
            ...task,
            assignedPersonId: action.personId,
          },
        },
      }
    }

    case 'clearTaskAssignee': {
      const task = state.tasks[action.taskId]

      if (!task || task.assignedPersonId === null) {
        return state
      }

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [task.id]: {
            ...task,
            assignedPersonId: null,
          },
        },
      }
    }

    case 'assignPersonToRow': {
      const row = state.rows[action.rowId]
      const person = state.people[action.personId]

      if (!row || !person) {
        return state
      }

      const nextTasks = Object.fromEntries(
        Object.entries(state.tasks).map(([taskId, task]) => {
          if (!isTaskScheduledInRow(task, action.rowId)) {
            return [taskId, task]
          }

          return [
            taskId,
            {
              ...task,
              assignedPersonId: null,
            },
          ]
        }),
      )

      return {
        ...state,
        rows: {
          ...state.rows,
          [row.id]: {
            ...row,
            assignedPersonId: action.personId,
          },
        },
        tasks: nextTasks,
      }
    }

    case 'clearRowAssignee': {
      const row = state.rows[action.rowId]

      if (!row || row.assignedPersonId === null) {
        return state
      }

      return {
        ...state,
        rows: {
          ...state.rows,
          [row.id]: {
            ...row,
            assignedPersonId: null,
          },
        },
      }
    }

    default:
      return state
  }
}
