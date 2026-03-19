import { motion, useReducedMotion } from 'framer-motion'

import type { Person, Task } from '../../domain/schedule/types.ts'

type DragOverlayCardProps =
  | {
      task: Task
      person?: never
    }
  | {
      person: Person
      task?: never
    }

export function DragOverlayCard({ task, person }: DragOverlayCardProps) {
  const reduceMotion = useReducedMotion()

  if (task) {
    return (
      <motion.div
        initial={{ scale: 0.96, y: 0 }}
        animate={{
          scale: 1.04,
          y: -6,
          rotate: reduceMotion ? 0 : -1.8,
        }}
        transition={{ type: 'spring', stiffness: 360, damping: 26 }}
        className="paper-card drag-overlay-card max-w-[16rem] p-3"
        style={{ backgroundColor: task.color }}
      >
        <p className="panel-kicker">Flytter kort</p>
        <p className="mt-1 text-[1.12rem] leading-tight">{task.title}</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ scale: 0.96, y: 0 }}
      animate={{
        scale: 1.04,
        y: -6,
        rotate: reduceMotion ? 0 : 1.6,
      }}
      transition={{ type: 'spring', stiffness: 360, damping: 26 }}
      className="paper-chip drag-overlay-card"
      style={{ backgroundColor: person.accentColor }}
    >
      <span className="person-chip__avatar">{person.avatarInitials}</span>
      <span className="text-left">
        <span className="block text-[1.04rem] leading-none">{person.name}</span>
        <span className="mt-1 block text-[0.8rem] uppercase tracking-[0.08em] text-[color:var(--foreground-soft)]">
          Tildeler person
        </span>
      </span>
    </motion.div>
  )
}
