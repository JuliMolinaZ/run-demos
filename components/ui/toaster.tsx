"use client";

/**
 * Wrapper para Sonner Toaster
 * Proporciona notificaciones toast accesibles y modernas
 * 
 * Resuelve: "UX - Sin Mensaje de Éxito" y "UX - Feedback de Errores Genérico"
 */
export function Toaster() {
  // Importación condicional para evitar errores si sonner no está instalado
  let SonnerToaster: any;
  try {
    // eslint-disable-next-line
    SonnerToaster = require("sonner").Toaster;
  } catch (e) {
    // Fallback: retornar null si sonner no está instalado
    // El usuario debe ejecutar: npm install sonner
    return null;
  }

  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "bg-white dark:bg-charcoal-900 border border-gray-200 dark:border-charcoal-700",
          title: "text-gray-900 dark:text-slate-100",
          description: "text-gray-600 dark:text-slate-400",
          success: "border-success/20",
          error: "border-error/20",
          warning: "border-warning/20",
          info: "border-corporate-500/20",
        },
      }}
    />
  );
}

