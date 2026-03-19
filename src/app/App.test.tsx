import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import App from './App.tsx'
import { STORAGE_KEY, STORAGE_VERSION } from '../domain/schedule/constants.ts'
import { createSeedPlannerState } from '../domain/schedule/seed.ts'

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

describe('App', () => {
  it('opens task details when a task card is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByLabelText(/kort norsk 8a/i))

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Norsk 8A')).toBeInTheDocument()
    expect(within(dialog).getByText('Ansvarlig')).toBeInTheDocument()
    expect(within(dialog).getByText('Ava Jansen')).toBeInTheDocument()
    expect(within(dialog).getByText(/dette kortet er tildelt direkte/i)).toBeInTheDocument()
  })

  it('removes the calendar panel header while keeping the side panel headers', () => {
    render(<App />)

    expect(screen.queryByText('Paper planner')).not.toBeInTheDocument()
    expect(screen.queryByText(/drag tasks into open blocks/i)).not.toBeInTheDocument()
    expect(screen.queryByText('Planner MVP')).not.toBeInTheDocument()
    expect(screen.getByText('Fagkort')).toBeInTheDocument()
    expect(screen.getByText('Personer')).toBeInTheDocument()
    expect(screen.queryByText('Rader')).not.toBeInTheDocument()
    expect(screen.queryByText(/ikke planlagte økter ligger her/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/tilgjengelige/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/dra for å tildele/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/klare/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/dra til planen/i)).not.toBeInTheDocument()
  })

  it('opens row details with owner and scheduled tasks', async () => {
    const user = userEvent.setup()
    render(<App />)

    const rowButton = screen.getByRole('button', { name: /livs timer/i })
    await user.click(rowButton)

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Livs timer')).toBeInTheDocument()
    expect(within(dialog).getByText('Radansvarlig')).toBeInTheDocument()
    expect(within(dialog).getByText('Liv Pedersen')).toBeInTheDocument()
    expect(within(dialog).getByText('Kunst og håndverk 6B')).toBeInTheDocument()
    expect(within(dialog).getByText('KRLE 7C')).toBeInTheDocument()
  })

  it('keeps task cards compact and shows assigned rows as first-name task groups', async () => {
    const user = userEvent.setup()
    render(<App />)

    const soundCheckCard = screen.getByLabelText(/kort norsk 8a/i)
    expect(
      within(soundCheckCard).getByRole('heading', { name: /norsk 8a/i }).className,
    ).toMatch(/line-clamp-1|truncate/)

    const [taskCard] = screen.getAllByLabelText(/kort kunst og håndverk 6b/i)

    expect(within(taskCard).getByText('LP')).toBeInTheDocument()
    expect(within(taskCard).queryByText('Liv Pedersen')).not.toBeInTheDocument()
    expect(
      within(taskCard).queryByRole('button', { name: /fjern ansvarlig/i }),
    ).not.toBeInTheDocument()

    const rowHeader = screen.getByRole('button', { name: /livs timer/i })
    expect(within(rowHeader).getByText('LP')).toBeInTheDocument()
    expect(within(rowHeader).queryByText('Liv Pedersen')).not.toBeInTheDocument()
    expect(within(rowHeader).getByText('Livs timer').className).toMatch(
      /line-clamp-1|truncate/,
    )
    expect(
      within(rowHeader).getByRole('button', { name: /fjern radansvarlig/i }),
    ).toBeInTheDocument()

    await user.click(taskCard)

    const dialog = screen.getByRole('dialog')
    expect(
      within(dialog).getByText(/dette kortet arver ansvarlig person fra livs timer/i),
    ).toBeInTheDocument()
  })

  it('shows an empty assignee as a dashed marker instead of text on compact task cards', () => {
    render(<App />)

    const taskCard = screen.getByLabelText(/kort matte 6c/i)
    const marker = within(taskCard).getByTestId('empty-assignee-marker')

    expect(marker).toBeInTheDocument()
    expect(marker.closest('.assignee-badge')).toHaveAttribute('aria-label', 'Ikke tildelt')
  })

  it('clears a direct task assignee inline without opening details', async () => {
    const user = userEvent.setup()
    render(<App />)

    const taskCard = screen.getByLabelText(/kort norsk 8a/i)
    const clearButton = within(taskCard).getByRole('button', {
      name: /fjern ansvarlig/i,
    })

    await user.click(clearButton)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(within(taskCard).queryByText('Ava Jansen')).not.toBeInTheDocument()
    expect(within(taskCard).queryByText('AJ')).not.toBeInTheDocument()
  })

  it('clears a row assignee inline without opening details', async () => {
    const user = userEvent.setup()
    render(<App />)

    const rowHeader = screen.getByRole('button', { name: /livs timer/i })
    const clearButton = within(rowHeader).getByRole('button', {
      name: /fjern radansvarlig/i,
    })

    await user.click(clearButton)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(within(rowHeader).queryByText('Liv Pedersen')).not.toBeInTheDocument()
    expect(within(rowHeader).getByText('Blokk 4')).toBeInTheDocument()
    expect(
      within(rowHeader).queryByRole('button', { name: /fjern radansvarlig/i }),
    ).not.toBeInTheDocument()
  })

  it('does not expose a direct clear control for inherited task assignees', () => {
    render(<App />)

    const taskCard = screen.getByLabelText(/kort kunst og håndverk 6b/i)

    expect(within(taskCard).getByText('LP')).toBeInTheDocument()
    expect(within(taskCard).queryByText('Liv Pedersen')).not.toBeInTheDocument()
    expect(
      within(taskCard).queryByRole('button', { name: /fjern ansvarlig/i }),
    ).not.toBeInTheDocument()
  })

  it('lights up valid task and row targets while dragging a person', () => {
    render(<App />)

    const personCard = screen.getByRole('button', { name: /person ava jansen/i })
    const taskCard = screen.getByLabelText(/kort norsk 8a/i)
    const rowDropzone = screen.getByLabelText(/tildel person til livs timer/i)

    fireEvent.pointerDown(personCard, {
      button: 0,
      clientX: 12,
      clientY: 12,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
    })
    fireEvent.pointerMove(personCard, {
      button: 0,
      clientX: 32,
      clientY: 32,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
    })

    expect(taskCard.className).toMatch(/drop-target-ready/)
    expect(rowDropzone.className).toMatch(/drop-target-ready/)
  })

  it('does not open the detail sheet from the click that follows a drag interaction', () => {
    render(<App />)

    const task = screen.getAllByText('Matte 6C')[0].closest('article')

    expect(task).not.toBeNull()

    fireEvent.pointerDown(task!, {
      button: 0,
      clientX: 10,
      clientY: 10,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
    })
    fireEvent.pointerMove(task!, {
      button: 0,
      clientX: 30,
      clientY: 30,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
    })
    fireEvent.pointerUp(task!, {
      button: 0,
      clientX: 30,
      clientY: 30,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
    })
    fireEvent.click(task!)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not expose empty slots as clickable controls', () => {
    render(<App />)

    expect(screen.queryByLabelText(/åpne detaljer for blokk 1 09:30/i)).not.toBeInTheDocument()
  })

  it('shows drag glyphs only during task drags and tints valid empty cells', () => {
    const { container } = render(<App />)

    expect(screen.queryByTestId('empty-cell-glyph')).not.toBeInTheDocument()
    expect(screen.queryByText(/drop task here/i)).not.toBeInTheDocument()

    const taskCard = screen.getByLabelText(/kort matte 6c/i)

    fireEvent.pointerDown(taskCard, {
      button: 0,
      clientX: 10,
      clientY: 10,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
    })
    fireEvent.pointerMove(taskCard, {
      button: 0,
      clientX: 30,
      clientY: 30,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
    })

    expect(screen.getAllByTestId('empty-cell-glyph').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('.empty-cell-state--ready').length).toBeGreaterThan(0)
    expect(screen.queryByText(/drop task here/i)).not.toBeInTheDocument()
  })

  it('does not show empty-cell glyphs during person drags', () => {
    render(<App />)

    const personCard = screen.getByRole('button', { name: /person ava jansen/i })

    fireEvent.pointerDown(personCard, {
      button: 0,
      clientX: 12,
      clientY: 12,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
    })
    fireEvent.pointerMove(personCard, {
      button: 0,
      clientX: 32,
      clientY: 32,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
    })

    expect(screen.queryByTestId('empty-cell-glyph')).not.toBeInTheDocument()
  })

  it('uses block labels for unassigned rows and assigned labels for owned rows', () => {
    render(<App />)

    expect(screen.getByText('Blokk 1')).toBeInTheDocument()
    expect(screen.getByText('Blokk 2')).toBeInTheDocument()
    expect(screen.getByText('Blokk 3')).toBeInTheDocument()
    expect(screen.getByText('Livs timer')).toBeInTheDocument()
    expect(screen.getByText('Blokk 5')).toBeInTheDocument()
  })

  it('hydrates planner state from localStorage', () => {
    const storedState = createSeedPlannerState()
    storedState.tasks['task-signage'] = {
      ...storedState.tasks['task-signage'],
      title: 'Hydrated signage card',
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storedState))

    render(<App />)

    expect(screen.getByText('Hydrated signage card')).toBeInTheDocument()
  })

  it('falls back to fresh norwegian seed data when stored state has an old version', () => {
    const storedState = createSeedPlannerState()
    storedState.version = STORAGE_VERSION - 1
    storedState.tasks['task-signage'] = {
      ...storedState.tasks['task-signage'],
      title: 'Prep Signage',
    }
    storedState.rows['row-front-desk'] = {
      ...storedState.rows['row-front-desk'],
      name: 'Front Desk',
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storedState))

    render(<App />)

    expect(screen.getByText('Matte 6C')).toBeInTheDocument()
    expect(screen.getByText('Blokk 1')).toBeInTheDocument()
    expect(screen.queryByText('Prep Signage')).not.toBeInTheDocument()
    expect(screen.queryByText('Front Desk')).not.toBeInTheDocument()
  })
})
