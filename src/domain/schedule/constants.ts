import type { TimeBlock, TimeKey } from './types.ts'

export const STORAGE_KEY = 'scheduler-mvp:v1'
export const STORAGE_VERSION = 2

export const TIME_BLOCKS = [
  { key: '08:30', label: '08:30-09:30', start: '08:30', end: '09:30' },
  { key: '09:30', label: '09:30-10:30', start: '09:30', end: '10:30' },
  { key: '10:30', label: '10:30-11:30', start: '10:30', end: '11:30' },
  { key: '11:30', label: '11:30-12:30', start: '11:30', end: '12:30' },
  { key: '12:30', label: '12:30-13:30', start: '12:30', end: '13:30' },
  { key: '13:30', label: '13:30-14:30', start: '13:30', end: '14:30' },
] as const satisfies readonly TimeBlock[]

export const TIME_KEY_ORDER = TIME_BLOCKS.reduce<Record<TimeKey, number>>(
  (accumulator, block, index) => {
    accumulator[block.key] = index
    return accumulator
  },
  {
    '08:30': 0,
    '09:30': 1,
    '10:30': 2,
    '11:30': 3,
    '12:30': 4,
    '13:30': 5,
  },
)
