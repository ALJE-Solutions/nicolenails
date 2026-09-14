import { ServiceCard } from "@/components/booking/ServiceCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Service } from "@/lib/types/database";

interface ServiceStepProps {
  services: Service[];
  selectedId: string | null;
  onSelect: (service: Service) => void;
}

export function ServiceStep({ services, selectedId, onSelect }: ServiceStepProps) {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-ink">Elige tu servicio</h2>
      <p className="mt-1 text-sm text-ink/50">Precio y duración de cada servicio.</p>

      <div className="mt-5">
        {services.length === 0 ? (
          <EmptyState
            title="Todavía no hay servicios disponibles"
            description="Vuelve a pasarte en breve para poder reservar."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                selected={service.id === selectedId}
                onSelect={() => onSelect(service)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
