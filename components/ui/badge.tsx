"use client";

import { forwardRef, HTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const badgeVariants = {
  variant: {
    default: [
      "bg-gray-100 dark:bg-charcoal-800 text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-charcoal-700",
    ].join(" "),

    corporate: [
      "bg-blue-50 dark:bg-corporate-500/10 text-blue-600 dark:text-corporate-400 border border-blue-200 dark:border-corporate-500/30",
      "dark:shadow-glow-corporate/30",
    ].join(" "),

    success: [
      "bg-green-50 dark:bg-success/10 text-green-700 dark:text-success border border-green-200 dark:border-success/30",
    ].join(" "),

    warning: [
      "bg-amber-50 dark:bg-warning/10 text-amber-700 dark:text-warning border border-amber-200 dark:border-warning/30",
    ].join(" "),

    error: [
      "bg-red-50 dark:bg-error/10 text-red-700 dark:text-error border border-red-200 dark:border-error/30",
    ].join(" "),

    platinum: [
      "bg-gradient-platinum text-charcoal-950 font-semibold",
      "shadow-glow-platinum/20",
    ].join(" "),
  },

  size: {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  },
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants.variant;
  size?: keyof typeof badgeVariants.size;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = "default",
      size = "md",
      dot = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center gap-1.5 rounded-full font-medium",
          "transition-all duration-normal",
          // Variant and size
          badgeVariants.variant[variant],
          badgeVariants.size[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
