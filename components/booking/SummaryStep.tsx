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
    <div className="flex items-center justify-between border-b border-cream/10 py-3 last:border-0">
      <span className="text-sm text-cream/50">{label}</span>
      <span className="text-sm font-medium text-cream">{value}</span>
    </div>
  );
}

export function SummaryStep({ service, date, time, customer, error }: SummaryStepProps) {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-cream">Revisa tu reserva</h2>
      <p className="mt-1 text-sm text-cream/50">
        Comprueba que todo es correcto antes de enviar la solicitud.
      </p>

      <div className="mt-5 rounded-2xl border border-cream/10 bg-ink-soft px-5 py-2">
        <Row label="Servicio" value={service.name} />
        <Row label="Duración" value={formatDuration(service.duration_minutes)} />
        <Row label="Precio" value={formatPrice(service.price)} />
        <Row label="Fecha" value={formatDateLong(date)} />
        <Row label="Hora" value={formatTime(time)} />
        <Row label="Nombre" value={customer.name} />
        <Row label="Correo" value={customer.email} />
        <Row label="Teléfono" value={customer.phone} />
      </div>

      <div className="mt-5 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-cream/70">
        Al confirmar, tu solicitud quedará <strong>pendiente de confirmación</strong> por parte
        de Nicolenails. Te avisaremos por correo en cuanto la revisemos.
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}
