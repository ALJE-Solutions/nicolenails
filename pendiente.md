# Nicolenails — estado del proyecto y pendientes

Última actualización: 2026-09-24. Este documento resume qué está hecho y qué queda, para retomarlo sin tener que releer todo el historial de cambios.

## Estado actual (hecho)

- **Stack**: Next.js (App Router) + TypeScript + Tailwind + Supabase (Postgres, Auth, RLS). Ya desplegado en Vercel.
- **Esquema de base de datos** (`supabase/migrations/001` a `007`): servicios, clientes, citas, horario de apertura (con tramos partidos, p. ej. mañana/tarde), bloqueos, personal (`staff`) y asignación de citas a personal.
- **Reservas públicas**: flujo completo `/reservar` (servicio → fecha → hora → datos → resumen → confirmación), con disponibilidad calculada en Postgres (`get_available_slots`) respetando duración del servicio, horario, bloqueos y capacidad del personal activo.
- **Panel de administración** (`/admin`): login, citas (aceptar/rechazar/completar/cancelar), calendario mensual, servicios, personal, horarios (por tramos), bloqueos.
- **Personal / asignación de citas**: al aceptar una cita, el panel comprueba quién está libre en ese horario. Ahora mismo solo hay **una** trabajadora (Nicole, la dueña, trabaja desde casa — sin foto), así que la cita se asigna sola a ella sin pedir confirmación; si en el futuro hay más de una persona libre en ese hueco, vuelve a aparecer el selector para elegir a quién asignarla (`components/admin/AppointmentCard.tsx`).
- **Cuenta de administración de Nicole**: creada en Supabase Auth y dada de alta en `admins`. Ya puede entrar en `/admin/login`.
- **Diseño**: tema negro con dorado como acento (fondo negro en toda la web y el panel, dorado reservado para CTAs y detalles).
- **Datos reales cargados** (`supabase/seed.sql`): los servicios y precios reales del negocio, Nicole como personal, y el horario (L-V 10:00-13:00 y 15:30-18:30, sábados 10:00-13:00, domingo cerrado).
- **Dominio propio**: `nicolenails.es`, comprado en IONOS y configurado en Vercel.
- **Emails de citas (Resend)**: activo en producción — solicitud recibida, confirmada (con botones de cancelar y de añadir al calendario), rechazada y cancelada. Cuenta y dominio de Resend definitivos configurados (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`), y `SITE_URL` ya apunta a `nicolenails.es` — falta solo la prueba real con un email cualquiera (ver pendientes).
- **Cancelación por el cliente**: desde el enlace del email, sin necesitar cuenta (`/cancelar/[id]`); probado y funcionando.

## Pendiente — configuración externa (bloqueante)

- **Probar el envío real** con la cuenta de Resend definitiva, el dominio verificado y `SITE_URL` ya actualizado: reservar con un email cualquiera (ya no solo `andcodeinfo@gmail.com`) y confirmar que llega correctamente desde el remitente elegido, con los enlaces de cancelar/calendario apuntando a `nicolenails.es`.

## Pendiente — funcionalidades / mejoras (sin empezar)

- **Subir y desplegar el último cambio de los botones de calendario**: el email de "cita confirmada" ahora enlaza a `/cita/[id]/ics` (`app/(site)/cita/[id]/ics/route.ts`) en vez de llevar el archivo `.ics` como adjunto, para que se abra con un solo toque en Apple Calendar/Outlook. Hace falta: `git push`, aplicar `supabase/migrations/009_appointment_ics.sql` en el SQL Editor, y redesplegar `send-appointment-email`.
- **Protección anti-spam en el formulario público de reserva**: no hay captcha ni límite de peticiones; cualquiera puede crear citas "pending" repetidamente.
- **Sin tests automatizados** (unitarios ni end-to-end).

## Notas técnicas a tener en cuenta

- **Concurrencia de citas**: antes había un `exclusion constraint` en Postgres que garantizaba al 100% que nunca hubiera dos citas solapadas. Al añadir soporte multi-personal, esa garantía dura pasó a ser solo para una persona ya asignada (cita **aceptada**); mientras una cita está "pending" (sin persona asignada todavía), el control de solapamiento es a nivel de aplicación, no de base de datos. Con el volumen de un negocio pequeño el riesgo es mínimo, pero no es matemáticamente imposible como antes. Ver comentarios en `supabase/migrations/004_staff.sql`.
- **Horario partido**: `business_hours` ya no tiene una fila única por día — cada fila es un tramo suelto (mañana, tarde, etc.), y un día sin filas está cerrado. El panel (`/admin/horarios`) permite añadir/quitar tramos por día.
- Hay una captura de pantalla (`WhatsApp Image 2026-09-15 at 12.18.45.jpeg`) en la raíz del repo que se usó para sacar los precios reales — no hace falta mantenerla en el repo, se puede borrar o mover fuera antes de subir cambios.

## Accesos y credenciales

⚠️ Esto queda en texto plano a propósito porque el repositorio es privado, pero tenlo en cuenta si alguna vez se hace público o se comparte: la misma contraseña se reutiliza para varias cuentas.

- **Email/contraseña de Nicole** (login en `/admin/login`, cuenta de Resend y cuenta de Supabase): `nicolecanto3@gmail.com` / `Nicolecanto3.`