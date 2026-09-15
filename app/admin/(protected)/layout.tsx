import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin/queries";
import { AdminNav } from "@/components/admin/AdminNav";
import { signOut } from "@/lib/admin/actions";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink px-6 text-center">
        <p className="font-display text-2xl text-cream">Acceso no autorizado</p>
        <p className="max-w-sm text-sm text-cream/60">
          Tu cuenta ({user.email}) ha iniciado sesión correctamente, pero no está autorizada
          como administradora de Nicolenails.
        </p>
        <form action={signOut}>
          <button type="submit" className="text-sm font-medium text-gold underline">
            Cerrar sesión
          </button>
        </form>
      </section>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink sm:flex-row">
      <aside className="border-b border-cream/10 bg-ink-soft px-5 py-4 sm:min-h-screen sm:w-64 sm:border-r sm:border-b-0 sm:px-6 sm:py-8">
        <AdminNav />
      </aside>
      <main className="flex-1 px-5 py-8 sm:px-10 sm:py-10">{children}</main>
    </div>
  );
}
