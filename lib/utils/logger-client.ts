/**
 * Logger para cliente (frontend)
 * Versión simplificada del logger que funciona en el navegador
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  [key: string]: any;
}

class ClientLogger {
  private isDevelopment = typeof window !== "undefined" 
    ? (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    : false;

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    // En producción, solo loguear errores
    if (!this.isDevelopment && level !== "error") {
      return false;
    }
    return true;
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog("info")) {
      console.info(this.formatMessage("info", message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    };

    if (this.shouldLog("error")) {
      console.error(this.formatMessage("error", message, errorContext));
    }

    // Aquí se puede integrar con Sentry u otro servicio de monitoreo
    // if (!this.isDevelopment && typeof window !== "undefined") {
    //   Sentry.captureException(error, { extra: errorContext });
    // }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog("debug")) {
      console.debug(this.formatMessage("debug", message, context));
    }
  }
}

export const logger = new ClientLogger();

