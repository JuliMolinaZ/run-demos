"use client";

import { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Modal } from "./modal";
import { Button } from "./button";
import { cn } from "@/lib/utils/cn";

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
}

/**
 * Componente AlertDialog para reemplazar confirm() nativo
 * Mejora accesibilidad y UX, especialmente en móvil
 * 
 * Resuelve: "UX - Confirmación de Eliminación Básica" del reporte de auditoría
 */
export const AlertDialog = forwardRef<HTMLDivElement, AlertDialogProps>(
  (
    {
      isOpen,
      onClose,
      onConfirm,
      title,
      description,
      confirmLabel = "Confirmar",
      cancelLabel = "Cancelar",
      variant = "default",
      loading = false,
    },
    ref
  ) => {
    const handleConfirm = () => {
      if (!loading) {
        onConfirm();
      }
    };

    return (
      <Modal
        ref={ref}
        isOpen={isOpen}
        onClose={onClose}
        size="sm"
        closeOnBackdrop={!loading}
        showCloseButton={!loading}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                variant === "destructive"
                  ? "bg-error/10 text-error"
                  : "bg-warning/10 text-warning"
              )}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-charcoal-800">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              aria-label={cancelLabel}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={variant === "destructive" ? "danger" : "primary"}
              onClick={handleConfirm}
              loading={loading}
              aria-label={confirmLabel}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
);

AlertDialog.displayName = "AlertDialog";

