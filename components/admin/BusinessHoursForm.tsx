"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { createBusinessHourShift, deleteBusinessHourShift } from "@/lib/admin/actions";
import type { BusinessHour } from "@/lib/types/database";
import { formatTime, WEEKDAY_LABELS } from "@/lib/format";

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // lunes .. domingo

export function BusinessHoursForm({ hours }: { hours: BusinessHour[] }) {
  const byDay = new Map<number, BusinessHour[]>();
  for (const hour of hours) {
    const list = byDay.get(hour.day_of_week) ?? [];
    list.push(hour);
    byDay.set(hour.day_of_week, list);
  }

  return (
    <div className="flex flex-col gap-3">
      {DAY_ORDER.map((day) => (
        <DayRow key={day} day={day} shifts={byDay.get(day) ?? []} />
      ))}
    </div>
  );
}

function DayRow({ day, shifts }: { day: number; shifts: BusinessHour[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);

    startTransition(async () => {
      const result = await createBusinessHourShift(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setFormKey((k) => k + 1);
      }
    });
  }

  function handleDelete(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteBusinessHourShift(id);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="rounded-xl border border-cream/10 bg-ink-soft p-4">
      <div className="flex flex-wrap items-start gap-4">
        <p className="w-24 shrink-0 pt-2 text-sm font-medium text-cream">
          {WEEKDAY_LABELS[day]}
        </p>

        <div className="flex flex-1 flex-wrap items-center gap-2">
          {shifts.length === 0 && (
            <span className="text-sm text-cream/40">Cerrado</span>
          )}

          {shifts.map((shift) => (
            <span
              key={shift.id}
              className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-sm text-cream"
            >
              {formatTime(shift.opening_time)} – {formatTime(shift.closing_time)}
              <button
                type="button"
                onClick={() => handleDelete(shift.id)}
                disabled={isPending}
                aria-label={`Eliminar tramo ${formatTime(shift.opening_time)}-${formatTime(shift.closing_time)}`}
                className="text-cream/50 hover:text-red-400 disabled:opacity-40"
              >
                ×
              </button>
            </span>
          ))}

          <form key={formKey} onSubmit={handleAdd} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="day_of_week" value={day} />
            <input
              name="opening_time"
              type="time"
              required
              defaultValue="09:00"
              className="rounded-lg border border-cream/15 bg-cream/5 px-2 py-1 text-sm text-cream"
            />
            <span className="text-cream/40">–</span>
            <input
              name="closing_time"
              type="time"
              required
              defaultValue="14:00"
              className="rounded-lg border border-cream/15 bg-cream/5 px-2 py-1 text-sm text-cream"
            />
            <Button type="submit" size="md" variant="secondary" disabled={isPending}>
              + Tramo
            </Button>
          </form>
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
