"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "@/components/providers/theme-provider";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [localTheme, setLocalTheme] = useState<"light" | "dark">("dark");
  
  // Intentar obtener el contexto del provider
  const themeContext = useContext(ThemeContext);
  
  // Si hay provider, usarlo; si no, usar estado local
  const theme = themeContext?.theme || localTheme;
  
  useEffect(() => {
    if (!themeContext) {
      // No hay provider, cargar desde localStorage
      if (typeof window !== "undefined") {
        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
        const initialTheme = savedTheme || systemTheme;
        setLocalTheme(initialTheme);
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(initialTheme);
      }
    }
    setMounted(true);
  }, [themeContext]);

  const toggleTheme = () => {
    if (themeContext) {
      themeContext.toggleTheme();
    } else {
      // Toggle manual si no hay provider
      setLocalTheme((prev) => {
        const newTheme = prev === "dark" ? "light" : "dark";
        if (typeof window !== "undefined") {
          localStorage.setItem("theme", newTheme);
          document.documentElement.classList.remove("light", "dark");
          document.documentElement.classList.add(newTheme);
        }
        return newTheme;
      });
    }
  };
  
  if (!mounted) {
    return null;
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="relative p-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 hover:bg-charcoal-700 transition-all group"
      title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      aria-label="Toggle theme"
    >
      {/* Iconos con transición */}
      <div className="relative w-5 h-5">
        <motion.div
          initial={false}
          animate={{
            scale: theme === "dark" ? 1 : 0,
            opacity: theme === "dark" ? 1 : 0,
            rotate: theme === "dark" ? 0 : 180,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Moon className="w-5 h-5 text-corporate-400" />
        </motion.div>

        <motion.div
          initial={false}
          animate={{
            scale: theme === "light" ? 1 : 0,
            opacity: theme === "light" ? 1 : 0,
            rotate: theme === "light" ? 0 : -180,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sun className="w-5 h-5 text-amber-500" />
        </motion.div>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl bg-corporate-500/0 group-hover:bg-corporate-500/5 transition-colors" />
    </motion.button>
  );
}
