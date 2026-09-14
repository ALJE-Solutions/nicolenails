import type { Metadata } from "next";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { getActiveServices } from "@/lib/services/queries";

export const metadata: Metadata = {
  title: "Reservar cita",
  description: "Reserva tu cita en Nicolenails: servicio, fecha, hora y confirmación.",
};

export default async function ReservarPage() {
  const services = await getActiveServices();

  return <BookingWizard services={services} />;
}
