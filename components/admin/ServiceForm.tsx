"use client";

import { useState, useTransition } from "react";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createService, updateService } from "@/lib/admin/actions";
import type { Service } from "@/lib/types/database";

interface ServiceFormProps {
  service?: Service;
  onDone: () => void;
}

export function ServiceForm({ service, onDone }: ServiceFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEditing = Boolean(service);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);

    startTransition(async () => {
      const result = service
        ? await updateService(service.id, formData)
        : await createService(formData);

      if (result?.error) {
        setError(result.error);
        return;
      }

      onDone();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-gold/30 bg-gold/5 p-5"
    >
      <Field label="Nombre" htmlFor="name" required>
        <Input id="name" name="name" required defaultValue={service?.name} />
      </Field>

      <Field label="Descripción" htmlFor="description">
        <Textarea id="description" name="description" defaultValue={service?.description ?? ""} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Precio (€)" htmlFor="price" required>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={service?.price}
          />
        </Field>

        <Field label="Duración (min)" htmlFor="duration_minutes" required>
          <Input
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            min="1"
            step="5"
            required
            defaultValue={service?.duration_minutes}
          />
        </Field>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear servicio"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone} disabled={isPending}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
