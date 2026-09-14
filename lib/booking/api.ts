import { createClient } from "@/lib/supabase/client";
import type { AvailableSlot, Service } from "@/lib/types/database";
import type { CustomerData } from "@/lib/validation/booking";

export class BookingError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "BookingError";
  }
}

const ERROR_MESSAGES: Record<string, string> = {
  SERVICE_NOT_FOUND: "Este servicio ya no está disponible. Elige otro servicio.",
  INVALID_NAME: "El nombre introducido no es válido.",
  INVALID_EMAIL: "El correo electrónico introducido no es válido.",
  INVALID_PHONE: "El número de teléfono introducido no es válido.",
  SLOT_NOT_AVAILABLE:
    "Esa hora ya no está disponible (puede que alguien la haya reservado). Elige otra hora.",
};

function toBookingError(error: { message: string }): BookingError {
  const code = Object.keys(ERROR_MESSAGES).find((key) => error.message.includes(key));
  if (code) {
    return new BookingError(code, ERROR_MESSAGES[code]);
  }
  return new BookingError(
    "CONNECTION_ERROR",
    "No se ha podido completar la solicitud. Comprueba tu conexión e inténtalo de nuevo."
  );
}

export async function fetchActiveServices(): Promise<Service[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("price", { ascending: true });

  if (error) throw toBookingError(error);
  return data ?? [];
}

export async function fetchAvailableSlots(
  serviceId: string,
  date: string
): Promise<AvailableSlot[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_available_slots", {
    p_service_id: serviceId,
    p_date: date,
  });

  if (error) throw toBookingError(error);
  return data ?? [];
}

export interface CreateAppointmentInput {
  serviceId: string;
  date: string;
  startTime: string;
  customer: CustomerData;
}

export interface CreateAppointmentResult {
  appointmentId: string;
  status: string;
}

export async function createAppointment(
  input: CreateAppointmentInput
): Promise<CreateAppointmentResult> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("create_appointment", {
    p_service_id: input.serviceId,
    p_date: input.date,
    p_start_time: input.startTime,
    p_customer_name: input.customer.name,
    p_customer_email: input.customer.email,
    p_customer_phone: input.customer.phone,
    p_notes: null,
  });

  if (error) throw toBookingError(error);

  const result = data?.[0];
  if (!result) {
    throw new BookingError("CONNECTION_ERROR", "No se ha podido crear la reserva.");
  }

  return { appointmentId: result.appointment_id, status: result.status };
}
