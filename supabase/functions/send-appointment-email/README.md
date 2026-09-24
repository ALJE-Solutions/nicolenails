# Email de confirmación de citas

Esta Edge Function envía un correo al cliente cuando:

- se crea una solicitud de cita (`INSERT` en `appointments`),
- el propietario la acepta (`status` → `accepted`),
- el propietario la rechaza (`status` → `rejected`).

El resto de la aplicación (crear y gestionar citas) **funciona igual sin esta
pieza**; simplemente no se enviarán los correos hasta que se complete esta
configuración.

## 1. Elegir y dar de alta un proveedor de email

Se ha preparado el código para [Resend](https://resend.com) por ser la opción
más simple y con plan gratuito suficiente para un solo negocio. No se ha dado
de alta ninguna cuenta ni se ha añadido ninguna clave real: hazlo tú cuando
quieras activar los correos.

## 2. Desplegar la función

```bash
supabase functions deploy send-appointment-email
```

El botón "Cancelar cita" del correo depende de las funciones SQL de
`supabase/migrations/008_cancel_appointment.sql`; asegúrate de que esa
migración esté aplicada en el proyecto de Supabase (igual que el resto de
migraciones de `supabase/migrations`).

## 3. Configurar los secretos (nunca en el repositorio)

```bash
supabase secrets set RESEND_API_KEY=tu_clave_de_resend
supabase secrets set RESEND_FROM_EMAIL="Nicolenails <reservas@tudominio.com>"
supabase secrets set SITE_URL=https://tu-dominio-o-proyecto.vercel.app
```

`RESEND_FROM_EMAIL` es opcional; sin verificar un dominio propio en Resend,
puede dejarse el remitente de pruebas por defecto.

`SITE_URL` es la URL pública de la web desplegada (sin barra final). Se usa
para construir el botón "Cancelar cita" del email de confirmación
(`/cancelar/<id>`); si no se configura, el email se envía igual pero sin ese
botón.

## 4. Crear el Database Webhook

Desde el dashboard de Supabase: **Database → Webhooks → Create a new hook**.

- Tabla: `appointments`
- Eventos: `INSERT` y `UPDATE`
- Tipo: `Supabase Edge Functions`
- Función: `send-appointment-email`

No hace falta escribir SQL manualmente: el propio dashboard crea el trigger
necesario.

## 5. Probar

Crea una cita de prueba desde la web y cambia su estado desde
`/admin/citas`; revisa los logs de la función (`supabase functions logs
send-appointment-email`) para confirmar el envío.
