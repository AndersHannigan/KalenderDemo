import { STORAGE_VERSION } from './constants.ts'
import type { Person, PlannerState, RowGroup, Task } from './types.ts'

function toRecord<T extends { id: string }>(items: T[]) {
  return items.reduce<Record<string, T>>((accumulator, item) => {
    accumulator[item.id] = item
    return accumulator
  }, {})
}

export function createSeedPlannerState(): PlannerState {
  const rows: RowGroup[] = [
    { id: 'row-front-desk', name: 'Blokk 1', assignedPersonId: null },
    { id: 'row-main-room', name: 'Blokk 2', assignedPersonId: null },
    { id: 'row-breakout', name: 'Blokk 3', assignedPersonId: null },
    { id: 'row-support-desk', name: 'Blokk 4', assignedPersonId: 'person-liv-p' },
    { id: 'row-wrap-crew', name: 'Blokk 5', assignedPersonId: null },
  ]

  const people: Person[] = [
    {
      id: 'person-ava-j',
      name: 'Ava Jansen',
      avatarInitials: 'AJ',
      accentColor: '#ffd7c2',
    },
    {
      id: 'person-sami-m',
      name: 'Sami Moe',
      avatarInitials: 'SM',
      accentColor: '#d2ebff',
    },
    {
      id: 'person-rina-k',
      name: 'Rina Kaur',
      avatarInitials: 'RK',
      accentColor: '#fff0a8',
    },
    {
      id: 'person-liv-p',
      name: 'Liv Pedersen',
      avatarInitials: 'LP',
      accentColor: '#d4edc8',
    },
    {
      id: 'person-milo-t',
      name: 'Milo Tran',
      avatarInitials: 'MT',
      accentColor: '#fdd4e4',
    },
    {
      id: 'person-jon-b',
      name: 'Jon Berg',
      avatarInitials: 'JB',
      accentColor: '#e3d7ff',
    },
  ]

  const tasks: Task[] = [
    {
      id: 'task-signage',
      title: 'Matte 6C',
      color: '#fff9c4',
      location: { kind: 'inventory' },
      assignedPersonId: null,
    },
    {
      id: 'task-sound-check',
      title: 'Norsk 8A',
      color: '#d6ecff',
      location: {
        kind: 'calendar',
        rowId: 'row-main-room',
        timeKey: '08:30',
      },
      assignedPersonId: 'person-ava-j',
    },
    {
      id: 'task-coffee-setup',
      title: 'Engelsk 7B',
      color: '#fff9c4',
      location: { kind: 'inventory' },
      assignedPersonId: null,
    },
    {
      id: 'task-speaker-welcome',
      title: 'Naturfag 9D',
      color: '#ffd7c2',
      location: {
        kind: 'calendar',
        rowId: 'row-breakout',
        timeKey: '10:30',
      },
      assignedPersonId: null,
    },
    {
      id: 'task-tech-rehearsal',
      title: 'Samfunnsfag 8C',
      color: '#d6ecff',
      location: {
        kind: 'calendar',
        rowId: 'row-main-room',
        timeKey: '09:30',
      },
      assignedPersonId: 'person-sami-m',
    },
    {
      id: 'task-badge-pickup',
      title: 'Kunst og håndverk 6B',
      color: '#fff9c4',
      location: {
        kind: 'calendar',
        rowId: 'row-support-desk',
        timeKey: '11:30',
      },
      assignedPersonId: null,
    },
    {
      id: 'task-lunch-layout',
      title: 'Musikk 5A',
      color: '#ffd7c2',
      location: { kind: 'inventory' },
      assignedPersonId: null,
    },
    {
      id: 'task-photo-corner',
      title: 'Kroppsøving 9A',
      color: '#d4edc8',
      location: {
        kind: 'calendar',
        rowId: 'row-wrap-crew',
        timeKey: '12:30',
      },
      assignedPersonId: 'person-rina-k',
    },
    {
      id: 'task-wrap-notes',
      title: 'Historie 10B',
      color: '#e3d7ff',
      location: { kind: 'inventory' },
      assignedPersonId: null,
    },
    {
      id: 'task-volunteer-check-in',
      title: 'KRLE 7C',
      color: '#d4edc8',
      location: {
        kind: 'calendar',
        rowId: 'row-support-desk',
        timeKey: '08:30',
      },
      assignedPersonId: null,
    },
  ]

  return {
    version: STORAGE_VERSION,
    tasks: toRecord(tasks),
    taskOrder: tasks.map((task) => task.id),
    people: toRecord(people),
    personOrder: people.map((person) => person.id),
    rows: toRecord(rows),
    rowOrder: rows.map((row) => row.id),
  }
}
