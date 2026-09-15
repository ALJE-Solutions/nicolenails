-- Nicolenails — horario partido (varios tramos por día)
--
-- Hasta ahora "business_hours" solo admitía un tramo por día (unique
-- day_of_week), lo que no permite representar un horario de mañana y tarde
-- con descanso (p. ej. 9:00-14:00 y 17:00-20:00). Ahora cada día puede tener
-- cero, uno o varios tramos: cada fila es un tramo suelto, y un día sin
-- filas simplemente está cerrado (ya no hace falta la columna "active").

alter table public.business_hours
  drop constraint if exists business_hours_day_of_week_key;

alter table public.business_hours
  drop column if exists active;

create index if not exists business_hours_day_idx on public.business_hours (day_of_week);
