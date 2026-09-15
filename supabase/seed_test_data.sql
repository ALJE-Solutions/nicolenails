-- Nicolenails — datos de prueba
--
-- Servicios y precios de referencia tomados de nailsandfriends.es/precios
-- (solo para tener algo real con lo que probar; las duraciones no vienen en
-- esa página, son estimaciones — ajústalas desde /admin/servicios).
-- Ejecutar una sola vez desde el SQL Editor, después de las migraciones.

insert into public.services (name, description, price, duration_minutes) values
  ('Manicura Esencial', null, 15.00, 30),
  ('Manicura Esencial Semipermanente Larga Duración', null, 19.90, 45),
  ('Manicura Completa', null, 25.90, 60),
  ('Manicura Completa Semipermanente Larga Duración', null, 29.90, 75),
  ('Manicura Completa Sin Esmaltar', null, 23.00, 50),
  ('Retirar Semipermanente sin Manicura', null, 10.00, 20),
  ('Pedicura Esencial', null, 19.90, 40),
  ('Pedicura Esencial Semipermanente Larga Duración', null, 24.80, 55),
  ('Pedicura SPA', null, 29.90, 60),
  ('Pedicura Completa', null, 39.90, 75),
  ('Pedicura Completa Semipermanente Larga Duración', null, 43.90, 90),
  ('Relleno Gel o Acrílico + Esmaltado Vegano', null, 40.00, 75),
  ('Uñas Nuevas Gel o Acrílico + Esmaltado Vegano', null, 45.00, 90),
  ('Soft Gel Uñas Nuevas', null, 40.00, 90);

insert into public.staff (name) values
  ('Nicole'),
  ('Marta');

-- Horario: lunes a viernes 9:00-14:00 y 17:00-20:00, sábados solo mañana
-- (9:00-14:00), domingo cerrado. day_of_week: 0 domingo … 6 sábado.
insert into public.business_hours (day_of_week, opening_time, closing_time) values
  (1, '09:00', '14:00'), (1, '17:00', '20:00'),
  (2, '09:00', '14:00'), (2, '17:00', '20:00'),
  (3, '09:00', '14:00'), (3, '17:00', '20:00'),
  (4, '09:00', '14:00'), (4, '17:00', '20:00'),
  (5, '09:00', '14:00'), (5, '17:00', '20:00'),
  (6, '09:00', '14:00');
