-- Nicolenails — personal (staff) y citas concurrentes
--
-- Habilita que varias personas trabajen a la vez: cada cita puede asignarse
-- a un miembro del personal. La asignación se hace al ACEPTAR la cita desde
-- el panel (el cliente no elige persona al reservar).

-- ---------------------------------------------------------------------------
-- staff
-- ---------------------------------------------------------------------------
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.staff;
create trigger set_updated_at
  before update on public.staff
  for each row execute function public.set_updated_at();

alter table public.staff enable row level security;

create policy staff_admin_all
  on public.staff
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- appointments.staff_id — nulo hasta que se acepta la cita.
-- ---------------------------------------------------------------------------
alter table public.appointments
  add column if not exists staff_id uuid references public.staff (id) on delete set null;

create index if not exists appointments_staff_idx on public.appointments (staff_id);

-- ---------------------------------------------------------------------------
-- El exclusion constraint anterior asumía un único profesional: bloqueaba
-- cualquier solapamiento sin importar quién lo atendiera. Ahora:
--   * la disponibilidad pública (ver 005_multi_staff_availability.sql)
--     compara el nº de citas activas solapadas contra el nº de personal
--     activo, en vez de bloquear en cuanto existe una cita;
--   * a nivel de base de datos protegemos que una MISMA persona ya asignada
--     no termine con dos citas aceptadas solapadas (red de seguridad).
-- ---------------------------------------------------------------------------
alter table public.appointments
  drop constraint if exists appointments_no_overlap;

alter table public.appointments
  add constraint appointments_staff_no_overlap
  exclude using gist (
    staff_id with =,
    date with =,
    public.timerange(start_time, end_time) with &&
  )
  where (status = 'accepted' and staff_id is not null);
