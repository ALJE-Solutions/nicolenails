"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppointmentStatus } from "@/lib/types/database";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function signIn(formData: FormData) {
  const email = str(formData, "email");
  const password = str(formData, "password");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Credenciales incorrectas. Comprueba el email y la contraseña." };
  }

  redirect("/admin/citas");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Citas
// ---------------------------------------------------------------------------

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("appointments").update({ status }).eq("id", id);

  if (error) {
    return { error: "No se ha podido actualizar la cita." };
  }

  revalidatePath("/admin/citas");
  revalidatePath("/admin/calendario");
  return { error: null };
}

// ---------------------------------------------------------------------------
// Servicios
// ---------------------------------------------------------------------------

export async function createService(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("services").insert({
    name: str(formData, "name"),
    description: str(formData, "description") || null,
    price: Number(str(formData, "price")),
    duration_minutes: Number(str(formData, "duration_minutes")),
  });

  if (error) return { error: "No se ha podido crear el servicio." };

  revalidatePath("/admin/servicios");
  return { error: null };
}

export async function updateService(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update({
      name: str(formData, "name"),
      description: str(formData, "description") || null,
      price: Number(str(formData, "price")),
      duration_minutes: Number(str(formData, "duration_minutes")),
    })
    .eq("id", id);

  if (error) return { error: "No se ha podido actualizar el servicio." };

  revalidatePath("/admin/servicios");
  return { error: null };
}

export async function toggleServiceActive(id: string, active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("services").update({ active }).eq("id", id);

  if (error) return { error: "No se ha podido cambiar el estado del servicio." };

  revalidatePath("/admin/servicios");
  return { error: null };
}

export async function deleteService(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("services").delete().eq("id", id);

  if (error) {
    return {
      error:
        "No se ha podido eliminar el servicio (puede tener citas asociadas). Puedes desactivarlo en su lugar.",
    };
  }

  revalidatePath("/admin/servicios");
  return { error: null };
}

// ---------------------------------------------------------------------------
// Horario
// ---------------------------------------------------------------------------

export async function upsertBusinessHour(formData: FormData) {
  const supabase = await createClient();
  const dayOfWeek = Number(str(formData, "day_of_week"));
  const active = formData.get("active") === "on";

  const { error } = await supabase
    .from("business_hours")
    .upsert(
      {
        day_of_week: dayOfWeek,
        opening_time: str(formData, "opening_time"),
        closing_time: str(formData, "closing_time"),
        active,
      },
      { onConflict: "day_of_week" }
    );

  if (error) return { error: "No se ha podido guardar el horario." };

  revalidatePath("/admin/horarios");
  return { error: null };
}

// ---------------------------------------------------------------------------
// Bloqueos
// ---------------------------------------------------------------------------

export async function createBlockedSlot(formData: FormData) {
  const supabase = await createClient();
  const startTime = str(formData, "start_time");
  const endTime = str(formData, "end_time");

  const { error } = await supabase.from("blocked_slots").insert({
    date: str(formData, "date"),
    start_time: startTime || null,
    end_time: endTime || null,
    reason: str(formData, "reason") || null,
  });

  if (error) return { error: "No se ha podido crear el bloqueo." };

  revalidatePath("/admin/bloqueos");
  return { error: null };
}

export async function deleteBlockedSlot(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("blocked_slots").delete().eq("id", id);

  if (error) return { error: "No se ha podido eliminar el bloqueo." };

  revalidatePath("/admin/bloqueos");
  return { error: null };
}
