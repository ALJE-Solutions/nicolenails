# Nicolenails — estado del proyecto y pendientes

Última actualización: 2026-09-15. Este documento resume qué está hecho y qué queda, para retomarlo sin tener que releer todo el historial de cambios.

## Estado actual (hecho)

- **Stack**: Next.js (App Router) + TypeScript + Tailwind + Supabase (Postgres, Auth, RLS). Ya desplegado en Vercel.
- **Esquema de base de datos** (`supabase/migrations/001` a `007`): servicios, clientes, citas, horario de apertura (con tramos partidos, p. ej. mañana/tarde), bloqueos, personal (`staff`) y asignación de citas a personal.
- **Reservas públicas**: flujo completo `/reservar` (servicio → fecha → hora → datos → resumen → confirmación), con disponibilidad calculada en Postgres (`get_available_slots`) respetando duración del servicio, horario, bloqueos y capacidad del personal activo.
- **Panel de administración** (`/admin`): login, citas (aceptar/rechazar/completar/cancelar), calendario mensual, servicios, personal, horarios (por tramos), bloqueos.
- **Personal / asignación de citas**: al aceptar una cita, el panel muestra quién está libre en ese horario y asigna la cita a esa persona. Ahora mismo solo hay **una** trabajadora (Nicole, la dueña, trabaja desde casa — sin foto), pero el sistema ya soporta varias si en el futuro se contrata a alguien más.
- **Diseño**: tema negro con dorado como acento (fondo negro en toda la web y el panel, dorado reservado para CTAs y detalles).
- **Datos reales cargados** (`supabase/seed.sql`): los servicios y precios reales del negocio, Nicole como personal, y el horario (L-V 10:00-13:00 y 15:30-18:30, sábados 10:00-13:00, domingo cerrado).

## Pendiente — configuración externa (bloqueante)

Nada de esto requiere código, pero sin hacerlo la app no funciona del todo:


2. **Crear la cuenta de administración de Nicole** (ya tenemos su email: `nicolecanto3@gmail.com`):
   - Dashboard de Supabase → **Authentication → Users → Add user** (ese email + una contraseña).
   - Copiar el UUID del usuario creado y en el **SQL Editor**:
     ```sql
     insert into public.admins (id) values ('uuid-del-usuario-creado');
     ```
   - Con eso ya puede entrar en `/admin/login`.
3. **Emails de confirmación (Resend)** — sigue sin activar, es opcional pero recomendable:
   - Instrucciones detalladas en `supabase/functions/send-appointment-email/README.md`.
   - Dar de alta una cuenta en Resend, desplegar la función (`supabase functions deploy send-appointment-email`), configurar `RESEND_API_KEY` (y opcionalmente `RESEND_FROM_EMAIL`) como secreto, y crear el Database Webhook en Supabase sobre `appointments` (INSERT/UPDATE).
   - Para probar el flujo de reserva de principio a fin, usar `andcodeinfo@gmail.com` como email del cliente al reservar.
4. **Variables de entorno en Vercel**: confirmar que el proyecto desplegado tiene `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` configuradas (las mismas de `.env.local`, que no se sube al repo).
5. **Foto del salón**: la home (`/`) tiene un `ImagePlaceholder` a la espera de una foto real — sustituir cuando Nicole tenga una.

## Pendiente — funcionalidades / mejoras (sin empezar)

- **Pruebas manuales end-to-end en navegador**: reservar una cita real, aceptarla/rechazarla desde el panel, comprobar el calendario y los estados. Solo se ha verificado que las rutas cargan (código 200), no el flujo completo de UI.
- **Protección anti-spam en el formulario público de reserva**: no hay captcha ni límite de peticiones; cualquiera puede crear citas "pending" repetidamente.
- **El cliente no puede cancelar ni modificar su propia cita** una vez enviada — solo Nicole desde el panel. Podría interesar un enlace de cancelación en el email de confirmación (cuando Resend esté activo).
- **Sin tests automatizados** (unitarios ni end-to-end).
- **Dominio propio**: confirmar si Vercel ya tiene un dominio personalizado apuntando o sigue en el `*.vercel.app` por defecto.

## Notas técnicas a tener en cuenta

- **Concurrencia de citas**: antes había un `exclusion constraint` en Postgres que garantizaba al 100% que nunca hubiera dos citas solapadas. Al añadir soporte multi-personal, esa garantía dura pasó a ser solo para una persona ya asignada (cita **aceptada**); mientras una cita está "pending" (sin persona asignada todavía), el control de solapamiento es a nivel de aplicación, no de base de datos. Con el volumen de un negocio pequeño el riesgo es mínimo, pero no es matemáticamente imposible como antes. Ver comentarios en `supabase/migrations/004_staff.sql`.
- **Horario partido**: `business_hours` ya no tiene una fila única por día — cada fila es un tramo suelto (mañana, tarde, etc.), y un día sin filas está cerrado. El panel (`/admin/horarios`) permite añadir/quitar tramos por día.
- Hay una captura de pantalla (`WhatsApp Image 2026-09-15 at 12.18.45.jpeg`) en la raíz del repo que se usó para sacar los precios reales — no hace falta mantenerla en el repo, se puede borrar o mover fuera antes de subir cambios.
