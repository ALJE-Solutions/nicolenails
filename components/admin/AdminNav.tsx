"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { signOut } from "@/lib/admin/actions";

const LINKS = [
  { href: "/admin/citas", label: "Citas" },
  { href: "/admin/calendario", label: "Calendario" },
  { href: "/admin/servicios", label: "Servicios" },
  { href: "/admin/horarios", label: "Horarios" },
  { href: "/admin/bloqueos", label: "Bloqueos" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-4 sm:h-full sm:justify-between">
      <div className="flex items-center justify-between sm:block">
        <div>
          <Link href="/admin/citas" className="font-display text-lg font-semibold text-cream">
            Nicole<span className="text-gold">nails</span>
          </Link>
          <p className="mt-0.5 hidden text-xs text-cream/40 sm:block">Panel de administración</p>
        </div>

        <form action={signOut} className="sm:hidden">
          <button type="submit" className="text-xs font-medium text-cream/50 hover:text-cream">
            Cerrar sesión
          </button>
        </form>
      </div>

      <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 sm:mx-0 sm:mt-8 sm:flex-col sm:overflow-visible sm:px-0">
        {LINKS.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "shrink-0 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                active ? "bg-gold/15 text-gold" : "text-cream/60 hover:bg-cream/5 hover:text-cream"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <form action={signOut} className="hidden sm:block">
        <button
          type="submit"
          className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-cream/50 transition-colors hover:bg-cream/5 hover:text-cream"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
