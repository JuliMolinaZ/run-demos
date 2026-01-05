/**
 * Utilidades de sanitización para prevenir XSS
 * 
 * NOTA: Para usar la sanitización completa, instala: npm install isomorphic-dompurify
 * Mientras tanto, se usa una sanitización básica de fallback
 */

// Intentar importar DOMPurify, pero no fallar si no está instalado
let DOMPurify: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const dompurifyModule = require("isomorphic-dompurify");
  DOMPurify = dompurifyModule.default || dompurifyModule;
} catch (error) {
  // La dependencia no está instalada - usar sanitización básica
  console.warn("⚠️ isomorphic-dompurify no está instalado. Usando sanitización básica.");
  console.warn("   Para mejor seguridad, ejecuta: npm install isomorphic-dompurify");
}

/**
 * Sanitización básica de fallback (sin DOMPurify)
 * Remueve scripts, iframes y atributos peligrosos
 */
function basicSanitize(html: string): string {
  if (!html || typeof html !== "string") {
    return "";
  }

  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*[^\s>]*/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:text\/html/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "");
}

/**
 * Sanitiza contenido HTML para prevenir XSS
 * 
 * @param html - Contenido HTML a sanitizar
 * @returns HTML sanitizado
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== "string") {
    return "";
  }

  // Si DOMPurify no está disponible, usar sanitización básica
  if (!DOMPurify) {
    return basicSanitize(html);
  }

  try {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "p", "br", "strong", "em", "u", "h1", "h2", "h3", "h4", "h5", "h6",
        "ul", "ol", "li", "a", "img", "blockquote", "code", "pre",
        "div", "span", "table", "thead", "tbody", "tr", "td", "th",
      ],
      ALLOWED_ATTR: [
        "href", "src", "alt", "title", "class", "id", "target", "rel",
        "width", "height",
      ],
      ALLOW_DATA_ATTR: false,
    });
  } catch (error) {
    // Si falla la sanitización con DOMPurify, usar fallback básico
    console.warn("Error en DOMPurify, usando sanitización básica:", error);
    return basicSanitize(html);
  }
}

/**
 * Valida formato de URL
 */
export function isValidURL(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    const urlObj = new URL(url);
    // Solo permitir http y https
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Sanitiza string simple (remueve caracteres peligrosos)
 */
export function sanitizeString(input: string, maxLength?: number): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  let sanitized = input.trim();
  
  // Remover caracteres de control
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "");
  
  // Limitar longitud si se especifica
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}
