import Link from "next/link";
import { formatDuration, formatPrice } from "@/lib/format";
import type { Service } from "@/lib/types/database";
import { cn } from "@/lib/cn";

interface ServiceCardProps {
  service: Service;
  href?: string;
  selected?: boolean;
  onSelect?: () => void;
}

export function ServiceCard({ service, href, selected, onSelect }: ServiceCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-display text-lg font-semibold text-ink">{service.name}</h3>
        <span className="whitespace-nowrap font-display text-lg font-semibold text-gold-deep">
          {formatPrice(service.price)}
        </span>
      </div>

      {service.description && (
        <p className="mt-2 text-sm leading-relaxed text-ink/60">{service.description}</p>
      )}

      <p className="mt-4 text-xs font-medium tracking-wide text-ink/40 uppercase">
        {formatDuration(service.duration_minutes)}
      </p>
    </>
  );

  const baseClasses = cn(
    "block rounded-2xl border bg-white p-6 text-left transition-all duration-200",
    selected
      ? "border-gold shadow-[0_0_0_1px_rgba(201,161,90,0.5)]"
      : "border-ink/10 hover:border-gold/50 hover:shadow-sm"
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onSelect} className={cn(baseClasses, "w-full")}>
      {content}
    </button>
  );
}
