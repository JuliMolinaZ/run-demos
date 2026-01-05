"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const mexicoRef = useRef<HTMLDivElement>(null);
  const usaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLButtonElement>(null);
  const [positions, setPositions] = useState({ mexico: 0, usa: 0, width: 18 });

  useEffect(() => {
    const updatePositions = () => {
      if (mexicoRef.current && usaRef.current && containerRef.current) {
        // Esperar a que el DOM se actualice completamente
        const timeoutId = setTimeout(() => {
          if (mexicoRef.current && usaRef.current && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const mexicoRect = mexicoRef.current.getBoundingClientRect();
            const usaRect = usaRef.current.getBoundingClientRect();
            
            // Calcular el centro exacto de cada bandera relativo al contenedor
            // Usar getBoundingClientRect para obtener posiciones precisas
            const mexicoLeft = mexicoRect.left - containerRect.left;
            const mexicoRight = mexicoRect.right - containerRect.left;
            const mexicoCenter = mexicoLeft + (mexicoRect.width / 2);
            
            const usaLeft = usaRect.left - containerRect.left;
            const usaRight = usaRect.right - containerRect.left;
            const usaCenter = usaLeft + (usaRect.width / 2);
            
            // Ancho de la línea - usar el ancho de la bandera o un mínimo
            const lineWidth = Math.max(20, Math.min(mexicoRect.width, usaRect.width) * 0.8);
            
            setPositions({
              mexico: mexicoCenter - (lineWidth / 2), // Centrar perfectamente debajo de la bandera
              usa: usaCenter - (lineWidth / 2),
              width: lineWidth,
            });
          }
        }, 450); // Esperar a que termine la animación de escala (300ms) + margen adicional
        
        return () => clearTimeout(timeoutId);
      }
    };

    // Calcular posiciones iniciales
    updatePositions();
    
    // Recalcular cuando cambia el idioma (con más tiempo para asegurar que las animaciones terminaron)
    const languageTimeout = setTimeout(updatePositions, 500);
    
    window.addEventListener("resize", updatePositions);
    return () => {
      window.removeEventListener("resize", updatePositions);
      clearTimeout(languageTimeout);
    };
  }, [language]);

  return (
    <button
      ref={containerRef}
      onClick={() => setLanguage(language === "es" ? "en" : "es")}
      className="relative flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-charcoal-800/50 transition-colors group"
      title={language === "es" ? "Switch to English" : "Cambiar a Español"}
    >
      <div className="flex items-center gap-2">
        {/* Bandera México */}
        <div
          ref={mexicoRef}
          className={`transition-all duration-300 ${
            language === "es" ? "opacity-100 scale-100" : "opacity-40 scale-90 grayscale"
          }`}
        >
          <span className="text-lg inline-block">🇲🇽</span>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-slate-600" />

        {/* Bandera USA */}
        <div
          ref={usaRef}
          className={`transition-all duration-300 ${
            language === "en" ? "opacity-100 scale-100" : "opacity-40 scale-90 grayscale"
          }`}
        >
          <span className="text-lg inline-block">🇺🇸</span>
        </div>
      </div>

      {/* Indicator animado - centrado exactamente bajo cada bandera */}
      {positions.mexico > 0 && positions.usa > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-corporate-500 rounded-full"
          style={{
            transformOrigin: 'center',
          }}
          animate={{
            x: language === "es" ? positions.mexico : positions.usa,
            width: positions.width,
          }}
          transition={{ 
            type: "spring", 
            stiffness: 600, 
            damping: 40,
            mass: 0.3
          }}
        />
      )}
    </button>
  );
}
