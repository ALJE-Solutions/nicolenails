import { formatDateLong, formatDuration, formatPrice, formatTime } from "@/lib/format";
import type { Service } from "@/lib/types/database";
import type { CustomerData } from "@/lib/validation/booking";

interface SummaryStepProps {
  service: Service;
  date: string;
  time: string;
  customer: CustomerData;
  error?: string | null;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-ink/10 py-3 last:border-0">
      <span className="text-sm text-ink/50">{label}</span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  );
}

export function SummaryStep({ service, date, time, customer, error }: SummaryStepProps) {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-ink">Revisa tu reserva</h2>
      <p className="mt-1 text-sm text-ink/50">
        Comprueba que todo es correcto antes de enviar la solicitud.
      </p>

      <div className="mt-5 rounded-2xl border border-ink/10 bg-white px-5 py-2">
        <Row label="Servicio" value={service.name} />
        <Row label="Duración" value={formatDuration(service.duration_minutes)} />
        <Row label="Precio" value={formatPrice(service.price)} />
        <Row label="Fecha" value={formatDateLong(date)} />
        <Row label="Hora" value={formatTime(time)} />
        <Row label="Nombre" value={customer.name} />
        <Row label="Correo" value={customer.email} />
        <Row label="Teléfono" value={customer.phone} />
      </div>

      <div className="mt-5 rounded-xl border border-gold/30 bg-gold-soft/20 px-4 py-3 text-sm text-ink/70">
        Al confirmar, tu solicitud quedará <strong>pendiente de confirmación</strong> por parte
        de Nicolenails. Te avisaremos por correo en cuanto la revisemos.
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
