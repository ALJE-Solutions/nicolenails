# Nicolenails — estado del proyecto y pendientes

Última actualización: 2026-09-21. Este documento resume qué está hecho y qué queda, para retomarlo sin tener que releer todo el historial de cambios.

## Estado actual (hecho)

- **Stack**: Next.js (App Router) + TypeScript + Tailwind + Supabase (Postgres, Auth, RLS). Ya desplegado en Vercel.
- **Esquema de base de datos** (`supabase/migrations/001` a `007`): servicios, clientes, citas, horario de apertura (con tramos partidos, p. ej. mañana/tarde), bloqueos, personal (`staff`) y asignación de citas a personal.
- **Reservas públicas**: flujo completo `/reservar` (servicio → fecha → hora → datos → resumen → confirmación), con disponibilidad calculada en Postgres (`get_available_slots`) respetando duración del servicio, horario, bloqueos y capacidad del personal activo.
- **Panel de administración** (`/admin`): login, citas (aceptar/rechazar/completar/cancelar), calendario mensual, servicios, personal, horarios (por tramos), bloqueos.
- **Personal / asignación de citas**: al aceptar una cita, el panel comprueba quién está libre en ese horario. Ahora mismo solo hay **una** trabajadora (Nicole, la dueña, trabaja desde casa — sin foto), así que la cita se asigna sola a ella sin pedir confirmación; si en el futuro hay más de una persona libre en ese hueco, vuelve a aparecer el selector para elegir a quién asignarla (`components/admin/AppointmentCard.tsx`).
- **Cuenta de administración de Nicole**: creada en Supabase Auth y dada de alta en `admins`. Ya puede entrar en `/admin/login`.
- **Diseño**: tema negro con dorado como acento (fondo negro en toda la web y el panel, dorado reservado para CTAs y detalles).
- **Datos reales cargados** (`supabase/seed.sql`): los servicios y precios reales del negocio, Nicole como personal, y el horario (L-V 10:00-13:00 y 15:30-18:30, sábados 10:00-13:00, domingo cerrado).

## Pendiente — configuración externa (bloqueante)

- **Emails de confirmación (Resend)**: activado — cuenta creada, secretos `RESEND_API_KEY` y `SITE_URL` configurados, función `send-appointment-email` desplegada y Database Webhook creado sobre `appointments` (INSERT/UPDATE).
  - **Limitación actual (modo de pruebas de Resend)**: sin dominio verificado, Resend solo permite enviar a la dirección con la que se creó la cuenta (`andcodeinfo@gmail.com`). Cualquier otro destinatario da error 403 (`validation_error`). Para las pruebas, reservar usando esa dirección como email del cliente.
  - **Pendiente para producción real**: cuando el negocio tenga una cuenta/dominio propio de verdad, verificar un dominio en [resend.com/domains](https://resend.com/domains) (es gratis, solo requiere tener un dominio y añadir registros DNS) y actualizar el secreto `RESEND_FROM_EMAIL` para usarlo (p. ej. `Nicolenails <reservas@nicolenails.com>`). Sin esto, **ningún cliente real recibirá los correos**, solo llegan a la dirección de prueba. Relacionado con el punto "Dominio propio" de abajo — si se compra un dominio, sirve para la web (Vercel) y para esto a la vez.


## Pendiente — funcionalidades / mejoras (sin empezar)

- **Pruebas manuales end-to-end en navegador**: reservar una cita real, aceptarla/rechazarla desde el panel, comprobar el calendario y los estados. Solo se ha verificado que las rutas cargan (código 200), no el flujo completo de UI.
- **Protección anti-spam en el formulario público de reserva**: no hay captcha ni límite de peticiones; cualquiera puede crear citas "pending" repetidamente.
- **Cancelación por parte del cliente**: ya implementada — página pública `/cancelar/[id]` (`app/(site)/cancelar/[id]/`) y funciones SQL `get_appointment_for_cancellation`/`cancel_appointment` (`supabase/migrations/008_cancel_appointment.sql`). Tanto el email de "solicitud recibida" como el de "cita confirmada" (Resend) incluyen el botón "Cancelar cita", usando el secreto `SITE_URL` (ver README de la función). El cliente sigue sin poder modificar la cita, solo cancelarla. Probado en producción (funciona), pendiente de subir el último ajuste (botón también en el email de solicitud).
- **Sin tests automatizados** (unitarios ni end-to-end).
- **Dominio propio**: confirmar si Vercel ya tiene un dominio personalizado apuntando o sigue en el `*.vercel.app` por defecto.

## Notas técnicas a tener en cuenta

- **Concurrencia de citas**: antes había un `exclusion constraint` en Postgres que garantizaba al 100% que nunca hubiera dos citas solapadas. Al añadir soporte multi-personal, esa garantía dura pasó a ser solo para una persona ya asignada (cita **aceptada**); mientras una cita está "pending" (sin persona asignada todavía), el control de solapamiento es a nivel de aplicación, no de base de datos. Con el volumen de un negocio pequeño el riesgo es mínimo, pero no es matemáticamente imposible como antes. Ver comentarios en `supabase/migrations/004_staff.sql`.
- **Horario partido**: `business_hours` ya no tiene una fila única por día — cada fila es un tramo suelto (mañana, tarde, etc.), y un día sin filas está cerrado. El panel (`/admin/horarios`) permite añadir/quitar tramos por día.
- Hay una captura de pantalla (`WhatsApp Image 2026-09-15 at 12.18.45.jpeg`) en la raíz del repo que se usó para sacar los precios reales — no hace falta mantenerla en el repo, se puede borrar o mover fuera antes de subir cambios.
nicolecanto3@gmail.com
Nicolecanto3.
claves resend y admin supabase