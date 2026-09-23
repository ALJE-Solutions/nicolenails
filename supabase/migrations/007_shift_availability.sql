-- Nicolenails — disponibilidad con horario partido
--
-- Sustituye get_available_slots para recorrer TODOS los tramos del día
-- (antes asumía un único tramo opening_time/closing_time por día_of_week).

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
  v_shift record;
  v_step interval := interval '15 minutes';
  v_cursor time;
  v_slot_end time;
  v_today date;
  v_now_time time;
  v_staff_count integer;
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

  select count(*) into v_staff_count from staff where active = true;
  if v_staff_count = 0 then
    return; -- sin personal dado de alta no hay huecos que ofrecer
  end if;

  select duration_minutes into v_duration
  from services
  where id = p_service_id and active = true;

  if v_duration is null then
    return; -- servicio inexistente o inactivo
  end if;

  if exists (
    select 1 from blocked_slots
    where date = p_date and start_time is null and end_time is null
  ) then
    return; -- día completo bloqueado
  end if;

  v_dow := extract(dow from p_date);

  for v_shift in
    select opening_time, closing_time
    from business_hours
    where day_of_week = v_dow
    order by opening_time
  loop
    v_cursor := v_shift.opening_time;
    while v_cursor + (v_duration || ' minutes')::interval <= v_shift.closing_time loop
      v_slot_end := v_cursor + (v_duration || ' minutes')::interval;

      if (v_now_time is null or v_cursor > v_now_time)
        and (
          select count(*) from appointments a
          where a.date = p_date
            and a.status in ('pending', 'accepted')
            and a.start_time < v_slot_end
            and a.end_time > v_cursor
        ) < v_staff_count
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
  end loop;

  return;
end;
$$;

grant execute on function public.get_available_slots(uuid, date) to anon, authenticated;
