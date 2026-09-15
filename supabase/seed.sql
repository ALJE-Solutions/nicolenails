-- Nicolenails — datos iniciales reales
--
-- Borra lo que hubiera en services / staff / business_hours (p. ej. datos
-- de prueba de una versión anterior de este seed) y deja solo los datos
-- reales del negocio. No toca customers/appointments/blocked_slots — esos
-- son datos de clientes reales, no algo que este seed deba gestionar.
--
-- Nicole es la única trabajadora (es la dueña, trabaja desde casa) — sin
-- foto, el esquema de "staff" no tiene campo de imagen.
--
-- Las duraciones de relleno/uñas nuevas vienen de la propia lista de
-- precios; las de pedicura no se especificaron y son una estimación
-- razonable — ajústalas desde /admin/servicios si no encajan.
--
-- "delete from services" falla si ya hay citas reales que los referencian;
-- en ese caso desactiva los servicios incorrectos desde /admin/servicios
-- en vez de ejecutar este seed.

delete from public.business_hours;
delete from public.staff;
delete from public.services;

insert into public.services (name, description, price, duration_minutes) values
  ('Relleno Solo Color', null, 28.00, 75),
  ('Relleno con Diseño', 'Precio desde 28€, varía según el diseño.', 28.00, 120),
  ('Uñas Nuevas Solo Color', null, 38.00, 90),
  ('Uñas Nuevas con Diseño', 'Precio desde 38€, varía según el diseño.', 38.00, 120),
  ('Pedicura', null, 20.00, 45),
  ('Pedicura + Color', null, 25.00, 60),
  ('Solo Pintar Pies', null, 15.00, 20),
  ('Lifting de Pestañas', null, 35.00, 60),
  ('Depilación de Cejas', 'Precio orientativo, entre 5€ y 7€ según el caso.', 6.00, 15);

insert into public.staff (name) values
  ('Nicole');

-- Horario real: lunes a viernes 10:00-13:00 y 15:30-18:30, sábados solo
-- mañana (10:00-13:00), domingo cerrado. day_of_week: 0 domingo … 6 sábado.
insert into public.business_hours (day_of_week, opening_time, closing_time) values
  (1, '10:00', '13:00'), (1, '15:30', '18:30'),
  (2, '10:00', '13:00'), (2, '15:30', '18:30'),
  (3, '10:00', '13:00'), (3, '15:30', '18:30'),
  (4, '10:00', '13:00'), (4, '15:30', '18:30'),
  (5, '10:00', '13:00'), (5, '15:30', '18:30'),
  (6, '10:00', '13:00');
