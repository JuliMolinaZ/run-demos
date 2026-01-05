import { z } from "zod";

/**
 * Esquemas de validación Zod para Leads
 */

const emailSchema = z.string().email("Debe ser un email válido");

export const createLeadSchema = z.object({
  name: z.string()
    .min(1, "El nombre es requerido")
    .max(255, "El nombre no puede exceder 255 caracteres"),
  email: emailSchema,
  company: z.string()
    .max(255, "El nombre de la empresa no puede exceder 255 caracteres")
    .nullable()
    .optional(),
  revenueRange: z.string()
    .max(50, "El rango de ingresos no puede exceder 50 caracteres")
    .nullable()
    .optional(),
  employeeCount: z.number()
    .int()
    .positive("El número de empleados debe ser positivo")
    .nullable()
    .optional(),
  location: z.string()
    .max(255, "La ubicación no puede exceder 255 caracteres")
    .nullable()
    .optional(),
  sharedByUserId: z.number().int().positive().nullable().optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

