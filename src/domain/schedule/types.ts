export type TimeKey =
  | '08:30'
  | '09:30'
  | '10:30'
  | '11:30'
  | '12:30'
  | '13:30'

export type TaskLocation =
  | { kind: 'inventory' }
  | {
      kind: 'calendar'
      rowId: string
      timeKey: TimeKey
    }

export type Task = {
  id: string
  title: string
  color: string
  location: TaskLocation
  assignedPersonId: string | null
}

export type Person = {
  id: string
  name: string
  avatarInitials: string
  accentColor: string
}

export type RowGroup = {
  id: string
  name: string
  assignedPersonId: string | null
}

export type TimeBlock = {
  key: TimeKey
  label: string
  start: string
  end: string
}

export type PlannerState = {
  version: number
  tasks: Record<string, Task>
  taskOrder: string[]
  people: Record<string, Person>
  personOrder: string[]
  rows: Record<string, RowGroup>
  rowOrder: string[]
}

export type PlannerAction =
  | {
      type: 'moveTaskToCell'
      taskId: string
      rowId: string
      timeKey: TimeKey
    }
  | {
      type: 'moveTaskToInventory'
      taskId: string
    }
  | {
      type: 'assignPersonToTask'
      taskId: string
      personId: string
    }
  | {
      type: 'clearTaskAssignee'
      taskId: string
    }
  | {
      type: 'assignPersonToRow'
      rowId: string
      personId: string
    }
  | {
      type: 'clearRowAssignee'
      rowId: string
    }
