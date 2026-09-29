-- Snow & ice service extensions: properties (service sites), a services price
-- list, estimates and proposals with line items. Follows the same
-- shared-workspace / RLS pattern as 0001_init.sql.

-- ---------------------------------------------------------------------------
-- properties (service sites belonging to a contact/customer)
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'property_type') then
    create type public.property_type as enum ('residential', 'commercial', 'municipal', 'hoa');
  end if;
end
$$;

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts (id) on delete cascade,
  label text not null,
  property_type public.property_type not null default 'residential',
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  surface_type text,
  square_footage numeric,
  salt_sensitive boolean not null default false,
  gate_code text,
  access_notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

create index if not exists properties_contact_id_idx on public.properties (contact_id);

-- ---------------------------------------------------------------------------
-- services (price list catalog)
-- ---------------------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'other'
    check (category in ('plowing', 'salting', 'shoveling', 'hauling', 'seasonal', 'other')),
  unit text not null default 'per visit',
  default_rate numeric not null default 0,
  description text,
  active boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

insert into public.services (name, category, unit, default_rate, description)
select v.name, v.category, v.unit, v.default_rate, v.description
from (
  values
    ('Plowing - Per Push', 'plowing', 'per push', 75, 'Single plow pass once accumulation threshold is met.'),
    ('Seasonal Plowing Contract', 'seasonal', 'flat', 1800, 'Unlimited plowing for the full winter season.'),
    ('Sidewalk Shoveling', 'shoveling', 'per visit', 35, 'Hand shoveling of walkways and entrances.'),
    ('Salt Application', 'salting', 'per application', 60, 'Rock salt spread across lot or walkways.'),
    ('Ice Melt / Brine Application', 'salting', 'per application', 85, 'Liquid brine pre-treatment or ice melt.'),
    ('Snow Hauling', 'hauling', 'per truckload', 250, 'Off-site removal of piled snow.')
) as v(name, category, unit, default_rate, description)
where not exists (select 1 from public.services s where s.name = v.name);

-- ---------------------------------------------------------------------------
-- estimates
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'estimate_status') then
    create type public.estimate_status as enum ('draft', 'sent', 'approved', 'declined', 'expired');
  end if;
end
$$;

create sequence if not exists public.estimate_number_seq start 1;

create table if not exists public.estimates (
  id uuid primary key default gen_random_uuid(),
  number text not null default ('EST-' || lpad(nextval('public.estimate_number_seq')::text, 4, '0')),
  contact_id uuid not null references public.contacts (id) on delete cascade,
  property_id uuid references public.properties (id) on delete set null,
  season text,
  status public.estimate_status not null default 'draft',
  valid_until date,
  notes text,
  terms text,
  subtotal numeric not null default 0,
  tax_rate numeric not null default 0,
  tax_amount numeric not null default 0,
  total numeric not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.estimates add constraint estimates_number_key unique (number);

drop trigger if exists estimates_set_updated_at on public.estimates;
create trigger estimates_set_updated_at
  before update on public.estimates
  for each row execute function public.set_updated_at();

create index if not exists estimates_contact_id_idx on public.estimates (contact_id);
create index if not exists estimates_property_id_idx on public.estimates (property_id);

create table if not exists public.estimate_line_items (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.estimates (id) on delete cascade,
  service_id uuid references public.services (id) on delete set null,
  description text not null,
  quantity numeric not null default 1,
  unit text,
  unit_price numeric not null default 0,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists estimate_line_items_estimate_id_idx on public.estimate_line_items (estimate_id);

-- ---------------------------------------------------------------------------
-- proposals (client-facing document, typically generated from an estimate)
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'proposal_status') then
    create type public.proposal_status as enum ('draft', 'sent', 'accepted', 'declined', 'expired');
  end if;
end
$$;

create sequence if not exists public.proposal_number_seq start 1;

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  number text not null default ('PRO-' || lpad(nextval('public.proposal_number_seq')::text, 4, '0')),
  estimate_id uuid references public.estimates (id) on delete set null,
  contact_id uuid not null references public.contacts (id) on delete cascade,
  property_id uuid references public.properties (id) on delete set null,
  status public.proposal_status not null default 'draft',
  valid_until date,
  notes text,
  terms text,
  subtotal numeric not null default 0,
  tax_rate numeric not null default 0,
  tax_amount numeric not null default 0,
  total numeric not null default 0,
  sent_at timestamptz,
  accepted_at timestamptz,
  declined_at timestamptz,
  signed_by text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.proposals add constraint proposals_number_key unique (number);

drop trigger if exists proposals_set_updated_at on public.proposals;
create trigger proposals_set_updated_at
  before update on public.proposals
  for each row execute function public.set_updated_at();

create index if not exists proposals_contact_id_idx on public.proposals (contact_id);
create index if not exists proposals_property_id_idx on public.proposals (property_id);
create index if not exists proposals_estimate_id_idx on public.proposals (estimate_id);

create table if not exists public.proposal_line_items (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals (id) on delete cascade,
  service_id uuid references public.services (id) on delete set null,
  description text not null,
  quantity numeric not null default 1,
  unit text,
  unit_price numeric not null default 0,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists proposal_line_items_proposal_id_idx on public.proposal_line_items (proposal_id);

-- ---------------------------------------------------------------------------
-- row level security
-- ---------------------------------------------------------------------------
alter table public.properties enable row level security;
alter table public.services enable row level security;
alter table public.estimates enable row level security;
alter table public.estimate_line_items enable row level security;
alter table public.proposals enable row level security;
alter table public.proposal_line_items enable row level security;

create policy "properties_all_authenticated" on public.properties
  for all to authenticated using (true) with check (true);

create policy "services_all_authenticated" on public.services
  for all to authenticated using (true) with check (true);

create policy "estimates_all_authenticated" on public.estimates
  for all to authenticated using (true) with check (true);

create policy "estimate_line_items_all_authenticated" on public.estimate_line_items
  for all to authenticated using (true) with check (true);

create policy "proposals_all_authenticated" on public.proposals
  for all to authenticated using (true) with check (true);

create policy "proposal_line_items_all_authenticated" on public.proposal_line_items
  for all to authenticated using (true) with check (true);
