"use client";

import { useState, useTransition } from "react";
import { StaffForm } from "@/components/admin/StaffForm";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { deleteStaff, toggleStaffActive } from "@/lib/admin/actions";
import type { Staff } from "@/lib/types/database";
import { cn } from "@/lib/cn";

export function StaffList({ staff }: { staff: Staff[] }) {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-cream">Personal</h1>
        {!creating && (
          <Button size="md" onClick={() => setCreating(true)}>
            Añadir persona
          </Button>
        )}
      </div>
      <p className="mt-1 text-sm text-cream/50">
        Quien esté activo aquí cuenta para la disponibilidad de huecos y aparece como opción al
        aceptar una cita.
      </p>

      {creating && (
        <div className="mt-6">
          <StaffForm onDone={() => setCreating(false)} />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {staff.length === 0 && !creating ? (
          <EmptyState
            title="Todavía no hay personal dado de alta"
            description="Añade al menos una persona para que puedan reservarse citas."
          />
        ) : (
          staff.map((member) =>
            editingId === member.id ? (
              <StaffForm key={member.id} staff={member} onDone={() => setEditingId(null)} />
            ) : (
              <StaffRow key={member.id} member={member} onEdit={() => setEditingId(member.id)} />
            )
          )
        )}
      </div>
    </div>
  );
}

function StaffRow({ member, onEdit }: { member: Staff; onEdit: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const result = await toggleStaffActive(member.id, !member.active);
      if (result?.error) setError(result.error);
    });
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar a "${member.name}"? Esta acción no se puede deshacer.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteStaff(member.id);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-cream/10 bg-ink-soft p-5",
        !member.active && "opacity-60"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="font-display text-lg font-semibold text-cream">{member.name}</p>
          {!member.active && (
            <span className="rounded-full bg-cream/10 px-2 py-0.5 text-xs text-cream/50">
              Inactivo
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="md" onClick={onEdit}>
            Editar
          </Button>
          <Button variant="secondary" size="md" onClick={handleToggle} disabled={isPending}>
            {member.active ? "Desactivar" : "Activar"}
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
