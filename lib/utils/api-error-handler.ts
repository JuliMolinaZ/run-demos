import { NextResponse } from "next/server";
import { logger } from "./logger";

/**
 * Manejo centralizado de errores para API routes
 * Previene exposición de información sensible al cliente
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isPublic: boolean = false
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Sanitiza mensajes de error para no exponer información sensible
 */
function sanitizeErrorMessage(error: unknown, isDevelopment: boolean): string {
  // Si es un error de API con mensaje público, usarlo
  if (error instanceof ApiError && error.isPublic) {
    return error.message;
  }

  // En desarrollo, mostrar más detalles
  if (isDevelopment) {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  // En producción, mensajes genéricos según el tipo de error
  if (error instanceof ApiError) {
    // Errores de validación pueden ser públicos
    if (error.statusCode >= 400 && error.statusCode < 500) {
      return error.message;
    }
  }

  // Errores de base de datos o internos: mensaje genérico
  return "Ha ocurrido un error. Por favor, intenta nuevamente más tarde.";
}

/**
 * Maneja errores en API routes de forma segura
 */
export function handleApiError(error: unknown, context?: string): NextResponse {
  const isDevelopment = process.env.NODE_ENV === "development";
  
  // Log del error completo (solo en servidor)
  logger.error(
    `API Error${context ? ` in ${context}` : ""}`,
    error,
    {
      timestamp: new Date().toISOString(),
    }
  );

  // Determinar código de estado
  let statusCode = 500;
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
  } else if (error instanceof Error) {
    // Errores comunes de base de datos
    if (error.message.includes("duplicate") || error.message.includes("unique")) {
      statusCode = 409; // Conflict
    } else if (error.message.includes("not found")) {
      statusCode = 404;
    } else if (error.message.includes("unauthorized") || error.message.includes("forbidden")) {
      statusCode = 403;
    }
  }

  // Mensaje sanitizado para el cliente
  const message = sanitizeErrorMessage(error, isDevelopment);

  return NextResponse.json(
    { error: message },
    { status: statusCode }
  );
}

/**
 * Wrapper para manejar errores en handlers de API
 */
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error, handler.name);
    }
  };
}

