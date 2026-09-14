import type { Metadata } from "next";
import Link from "next/link";
import { ServiceCard } from "@/components/booking/ServiceCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";
import { getActiveServices } from "@/lib/services/queries";

export const metadata: Metadata = {
  title: "Servicios",
  description: "Consulta los servicios de Nicolenails, con precio y duración de cada uno.",
};

export default async function ServiciosPage() {
  const services = await getActiveServices();

  return (
    <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="text-xs font-semibold tracking-[0.2em] text-gold-deep uppercase">
        Carta de servicios
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
        Nuestros servicios
      </h1>
      <p className="mt-3 max-w-xl text-base text-ink/60">
        Precio y duración orientativos de cada servicio. Selecciona uno para empezar tu reserva.
      </p>

      <div className="mt-10">
        {services.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} href="/reservar" />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Todavía no hay servicios publicados"
            description="Nicolenails está preparando su carta de servicios. Vuelve a pasarte en breve."
          />
        )}
      </div>

      {services.length > 0 && (
        <div className="mt-12">
          <Link href="/reservar" className={buttonClasses("primary", "lg")}>
            Reservar cita
          </Link>
        </div>
      )}
    </section>
  );
}
