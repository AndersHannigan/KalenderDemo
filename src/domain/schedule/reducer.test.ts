import { describe, expect, it } from 'vitest'

import { plannerReducer } from './reducer.ts'
import { createSeedPlannerState } from './seed.ts'
import {
  selectEffectiveTaskAssignee,
  selectRowDisplayName,
} from './selectors.ts'

describe('plannerReducer', () => {
  it('schedules an inventory task into an empty calendar cell', () => {
    const state = createSeedPlannerState()
    const nextState = plannerReducer(state, {
      type: 'moveTaskToCell',
      taskId: 'task-signage',
      rowId: 'row-front-desk',
      timeKey: '08:30',
    })

    expect(nextState.tasks['task-signage'].location).toEqual({
      kind: 'calendar',
      rowId: 'row-front-desk',
      timeKey: '08:30',
    })
  })

  it('rejects dropping a task into an occupied cell', () => {
    const state = createSeedPlannerState()
    const nextState = plannerReducer(state, {
      type: 'moveTaskToCell',
      taskId: 'task-signage',
      rowId: 'row-main-room',
      timeKey: '08:30',
    })

    expect(nextState.tasks['task-signage'].location).toEqual({ kind: 'inventory' })
  })

  it('moves a task between calendar cells', () => {
    const state = createSeedPlannerState()
    const nextState = plannerReducer(state, {
      type: 'moveTaskToCell',
      taskId: 'task-tech-rehearsal',
      rowId: 'row-breakout',
      timeKey: '09:30',
    })

    expect(nextState.tasks['task-tech-rehearsal'].location).toEqual({
      kind: 'calendar',
      rowId: 'row-breakout',
      timeKey: '09:30',
    })
  })

  it('moves a task back to inventory and clears its direct assignee', () => {
    const state = createSeedPlannerState()
    const nextState = plannerReducer(state, {
      type: 'moveTaskToInventory',
      taskId: 'task-sound-check',
    })

    expect(nextState.tasks['task-sound-check']).toMatchObject({
      location: { kind: 'inventory' },
      assignedPersonId: null,
    })
  })

  it('assigns a person to a task when its row has no row-level assignee', () => {
    const state = createSeedPlannerState()
    const nextState = plannerReducer(state, {
      type: 'assignPersonToTask',
      taskId: 'task-speaker-welcome',
      personId: 'person-jon-b',
    })

    expect(nextState.tasks['task-speaker-welcome'].assignedPersonId).toBe('person-jon-b')
  })

  it('assigns a person to a row and clears direct task assignees in that row', () => {
    const state = createSeedPlannerState()
    const nextState = plannerReducer(state, {
      type: 'assignPersonToRow',
      rowId: 'row-main-room',
      personId: 'person-liv-p',
    })

    expect(nextState.rows['row-main-room'].assignedPersonId).toBe('person-liv-p')
    expect(nextState.tasks['task-sound-check'].assignedPersonId).toBeNull()
    expect(nextState.tasks['task-tech-rehearsal'].assignedPersonId).toBeNull()
  })

  it('clears a row assignment and leaves tasks unassigned', () => {
    const state = plannerReducer(createSeedPlannerState(), {
      type: 'assignPersonToRow',
      rowId: 'row-main-room',
      personId: 'person-milo-t',
    })

    const nextState = plannerReducer(state, {
      type: 'clearRowAssignee',
      rowId: 'row-main-room',
    })

    expect(nextState.rows['row-main-room'].assignedPersonId).toBeNull()
    expect(nextState.tasks['task-sound-check'].assignedPersonId).toBeNull()
    expect(nextState.tasks['task-tech-rehearsal'].assignedPersonId).toBeNull()
  })

  it('prefers the row assignee when resolving effective assignment', () => {
    const state = plannerReducer(createSeedPlannerState(), {
      type: 'assignPersonToRow',
      rowId: 'row-main-room',
      personId: 'person-milo-t',
    })

    expect(selectEffectiveTaskAssignee(state, 'task-sound-check')?.id).toBe('person-milo-t')
  })

  it('derives the row display name from the assigned person first name', () => {
    const state = createSeedPlannerState()

    expect(selectRowDisplayName(state, 'row-front-desk')).toBe('Blokk 1')
    expect(selectRowDisplayName(state, 'row-support-desk')).toBe('Livs timer')
  })
})
