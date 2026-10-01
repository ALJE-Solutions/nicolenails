"use client";

import { useEffect, useRef, useState } from "react";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDuration, formatPrice, formatTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { AppointmentWithRelations } from "@/lib/types/database";

export interface CalendarGridDay {
  iso: string;
  dayLabel: string;
  inCurrentMonth: boolean;
  isToday: boolean;
  appointments: AppointmentWithRelations[];
}

const WEEKDAY_HEADERS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const dayHeadingFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export function CalendarGrid({ days }: { days: CalendarGridDay[] }) {
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const selectedDay = days.find((day) => day.iso === selectedIso) ?? null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selectedDay && !dialog.open) {
      dialog.showModal();
    } else if (!selectedDay && dialog.open) {
      dialog.close();
    }
  }, [selectedDay]);

  return (
    <>
      <div className="mt-6 grid grid-cols-7 gap-px overflow-hidden rounded-2xl border border-cream/10 bg-cream/10 text-xs">
        {WEEKDAY_HEADERS.map((day) => (
          <div key={day} className="bg-ink-soft px-2 py-2 text-center font-semibold text-cream/50">
            {day}
          </div>
        ))}

        {days.map((day) => (
          <button
            key={day.iso}
            type="button"
            onClick={() => setSelectedIso(day.iso)}
            className={cn(
              "min-h-24 bg-ink-soft p-1.5 text-left transition hover:bg-cream/5 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/60 sm:min-h-32 sm:p-2",
              !day.inCurrentMonth && "bg-ink-soft/30"
            )}
          >
            <span
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                day.isToday ? "bg-gold text-ink" : day.inCurrentMonth ? "text-cream" : "text-cream/30"
              )}
            >
              {day.dayLabel}
            </span>

            <div className="mt-1 flex flex-col gap-1">
              {day.appointments.slice(0, 3).map((appointment) => (
                <div
                  key={appointment.id}
                  className="truncate rounded bg-cream/10 px-1.5 py-0.5 text-[11px] text-cream/70"
                >
                  {formatTime(appointment.start_time)} {appointment.customer.name}
                </div>
              ))}
              {day.appointments.length > 3 && (
                <span className="text-[11px] text-cream/40">+{day.appointments.length - 3} más</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setSelectedIso(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-cream/10 bg-ink-soft p-0 text-cream backdrop:bg-ink/70 open:animate-none"
      >
        {selectedDay && (
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-cream/40">
                  {selectedDay.appointments.length === 0
                    ? "Sin citas"
                    : `${selectedDay.appointments.length} ${
                        selectedDay.appointments.length === 1 ? "cita" : "citas"
                      }`}
                </p>
                <h2 className="font-display text-lg font-semibold capitalize text-cream">
                  {dayHeadingFormatter.format(new Date(`${selectedDay.iso}T00:00:00`))}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="rounded-full border border-cream/15 px-3 py-1 text-xs text-cream/60 hover:border-gold/50"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-4 flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
              {selectedDay.appointments.length === 0 ? (
                <p className="text-sm text-cream/50">No hay citas este día.</p>
              ) : (
                selectedDay.appointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-xl border border-cream/10 bg-ink/40 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-cream">
                          {formatTime(appointment.start_time)} · {appointment.customer.name}
                        </p>
                        <p className="text-sm text-cream/50">{appointment.service.name}</p>
                        <p className="text-sm text-cream/50">{appointment.customer.phone}</p>
                      </div>
                      <StatusBadge status={appointment.status} />
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-cream/50">
                      <p>Duración: {formatDuration(appointment.service.duration_minutes)}</p>
                      <p>Precio: {formatPrice(appointment.service.price)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
