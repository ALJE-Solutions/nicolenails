import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export interface MonthGridDay {
  date: Date;
  iso: string;
  inCurrentMonth: boolean;
  isToday: boolean;
}

export function getMonthGrid(monthDate: Date): MonthGridDay[] {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: MonthGridDay[] = [];
  let cursor = gridStart;
  while (cursor <= gridEnd) {
    days.push({
      date: cursor,
      iso: format(cursor, "yyyy-MM-dd"),
      inCurrentMonth: isSameMonth(cursor, monthDate),
      isToday: isToday(cursor),
    });
    cursor = addDays(cursor, 1);
  }

  return days;
}

export function parseMonthParam(monthParam: string | undefined): Date {
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [year, month] = monthParam.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function shiftMonthParam(monthDate: Date, delta: number): string {
  const shifted = new Date(monthDate.getFullYear(), monthDate.getMonth() + delta, 1);
  return format(shifted, "yyyy-MM");
}

export const MONTH_LABEL = (date: Date) =>
  new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(date);
