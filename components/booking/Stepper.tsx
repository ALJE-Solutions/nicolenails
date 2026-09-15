import { cn } from "@/lib/cn";

const STEP_LABELS = ["Servicio", "Fecha", "Hora", "Tus datos", "Resumen"];

export function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3">
      {STEP_LABELS.map((label, index) => {
        const step = index + 1;
        const isActive = step === current;
        const isDone = step < current;

        return (
          <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                isDone && "bg-gold text-ink",
                isActive && "border border-gold text-gold",
                !isDone && !isActive && "bg-cream/10 text-cream/40"
              )}
            >
              {isDone ? "✓" : step}
            </div>
            <span
              className={cn(
                "hidden text-xs font-medium sm:inline",
                isActive ? "text-cream" : "text-cream/40"
              )}
            >
              {label}
            </span>
            {step < STEP_LABELS.length && (
              <div
                className={cn("h-px flex-1", isDone ? "bg-gold" : "bg-cream/10")}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
