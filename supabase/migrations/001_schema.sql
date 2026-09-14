-- Nicolenails — esquema base
-- Tablas principales del sistema de reservas.

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

-- ---------------------------------------------------------------------------
-- services
-- ---------------------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  duration_minutes integer not null check (duration_minutes > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email)
);

-- ---------------------------------------------------------------------------
-- appointments
-- ---------------------------------------------------------------------------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete restrict,
  service_id uuid not null references public.services (id) on delete restrict,
  date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'cancelled', 'completed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index if not exists appointments_date_idx on public.appointments (date);
create index if not exists appointments_status_idx on public.appointments (status);
create index if not exists appointments_customer_idx on public.appointments (customer_id);

-- Un único profesional atiende cada cita: dos citas activas (pending/accepted)
-- no pueden solaparse en el tiempo, sea cual sea el servicio.
create type public.timerange as range (subtype = time);

alter table public.appointments
  add constraint appointments_no_overlap
  exclude using gist (
    date with =,
    public.timerange(start_time, end_time) with &&
  )
  where (status in ('pending', 'accepted'));

-- ---------------------------------------------------------------------------
-- business_hours
-- ---------------------------------------------------------------------------
create table if not exists public.business_hours (
  id uuid primary key default gen_random_uuid(),
  -- 0 = domingo … 6 = sábado (igual que extract(dow from date))
  day_of_week smallint not null check (day_of_week between 0 and 6),
  opening_time time not null,
  closing_time time not null,
  active boolean not null default true,
  unique (day_of_week),
  check (closing_time > opening_time)
);

-- ---------------------------------------------------------------------------
-- blocked_slots
-- ---------------------------------------------------------------------------
create table if not exists public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  -- start_time/end_time NULL = bloquea el día completo
  start_time time,
  end_time time,
  reason text,
  created_at timestamptz not null default now(),
  check (
    (start_time is null and end_time is null)
    or (start_time is not null and end_time is not null and end_time > start_time)
  )
);

create index if not exists blocked_slots_date_idx on public.blocked_slots (date);

-- ---------------------------------------------------------------------------
-- admins — usuarios de Supabase Auth con acceso al panel de administración.
-- Se gestiona manualmente (dashboard/SQL), no desde la app.
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.services;
create trigger set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.customers;
create trigger set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.appointments;
create trigger set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();
