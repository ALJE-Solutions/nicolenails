import { buildIcsContent } from "@/lib/calendar/ics";
import { createClient } from "@/lib/supabase/server";

// Enlazado desde el botón "Añadir a Apple Calendar / Outlook" del email de
// confirmación (Resend): al pulsarlo, el navegador/sistema abre este archivo
// directamente en la app de calendario del cliente, sin pasos intermedios.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .rpc("get_appointment_for_ics", { p_appointment_id: id })
    .maybeSingle();

  if (!data || data.status !== "accepted") {
    return new Response("Cita no encontrada.", { status: 404 });
  }

  const ics = buildIcsContent({
    appointmentId: id,
    serviceName: data.service_name,
    date: data.date,
    startTime: data.start_time,
    endTime: data.end_time,
  });

  return new Response(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="cita-nicolenails.ics"',
    },
  });
}
