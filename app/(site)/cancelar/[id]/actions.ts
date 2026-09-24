"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function cancelAppointment(formData: FormData) {
  const id = String(formData.get("appointment_id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.rpc("cancel_appointment", { p_appointment_id: id });

  // Si la cita ya no era cancelable (carrera con el panel de administración),
  // la función RPC simplemente no hace nada: la página vuelve a mostrar el
  // estado real tras revalidar.
  revalidatePath(`/cancelar/${id}`);
  revalidatePath("/admin/citas");
  revalidatePath("/admin/calendario");
}
