"use client";

import { motion, AnimatePresence } from "framer-motion";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";

/**
 * Banner que muestra cuando el usuario está offline
 * Deshabilita acciones y notifica al usuario
 * 
 * Resuelve: "Resiliencia - Sin Manejo de Offline" del reporte de auditoría
 */
export function OfflineBanner() {
  const { isOffline } = useOnlineStatus();

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-warning/90 dark:bg-warning/80 backdrop-blur-sm border-b border-warning/20"
        >
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-warning-foreground flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-warning-foreground">
                Sin conexión a internet
              </p>
              <p className="text-xs text-warning-foreground/80">
                Algunas funciones pueden no estar disponibles
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

