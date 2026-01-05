"use client";

import { forwardRef, HTMLAttributes } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Trend {
  value: string;
  isPositive: boolean;
  label: string;
}

interface StatsCardProps extends Omit<HTMLAttributes<HTMLDivElement>,
  'className' | 'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragOver' | 'onDragEnter' | 'onDragLeave' | 'onDrop'
> {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: Trend;
  variant?: "default" | "corporate" | "platinum";
  className?: string;
}

const variantStyles = {
  default: {
    card: "glass-premium hover:glass-premium-strong",
    icon: "bg-gradient-charcoal border border-charcoal-700",
    iconColor: "text-corporate-400",
  },
  corporate: {
    card: "glass-premium hover:glass-premium-strong border-gradient-corporate",
    icon: "bg-gradient-corporate shadow-glow-corporate",
    iconColor: "text-white",
  },
  platinum: {
    card: "glass-premium hover:glass-premium-strong",
    icon: "bg-gradient-platinum",
    iconColor: "text-charcoal-950",
  },
};

export const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(
  (
    {
      label,
      value,
      icon: Icon,
      trend,
      variant = "default",
      className,
      ...props
    },
    ref
  ) => {
    const styles = variantStyles[variant];

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-6 transition-all duration-300 group",
          styles.card,
          className
        )}
        {...props}
      >
        {/* Icon with subtle hover effect */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
            styles.icon
          )}
        >
          <Icon className={cn("w-7 h-7", styles.iconColor)} />
        </motion.div>

        {/* Value - sin animación para evitar "saltos" */}
        <div className="text-3xl font-semibold mb-2 text-gray-900 dark:text-slate-50 tracking-tight">
          {value}
        </div>

        {/* Label */}
        <div className="text-xs font-medium text-gray-600 dark:text-slate-400 mb-3">
          {label}
        </div>

        {/* Trend Indicator - sin animación para evitar "saltos" */}
        {trend && (
          <div className="flex items-center gap-1.5">
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4 text-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-error" />
            )}
            <span
              className={cn(
                "text-sm font-semibold",
                trend.isPositive ? "text-success" : "text-error"
              )}
            >
              {trend.value}
            </span>
            <span className="text-xs text-gray-500 dark:text-slate-500">{trend.label}</span>
          </div>
        )}
      </div>
    );
  }
);

StatsCard.displayName = "StatsCard";
