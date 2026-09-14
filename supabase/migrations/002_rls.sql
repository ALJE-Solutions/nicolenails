-- Nicolenails — Row Level Security
--
-- Modelo:
--   * "services" es la única tabla con lectura pública (solo activos).
--   * "customers", "appointments", "business_hours" y "blocked_slots" no
--     tienen ninguna política pública: el público solo interactúa con ellas
--     a través de las funciones SECURITY DEFINER de 003_functions.sql.
--   * Los administradores (tabla "admins") tienen acceso completo a todo.

alter table public.services enable row level security;
alter table public.customers enable row level security;
alter table public.appointments enable row level security;
alter table public.business_hours enable row level security;
alter table public.blocked_slots enable row level security;
alter table public.admins enable row level security;

-- ---------------------------------------------------------------------------
-- Helper: ¿el usuario autenticado actual es administrador?
-- SECURITY DEFINER + dueño con privilegios evita recursión de RLS al
-- consultar la propia tabla "admins".
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.admins a where a.id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- services
-- ---------------------------------------------------------------------------
create policy services_public_select
  on public.services
  for select
  to anon, authenticated
  using (active = true or public.is_admin());

create policy services_admin_write
  on public.services
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- customers — sin acceso público; solo administradores.
-- ---------------------------------------------------------------------------
create policy customers_admin_all
  on public.customers
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- appointments — sin acceso público; solo administradores.
-- El estado de una cita solo puede cambiarlo un administrador.
-- ---------------------------------------------------------------------------
create policy appointments_admin_all
  on public.appointments
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- business_hours — sin acceso público; solo administradores.
-- ---------------------------------------------------------------------------
create policy business_hours_admin_all
  on public.business_hours
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- blocked_slots — sin acceso público; solo administradores.
-- ---------------------------------------------------------------------------
create policy blocked_slots_admin_all
  on public.blocked_slots
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- admins — visible solo para administradores; se gestiona desde el
-- dashboard/SQL, no hay policy de escritura para la app.
-- ---------------------------------------------------------------------------
create policy admins_self_select
  on public.admins
  for select
  to authenticated
  using (public.is_admin());
