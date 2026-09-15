import { cn } from "@/lib/cn";
import type { AppointmentStatus } from "@/lib/types/database";

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-amber-400/10 text-amber-300 border-amber-400/30" },
  accepted: { label: "Aceptada", className: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30" },
  rejected: { label: "Rechazada", className: "bg-red-400/10 text-red-300 border-red-400/30" },
  cancelled: { label: "Cancelada", className: "bg-cream/10 text-cream/50 border-cream/20" },
  completed: { label: "Completada", className: "bg-gold/10 text-gold border-gold/30" },
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
