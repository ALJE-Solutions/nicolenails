const DAY_ABBR = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_LABEL = new Intl.DateTimeFormat("es-ES", { month: "short" });

export interface BookableDay {
  iso: string; // YYYY-MM-DD
  dayNumber: number;
  weekdayLabel: string;
  monthLabel: string;
  isToday: boolean;
}

function toIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Próximos `days` días a partir de hoy (incluido), en horario local. */
export function getBookableDays(days = 45): BookableDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    return {
      iso: toIso(date),
      dayNumber: date.getDate(),
      weekdayLabel: DAY_ABBR[date.getDay()],
      monthLabel: MONTH_LABEL.format(date),
      isToday: i === 0,
    };
  });
}
