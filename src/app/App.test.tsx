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
import { STORAGE_KEY } from '../domain/schedule/constants.ts'
import { createSeedPlannerState } from '../domain/schedule/seed.ts'

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

describe('App', () => {
  it('opens task details when a task card is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByLabelText(/task sound check/i))

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Sound check')).toBeInTheDocument()
    expect(within(dialog).getByText('Task owner')).toBeInTheDocument()
    expect(within(dialog).getByText('Ava Jansen')).toBeInTheDocument()
    expect(within(dialog).getByText(/this task is assigned directly/i)).toBeInTheDocument()
  })

  it('removes the calendar panel header while keeping the side panel headers', () => {
    render(<App />)

    expect(screen.queryByText('Paper planner')).not.toBeInTheDocument()
    expect(screen.queryByText(/drag tasks into open blocks/i)).not.toBeInTheDocument()
    expect(screen.getAllByText('Planner MVP')).toHaveLength(2)
  })

  it('opens row details with owner and scheduled tasks', async () => {
    const user = userEvent.setup()
    render(<App />)

    const rowButton = screen.getByRole('button', { name: /liv's tasks/i })
    await user.click(rowButton)

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText("Liv's tasks")).toBeInTheDocument()
    expect(within(dialog).getByText('Lane owner')).toBeInTheDocument()
    expect(within(dialog).getByText('Liv Pedersen')).toBeInTheDocument()
    expect(within(dialog).getByText('Badge pickup')).toBeInTheDocument()
    expect(within(dialog).getByText('Volunteer check-in')).toBeInTheDocument()
  })

  it('keeps task cards compact and shows assigned rows as first-name task groups', async () => {
    const user = userEvent.setup()
    render(<App />)

    const soundCheckCard = screen.getByLabelText(/task sound check/i)
    expect(
      within(soundCheckCard).getByRole('heading', { name: /sound check/i }).className,
    ).toMatch(/line-clamp-1|truncate/)

    const [taskCard] = screen.getAllByLabelText(/task badge pickup/i)

    expect(within(taskCard).getByText('LP')).toBeInTheDocument()
    expect(within(taskCard).queryByText('Liv Pedersen')).not.toBeInTheDocument()
    expect(
      within(taskCard).queryByRole('button', { name: /clear task assignee/i }),
    ).not.toBeInTheDocument()

    const rowHeader = screen.getByRole('button', { name: /liv's tasks/i })
    expect(within(rowHeader).getByText('LP')).toBeInTheDocument()
    expect(within(rowHeader).queryByText('Liv Pedersen')).not.toBeInTheDocument()
    expect(within(rowHeader).getByText("Liv's tasks").className).toMatch(
      /line-clamp-1|truncate/,
    )
    expect(
      within(rowHeader).getByRole('button', { name: /clear row assignee/i }),
    ).toBeInTheDocument()

    await user.click(taskCard)

    const dialog = screen.getByRole('dialog')
    expect(
      within(dialog).getByText(/this task inherits its assignee from liv's tasks/i),
    ).toBeInTheDocument()
  })

  it('clears a direct task assignee inline without opening details', async () => {
    const user = userEvent.setup()
    render(<App />)

    const taskCard = screen.getByLabelText(/task sound check/i)
    const clearButton = within(taskCard).getByRole('button', {
      name: /clear task assignee/i,
    })

    await user.click(clearButton)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(within(taskCard).queryByText('Ava Jansen')).not.toBeInTheDocument()
    expect(within(taskCard).queryByText('AJ')).not.toBeInTheDocument()
  })

  it('clears a row assignee inline without opening details', async () => {
    const user = userEvent.setup()
    render(<App />)

    const rowHeader = screen.getByRole('button', { name: /liv's tasks/i })
    const clearButton = within(rowHeader).getByRole('button', {
      name: /clear row assignee/i,
    })

    await user.click(clearButton)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(within(rowHeader).queryByText('Liv Pedersen')).not.toBeInTheDocument()
    expect(within(rowHeader).getByText('Block 4')).toBeInTheDocument()
    expect(
      within(rowHeader).queryByRole('button', { name: /clear row assignee/i }),
    ).not.toBeInTheDocument()
  })

  it('does not expose a direct clear control for inherited task assignees', () => {
    render(<App />)

    const taskCard = screen.getByLabelText(/task badge pickup/i)

    expect(within(taskCard).getByText('LP')).toBeInTheDocument()
    expect(within(taskCard).queryByText('Liv Pedersen')).not.toBeInTheDocument()
    expect(
      within(taskCard).queryByRole('button', { name: /clear task assignee/i }),
    ).not.toBeInTheDocument()
  })

  it('lights up valid task and row targets while dragging a person', () => {
    render(<App />)

    const personCard = screen.getByRole('button', { name: /person ava jansen/i })
    const taskCard = screen.getByLabelText(/task sound check/i)
    const rowDropzone = screen.getByLabelText(/assign person to liv's tasks/i)

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

    const task = screen.getAllByText('Prep signage')[0].closest('article')

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

    expect(screen.queryByLabelText(/open block 1 09:30 slot details/i)).not.toBeInTheDocument()
  })

  it('renders drag glyphs in empty cells and tints them during task drag', () => {
    const { container } = render(<App />)

    expect(screen.getAllByTestId('empty-cell-glyph').length).toBeGreaterThan(0)
    expect(screen.queryByText(/drop task here/i)).not.toBeInTheDocument()

    const taskCard = screen.getByLabelText(/task prep signage/i)

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

    expect(container.querySelectorAll('.empty-cell-state--ready').length).toBeGreaterThan(0)
    expect(screen.queryByText(/drop task here/i)).not.toBeInTheDocument()
  })

  it('uses block labels for unassigned rows and assigned labels for owned rows', () => {
    render(<App />)

    expect(screen.getByText('Block 1')).toBeInTheDocument()
    expect(screen.getByText('Block 2')).toBeInTheDocument()
    expect(screen.getByText('Block 3')).toBeInTheDocument()
    expect(screen.getByText("Liv's tasks")).toBeInTheDocument()
    expect(screen.getByText('Block 5')).toBeInTheDocument()
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
})
