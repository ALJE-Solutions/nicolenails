const KEY = "nicolenails:last-booking";

export interface BookingConfirmation {
  serviceName: string;
  date: string;
  time: string;
  customerName: string;
}

export function saveBookingConfirmation(data: BookingConfirmation) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // sessionStorage puede no estar disponible (modo privado, etc.); no es crítico.
  }
}

export function readBookingConfirmation(): BookingConfirmation | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as BookingConfirmation) : null;
  } catch {
    return null;
  }
}
