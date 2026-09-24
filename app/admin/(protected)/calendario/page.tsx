import Link from "next/link";
import { format } from "date-fns";
import { StatusBadge } from "@/components/ui/Badge";
import { getAppointmentsInRange } from "@/lib/admin/queries";
import { getMonthGrid, MONTH_LABEL, parseMonthParam, shiftMonthParam } from "@/lib/admin/calendar";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { AppointmentStatus } from "@/lib/types/database";

const WEEKDAY_HEADERS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const STATUS_ORDER: AppointmentStatus[] = [
  "pending",
  "accepted",
  "rejected",
  "cancelled",
  "completed",
];

interface CalendarioPageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function CalendarioPage({ searchParams }: CalendarioPageProps) {
  const { month: monthParam } = await searchParams;
  const monthDate = parseMonthParam(monthParam);
  const grid = getMonthGrid(monthDate);

  const rangeStart = grid[0].iso;
  const rangeEnd = grid[grid.length - 1].iso;
  const appointments = await getAppointmentsInRange(rangeStart, rangeEnd);

  // La cuadrícula solo muestra citas activas: una cancelada o rechazada ya no
  // ocupa ese hueco, y dejarla ahí confundía con una cita real (el resumen de
  // abajo sigue contando todos los estados, incluidos esos, para el histórico).
  const activeAppointments = appointments.filter(
    (appointment) => appointment.status !== "cancelled" && appointment.status !== "rejected"
  );

  const appointmentsByDate = new Map<string, typeof appointments>();
  for (const appointment of activeAppointments) {
    const list = appointmentsByDate.get(appointment.date) ?? [];
    list.push(appointment);
    appointmentsByDate.set(appointment.date, list);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-cream">Calendario</h1>
          <p className="mt-1 text-sm text-cream/50 capitalize">{MONTH_LABEL(monthDate)}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/calendario?month=${shiftMonthParam(monthDate, -1)}`}
            className="rounded-full border border-cream/15 px-4 py-1.5 text-sm font-medium text-cream/60 hover:border-gold/50"
          >
            ← Anterior
          </Link>
          <Link
            href={`/admin/calendario?month=${shiftMonthParam(monthDate, 1)}`}
            className="rounded-full border border-cream/15 px-4 py-1.5 text-sm font-medium text-cream/60 hover:border-gold/50"
          >
            Siguiente →
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-px overflow-hidden rounded-2xl border border-cream/10 bg-cream/10 text-xs">
        {WEEKDAY_HEADERS.map((day) => (
          <div key={day} className="bg-ink-soft px-2 py-2 text-center font-semibold text-cream/50">
            {day}
          </div>
        ))}

        {grid.map((day) => {
          const dayAppointments = appointmentsByDate.get(day.iso) ?? [];
          return (
            <div
              key={day.iso}
              className={cn(
                "min-h-24 bg-ink-soft p-1.5 sm:min-h-32 sm:p-2",
                !day.inCurrentMonth && "bg-ink-soft/30"
              )}
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                  day.isToday ? "bg-gold text-ink" : day.inCurrentMonth ? "text-cream" : "text-cream/30"
                )}
              >
                {format(day.date, "d")}
              </span>

              <div className="mt-1 flex flex-col gap-1">
                {dayAppointments.slice(0, 3).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="truncate rounded bg-cream/10 px-1.5 py-0.5 text-[11px] text-cream/70"
                    title={`${formatTime(appointment.start_time)} · ${appointment.customer.name}`}
                  >
                    {formatTime(appointment.start_time)} {appointment.customer.name}
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <span className="text-[11px] text-cream/40">
                    +{dayAppointments.length - 3} más
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-cream">Este mes de un vistazo</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-cream/60">
          {STATUS_ORDER.map((status) => {
            const count = appointments.filter((a) => a.status === status).length;
            return (
              <div key={status} className="flex items-center gap-2 rounded-full border border-cream/10 bg-ink-soft px-3 py-1.5">
                <StatusBadge status={status} />
                <span>{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
