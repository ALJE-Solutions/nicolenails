-- Nicolenails — datos públicos para el archivo .ics de una cita confirmada
--
-- Se usa desde app/(site)/cita/[id]/ics/route.ts, enlazado desde el botón
-- "Añadir a Apple Calendar / Outlook" del email de confirmación (Resend),
-- para que el cliente pueda añadir la cita a su calendario con un solo clic
-- (el navegador/OS abre el archivo directamente), sin depender de un
-- adjunto de email. El id de la cita actúa como token, igual que en
-- get_appointment_for_cancellation (007/008).

create or replace function public.get_appointment_for_ics(
  p_appointment_id uuid
)
returns table (
  service_name text,
  date date,
  start_time time,
  end_time time,
  status text
)
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return query
  select s.name, a.date, a.start_time, a.end_time, a.status
  from appointments a
  join services s on s.id = a.service_id
  where a.id = p_appointment_id;
end;
$$;

grant execute on function public.get_appointment_for_ics(uuid) to anon, authenticated;
