# Flowbase CRM

A self-hosted CRM: contacts, projects, and ClickUp-style task boards
(Kanban with drag-and-drop, plus a list view), built with Next.js and
Supabase.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **Supabase** — Postgres database + authentication (email/password)
- **@dnd-kit** — drag-and-drop Kanban board

This is a shared-workspace app: every signed-in user can see and edit all
contacts, projects and tasks (like a small team's shared CRM). There's no
per-team data isolation — see [Multi-tenant](#multi-tenant--roles) below if
you need that.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In the Supabase SQL editor, run the migration in
   [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql).
   This creates all tables, the `profiles` auto-provisioning trigger, and
   row-level security policies.
   - Or, if you use the [Supabase CLI](https://supabase.com/docs/guides/cli):
     `supabase link --project-ref <your-ref>` then `supabase db push`.
3. In **Authentication → Providers**, email/password sign-up is enabled by
   default. If you want to skip email confirmation for local testing, turn
   off "Confirm email" under **Authentication → Sign In / Providers → Email**.
4. Copy your project's **URL** and **anon/public key** from
   **Settings → API**.

## 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

## 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up for an
account, and you'll land on the dashboard.

## 4. Deploy

### Option A — Vercel (easiest)

1. Push this repo to GitHub.
2. Import it in [Vercel](https://vercel.com/new).
3. Add the two environment variables from `.env.local` in the Vercel
   project settings.
4. Deploy. Vercel builds and hosts the Next.js app; Supabase remains your
   database/auth backend.

### Option B — Self-host with Docker

Build and run the production server yourself:

```bash
npm run build
npm run start   # serves on port 3000
```

Put this behind your own reverse proxy (Caddy/Nginx) with TLS, or wrap it
in a Dockerfile using the [Next.js standalone output](https://nextjs.org/docs/app/getting-started/deploying#docker) guide. Either way, the app
still talks to your Supabase project over the network — Supabase itself
isn't part of this repo, but you can also self-host Supabase (see
[supabase.com/docs/guides/self-hosting](https://supabase.com/docs/guides/self-hosting))
if you want the whole stack under your control.

## Features

- **Auth** — email/password sign-up & sign-in via Supabase Auth, protected
  routes via `src/proxy.ts` (Next.js 16's proxy, formerly `middleware.ts`).
- **Contacts** — searchable list, create/edit/delete, notes & tags, and a
  detail page showing every task linked to that contact.
- **Projects** — colorful project cards; each project gets its own board
  seeded with default columns (Backlog, To Do, In Progress, Review, Done).
- **Kanban board** — drag tasks between columns or reorder within a
  column, add/remove columns, click a card to edit title, description,
  priority, assignee, due date, and linked contact. A **List** view shows
  the same tasks as a sortable table.
- **Dashboard** — contact/project/task counts, tasks due soon, overdue
  tasks, and a recent-activity feed.

## Project structure

```
src/
  app/
    login/, signup/, auth/callback/   — auth pages & OAuth-style callback
    app/                              — protected area (redirects to /login if signed out)
      page.tsx                        — dashboard
      contacts/                       — contacts list, detail, server actions
      projects/                       — project grid, board, server actions
  components/
    ui/                               — Button, Input, Modal, Badge, Avatar…
    layout/                           — sidebar, sign-out button
    contacts/, projects/, kanban/     — feature components
  lib/
    supabase/                         — browser & server Supabase clients
    types.ts, utils.ts
  proxy.ts                            — session refresh + route protection
supabase/migrations/0001_init.sql     — full database schema
```

## Multi-tenant / roles

This app currently uses a single shared workspace: any authenticated user
can read and write all data (see the RLS policies in the migration file).
To turn it into a multi-team product, you'd add a `workspace_id` column to
`contacts`, `projects`, `task_statuses`, and `tasks`, a `workspace_members`
table, and update the RLS policies to check membership instead of just
`auth.role() = 'authenticated'`.
