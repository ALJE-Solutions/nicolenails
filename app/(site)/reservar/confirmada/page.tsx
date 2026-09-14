"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { formatDateLong, formatTime } from "@/lib/format";
import { readBookingConfirmation, type BookingConfirmation } from "@/lib/booking/confirmationStorage";

export default function ReservaConfirmadaPage() {
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  useEffect(() => {
    // sessionStorage solo existe en el cliente; se lee de forma diferida
    // (no durante el render) para evitar un desajuste con el HTML del servidor.
    Promise.resolve().then(() => setConfirmation(readBookingConfirmation()));
  }, []);

  return (
    <section className="mx-auto flex max-w-lg flex-col items-center px-5 py-20 text-center sm:px-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-soft/50 text-3xl text-gold-deep">
        ✓
      </div>

      <h1 className="mt-6 font-display text-3xl font-semibold text-ink">
        Solicitud enviada
      </h1>

      <p className="mt-3 text-base leading-relaxed text-ink/60">
        {confirmation
          ? `Gracias, ${confirmation.customerName}. Tu solicitud para el ${formatDateLong(
              confirmation.date
            )} a las ${formatTime(confirmation.time)} ha sido registrada y está `
          : "Tu solicitud ha sido registrada y está "}
        <strong>pendiente de confirmación</strong> por parte de Nicolenails. Te avisaremos por
        correo electrónico en cuanto la revisemos.
      </p>

      <Link href="/" className={buttonClasses("primary", "lg", "mt-8")}>
        Volver al inicio
      </Link>
    </section>
  );
}
