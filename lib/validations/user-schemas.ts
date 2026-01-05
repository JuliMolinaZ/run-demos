import { z } from "zod";

/**
 * Esquemas de validación Zod para Users
 */

const emailSchema = z.string().email("Debe ser un email válido");

export const userRoleSchema = z.enum(["admin", "sales", "buyer"]);

export const createUserSchema = z.object({
  name: z.string()
    .min(1, "El nombre es requerido")
    .max(255, "El nombre no puede exceder 255 caracteres"),
  email: emailSchema,
  password: z.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100, "La contraseña no puede exceder 100 caracteres"),
  role: userRoleSchema.default("buyer"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

