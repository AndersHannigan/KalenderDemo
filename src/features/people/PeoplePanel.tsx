import type { PlannerDragItem } from '../../domain/schedule/dnd.ts'
import { useSchedule } from '../schedule/useSchedule.ts'
import { PanelFrame } from '../shared/PanelFrame.tsx'
import { PersonCard } from '../shared/PersonCard.tsx'

type PeoplePanelProps = {
  activeDrag: PlannerDragItem | null
}

export function PeoplePanel({ activeDrag }: PeoplePanelProps) {
  const { state } = useSchedule()

  return (
    <PanelFrame
      title="People deck"
      subtitle="Drop a person onto a task for a direct assignment, or onto a row header to assign the whole lane."
      tilt="right"
      className="overflow-hidden"
    >
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <span className="mini-label">{state.personOrder.length} available</span>
        <span className="mini-label">drag to assign</span>
      </div>

      <div className="flex max-h-[34rem] flex-col gap-3 overflow-y-auto pr-1">
        {state.personOrder.map((personId) => (
          <PersonCard
            key={personId}
            person={state.people[personId]}
            activeDrag={activeDrag}
          />
        ))}
      </div>
    </PanelFrame>
  )
}
