import type { Person } from '../../domain/schedule/types.ts'
import { cx } from '../../lib/cx.ts'

type AssigneeBadgeProps = {
  person: Person | null
  scope: 'row' | 'task' | 'inherited' | 'empty'
  density?: 'compact' | 'detail'
  showCompactName?: boolean
  labelOverride?: string
  onClear?: () => void
  clearLabel?: string
}

const labelByScope = {
  row: 'Lane owner',
  task: 'Task owner',
  inherited: 'Via row',
  empty: 'Unassigned',
} as const

export function AssigneeBadge({
  person,
  scope,
  density = 'detail',
  showCompactName = false,
  labelOverride,
  onClear,
  clearLabel,
}: AssigneeBadgeProps) {
  const label = labelOverride ?? labelByScope[scope]
  const effectiveClearLabel =
    clearLabel ?? `Clear ${scope === 'row' ? 'row' : 'task'} assignee`

  return (
    <div
      className={cx(
        'assignee-badge',
        `assignee-badge--${scope}`,
        density === 'detail' && 'assignee-badge--detail',
        density === 'compact' && 'assignee-badge--compact',
        density === 'compact' && showCompactName && 'assignee-badge--compact-name',
      )}
    >
      {person ? (
        <>
          <span
            className={cx(
              'assignee-badge__avatar-shell',
              density === 'compact' && 'assignee-badge__avatar-shell--compact',
            )}
            title={person.name}
            role={density === 'compact' && !showCompactName ? 'img' : undefined}
            aria-label={
              density === 'compact' && !showCompactName ? `${label}: ${person.name}` : undefined
            }
          >
            <span className="assignee-badge__avatar">{person.avatarInitials}</span>
            {density === 'compact' && onClear ? (
              <button
                type="button"
                className="assignee-badge__compact-clear"
                onPointerDown={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  onClear()
                }}
                aria-label={effectiveClearLabel}
              >
                <span aria-hidden="true">x</span>
              </button>
            ) : null}
          </span>
          {density === 'detail' ? (
            <span className="flex flex-col leading-none">
              <span className="text-[0.68rem] uppercase tracking-[0.08em] text-[color:var(--foreground-soft)]">
                {label}
              </span>
              <span className="text-[0.96rem]">{person.name}</span>
            </span>
          ) : showCompactName ? (
            <span className="assignee-badge__compact-name-text" title={person.name}>
              {person.name}
            </span>
          ) : null}
        </>
      ) : (
        <span className={cx(density === 'compact' ? 'text-[0.86rem]' : 'text-[0.92rem]')}>
          {label}
        </span>
      )}

      {density === 'detail' && onClear ? (
        <button
          type="button"
          className="badge-clear"
          onClick={onClear}
          aria-label={effectiveClearLabel}
        >
          clear
        </button>
      ) : null}
    </div>
  )
}
