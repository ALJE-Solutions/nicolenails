const MADRID_TZ = "Europe/Madrid";

// Las citas se guardan en hora local de Europe/Madrid; hay que convertirlas a
// UTC (con el cambio de horario de verano/invierno ya aplicado) para que el
// archivo .ics funcione igual sin importar la zona horaria del cliente.
function madridOffsetMinutes(instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: MADRID_TZ,
    timeZoneName: "shortOffset",
  }).formatToParts(instant);
  const tzName = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+1";
  const match = tzName.match(/GMT([+-])(\d+)(?::(\d+))?/);
  if (!match) return 60;
  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = match[3] ? Number(match[3]) : 0;
  return sign * (hours * 60 + minutes);
}

export function madridLocalToUtcDate(dateStr: string, timeStr: string): Date {
  const naiveUtc = new Date(`${dateStr}T${timeStr}Z`);
  const offsetMinutes = madridOffsetMinutes(naiveUtc);
  return new Date(naiveUtc.getTime() - offsetMinutes * 60000);
}

export function toIcsUtcString(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

export function buildIcsContent(params: {
  appointmentId: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
}): string {
  const startIcs = toIcsUtcString(madridLocalToUtcDate(params.date, params.startTime));
  const endIcs = toIcsUtcString(madridLocalToUtcDate(params.date, params.endTime));
  const title = `Nicolenails: ${params.serviceName}`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nicolenails//Appointments//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${params.appointmentId}@nicolenails`,
    `DTSTAMP:${toIcsUtcString(new Date())}`,
    `DTSTART:${startIcs}`,
    `DTEND:${endIcs}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText("Cita reservada en Nicolenails.")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
