# The Deck

A small local-first task scheduler for keeping every project you're
juggling in one place: what's active, what's blocked waiting on someone
else's reply, what's a someday-maybe, and what's due when. Tasks are
grouped by project (school website, company registration, final year
project, internship applications, research work, ...) so nothing quietly
falls through the cracks.

See [CLAUDE.md](./CLAUDE.md) for the original spec this was built from.

## Running it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). First run creates a
local SQLite database and seeds it with a few example projects — no setup
needed.

There's also a desktop launcher — see [Desktop shortcut](#desktop-shortcut)
below — for opening the app like a normal Windows program instead of
running `npm run dev` in a terminal every time.

## Where your data lives

**Locally, in a real SQLite file on disk — not a browser cache, not
`localStorage`, not anything tied to a specific browser or tab.**

The file is `data/tasks.db` inside the project folder. It's created
automatically the first time the app starts (`lib/db.ts` calls `mkdirSync`
on the `data/` folder if it doesn't exist yet, then opens/creates
`tasks.db` there via `@libsql/client`). It's a genuine SQLite database file
— you can point any SQLite browser/CLI at it directly. It's excluded from
git (see `.gitignore`), so it stays entirely local and isn't something you
could accidentally commit or publish.

Because it's a real file rather than a cache:
- It survives closing the app, restarting your machine, `npm install`, etc.
- It does *not* survive deleting the `data/` folder, or moving/reinstalling
  the project without carrying that folder along.
- Opening the app in a different browser, or as the packaged desktop app
  vs. a plain browser tab, sees the *same* data — it's all hitting the same
  local Next.js server and the same file, not per-browser storage.

