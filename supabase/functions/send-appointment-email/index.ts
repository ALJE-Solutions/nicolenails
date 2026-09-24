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

function cancelButtonHtml(cancelUrl: string): string {
  return `
    <p style="margin: 28px 0;">
      <a href="${cancelUrl}" style="display: inline-block; padding: 12px 24px; background: #1a1a1a; color: #d4af37; text-decoration: none; border-radius: 999px; font-weight: 600;">
        Cancelar cita
      </a>
    </p>
    <p style="color: #666; font-size: 14px;">Si no puedes venir, usa el botón de arriba para liberar el hueco.</p>
  `;
}

function subjectAndBody(
  event: "created" | "accepted" | "rejected" | "cancelled",
  data: { customerName: string; serviceName: string; date: string; time: string; appointmentId: string }
): { subject: string; text: string; html?: string } {
  const when = `${data.date} a las ${data.time.slice(0, 5)}`;
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
        html: `
          <div style="font-family: sans-serif; color: #1a1a1a; line-height: 1.5;">
            <p>Hola ${escapeHtml(data.customerName)},</p>
            <p>Hemos recibido tu solicitud de cita para <strong>${escapeHtml(data.serviceName)}</strong> el ${escapeHtml(when)}.</p>
            <p>Está pendiente de confirmación por parte de Nicolenails; te avisaremos en cuanto la revisemos.</p>
            ${cancelUrl ? cancelButtonHtml(cancelUrl) : ""}
            <p>Gracias,<br />Nicolenails</p>
          </div>
        `,
      };
    case "accepted":
      return {
        subject: "Tu cita ha sido confirmada — Nicolenails",
        text: `Hola ${data.customerName},\n\n¡Tu cita para "${data.serviceName}" el ${when} ha sido confirmada!${
          cancelUrl ? `\n\nSi no puedes venir, cancela aquí: ${cancelUrl}` : ""
        }\n\nTe esperamos,\nNicolenails`,
        html: `
          <div style="font-family: sans-serif; color: #1a1a1a; line-height: 1.5;">
            <p>Hola ${escapeHtml(data.customerName)},</p>
            <p>¡Tu cita para <strong>${escapeHtml(data.serviceName)}</strong> el ${escapeHtml(when)} ha sido confirmada!</p>
            ${cancelUrl ? cancelButtonHtml(cancelUrl) : ""}
            <p>Te esperamos,<br />Nicolenails</p>
          </div>
        `,
      };
    case "rejected":
      return {
        subject: "Tu solicitud no ha podido confirmarse — Nicolenails",
        text: `Hola ${data.customerName},\n\nLo sentimos, no hemos podido confirmar tu solicitud para "${data.serviceName}" el ${when}. Contacta con nosotras para buscar otra fecha.\n\nNicolenails`,
      };
    case "cancelled":
      return {
        subject: "Tu cita ha sido cancelada — Nicolenails",
        text: `Hola ${data.customerName},\n\nTu cita para "${data.serviceName}" el ${when} ha sido cancelada. Si quieres reservar otra fecha, entra en nuestra web cuando quieras.\n\nNicolenails`,
      };
  }
}

async function sendEmail(to: string, subject: string, text: string, html?: string) {
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
    body: JSON.stringify({ from: RESEND_FROM, to, subject, text, ...(html ? { html } : {}) }),
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

  const { subject, text, html } = subjectAndBody(event, {
    customerName: customer.name,
    serviceName: service.name,
    date: record.date,
    time: record.start_time,
    appointmentId: record.id,
  });

  await sendEmail(customer.email, subject, text, html);

  return new Response("ok", { status: 200 });
});
