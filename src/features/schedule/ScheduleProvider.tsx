import {
  useEffect,
  useReducer,
  type PropsWithChildren,
} from 'react'

import { plannerReducer } from '../../domain/schedule/reducer.ts'
import { loadPlannerState, savePlannerState } from '../../domain/schedule/storage.ts'
import { ScheduleContext } from './ScheduleContext.ts'

export function ScheduleProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(plannerReducer, undefined, loadPlannerState)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      savePlannerState(state)
    }, 200)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [state])

  return (
    <ScheduleContext.Provider value={{ state, dispatch }}>
      {children}
    </ScheduleContext.Provider>
  )
}
