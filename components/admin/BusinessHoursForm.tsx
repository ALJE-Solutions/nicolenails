"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { upsertBusinessHour } from "@/lib/admin/actions";
import type { BusinessHour } from "@/lib/types/database";
import { WEEKDAY_LABELS } from "@/lib/format";

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // lunes .. domingo

export function BusinessHoursForm({ hours }: { hours: BusinessHour[] }) {
  const byDay = new Map(hours.map((h) => [h.day_of_week, h]));

  return (
    <div className="flex flex-col gap-3">
      {DAY_ORDER.map((day) => (
        <DayRow key={day} day={day} hour={byDay.get(day)} />
      ))}
    </div>
  );
}

function DayRow({ day, hour }: { day: number; hour?: BusinessHour }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [active, setActive] = useState(hour?.active ?? false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await upsertBusinessHour(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-ink/10 bg-white p-4"
    >
      <input type="hidden" name="day_of_week" value={day} />

      <div className="w-24 shrink-0">
        <p className="text-sm font-medium text-ink">{WEEKDAY_LABELS[day]}</p>
        <label className="mt-2 flex items-center gap-1.5 text-xs text-ink/50">
          <input
            type="checkbox"
            name="active"
            defaultChecked={hour?.active ?? false}
            onChange={(e) => setActive(e.target.checked)}
            className="accent-gold"
          />
          Abierto
        </label>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-ink/50" htmlFor={`opening-${day}`}>
          Apertura
        </label>
        <input
          id={`opening-${day}`}
          name="opening_time"
          type="time"
          defaultValue={hour?.opening_time?.slice(0, 5) ?? "10:00"}
          disabled={!active}
          className="rounded-lg border border-ink/15 px-3 py-1.5 text-sm disabled:opacity-40"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-ink/50" htmlFor={`closing-${day}`}>
          Cierre
        </label>
        <input
          id={`closing-${day}`}
          name="closing_time"
          type="time"
          defaultValue={hour?.closing_time?.slice(0, 5) ?? "19:00"}
          disabled={!active}
          className="rounded-lg border border-ink/15 px-3 py-1.5 text-sm disabled:opacity-40"
        />
      </div>

      <Button type="submit" size="md" disabled={isPending}>
        {isPending ? "Guardando…" : "Guardar"}
      </Button>

      {saved && !isPending && <span className="text-xs text-emerald-700">Guardado ✓</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </form>
  );
}
