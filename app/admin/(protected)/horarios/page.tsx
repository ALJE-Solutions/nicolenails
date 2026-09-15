import { BusinessHoursForm } from "@/components/admin/BusinessHoursForm";
import { getBusinessHours } from "@/lib/admin/queries";

export default async function HorariosPage() {
  const hours = await getBusinessHours();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-cream">Horario de apertura</h1>
      <p className="mt-1 text-sm text-cream/50">
        Define en qué días y horas puede reservarse cita. Los días desmarcados aparecen como
        cerrados.
      </p>

      <div className="mt-6">
        <BusinessHoursForm hours={hours} />
      </div>
    </div>
  );
}
