"use client";

import { useState, useTransition } from "react";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDuration, formatPrice } from "@/lib/format";
import { deleteService, toggleServiceActive } from "@/lib/admin/actions";
import type { Service } from "@/lib/types/database";
import { cn } from "@/lib/cn";

export function ServiceList({ services }: { services: Service[] }) {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-cream">Servicios</h1>
        {!creating && (
          <Button size="md" onClick={() => setCreating(true)}>
            Nuevo servicio
          </Button>
        )}
      </div>
      <p className="mt-1 text-sm text-cream/50">
        Crea, edita, activa/desactiva y elimina los servicios de Nicolenails.
      </p>

      {creating && (
        <div className="mt-6">
          <ServiceForm onDone={() => setCreating(false)} />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {services.length === 0 && !creating ? (
          <EmptyState
            title="Todavía no hay servicios"
            description="Crea el primero para poder empezar a recibir reservas."
          />
        ) : (
          services.map((service) =>
            editingId === service.id ? (
              <ServiceForm key={service.id} service={service} onDone={() => setEditingId(null)} />
            ) : (
              <ServiceRow
                key={service.id}
                service={service}
                onEdit={() => setEditingId(service.id)}
              />
            )
          )
        )}
      </div>
    </div>
  );
}

function ServiceRow({ service, onEdit }: { service: Service; onEdit: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const result = await toggleServiceActive(service.id, !service.active);
      if (result?.error) setError(result.error);
    });
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar "${service.name}"? Esta acción no se puede deshacer.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteService(service.id);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div
      className={cn(
        "rounded-2xl border bg-ink-soft p-5",
        service.active ? "border-cream/10" : "border-cream/10 opacity-60"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-display text-lg font-semibold text-cream">{service.name}</p>
            {!service.active && (
              <span className="rounded-full bg-cream/10 px-2 py-0.5 text-xs text-cream/50">
                Inactivo
              </span>
            )}
          </div>
          {service.description && (
            <p className="mt-1 max-w-md text-sm text-cream/50">{service.description}</p>
          )}
          <p className="mt-2 text-sm text-cream/70">
            {formatPrice(service.price)} · {formatDuration(service.duration_minutes)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="md" onClick={onEdit}>
            Editar
          </Button>
          <Button variant="secondary" size="md" onClick={handleToggle} disabled={isPending}>
            {service.active ? "Desactivar" : "Activar"}
          </Button>
          <Button variant="danger" size="md" onClick={handleDelete} disabled={isPending}>
            Eliminar
          </Button>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
