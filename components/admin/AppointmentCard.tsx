"use client";

import { useState, useTransition } from "react";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateLong, formatDuration, formatPrice, formatTime } from "@/lib/format";
import { updateAppointmentStatus } from "@/lib/admin/actions";
import type { AppointmentStatus, AppointmentWithRelations } from "@/lib/types/database";

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function AppointmentCard({ appointment }: { appointment: AppointmentWithRelations }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<AppointmentStatus | null>(null);

  function changeStatus(status: AppointmentStatus) {
    setError(null);
    setPendingAction(status);
    startTransition(async () => {
      const result = await updateAppointmentStatus(appointment.id, status);
      if (result?.error) setError(result.error);
      setPendingAction(null);
    });
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-ink">{appointment.customer.name}</p>
          <p className="text-sm text-ink/50">
            {appointment.customer.email} · {appointment.customer.phone}
          </p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
        <div>
          <p className="text-ink/40">Servicio</p>
          <p className="font-medium text-ink">{appointment.service.name}</p>
        </div>
        <div>
          <p className="text-ink/40">Fecha y hora</p>
          <p className="font-medium text-ink capitalize">
            {formatDateLong(appointment.date)} · {formatTime(appointment.start_time)}
          </p>
        </div>
        <div>
          <p className="text-ink/40">Duración</p>
          <p className="font-medium text-ink">{formatDuration(appointment.service.duration_minutes)}</p>
        </div>
        <div>
          <p className="text-ink/40">Precio</p>
          <p className="font-medium text-ink">{formatPrice(appointment.service.price)}</p>
        </div>
      </div>

      <p className="mt-3 text-xs text-ink/35">
        Solicitada el {dateTimeFormatter.format(new Date(appointment.created_at))}
      </p>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {appointment.status === "pending" && (
          <>
            <Button
              size="md"
              onClick={() => changeStatus("accepted")}
              disabled={isPending}
            >
              {isPending && pendingAction === "accepted" ? "Aceptando…" : "Aceptar"}
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={() => changeStatus("rejected")}
              disabled={isPending}
            >
              {isPending && pendingAction === "rejected" ? "Rechazando…" : "Rechazar"}
            </Button>
          </>
        )}

        {appointment.status === "accepted" && (
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() => changeStatus("completed")}
              disabled={isPending}
            >
              {isPending && pendingAction === "completed" ? "Guardando…" : "Marcar completada"}
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={() => changeStatus("cancelled")}
              disabled={isPending}
            >
              {isPending && pendingAction === "cancelled" ? "Cancelando…" : "Cancelar cita"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
