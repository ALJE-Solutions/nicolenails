"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, Input } from "@/components/ui/Input";
import { customerDataSchema, type CustomerData } from "@/lib/validation/booking";

interface CustomerStepProps {
  defaultValues: Partial<CustomerData>;
  onSubmit: (data: CustomerData) => void;
}

export function CustomerStep({ defaultValues, onSubmit }: CustomerStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerData>({
    resolver: zodResolver(customerDataSchema),
    defaultValues,
  });

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-cream">Tus datos</h2>
      <p className="mt-1 text-sm text-cream/50">Los necesitamos para confirmarte la cita.</p>

      <form
        id="customer-form"
        onSubmit={handleSubmit(onSubmit)}
        className="mt-5 flex flex-col gap-4"
        noValidate
      >
        <Field label="Nombre completo" htmlFor="name" required error={errors.name?.message}>
          <Input id="name" autoComplete="name" {...register("name")} />
        </Field>

        <Field label="Correo electrónico" htmlFor="email" required error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
        </Field>

        <Field label="Teléfono" htmlFor="phone" required error={errors.phone?.message}>
          <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
        </Field>
      </form>
    </div>
  );
}
