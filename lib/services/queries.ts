import { createClient } from "@/lib/supabase/server";
import type { Service } from "@/lib/types/database";

export async function getActiveServices(): Promise<Service[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("price", { ascending: true });

  if (error) {
    console.error("Error al cargar servicios:", error.message);
    return [];
  }

  return data ?? [];
}
