import { Variants } from "framer-motion";

// Configuración de easing suave y profesional
export const easing = {
  smooth: [0.4, 0, 0.2, 1], // cubic-bezier estándar
  snappy: [0.6, 0.01, 0.05, 0.95], // Más rápido al inicio
  spring: { type: "spring", stiffness: 300, damping: 25 },
  bouncy: { type: "spring", stiffness: 400, damping: 10 },
};

// Duraciones optimizadas
export const duration = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
};

// Fade In - Muy suave, sin movimiento brusco
export const fadeIn: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: duration.normal,
      ease: easing.smooth,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: duration.fast,
      ease: easing.smooth,
    },
  },
};

// Fade Up - Movimiento vertical mínimo para evitar "saltos"
export const fadeUp: Variants = {
  initial: {
    opacity: 0,
    y: 8, // Reducido de 20 a 8 para movimiento más sutil
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.normal,
      ease: easing.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: duration.fast,
      ease: easing.smooth,
    },
  },
};

// Scale In - Zoom muy sutil
export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.98, // Reducido de 0.95 a 0.98 para efecto más sutil
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: duration.normal,
      ease: easing.smooth,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: duration.fast,
      ease: easing.smooth,
    },
  },
};

// Slide In Right - Para modales y sidebars
export const slideInRight: Variants = {
  initial: {
    opacity: 0,
    x: 20, // Reducido para movimiento más sutil
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: duration.normal,
      ease: easing.smooth,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: duration.fast,
      ease: easing.smooth,
    },
  },
};

// Stagger Container - Para listas con delay progresivo
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05, // Reducido de 0.1 para transición más rápida
      delayChildren: 0,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

// Stagger Item - Item hijo para stagger
export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.fast,
      ease: easing.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: duration.instant,
      ease: easing.smooth,
    },
  },
};

// Modal Overlay - Para fondos de modales
export const modalOverlay: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: duration.fast,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: duration.fast,
    },
  },
};

// Modal Content - Para contenido de modales
export const modalContent: Variants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    y: 10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: duration.normal,
      ease: easing.smooth,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 10,
    transition: {
      duration: duration.fast,
      ease: easing.smooth,
    },
  },
};

// Shimmer - Para loading states
export const shimmer = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 2,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

// Pulse - Para elementos que necesitan atención
export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      ease: easing.smooth,
      repeat: Infinity,
    },
  },
};

// Hover effects para botones y cards
export const hoverScale = {
  whileHover: {
    scale: 1.02,
    transition: {
      duration: duration.fast,
      ease: easing.snappy,
    },
  },
  whileTap: {
    scale: 0.98,
    transition: {
      duration: duration.instant,
    },
  },
};

export const hoverGlow = {
  whileHover: {
    boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
    transition: {
      duration: duration.normal,
    },
  },
};

// Para prevenir animaciones en la carga inicial (reducir "flasheo")
export const pageTransition = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: duration.normal,
      ease: easing.smooth,
      when: "beforeChildren",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: duration.fast,
      when: "afterChildren",
    },
  },
};
