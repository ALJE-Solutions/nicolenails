import type { Staff } from "@/lib/types/database";
import type { StaffBooking } from "@/lib/admin/queries";

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && aEnd > bStart;
}

// Personal activo que NO tiene ya otra cita aceptada solapada ese día.
export function availableStaffFor(
  staff: Staff[],
  bookings: StaffBooking[],
  appointment: { date: string; start_time: string; end_time: string }
): Staff[] {
  const busyIds = new Set(
    bookings
      .filter(
        (b) =>
          b.date === appointment.date &&
          overlaps(b.start_time, b.end_time, appointment.start_time, appointment.end_time)
      )
      .map((b) => b.staff_id)
  );

  return staff.filter((s) => s.active && !busyIds.has(s.id));
}
