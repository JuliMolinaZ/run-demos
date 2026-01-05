"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// Variantes de botón premium
const buttonVariants = {
  // Variantes de estilo
  variant: {
    primary: [
      "bg-gradient-corporate text-white",
      "hover:shadow-glow-corporate hover:scale-[1.02]",
      "active:scale-[0.98]",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
    ].join(" "),

    secondary: [
      "glass-premium text-gray-900 dark:text-slate-50 border border-gray-300 dark:border-corporate-500/30",
      "hover:glass-premium-strong hover:shadow-lg hover:border-corporate-500",
      "active:scale-[0.98]",
    ].join(" "),

    ghost: [
      "text-gray-700 dark:text-slate-300 bg-transparent",
      "hover:bg-gray-100 dark:hover:bg-charcoal-800 hover:text-gray-900 dark:hover:text-slate-50",
      "active:bg-gray-200 dark:active:bg-charcoal-700",
    ].join(" "),

    outline: [
      "border-2 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200 bg-transparent",
      "hover:border-corporate-500 hover:text-corporate-500 dark:hover:text-corporate-400 hover:bg-gray-50 dark:hover:bg-charcoal-900",
      "active:border-corporate-600",
    ].join(" "),

    platinum: [
      "bg-gradient-platinum text-charcoal-950 font-bold",
      "hover:shadow-glow-platinum hover:scale-[1.02]",
      "active:scale-[0.98]",
    ].join(" "),

    danger: [
      "bg-error text-white",
      "hover:opacity-90 hover:shadow-lg",
      "active:scale-[0.98]",
    ].join(" "),
  },

  // Tamaños
  size: {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-xl",
    lg: "px-8 py-4 text-lg rounded-2xl",
    xl: "px-10 py-5 text-xl rounded-2xl",
  },
};

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragOver' | 'onDragEnter' | 'onDragLeave' | 'onDrop'
> {
  variant?: keyof typeof buttonVariants.variant;
  size?: keyof typeof buttonVariants.size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center gap-2",
          "font-semibold tracking-wide",
          "transition-all duration-300 ease-out",
          "focus:outline-none focus:ring-2 focus:ring-corporate-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-charcoal-950",
          "shine-effect",
          // Variant styles
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          // Custom className
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
