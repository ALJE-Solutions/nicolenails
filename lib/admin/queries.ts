import { createClient } from "@/lib/supabase/server";
import type {
  AppointmentStatus,
  AppointmentWithRelations,
  BlockedSlot,
  BusinessHour,
  Service,
} from "@/lib/types/database";

export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_admin");
  if (error) return false;
  return Boolean(data);
}

export async function getAppointments(
  status?: AppointmentStatus | "all"
): Promise<AppointmentWithRelations[]> {
  const supabase = await createClient();
  let query = supabase
    .from("appointments")
    .select("*, customer:customers(*), service:services(*)")
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error al cargar citas:", error.message);
    return [];
  }

  return (data ?? []) as unknown as AppointmentWithRelations[];
}

export async function getAppointmentsInRange(
  startDate: string,
  endDate: string
): Promise<AppointmentWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*, customer:customers(*), service:services(*)")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error al cargar citas del calendario:", error.message);
    return [];
  }

  return (data ?? []) as unknown as AppointmentWithRelations[];
}

export async function getAllServices(): Promise<Service[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error al cargar servicios:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getBusinessHours(): Promise<BusinessHour[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_hours")
    .select("*")
    .order("day_of_week", { ascending: true });

  if (error) {
    console.error("Error al cargar horarios:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getBlockedSlots(): Promise<BlockedSlot[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blocked_slots")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    console.error("Error al cargar bloqueos:", error.message);
    return [];
  }

  return data ?? [];
}
