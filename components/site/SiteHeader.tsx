import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-cream/10 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="font-display text-xl font-semibold tracking-wide text-cream">
          Nicole<span className="text-gold">nails</span>
        </Link>

        <Link href="/reservar" className={buttonClasses("primary", "md")}>
          Reservar cita
        </Link>
      </div>
    </header>
  );
}