If you ever deploy this somewhere other than your own machine (Vercel,
etc.), a plain file won't survive serverless restarts — see
[Deploying](#deploying) for the one-env-var swap to a hosted SQLite
(Turso) instead. Locally, nothing changes.

## How it's built

- **Next.js (App Router) + TypeScript + Tailwind CSS.** No separate
  backend, no ORM — Next.js Server Actions *are* the backend.
- **Storage:** SQLite via `@libsql/client` (the Turso client library, which
  also happily talks to a plain local file — see above), behind a small
  hand-written data-access layer in `lib/db.ts`.
- **No auth, single user.** This is a personal tool, not a multi-tenant app.

### Request flow

There's no API layer to speak of — it's all Server Components and Server
Actions:

1. `app/page.tsx` is a Server Component. On each load it calls
   `listTasks()` from `lib/db.ts` directly (real server-side code, runs on
   the Next.js server, never shipped to the browser) and passes the tasks
   down as a prop.
2. `components/DeckApp.tsx` (a Client Component — everything interactive
   lives here) takes that task list and derives everything the UI needs
   from it with `useMemo`: tasks grouped by project, the waiting-on list
   sorted by longest-waiting, upcoming due dates for the agenda, overdue /
   due-today / stale-waiting items for the "needs attention" strip, etc.
   There's no separate client-side store — the server's task list *is* the
   state, re-derived on every render.
3. Any change (add, edit, delete, mark done, drag a card to a new
   project/lane) calls a Server Action from `app/actions.ts` — a function
   marked `"use server"` that runs on the server, writes to SQLite via
   `lib/db.ts`, then calls `revalidatePath("/")`. That tells Next.js the
   page's data is stale, so it re-runs `listTasks()` and pushes the new
   list down — no manual `fetch`, no client-side cache to keep in sync by
   hand.
4. Drag-and-drop (moving a card between project/status lanes on the board)
   uses `@dnd-kit/core`, wired up in `DeckApp.tsx`. Drop targets carry
   `{ project, status }` in their data; on drop, that pair is sent straight
   to `moveTaskAction`.

### Data model

```ts
type Status = 'active' | 'waiting' | 'someday' | 'done';

interface Task {
  id: string;
  project: string;       // free-text, shared across tasks — no projects table
  title: string;
  detail?: string;
  status: Status;
  waitingOn?: string;    // who/what it's blocked on, only when status = 'waiting'
  since?: string;        // YYYY-MM-DD, stamped when a task becomes 'waiting'
  due?: string;          // YYYY-MM-DD, optional
  createdAt: string;
}
```

One `tasks` table, defined and created (`CREATE TABLE IF NOT EXISTS`) the
first time the app touches the database — no separate migration step.
`project` is just a text column: a "project" is whatever string is shared
across a group of tasks, not its own entity. `since` is server-managed
(`resolveSince` in `lib/db.ts`): it's stamped with today's date the moment
a task's status becomes `waiting`, left untouched while it stays `waiting`,
and cleared the moment it leaves that status — so "how many days has this
been waiting" (`daysSince` in `lib/dates.ts`) is always measured from the
actual transition, not from whenever the task was created.

On a completely empty database, `lib/db.ts` seeds it once from
`lib/seed.ts` — the example projects from CLAUDE.md (Marigold School
Website, Fourth Wall Technologies, Closet Buddy, PexusTech Internship, WPT
Literature Review), with due/waiting-since dates generated relative to
"today" so the calendar and waiting-strip always look sensible regardless
of when you first run it.

### File map

```
app/
  page.tsx        Server Component — loads tasks, renders DeckApp
  actions.ts       Server Actions — create/update/delete/setStatus/moveTask
  layout.tsx       fonts (Baloo 2 + Karla), page metadata
  globals.css      Tailwind + design tokens
lib/
  db.ts            SQLite access — schema, seeding, all CRUD
  types.ts         Task / Status / TaskInput types
  seed.ts          first-run example data
  dates.ts         local-timezone date helpers, calendar grid builder
  colors.ts        per-project color hashing, status glyphs
components/
  DeckApp.tsx      client shell — state derivation, drag-and-drop, modal
  Board.tsx / LaneCell.tsx / TaskCard.tsx   the Active/Waiting/Someday/Done board
  Calendar.tsx / Agenda.tsx                 month calendar + upcoming due list
  WaitingPanel.tsx / NeedsAttention.tsx     "waiting on" strip, overdue/stale callouts
  TaskModal.tsx    add/edit form (modal, not a page navigation)
  Header.tsx / Mascot.tsx  chrome
reference/         static HTML mockup — visual/structural target only, not run
scripts/           desktop launcher — see below
```

## Desktop shortcut

Since this only ever needs to run on your own machine, there's a "The
Deck" shortcut on the Desktop that starts the app and opens it in its own
window — no terminal, no browser tabs/address bar.

Closing the app window stops everything — the server shuts down with it,
there's nothing left running in the background and nothing to clean up in
Task Manager.

How it works:

- **`scripts/start-deck.ps1`** does the real work. It starts the
  production server (`next start`, via `npm run start`) on a dedicated
  port, **4278** — deliberately *not* Next's default 3000, since that's
  likely to collide with some other project's dev server (e.g. a
  `next dev` you've got running elsewhere) and cause the shortcut to open
  the wrong app entirely. It first checks whether something's already
  listening on 4278 (so clicking the shortcut twice doesn't spawn a second
  server); if not, and there's no production build yet, it runs
  `npm run build` first. The server itself is started fully hidden (no
  console window), with its output going to `scripts/server.log` and
  `server.err.log` instead. It then opens
  `msedge --app=http://localhost:4278` in its **own dedicated browser
  profile** (`%LOCALAPPDATA%\TheDeckEdgeProfile`, separate from your
  normal Edge) — Edge's app mode gives a chromeless window with no tabs or
  address bar, and the separate profile is what makes it a genuinely
  distinct process rather than just another window in whatever Edge
  session you already have open. The script then blocks until *that*
  process exits — i.e. until you close the app window — and only then
  kills the server. If a Deck window was already open when you click the
  shortcut, it just opens another window onto the same server instead of
  double-launching (and won't be the one responsible for stopping it).
- **`scripts/start-deck.vbs`** is what the desktop shortcut actually
  points at. It runs the `.ps1` above completely hidden, so no console
  ever flashes or appears in the taskbar — not even while it's sitting
  there waiting for you to close the app window.
- **`scripts/mascot.ico`** is the shortcut's icon — the header mascot from
  `components/Mascot.tsx` (the fanned deck of cards with the bird face),
  redrawn at icon sizes (16/32/48/256px) by
  **`scripts/make-mascot-icon.ps1`** using plain GDI+ drawing (rounded
  rects, a star polygon, matching the exact coordinates and colors of the
  React component) rather than a screenshot. Re-run it if the mascot's
  design ever changes, then re-run `create-shortcut.ps1` to pick up the
  new icon.
- **`scripts/create-shortcut.ps1`** is what created the Desktop shortcut
  (`The Deck.lnk`). You won't need to run it again unless the project
  folder moves — re-run it with
  `powershell -ExecutionPolicy Bypass -File scripts\create-shortcut.ps1`
  and it'll recreate the shortcut pointing at the new location.

If the server ever needs checking on while it's running (or after a crash),
`scripts/server.log` / `server.err.log` have whatever it printed.

**After you change the app's code**, the shortcut will keep serving the
old build until you rebuild — run `npm run build` once, or delete the
`.next` folder so the next launch rebuilds automatically. For active
day-to-day development, use `npm run dev` instead, which reflects changes
immediately.

## Deploying

The local SQLite file won't persist on serverless hosting. Create a free
database at [turso.tech](https://turso.tech), then set `DATABASE_URL` and
`DATABASE_AUTH_TOKEN` as environment variables on your deployment — see
`.env.local.example`. No code changes needed; `lib/db.ts` uses the same
client either way.

## Design

`reference/` holds a static HTML mockup — the visual and structural target
for colors, fonts, spacing, and card style. It's not functional (no real
state or data, templated syntax) and is never run as part of the app.
