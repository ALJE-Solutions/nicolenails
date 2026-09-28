import Link from "next/link";
import { format } from "date-fns";
import { StatusBadge } from "@/components/ui/Badge";
import { CalendarGrid, type CalendarGridDay } from "@/components/admin/CalendarGrid";
import { getAppointmentsInRange } from "@/lib/admin/queries";
import { getMonthGrid, MONTH_LABEL, parseMonthParam, shiftMonthParam } from "@/lib/admin/calendar";
import type { AppointmentStatus } from "@/lib/types/database";

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

  // Se pasa como array plano de datos serializables (nada de Date/Map) al
  // componente cliente, que es quien abre el diálogo con el detalle del día.
  const calendarDays: CalendarGridDay[] = grid.map((day) => ({
    iso: day.iso,
    dayLabel: format(day.date, "d"),
    inCurrentMonth: day.inCurrentMonth,
    isToday: day.isToday,
    appointments: appointmentsByDate.get(day.iso) ?? [],
  }));

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

      <CalendarGrid days={calendarDays} />

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
