"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { getBookableDays } from "@/lib/booking/dates";

interface DateStepProps {
  selectedDate: string | null;
  onSelect: (iso: string) => void;
}

export function DateStep({ selectedDate, onSelect }: DateStepProps) {
  const days = useMemo(() => getBookableDays(45), []);

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-cream">¿Qué día te viene bien?</h2>
      <p className="mt-1 text-sm text-cream/50">Desliza para ver más fechas disponibles.</p>

      <div className="mt-5 -mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
        {days.map((day) => {
          const isSelected = day.iso === selectedDate;
          return (
            <button
              key={day.iso}
              type="button"
              onClick={() => onSelect(day.iso)}
              aria-pressed={isSelected}
              className={cn(
                "flex w-16 shrink-0 snap-start flex-col items-center gap-1 rounded-xl border px-2 py-3 transition-colors",
                isSelected
                  ? "border-gold bg-gold text-ink"
                  : "border-cream/15 bg-ink-soft text-cream hover:border-gold/50"
              )}
            >
              <span
                className={cn(
                  "text-[11px] font-medium uppercase",
                  isSelected ? "text-ink/70" : "text-cream/40"
                )}
              >
                {day.weekdayLabel}
              </span>
              <span className="font-display text-lg font-semibold">{day.dayNumber}</span>
              <span
                className={cn(
                  "text-[11px] uppercase",
                  isSelected ? "text-ink/70" : "text-cream/40"
                )}
              >
                {day.monthLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
