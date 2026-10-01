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

interface AppointmentCardProps {
  appointment: AppointmentWithRelations;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
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
    <div className="rounded-2xl border border-cream/10 bg-ink-soft p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-cream">{appointment.customer.name}</p>
          <p className="text-sm text-cream/50">
            {appointment.customer.email} · {appointment.customer.phone}
          </p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
        <div>
          <p className="text-cream/40">Servicio</p>
          <p className="font-medium text-cream">{appointment.service.name}</p>
        </div>
        <div>
          <p className="text-cream/40">Fecha y hora</p>
          <p className="font-medium text-cream capitalize">
            {formatDateLong(appointment.date)} · {formatTime(appointment.start_time)}
          </p>
        </div>
        <div>
          <p className="text-cream/40">Duración</p>
          <p className="font-medium text-cream">{formatDuration(appointment.service.duration_minutes)}</p>
        </div>
        <div>
          <p className="text-cream/40">Precio</p>
          <p className="font-medium text-cream">{formatPrice(appointment.service.price)}</p>
        </div>
      </div>

      <p className="mt-3 text-xs text-cream/35">
        Solicitada el {dateTimeFormatter.format(new Date(appointment.created_at))}
      </p>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

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
