import { z } from "zod";

export const customerDataSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Introduce tu nombre completo.")
    .max(100, "El nombre es demasiado largo."),
  email: z
    .string()
    .trim()
    .min(1, "Introduce tu correo electrónico.")
    .email("Introduce un correo electrónico válido."),
  phone: z
    .string()
    .trim()
    .min(6, "Introduce un número de teléfono válido.")
    .max(20, "El número de teléfono es demasiado largo.")
    .regex(/^[+\d][\d\s-]*$/, "Introduce un número de teléfono válido."),
});

export type CustomerData = z.infer<typeof customerDataSchema>;
