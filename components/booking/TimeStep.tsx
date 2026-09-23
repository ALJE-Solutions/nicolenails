"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { formatTime } from "@/lib/format";
import { fetchAvailableSlots } from "@/lib/booking/api";
import type { AvailableSlot } from "@/lib/types/database";

interface TimeStepProps {
  serviceId: string;
  date: string;
  selectedTime: string | null;
  onSelect: (slot: AvailableSlot) => void;
}

type LoadState = "loading" | "ready" | "error";

export function TimeStep({ serviceId, date, selectedTime, onSelect }: TimeStepProps) {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;

    fetchAvailableSlots(serviceId, date)
      .then((result) => {
        if (cancelled) return;
        setSlots(result);
        setState("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [serviceId, date]);

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-cream">¿A qué hora?</h2>
      <p className="mt-1 text-sm text-cream/50">Solo se muestran las horas realmente disponibles.</p>

      <div className="mt-5">
        {state === "loading" && (
          <p className="rounded-xl border border-cream/10 bg-ink-soft px-4 py-6 text-center text-sm text-cream/50">
            Comprobando horario disponible…
          </p>
        )}

        {state === "error" && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-6 text-center text-sm text-red-300">
            No se ha podido comprobar la disponibilidad. Revisa tu conexión e inténtalo de nuevo.
          </p>
        )}

        {state === "ready" && slots.length === 0 && (
          <p className="rounded-xl border border-cream/10 bg-ink-soft px-4 py-6 text-center text-sm text-cream/50">
            No quedan horas disponibles ese día. Prueba con otra fecha.
          </p>
        )}

        {state === "ready" && slots.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => {
              const isSelected = slot.slot_start === selectedTime;
              return (
                <button
                  key={slot.slot_start}
                  type="button"
                  onClick={() => onSelect(slot)}
                  aria-pressed={isSelected}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                    isSelected
                      ? "border-gold bg-gold text-ink"
                      : "border-cream/15 bg-ink-soft text-cream hover:border-gold/50"
                  )}
                >
                  {formatTime(slot.slot_start)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
