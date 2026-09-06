@AGENTS.md

# The Deck — personal work scheduler

## What this is
A small local-first web app for Viom to see everything currently in flight
in one place: active work, things blocked on someone else's reply, someday
items, and a calendar/timeline view of what's due when. Multiple unrelated
projects at once (a school website with sub-tasks, a company registration,
a final year project, internship applications, research work, etc.) — the
point is nothing quietly falls through the cracks.

Should run locally with `npm install && npm run dev`. Meant to be
deployable to Vercel's free tier later with no code changes — see Storage
below.

## Design
A static design reference (HTML mockup) is in `reference/`. Build the
real, functional version to match its look, layout, and composition as
closely as reasonably possible — colors, fonts, spacing, card style, the
works. The mockup is not functional (no real state, no real data) and uses
templated syntax — treat it purely as the visual and structural target,
not as code to run as-is.

## Stack
- Next.js (App Router) + TypeScript + Tailwind CSS
- Storage: SQLite via `@libsql/client` (Turso), behind a small abstraction
  in `lib/db.ts`. Locally this points at a plain file (`file:./data/tasks.db`,
  no account needed). In production, set `DATABASE_URL`/`DATABASE_AUTH_TOKEN`
  to a free Turso database and nothing else changes — same client, same
  queries. Do NOT add an ORM or ship a Django/separate backend — Next.js
  Server Actions are the backend.
- No auth, no multi-user concerns.

## Data model
```ts
type Status = 'active' | 'waiting' | 'someday' | 'done';

interface Task {
  id: string;
  project: string;       // e.g. "Marigold School Website"
  title: string;         // the actual sub-task, e.g. "Fix contact form"
  detail?: string;
  status: Status;
  waitingOn?: string;    // who/what it's blocked on, only when status = 'waiting'
  since?: string;        // YYYY-MM-DD, stamped when a task becomes 'waiting'
  due?: string;          // YYYY-MM-DD, optional
  createdAt: string;
}
```

Tasks are grouped by `project` — a project is just a free-text string shared
across tasks (no separate projects table needed). Existing projects should
autocomplete when adding a new task.

## Required features
1. **Board view** — Active / Waiting On / Someday / Done, grouped by
   project, with add/edit/delete and status changes.
2. **Calendar / timeline view**, shown *alongside* the board (not a separate
   page) — a small month calendar with dots on days that have a `due` task,
   plus an agenda list of upcoming due dates.
3. **"Waiting on" strip** — every task with status `waiting`, showing who/what
   it's waiting on and how many days it's been waiting (computed from `since`).
4. Adding a task should be fast — a lightweight form/modal, not a full page nav.
5. Marking something done should be one click/tap.

## Notes
- Keep it light — this is meant to reduce overwhelm, not add UI complexity.
  Favor clarity over cleverness.
- Seed projects to have on hand for testing: Marigold School Website,
  Fourth Wall Technologies, Closet Buddy (final year project), PexusTech
  Internship, WPT Literature Review.
