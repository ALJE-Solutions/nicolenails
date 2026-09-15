"use client";

import { useState, useTransition } from "react";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createStaff, updateStaff } from "@/lib/admin/actions";
import type { Staff } from "@/lib/types/database";

interface StaffFormProps {
  staff?: Staff;
  onDone: () => void;
}

export function StaffForm({ staff, onDone }: StaffFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEditing = Boolean(staff);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);

    startTransition(async () => {
      const result = staff
        ? await updateStaff(staff.id, formData)
        : await createStaff(formData);

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
        <Input id="name" name="name" required defaultValue={staff?.name} />
      </Field>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando…" : isEditing ? "Guardar cambios" : "Añadir"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone} disabled={isPending}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
