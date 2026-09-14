import { cn } from "@/lib/cn";
import type { AppointmentStatus } from "@/lib/types/database";

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-amber-50 text-amber-800 border-amber-200" },
  accepted: { label: "Aceptada", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  rejected: { label: "Rechazada", className: "bg-red-50 text-red-700 border-red-200" },
  cancelled: { label: "Cancelada", className: "bg-gray-100 text-gray-600 border-gray-200" },
  completed: { label: "Completada", className: "bg-gold-soft/40 text-gold-deep border-gold-soft" },
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
