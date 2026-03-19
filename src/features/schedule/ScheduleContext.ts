import { createContext, type Dispatch } from 'react'

import type { PlannerAction, PlannerState } from '../../domain/schedule/types.ts'

export type ScheduleContextValue = {
  state: PlannerState
  dispatch: Dispatch<PlannerAction>
}

export const ScheduleContext = createContext<ScheduleContextValue | null>(null)
