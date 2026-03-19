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
      title="Personer"
      kicker={null}
      tilt="right"
      className="overflow-hidden"
    >
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
