import { cn } from "@/lib/cn";

interface ImagePlaceholderProps {
  label?: string;
  className?: string;
  aspect?: "square" | "video" | "portrait";
}

const ASPECT_CLASSES = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
};

/**
 * Marcador de posición para fotografías reales que Nicolenails aún no ha
 * proporcionado. Sustituir por <img>/<Image> cuando existan, sin necesidad
 * de rediseñar el layout que lo envuelve.
 */
export function ImagePlaceholder({
  label = "Imagen próximamente",
  className,
  aspect = "square",
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gold/40 bg-ink/[0.03] text-ink/40",
        ASPECT_CLASSES[aspect],
        className
      )}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <span className="text-xs tracking-wide uppercase">{label}</span>
    </div>
  );
}
