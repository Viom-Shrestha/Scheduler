# The Deck

A small local-first task scheduler — a board of what's active, waiting on
someone else, someday, or done, grouped by project, alongside a calendar
and agenda of what's due when. See [CLAUDE.md](./CLAUDE.md) for the full
spec and data model.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). First run creates a
local SQLite database at `data/tasks.db` and seeds it with a few example
projects — no setup needed.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- SQLite via `@libsql/client`, behind `lib/db.ts`

## Deploying (e.g. to Vercel)

The local SQLite file won't persist on serverless hosting. Create a free
database at [turso.tech](https://turso.tech), then set `DATABASE_URL` and
`DATABASE_AUTH_TOKEN` as environment variables on your deployment — see
`.env.local.example`. No code changes needed.
