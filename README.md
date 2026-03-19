# Hand-Drawn Scheduler MVP

Single-page scheduling board built with React, TypeScript, Tailwind CSS, `dnd-kit`, and Framer Motion. The planner keeps all state locally, persists to `localStorage`, and seeds the board with demo rows, tasks, and people on first load.

## Run

```bash
npm install
npm run dev
```

## Verify

```bash
npm run build
npm test
npm run lint
```

## Core behavior

- Drag tasks from the left inventory into empty calendar cells.
- Move scheduled tasks between rows and time blocks.
- Drag scheduled tasks back into the left inventory to unschedule them.
- Drag people from the right inventory onto a task to assign that task.
- Drag people onto a row header to assign the whole row and clear task-level assignees in that row.
- Clear task or row assignments with explicit controls.

## Project structure

```text
src/
  app/
    App.tsx
    App.test.tsx
  domain/schedule/
    constants.ts
    dnd.ts
    reducer.ts
    reducer.test.ts
    seed.ts
    selectors.ts
    storage.ts
    types.ts
  features/
    calendar/
    layout/
    people/
    schedule/
    shared/
    tasks/
  lib/cx.ts
  index.css
  main.tsx
```

## Notes

- Planner state is stored under `scheduler-mvp:v1`.
- Time blocks are fixed from `08:30` to `14:30`.
- Each calendar cell accepts at most one task.
- Unscheduled tasks do not keep person assignments in this MVP.
