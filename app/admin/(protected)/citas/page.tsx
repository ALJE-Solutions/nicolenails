import { StatusFilter } from "@/components/admin/StatusFilter";
import { AppointmentCard } from "@/components/admin/AppointmentCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAppointments } from "@/lib/admin/queries";
import type { AppointmentStatus } from "@/lib/types/database";

const VALID_STATUSES: (AppointmentStatus | "all")[] = [
  "pending",
  "accepted",
  "rejected",
  "cancelled",
  "completed",
  "all",
];

interface CitasPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function CitasPage({ searchParams }: CitasPageProps) {
  const { status: statusParam } = await searchParams;
  const status = VALID_STATUSES.includes(statusParam as AppointmentStatus | "all")
    ? (statusParam as AppointmentStatus | "all")
    : "pending";

  const appointments = await getAppointments(status);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Citas</h1>
      <p className="mt-1 text-sm text-ink/50">
        Revisa las solicitudes y decide si aceptarlas o rechazarlas.
      </p>

      <div className="mt-6">
        <StatusFilter current={status} />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {appointments.length === 0 ? (
          <EmptyState
            title="No hay citas en este estado"
            description="Cuando lleguen nuevas solicitudes aparecerán aquí."
          />
        ) : (
          appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))
        )}
      </div>
    </div>
  );
}
