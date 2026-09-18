-- CRM schema: profiles, contacts, projects, task statuses (board columns), tasks.
-- Shared-workspace model: every authenticated user can see and edit all
-- records. If you need per-team isolation later, add a workspace_id column
-- and tighten the policies below.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_color text not null default '#7B68EE',
  created_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    (array['#7B68EE', '#F76B8A', '#2FB7B0', '#F2994A', '#5B8DEF'])[1 + floor(random() * 5)]
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- shared updated_at trigger helper
-- ---------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- contacts
-- ---------------------------------------------------------------------------
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  company text,
  title text,
  notes text,
  tags text[] not null default '{}',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- projects (boards)
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  color text not null default '#7B68EE',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- task_statuses (per-project Kanban columns)
-- ---------------------------------------------------------------------------
create table if not exists public.task_statuses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  color text not null default '#94A3B8',
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'task_priority') then
    create type public.task_priority as enum ('low', 'normal', 'high', 'urgent');
  end if;
end
$$;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  status_id uuid not null references public.task_statuses (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,
  title text not null,
  description text,
  priority public.task_priority not null default 'normal',
  assignee_id uuid references public.profiles (id) on delete set null,
  due_date date,
  position integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create index if not exists tasks_project_id_idx on public.tasks (project_id);
create index if not exists tasks_status_id_idx on public.tasks (status_id);
create index if not exists tasks_contact_id_idx on public.tasks (contact_id);
create index if not exists task_statuses_project_id_idx on public.task_statuses (project_id);

-- ---------------------------------------------------------------------------
-- row level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.projects enable row level security;
alter table public.task_statuses enable row level security;
alter table public.tasks enable row level security;

create policy "profiles_select_authenticated" on public.profiles
  for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id);

create policy "contacts_all_authenticated" on public.contacts
  for all to authenticated using (true) with check (true);

create policy "projects_all_authenticated" on public.projects
  for all to authenticated using (true) with check (true);

create policy "task_statuses_all_authenticated" on public.task_statuses
  for all to authenticated using (true) with check (true);

create policy "tasks_all_authenticated" on public.tasks
  for all to authenticated using (true) with check (true);
