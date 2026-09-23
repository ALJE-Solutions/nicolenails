import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-cream/10 bg-ink-soft text-cream/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="font-display text-lg text-cream">
          Nicole<span className="text-gold">nails</span>
        </p>

        <nav className="flex gap-6 text-sm">
          <Link href="/" className="transition-colors hover:text-gold">
            Inicio
          </Link>
          <Link href="/servicios" className="transition-colors hover:text-gold">
            Servicios
          </Link>
          <Link href="/reservar" className="transition-colors hover:text-gold">
            Reservar cita
          </Link>
        </nav>

        <p className="text-xs text-cream/40">
          © {new Date().getFullYear()} Nicolenails
        </p>
      </div>
    </footer>
  );
}
