import { STORAGE_KEY, STORAGE_VERSION } from './constants.ts'
import { createSeedPlannerState } from './seed.ts'
import type { PlannerState } from './types.ts'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function migrateStoredPlannerState(value: unknown): PlannerState | null {
  if (!isRecord(value)) {
    return null
  }

  const candidate = value as Partial<PlannerState>

  if (
    candidate.version !== STORAGE_VERSION ||
    !isRecord(candidate.tasks) ||
    !Array.isArray(candidate.taskOrder) ||
    !isRecord(candidate.people) ||
    !Array.isArray(candidate.personOrder) ||
    !isRecord(candidate.rows) ||
    !Array.isArray(candidate.rowOrder)
  ) {
    return null
  }

  return candidate as PlannerState
}

export function loadPlannerState() {
  if (typeof window === 'undefined') {
    return createSeedPlannerState()
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY)

  if (!rawValue) {
    return createSeedPlannerState()
  }

  try {
    const parsed = JSON.parse(rawValue)
    return migrateStoredPlannerState(parsed) ?? createSeedPlannerState()
  } catch {
    return createSeedPlannerState()
  }
}

export function savePlannerState(state: PlannerState) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
