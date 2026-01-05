import { z } from "zod";

/**
 * Esquemas de validación Zod para Demos
 */

export const demoStatusSchema = z.enum(["draft", "active", "archived"]);

export const credentialsJsonSchema = z.object({
  username: z.string().nullable().optional(),
  password: z.string().nullable().optional(),
}).nullable().optional();

/**
 * Normaliza una URL agregando https:// si no tiene protocolo
 */
function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  
  // Si ya tiene protocolo, retornar tal cual
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  
  // Agregar https:// al inicio
  return `https://${trimmed}`;
}

/**
 * Valida y normaliza URLs, aceptando URLs con o sin protocolo
 */
const urlSchema = z.string()
  .transform((val) => {
    if (!val || val.trim().length === 0) return val;
    return normalizeUrl(val);
  })
  .refine(
    (val) => {
      if (!val || val.trim().length === 0) return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    {
      message: "Debe ser una URL válida",
    }
  )
  .nullable()
  .optional();

// Schema base sin refine (para poder usar .partial())
const demoSchemaBase = z.object({
  productId: z.number().int().positive("El ID del producto debe ser un número positivo"),
  title: z.string()
    .min(1, "El título es requerido")
    .max(255, "El título no puede exceder 255 caracteres"),
  subtitle: z.string()
    .max(500, "El subtítulo no puede exceder 500 caracteres")
    .nullable()
    .optional(),
  url: urlSchema,
  htmlContent: z.string()
    .max(100000, "El contenido HTML no puede exceder 100KB")
    .nullable()
    .optional(),
  instructions: z.string().nullable().optional(),
  instructionsEs: z.string()
    .max(2000, "Las instrucciones en español no pueden exceder 2000 caracteres")
    .nullable()
    .optional(),
  instructionsEn: z.string()
    .max(2000, "Las instrucciones en inglés no pueden exceder 2000 caracteres")
    .nullable()
    .optional(),
  credentialsJson: credentialsJsonSchema,
  hasResponsive: z.boolean().default(false),
  requiresCredentials: z.boolean().default(false),
  status: demoStatusSchema.default("draft"),
});

// Schema de creación con validación refine (debe tener URL o HTML)
export const createDemoSchema = demoSchemaBase.refine(
  (data) => {
    // Debe tener URL o HTML, pero no ambos vacíos
    const hasUrl = data.url && data.url.trim().length > 0;
    const hasHtml = data.htmlContent && data.htmlContent.trim().length > 0;
    return hasUrl || hasHtml;
  },
  {
    message: "Debes proporcionar una URL o contenido HTML",
    path: ["url"],
  }
);

// Schema de actualización (todos los campos opcionales, sin refine)
export const updateDemoSchema = demoSchemaBase.partial().refine(
  (data) => {
    // Si se proporciona url o htmlContent, al menos uno debe tener valor
    // Pero si no se proporciona ninguno, está bien (no se está actualizando)
    if (data.url !== undefined || data.htmlContent !== undefined) {
      const hasUrl = data.url && data.url.trim().length > 0;
      const hasHtml = data.htmlContent && data.htmlContent.trim().length > 0;
      // Si ambos están definidos pero vacíos, es un error
      if (data.url !== undefined && data.htmlContent !== undefined) {
        return hasUrl || hasHtml;
      }
      // Si solo uno está definido, está bien
      return true;
    }
    // Si no se proporciona ninguno, está bien (no se actualiza)
    return true;
  },
  {
    message: "Si actualizas URL o HTML, al menos uno debe tener contenido",
    path: ["url"],
  }
);

export type CreateDemoInput = z.infer<typeof createDemoSchema>;
export type UpdateDemoInput = z.infer<typeof updateDemoSchema>;

