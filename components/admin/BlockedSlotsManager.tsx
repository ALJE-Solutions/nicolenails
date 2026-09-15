"use client";

import { useState, useTransition } from "react";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { createBlockedSlot, deleteBlockedSlot } from "@/lib/admin/actions";
import { formatDateLong, formatTime } from "@/lib/format";
import type { BlockedSlot } from "@/lib/types/database";

export function BlockedSlotsManager({ slots }: { slots: BlockedSlot[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);

    startTransition(async () => {
      const result = await createBlockedSlot(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setFormKey((k) => k + 1); // resetea el formulario
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteBlockedSlot(id);
    });
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-cream">Bloqueos</h1>
      <p className="mt-1 text-sm text-cream/50">
        Bloquea días completos (vacaciones, festivos) u horas concretas. Deja las horas en blanco
        para bloquear el día entero.
      </p>

      <form
        key={formKey}
        onSubmit={handleSubmit}
        className="mt-6 grid gap-4 rounded-2xl border border-cream/10 bg-ink-soft p-5 sm:grid-cols-4"
      >
        <Field label="Fecha" htmlFor="date" required>
          <Input id="date" name="date" type="date" required />
        </Field>
        <Field label="Desde (opcional)" htmlFor="start_time">
          <Input id="start_time" name="start_time" type="time" />
        </Field>
        <Field label="Hasta (opcional)" htmlFor="end_time">
          <Input id="end_time" name="end_time" type="time" />
        </Field>
        <Field label="Motivo (opcional)" htmlFor="reason">
          <Input id="reason" name="reason" placeholder="Vacaciones, festivo…" />
        </Field>

        {error && <p className="sm:col-span-4 text-sm text-red-400">{error}</p>}

        <div className="sm:col-span-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Añadiendo…" : "Añadir bloqueo"}
          </Button>
        </div>
      </form>

      <div className="mt-6 flex flex-col gap-3">
        {slots.length === 0 ? (
          <EmptyState title="No hay bloqueos programados" />
        ) : (
          slots.map((slot) => (
            <div
              key={slot.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cream/10 bg-ink-soft px-4 py-3"
            >
              <div className="text-sm">
                <p className="font-medium text-cream capitalize">{formatDateLong(slot.date)}</p>
                <p className="text-cream/50">
                  {slot.start_time && slot.end_time
                    ? `${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}`
                    : "Día completo"}
                  {slot.reason ? ` · ${slot.reason}` : ""}
                </p>
              </div>
              <Button
                variant="danger"
                size="md"
                disabled={isPending}
                onClick={() => handleDelete(slot.id)}
              >
                Eliminar
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
