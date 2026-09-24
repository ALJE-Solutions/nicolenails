-- Nicolenails — cancelación pública de citas
--
-- Permite que el cliente cancele su propia cita desde el enlace incluido en
-- el email de confirmación, sin necesitar cuenta ni acceso al panel. El id
-- de la cita (uuid aleatorio, no enumerable) actúa como token de acceso.
-- Estas dos funciones SECURITY DEFINER son la única vía pública: no hay
-- policy de SELECT/UPDATE directa sobre "appointments" para anon.

create or replace function public.get_appointment_for_cancellation(
  p_appointment_id uuid
)
returns table (
  service_name text,
  date date,
  start_time time,
  status text
)
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return query
  select s.name, a.date, a.start_time, a.status
  from appointments a
  join services s on s.id = a.service_id
  where a.id = p_appointment_id;
end;
$$;

grant execute on function public.get_appointment_for_cancellation(uuid) to anon, authenticated;

create or replace function public.cancel_appointment(
  p_appointment_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
begin
  select status into v_status from appointments where id = p_appointment_id;

  if v_status is null then
    raise exception 'APPOINTMENT_NOT_FOUND';
  end if;

  if v_status not in ('pending', 'accepted') then
    raise exception 'NOT_CANCELLABLE';
  end if;

  update appointments set status = 'cancelled' where id = p_appointment_id;
end;
$$;

grant execute on function public.cancel_appointment(uuid) to anon, authenticated;
