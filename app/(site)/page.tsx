import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { ServiceCard } from "@/components/booking/ServiceCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { getActiveServices } from "@/lib/services/queries";

export default async function HomePage() {
  const services = await getActiveServices();
  const featured = services.slice(0, 3);

  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-14 pb-16 sm:px-8 sm:pt-20 sm:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">
              Salón de uñas
            </p>
            <h1 className="mt-4 font-display text-4xl leading-tight font-semibold text-cream sm:text-5xl">
              Cuidado de uñas con un toque elegante y personal
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-cream/60">
              Reserva tu cita en Nicolenails en pocos pasos: elige tu servicio,
              el día y la hora que mejor te vengan.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/reservar" className={buttonClasses("primary", "lg")}>
                Reservar cita
              </Link>
              <Link href="/servicios" className={buttonClasses("secondary", "lg")}>
                Ver servicios
              </Link>
            </div>
          </div>

          <ImagePlaceholder label="Fotografía del salón próximamente" aspect="video" />
        </div>
      </section>

      <section className="border-t border-cream/10 bg-ink-soft/40">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">
                Servicios destacados
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-cream">
                Lo que hacemos
              </h2>
            </div>
            <Link
              href="/servicios"
              className="text-sm font-medium text-cream/60 underline decoration-gold/50 underline-offset-4 transition-colors hover:text-cream"
            >
              Ver todos los servicios
            </Link>
          </div>

          <div className="mt-10">
            {featured.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((service) => (
                  <ServiceCard key={service.id} service={service} href="/reservar" />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Los servicios se publicarán muy pronto"
                description="Nicolenails está configurando su carta de servicios. Vuelve a pasarte en breve."
              />
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-cream">Reserva sencilla</h3>
            <p className="mt-2 text-sm leading-relaxed text-cream/60">
              Elige servicio, fecha y hora disponible en menos de un minuto.
            </p>
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-cream">Confirmación personal</h3>
            <p className="mt-2 text-sm leading-relaxed text-cream/60">
              Cada solicitud la revisa Nicolenails antes de confirmarse.
            </p>
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-cream">Trato cercano</h3>
            <p className="mt-2 text-sm leading-relaxed text-cream/60">
              Un servicio pensado para cuidarte con calma y atención al detalle.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
