// Edge Function: send-appointment-email
//
// Se invoca desde un Database Webhook de Supabase (INSERT y UPDATE OF status
// en la tabla "appointments"). Envía al cliente un correo según el evento:
//   - INSERT                          -> "solicitud recibida"
//   - UPDATE a status = 'accepted'    -> "cita confirmada"
//   - UPDATE a status = 'rejected'    -> "cita rechazada"
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

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function subjectAndBody(
  event: "created" | "accepted" | "rejected",
  data: { customerName: string; serviceName: string; date: string; time: string }
) {
  const when = `${data.date} a las ${data.time.slice(0, 5)}`;

  switch (event) {
    case "created":
      return {
        subject: "Hemos recibido tu solicitud — Nicolenails",
        text: `Hola ${data.customerName},\n\nHemos recibido tu solicitud de cita para "${data.serviceName}" el ${when}.\nEstá pendiente de confirmación por parte de Nicolenails; te avisaremos en cuanto la revisemos.\n\nGracias,\nNicolenails`,
      };
    case "accepted":
      return {
        subject: "Tu cita ha sido confirmada — Nicolenails",
        text: `Hola ${data.customerName},\n\n¡Tu cita para "${data.serviceName}" el ${when} ha sido confirmada!\n\nTe esperamos,\nNicolenails`,
      };
    case "rejected":
      return {
        subject: "Tu solicitud no ha podido confirmarse — Nicolenails",
        text: `Hola ${data.customerName},\n\nLo sentimos, no hemos podido confirmar tu solicitud para "${data.serviceName}" el ${when}. Contacta con nosotras para buscar otra fecha.\n\nNicolenails`,
      };
  }
}

async function sendEmail(to: string, subject: string, text: string) {
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
    body: JSON.stringify({ from: RESEND_FROM, to, subject, text }),
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

  let event: "created" | "accepted" | "rejected" | null = null;
  if (isNewRequest) event = "created";
  else if (statusChanged && record.status === "accepted") event = "accepted";
  else if (statusChanged && record.status === "rejected") event = "rejected";

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

  const { subject, text } = subjectAndBody(event, {
    customerName: customer.name,
    serviceName: service.name,
    date: record.date,
    time: record.start_time,
  });

  await sendEmail(customer.email, subject, text);

  return new Response("ok", { status: 200 });
});
