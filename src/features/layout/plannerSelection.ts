export type PlannerSelection =
  | {
      kind: 'task'
      taskId: string
    }
  | {
      kind: 'row'
      rowId: string
    }

export function isTaskSelection(
  selection: PlannerSelection | null,
  taskId: string,
) {
  return selection?.kind === 'task' && selection.taskId === taskId
}

export function isRowSelection(
  selection: PlannerSelection | null,
  rowId: string,
) {
  return selection?.kind === 'row' && selection.rowId === rowId
}
