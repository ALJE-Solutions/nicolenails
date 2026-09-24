import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { formatDateLong, formatTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { cancelAppointment } from "./actions";

type CancellationInfo = {
  service_name: string;
  date: string;
  start_time: string;
  status: string;
};

const INACTIVE_STATUS_MESSAGES: Record<string, string> = {
  cancelled: "Esta cita ya estaba cancelada.",
  rejected: "Esta cita fue rechazada y ya no está activa.",
  completed: "Esta cita ya se completó, no se puede cancelar.",
};

export default async function CancelarCitaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .rpc("get_appointment_for_cancellation", { p_appointment_id: id })
    .maybeSingle();

  const appointment = data as CancellationInfo | null;
  const isCancellable =
    appointment?.status === "pending" || appointment?.status === "accepted";

  return (
    <section className="mx-auto flex max-w-lg flex-col items-center px-5 py-20 text-center sm:px-8">
      <h1 className="font-display text-3xl font-semibold text-cream">Cancelar cita</h1>

      {!appointment ? (
        <p className="mt-4 text-base leading-relaxed text-cream/60">
          No hemos encontrado esa cita. Puede que el enlace no sea correcto.
        </p>
      ) : isCancellable ? (
        <>
          <p className="mt-4 text-base leading-relaxed text-cream/60">
            Tu cita para <strong>{appointment.service_name}</strong> el{" "}
            {formatDateLong(appointment.date)} a las {formatTime(appointment.start_time)}.
          </p>
          <p className="mt-2 text-sm text-cream/50">
            Si no puedes venir, confirma la cancelación para liberar el hueco.
          </p>
          <form action={cancelAppointment} className="mt-8">
            <input type="hidden" name="appointment_id" value={id} />
            <button type="submit" className={buttonClasses("danger", "lg")}>
              Cancelar cita
            </button>
          </form>
        </>
      ) : (
        <p className="mt-4 text-base leading-relaxed text-cream/60">
          {INACTIVE_STATUS_MESSAGES[appointment.status] ?? "Esta cita ya no está activa."}
        </p>
      )}

      <Link href="/" className={buttonClasses("secondary", "lg", "mt-8")}>
        Volver al inicio
      </Link>
    </section>
  );
}
