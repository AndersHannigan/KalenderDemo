import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'

import type { PlannerDragItem } from '../../domain/schedule/dnd.ts'
import type { Person } from '../../domain/schedule/types.ts'
import { cx } from '../../lib/cx.ts'

type PersonCardProps = {
  person: Person
  activeDrag: PlannerDragItem | null
}

export function PersonCard({ person, activeDrag }: PersonCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `person:${person.id}`,
    data: {
      type: 'person',
      personId: person.id,
      from: { type: 'people-inventory' },
    },
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        touchAction: 'none',
      }}
      className={cx(isDragging && 'opacity-0')}
    >
      <motion.button
        type="button"
        whileHover={{ y: -2, rotate: -1.2 }}
        whileTap={{ x: 1, y: 1, scale: 0.98 }}
        className={cx(
          'paper-chip w-full cursor-grab active:cursor-grabbing',
          activeDrag?.type === 'person' && activeDrag.personId === person.id && 'is-active',
        )}
        style={{ backgroundColor: person.accentColor }}
        aria-label={`Person ${person.name}`}
        {...listeners}
        {...attributes}
      >
        <span className="person-chip__avatar">{person.avatarInitials}</span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate text-[1.02rem] leading-none">{person.name}</span>
          <span className="mt-1 block text-[0.8rem] uppercase tracking-[0.08em] text-[color:var(--foreground-soft)]">
            Drag to a lane or task
          </span>
        </span>
      </motion.button>
    </div>
  )
}
