// Edge Function: send-appointment-email
//
// Se invoca desde un Database Webhook de Supabase (INSERT y UPDATE OF status
// en la tabla "appointments"). Envía al cliente un correo según el evento:
//   - INSERT                          -> "solicitud recibida"
//   - UPDATE a status = 'accepted'    -> "cita confirmada"
//   - UPDATE a status = 'rejected'    -> "cita rechazada"
//   - UPDATE a status = 'cancelled'   -> "cita cancelada" (tanto si cancela
//                                        Nicole desde el panel como si cancela
//                                        el propio cliente desde el email)
//
// No requiere ninguna credencial para desplegarse, pero no enviará correos
// reales hasta que se configure el secreto RESEND_API_KEY (ver README.md de
// esta misma carpeta). El resto de la aplicación (crear/gestionar citas)
// funciona con normalidad sin esta pieza.

import { createClient } from "jsr:@supabase/supabase-js@2";

interface AppointmentRecord {
  id: string;
  customer_id: string;
  service_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: AppointmentRecord;
  old_record: AppointmentRecord | null;
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM = Deno.env.get("RESEND_FROM_EMAIL") ?? "Nicolenails <onboarding@resend.dev>";
// URL pública de la web desplegada, para construir el enlace de cancelación
// que se incluye en el email de confirmación (ver README.md de esta carpeta).
const SITE_URL = Deno.env.get("SITE_URL");

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Colores de marca (ver app/globals.css) para que el email se parezca a la web.
const COLOR_INK = "#0b0b0c";
const COLOR_CREAM = "#faf7f2";
const COLOR_CREAM_SOFT = "#f2ecdf";
const COLOR_GOLD = "#c9a15a";
const COLOR_GOLD_SOFT = "#e4d3ab";
const COLOR_MUTED = "#7a7266";

// Envuelve el contenido de cada correo en la misma cabecera/tarjeta/pie, para
// que todos los emails (solicitud, confirmación, rechazo, cancelación) se
// vean como parte de la misma marca en vez de texto suelto sin estilo.
function emailShell(bodyHtml: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR_CREAM_SOFT}; padding: 32px 16px; font-family: Georgia, 'Times New Roman', serif;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background: ${COLOR_CREAM}; border-radius: 16px; overflow: hidden; border: 1px solid ${COLOR_GOLD_SOFT};">
            <tr>
              <td style="background: ${COLOR_INK}; padding: 28px 32px; text-align: center;">
                <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 20px; letter-spacing: 3px; text-transform: uppercase; color: ${COLOR_GOLD};">
                  Nicolenails
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px 32px 8px; font-family: Georgia, 'Times New Roman', serif; color: ${COLOR_INK}; font-size: 15px; line-height: 1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 32px 28px; border-top: 1px solid ${COLOR_GOLD_SOFT}; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${COLOR_MUTED}; text-align: center;">
                Nicolenails · este es un correo automático, no hace falta responder.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

// Tarjeta con los datos de la cita (servicio + fecha/hora), reutilizada en
// todos los correos para que destaquen sobre el texto.
function appointmentDetailsHtml(serviceName: string, when: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0 20px; background: ${COLOR_CREAM_SOFT}; border-radius: 12px;">
      <tr>
        <td style="padding: 16px 20px;">
          <div style="font-weight: bold; font-size: 16px; color: ${COLOR_INK};">${escapeHtml(serviceName)}</div>
          <div style="margin-top: 2px; color: ${COLOR_MUTED}; font-family: Arial, Helvetica, sans-serif; font-size: 13px; text-transform: capitalize;">
            ${escapeHtml(when)}
          </div>
        </td>
      </tr>
    </table>
  `;
}

function cancelButtonHtml(cancelUrl: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 22px 0 4px;">
      <tr>
        <td style="border-radius: 999px; background: ${COLOR_INK};">
          <a href="${cancelUrl}" style="display: inline-block; padding: 12px 26px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; color: ${COLOR_GOLD}; text-decoration: none; letter-spacing: 0.3px;">
            Cancelar cita
          </a>
        </td>
      </tr>
    </table>
    <p style="margin: 8px 0 0; font-family: Arial, Helvetica, sans-serif; color: ${COLOR_MUTED}; font-size: 13px;">
      Si no puedes venir, usa el botón de arriba para liberar el hueco.
    </p>
  `;
}

function googleCalendarButtonHtml(googleCalendarUrl: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 4px 0 0;">
      <tr>
        <td style="border-radius: 999px; border: 1px solid ${COLOR_GOLD_SOFT};">
          <a href="${googleCalendarUrl}" style="display: inline-block; padding: 11px 24px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; color: ${COLOR_INK}; text-decoration: none;">
            Añadir a Google Calendar
          </a>
        </td>
      </tr>
    </table>
    <p style="margin: 8px 0 0; font-family: Arial, Helvetica, sans-serif; color: ${COLOR_MUTED}; font-size: 13px;">
      ¿Usas Apple Calendar u Outlook? Este correo lleva adjunto un archivo (.ics) que puedes abrir directamente para añadir la cita.
    </p>
  `;
}

// --- Calendario: enlace de Google Calendar + archivo .ics adjunto -------
// Cubre los tres casos habituales: Google (enlace de un clic), y Apple
// Calendar/Outlook/el resto (abriendo el adjunto .ics del propio correo).

function base64Encode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

// Las citas se guardan en hora local de Europe/Madrid; hay que convertirlas a
// UTC (con el cambio de horario de verano/invierno ya aplicado) para que los
// enlaces/archivos de calendario funcionen igual en cualquier zona horaria.
function madridOffsetMinutes(instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Madrid",
    timeZoneName: "shortOffset",
  }).formatToParts(instant);
  const tzName = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+1";
  const match = tzName.match(/GMT([+-])(\d+)(?::(\d+))?/);
  if (!match) return 60;
  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = match[3] ? Number(match[3]) : 0;
  return sign * (hours * 60 + minutes);
}

function madridLocalToUtcDate(dateStr: string, timeStr: string): Date {
  const naiveUtc = new Date(`${dateStr}T${timeStr}Z`);
  const offsetMinutes = madridOffsetMinutes(naiveUtc);
  return new Date(naiveUtc.getTime() - offsetMinutes * 60000);
}

function toIcsUtcString(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeIcsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

function buildCalendarEvent(params: {
  appointmentId: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
}): { googleCalendarUrl: string; icsContent: string } {
  const startUtc = madridLocalToUtcDate(params.date, params.startTime);
  const endUtc = madridLocalToUtcDate(params.date, params.endTime);
  const startIcs = toIcsUtcString(startUtc);
  const endIcs = toIcsUtcString(endUtc);
  const title = `Nicolenails: ${params.serviceName}`;
  const description = "Cita reservada en Nicolenails.";

  const googleCalendarUrl =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${startIcs}/${endIcs}` +
    `&details=${encodeURIComponent(description)}`;

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nicolenails//Appointments//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${params.appointmentId}@nicolenails`,
    `DTSTAMP:${toIcsUtcString(new Date())}`,
    `DTSTART:${startIcs}`,
    `DTEND:${endIcs}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return { googleCalendarUrl, icsContent };
}

function subjectAndBody(
  event: "created" | "accepted" | "rejected" | "cancelled",
  data: {
    customerName: string;
    serviceName: string;
    date: string;
    time: string;
    endTime: string;
    appointmentId: string;
  }
): {
  subject: string;
  text: string;
  html?: string;
  icsAttachment?: { filename: string; content: string };
} {
  const when = `${data.date} a las ${data.time.slice(0, 5)}`;
  const name = escapeHtml(data.customerName);
  const details = appointmentDetailsHtml(data.serviceName, when);
  // El botón de cancelar solo se incluye si sabemos la URL pública de la web
  // (secreto SITE_URL); sin ella se envía el correo igual, sin el enlace.
  const cancelUrl = SITE_URL ? `${SITE_URL}/cancelar/${data.appointmentId}` : null;

  switch (event) {
    case "created":
      return {
        subject: "Hemos recibido tu solicitud — Nicolenails",
        text: `Hola ${data.customerName},\n\nHemos recibido tu solicitud de cita para "${data.serviceName}" el ${when}.\nEstá pendiente de confirmación por parte de Nicolenails; te avisaremos en cuanto la revisemos.${
          cancelUrl ? `\n\nSi ya no la necesitas, puedes cancelarla aquí: ${cancelUrl}` : ""
        }\n\nGracias,\nNicolenails`,
        html: emailShell(`
          <p>Hola ${name},</p>
          <p>Hemos recibido tu solicitud de cita:</p>
          ${details}
          <p>Está pendiente de confirmación por parte de Nicolenails; te avisaremos en cuanto la revisemos.</p>
          ${cancelUrl ? cancelButtonHtml(cancelUrl) : ""}
          <p style="margin-top: 24px;">Gracias,<br />Nicolenails</p>
        `),
      };
    case "accepted": {
      const { googleCalendarUrl, icsContent } = buildCalendarEvent({
        appointmentId: data.appointmentId,
        serviceName: data.serviceName,
        date: data.date,
        startTime: data.time,
        endTime: data.endTime,
      });

      return {
        subject: "Tu cita ha sido confirmada — Nicolenails",
        text: `Hola ${data.customerName},\n\n¡Tu cita para "${data.serviceName}" el ${when} ha sido confirmada!\n\nAñádela a tu calendario (Google): ${googleCalendarUrl}\n(Si usas Apple Calendar u Outlook, abre el archivo .ics adjunto a este correo.)${
          cancelUrl ? `\n\nSi no puedes venir, cancela aquí: ${cancelUrl}` : ""
        }\n\nTe esperamos,\nNicolenails`,
        html: emailShell(`
          <p>Hola ${name},</p>
          <p>¡Tu cita ha sido confirmada!</p>
          ${details}
          ${googleCalendarButtonHtml(googleCalendarUrl)}
          ${cancelUrl ? cancelButtonHtml(cancelUrl) : ""}
          <p style="margin-top: 24px;">Te esperamos,<br />Nicolenails</p>
        `),
        icsAttachment: {
          filename: "cita-nicolenails.ics",
          content: base64Encode(icsContent),
        },
      };
    }
    case "rejected":
      return {
        subject: "Tu solicitud no ha podido confirmarse — Nicolenails",
        text: `Hola ${data.customerName},\n\nLo sentimos, no hemos podido confirmar tu solicitud para "${data.serviceName}" el ${when}. Contacta con nosotras para buscar otra fecha.\n\nNicolenails`,
        html: emailShell(`
          <p>Hola ${name},</p>
          <p>Lo sentimos, no hemos podido confirmar esta solicitud:</p>
          ${details}
          <p>Contacta con nosotras para buscar otra fecha.</p>
          <p style="margin-top: 24px;">Nicolenails</p>
        `),
      };
    case "cancelled":
      return {
        subject: "Tu cita ha sido cancelada — Nicolenails",
        text: `Hola ${data.customerName},\n\nTu cita para "${data.serviceName}" el ${when} ha sido cancelada. Si quieres reservar otra fecha, entra en nuestra web cuando quieras.\n\nNicolenails`,
        html: emailShell(`
          <p>Hola ${name},</p>
          <p>Tu cita ha sido cancelada:</p>
          ${details}
          <p>Si quieres reservar otra fecha, entra en nuestra web cuando quieras.</p>
          <p style="margin-top: 24px;">Nicolenails</p>
        `),
      };
  }
}

async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string,
  attachments?: { filename: string; content: string }[]
) {
  if (!RESEND_API_KEY) {
    console.warn(
      "RESEND_API_KEY no configurada: se omite el envío de email. Ver README.md."
    );
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to,
      subject,
      text,
      ...(html ? { html } : {}),
      ...(attachments && attachments.length ? { attachments } : {}),
    }),
  });

  if (!response.ok) {
    console.error("Error enviando email con Resend:", await response.text());
  }
}

Deno.serve(async (req) => {
  const payload = (await req.json()) as WebhookPayload;

  if (payload.table !== "appointments") {
    return new Response("ignored", { status: 200 });
  }

  const record = payload.record;

  const isNewRequest = payload.type === "INSERT";
  const statusChanged =
    payload.type === "UPDATE" && payload.old_record?.status !== record.status;

  let event: "created" | "accepted" | "rejected" | "cancelled" | null = null;
  if (isNewRequest) event = "created";
  else if (statusChanged && record.status === "accepted") event = "accepted";
  else if (statusChanged && record.status === "rejected") event = "rejected";
  else if (statusChanged && record.status === "cancelled") event = "cancelled";

  if (!event) {
    return new Response("no-op", { status: 200 });
  }

  const [{ data: customer }, { data: service }] = await Promise.all([
    supabaseAdmin.from("customers").select("name, email").eq("id", record.customer_id).single(),
    supabaseAdmin.from("services").select("name").eq("id", record.service_id).single(),
  ]);

  if (!customer || !service) {
    return new Response("missing related data", { status: 200 });
  }

  const { subject, text, html, icsAttachment } = subjectAndBody(event, {
    customerName: customer.name,
    serviceName: service.name,
    date: record.date,
    time: record.start_time,
    endTime: record.end_time,
    appointmentId: record.id,
  });

  await sendEmail(customer.email, subject, text, html, icsAttachment ? [icsAttachment] : undefined);

  return new Response("ok", { status: 200 });
});
