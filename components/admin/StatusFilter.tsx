import Link from "next/link";
import { cn } from "@/lib/cn";
import type { AppointmentStatus } from "@/lib/types/database";

const OPTIONS: { value: AppointmentStatus | "all"; label: string }[] = [
  { value: "pending", label: "Pendientes" },
  { value: "accepted", label: "Aceptadas" },
  { value: "rejected", label: "Rechazadas" },
  { value: "cancelled", label: "Canceladas" },
  { value: "completed", label: "Completadas" },
  { value: "all", label: "Todas" },
];

export function StatusFilter({ current }: { current: AppointmentStatus | "all" }) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {OPTIONS.map((option) => {
        const active = option.value === current;
        return (
          <Link
            key={option.value}
            href={option.value === "pending" ? "/admin/citas" : `/admin/citas?status=${option.value}`}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "border-ink bg-ink text-cream"
                : "border-ink/15 text-ink/60 hover:border-gold/50"
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
