"use client";

import { useActionState } from "react";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signIn } from "@/lib/admin/actions";

type LoginState = { error: string | null };

async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const result = await signIn(formData);
  return result ?? { error: null };
}

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {
    error: null,
  });

  return (
    <section className="flex min-h-screen items-center justify-center bg-ink px-5 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-cream/10 bg-ink-soft p-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">
          Panel privado
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-cream">Nicolenails</h1>
        <p className="mt-1 text-sm text-cream/50">Acceso exclusivo para la propietaria.</p>

        <form action={formAction} className="mt-8 flex flex-col gap-4">
          <Field label="Email" htmlFor="email" required>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </Field>

          <Field label="Contraseña" htmlFor="password" required>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </Field>

          {state.error && <p className="text-sm text-red-400">{state.error}</p>}

          <Button type="submit" size="lg" disabled={pending} className="mt-2">
            {pending ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      </div>
    </section>
  );
}
