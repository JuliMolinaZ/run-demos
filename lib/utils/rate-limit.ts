import { NextRequest, NextResponse } from "next/server";
import { logger } from "./logger";

/**
 * Rate Limiting simple basado en memoria
 * 
 * ESTRATEGIA:
 * - Almacena intentos en memoria (Map)
 * - Sliding window: cuenta intentos en ventana de tiempo
 * - Límites configurables por endpoint
 * 
 * NOTA: Para producción, considera usar:
 * - Upstash Redis (ratelimit)
 * - Vercel Edge Config
 * - Cloudflare Rate Limiting
 */

interface RateLimitConfig {
  maxRequests: number; // Máximo de requests
  windowMs: number; // Ventana de tiempo en milisegundos
  message?: string; // Mensaje personalizado
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

// Store en memoria (se reinicia al reiniciar el servidor)
const requestStore = new Map<string, RequestRecord>();

// Limpiar registros expirados cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestStore.entries()) {
    if (now > record.resetTime) {
      requestStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Genera una clave única para el rate limiting
 */
function getRateLimitKey(req: NextRequest, identifier?: string): string {
  // Intentar obtener IP del cliente
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip") || "unknown";
  
  // Usar identificador adicional si se proporciona (ej: userId)
  const baseKey = identifier ? `${ip}:${identifier}` : ip;
  
  // Incluir path para limitar por endpoint
  const path = new URL(req.url).pathname;
  
  return `${path}:${baseKey}`;
}

/**
 * Middleware de rate limiting
 * 
 * @param req Request de Next.js
 * @param config Configuración del rate limit
 * @param identifier Identificador adicional (ej: userId) para rate limiting por usuario
 * @returns NextResponse con error 429 si excede límite, null si está OK
 */
export function rateLimit(
  req: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): NextResponse | null {
  const key = getRateLimitKey(req, identifier);
  const now = Date.now();
  
  const record = requestStore.get(key);
  
  if (!record || now > record.resetTime) {
    // Primera request o ventana expirada, crear nuevo registro
    requestStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return null; // OK
  }
  
  // Incrementar contador
  record.count++;
  
  if (record.count > config.maxRequests) {
    // Excedió el límite
    logger.warn(`Rate limit excedido para ${key}`, {
      count: record.count,
      maxRequests: config.maxRequests,
    });
    
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    
    return NextResponse.json(
      {
        error: config.message || "Demasiadas solicitudes. Por favor, intenta más tarde.",
        retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(record.resetTime).toISOString(),
        },
      }
    );
  }
  
  // OK, actualizar registro
  requestStore.set(key, record);
  
  return null; // OK
}

/**
 * Configuraciones predefinidas de rate limiting
 */
export const RATE_LIMIT_CONFIGS = {
  // Login: 5 intentos por 15 minutos
  LOGIN: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    message: "Demasiados intentos de inicio de sesión. Por favor, espera 15 minutos.",
  } as RateLimitConfig,
  
  // Leads: 10 requests por minuto
  LEADS: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minuto
    message: "Demasiadas solicitudes. Por favor, espera un momento.",
  } as RateLimitConfig,
  
  // API general: 100 requests por minuto
  API_GENERAL: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minuto
    message: "Demasiadas solicitudes. Por favor, espera un momento.",
  } as RateLimitConfig,
  
  // Crear/editar demos: 20 requests por minuto
  DEMOS_WRITE: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minuto
    message: "Demasiadas solicitudes de escritura. Por favor, espera un momento.",
  } as RateLimitConfig,
};

