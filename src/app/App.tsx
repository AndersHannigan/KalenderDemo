import { PlannerPage } from '../features/layout/PlannerPage.tsx'
import { ScheduleProvider } from '../features/schedule/ScheduleProvider.tsx'

export default function App() {
  return (
    <ScheduleProvider>
      <PlannerPage />
    </ScheduleProvider>
  )
}
