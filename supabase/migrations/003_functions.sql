-- Nicolenails — funciones públicas (SECURITY DEFINER)
--
-- Estas dos funciones son la ÚNICA vía de acceso público a la disponibilidad
-- y a la creación de citas. El cliente anónimo nunca hace SELECT/INSERT
-- directo sobre appointments/customers/business_hours/blocked_slots.
--
-- Zona horaria asumida: Europe/Madrid (ajustar si el negocio cambia de país).

-- ---------------------------------------------------------------------------
-- get_available_slots: huecos libres para un servicio en una fecha dada.
-- ---------------------------------------------------------------------------
create or replace function public.get_available_slots(
  p_service_id uuid,
  p_date date
)
returns table (slot_start time, slot_end time)
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_duration integer;
  v_dow smallint;
  v_open time;
  v_close time;
  v_step interval := interval '15 minutes';
  v_cursor time;
  v_slot_end time;
  v_today date;
  v_now_time time;
begin
  v_today := (now() at time zone 'Europe/Madrid')::date;
  if p_date < v_today then
    return;
  end if;

  if p_date = v_today then
    v_now_time := (now() at time zone 'Europe/Madrid')::time;
  else
    v_now_time := null;
  end if;

  select duration_minutes into v_duration
  from services
  where id = p_service_id and active = true;

  if v_duration is null then
    return; -- servicio inexistente o inactivo
  end if;

  v_dow := extract(dow from p_date);

  select opening_time, closing_time into v_open, v_close
  from business_hours
  where day_of_week = v_dow and active = true;

  if v_open is null then
    return; -- negocio cerrado ese día
  end if;

  if exists (
    select 1 from blocked_slots
    where date = p_date and start_time is null and end_time is null
  ) then
    return; -- día completo bloqueado
  end if;

  v_cursor := v_open;
  while v_cursor + (v_duration || ' minutes')::interval <= v_close loop
    v_slot_end := v_cursor + (v_duration || ' minutes')::interval;

    if (v_now_time is null or v_cursor > v_now_time)
      and not exists (
        select 1 from appointments a
        where a.date = p_date
          and a.status in ('pending', 'accepted')
          and a.start_time < v_slot_end
          and a.end_time > v_cursor
      )
      and not exists (
        select 1 from blocked_slots b
        where b.date = p_date
          and b.start_time is not null
          and b.start_time < v_slot_end
          and b.end_time > v_cursor
      )
    then
      slot_start := v_cursor;
      slot_end := v_slot_end;
      return next;
    end if;

    v_cursor := v_cursor + v_step;
  end loop;

  return;
end;
$$;

grant execute on function public.get_available_slots(uuid, date) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- create_appointment: crea (o reutiliza) el cliente y la cita en "pending".
-- Revalida la disponibilidad dentro de la misma transacción para evitar
-- dobles reservas por condición de carrera (además del exclusion constraint
-- de la tabla appointments, que actúa como última red de seguridad).
-- ---------------------------------------------------------------------------
create or replace function public.create_appointment(
  p_service_id uuid,
  p_date date,
  p_start_time time,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_notes text default null
)
returns table (appointment_id uuid, status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_duration integer;
  v_end_time time;
  v_customer_id uuid;
  v_appointment_id uuid;
begin
  select duration_minutes into v_duration
  from services
  where id = p_service_id and active = true;

  if v_duration is null then
    raise exception 'SERVICE_NOT_FOUND';
  end if;

  if p_customer_name is null or length(trim(p_customer_name)) = 0 then
    raise exception 'INVALID_NAME';
  end if;

  if p_customer_email is null or p_customer_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'INVALID_EMAIL';
  end if;

  if p_customer_phone is null or length(trim(p_customer_phone)) < 6 then
    raise exception 'INVALID_PHONE';
  end if;

  v_end_time := p_start_time + (v_duration || ' minutes')::interval;

  if not exists (
    select 1 from get_available_slots(p_service_id, p_date) s
    where s.slot_start = p_start_time
  ) then
    raise exception 'SLOT_NOT_AVAILABLE';
  end if;

  insert into customers (name, email, phone)
  values (trim(p_customer_name), lower(trim(p_customer_email)), trim(p_customer_phone))
  on conflict (email) do update
    set name = excluded.name,
        phone = excluded.phone,
        updated_at = now()
  returning id into v_customer_id;

  begin
    insert into appointments (customer_id, service_id, date, start_time, end_time, status, notes)
    values (
      v_customer_id,
      p_service_id,
      p_date,
      p_start_time,
      v_end_time,
      'pending',
      nullif(trim(coalesce(p_notes, '')), '')
    )
    returning id into v_appointment_id;
  exception
    when exclusion_violation then
      raise exception 'SLOT_NOT_AVAILABLE';
  end;

  appointment_id := v_appointment_id;
  status := 'pending';
  return next;
end;
$$;

grant execute on function public.create_appointment(uuid, date, time, text, text, text, text)
  to anon, authenticated;
