import { useState, useEffect, useCallback } from "react";

/**
 * Hook para detectar cambios no guardados (dirty state)
 * Útil para prevenir pérdida de datos al cerrar modales o navegar
 * 
 * @param initialData Datos iniciales del formulario
 * @param currentData Datos actuales del formulario
 * @returns Objeto con isDirty (boolean) y resetDirty (función)
 */
export function useDirtyState<T extends Record<string, any>>(
  initialData: T,
  currentData: T
) {
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Comparar datos iniciales con actuales
    const hasChanges = JSON.stringify(initialData) !== JSON.stringify(currentData);
    setIsDirty(hasChanges);
  }, [initialData, currentData]);

  const resetDirty = useCallback(() => {
    setIsDirty(false);
  }, []);

  return { isDirty, resetDirty };
}

