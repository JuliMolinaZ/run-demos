"use client";

import { forwardRef, HTMLAttributes, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "./button";

interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>,
  'title' | 'className' | 'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragOver' | 'onDragEnter' | 'onDragLeave' | 'onDrop'
> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  footer?: React.ReactNode;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-7xl",
};

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      description,
      children,
      size = "md",
      footer,
      closeOnBackdrop = true,
      showCloseButton = true,
      className,
      ...props
    },
    ref
  ) => {
    // Lock scroll when modal is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
      return () => {
        document.body.style.overflow = "unset";
      };
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isOpen) {
          onClose();
        }
      };
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Sólido */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/80"
              onClick={closeOnBackdrop ? onClose : undefined}
            />

            {/* Modal Container Sólido - Centrado verticalmente */}
            <motion.div
              ref={ref}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "relative w-full bg-white dark:bg-charcoal-900 rounded-xl shadow-2xl",
                "border border-gray-300 dark:border-charcoal-700",
                "max-h-[90vh] flex flex-col",
                "min-h-0", // Importante para que flex funcione correctamente
                "overflow-hidden", // Evitar que el contenido se desborde
                sizeClasses[size],
                className
              )}
              style={{ margin: 'auto' }} // Forzar centrado
              onClick={(e) => e.stopPropagation()}
              {...props}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-start justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-charcoal-800">
                  <div className="flex-1 min-w-0 pr-2">
                    {title && (
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-500 mt-1">
                        {description}
                      </p>
                    )}
                  </div>
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="p-1.5 rounded text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-charcoal-800 transition-colors flex-shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Body - Scrollable */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 min-h-0">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-charcoal-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 bg-gray-50 dark:bg-charcoal-950/50">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }
);

Modal.displayName = "Modal";

// Helper components for common modal patterns
export const ModalFooter = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const ModalActions = ({
  onCancel,
  onConfirm,
  cancelLabel = "Cancelar",
  confirmLabel = "Confirmar",
  confirmVariant = "primary",
  loading = false,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  cancelLabel?: string;
  confirmLabel?: string;
  confirmVariant?: "primary" | "secondary" | "ghost" | "outline" | "platinum" | "danger";
  loading?: boolean;
}) => {
  return (
    <>
      <Button variant="ghost" onClick={onCancel} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button
        variant={confirmVariant}
        onClick={onConfirm}
        loading={loading}
      >
        {confirmLabel}
      </Button>
    </>
  );
};
