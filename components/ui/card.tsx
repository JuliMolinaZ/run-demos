"use client";

import { forwardRef, HTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const cardVariants = {
  variant: {
    default: [
      "bg-white dark:bg-charcoal-900 border border-gray-200 dark:border-charcoal-700",
      "hover:border-gray-300 dark:hover:border-charcoal-600 hover:shadow-md",
    ].join(" "),

    elevated: [
      "bg-white dark:bg-gradient-charcoal border border-gray-200 dark:border-charcoal-700",
      "shadow-xl",
      "hover:shadow-2xl hover:border-gray-300 dark:hover:border-slate-700",
    ].join(" "),

    glassPremium: [
      "glass-premium",
      "hover:glass-premium-strong",
    ].join(" "),

    bordered: [
      "bg-white dark:bg-charcoal-900 border-gradient-corporate",
      "hover:shadow-glow-corporate",
    ].join(" "),

    interactive: [
      "glass-premium cursor-pointer",
      "hover:glass-premium-strong hover:scale-[1.01] hover:shadow-xl",
      "active:scale-[0.99]",
      "transition-all duration-normal",
    ].join(" "),
  },

  padding: {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    xl: "p-10",
  },
};

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>,
  'className' | 'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragOver' | 'onDragEnter' | 'onDragLeave' | 'onDrop'
> {
  variant?: keyof typeof cardVariants.variant;
  padding?: keyof typeof cardVariants.padding;
  className?: string;
  animate?: boolean;
  children: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "md",
      className,
      animate = false, // Cambiado a false por defecto para evitar animaciones innecesarias
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = cn(
      "rounded-2xl transition-all duration-300",
      cardVariants.variant[variant],
      cardVariants.padding[padding],
      className
    );

    // Animaciones deshabilitadas por defecto para mejor performance
    // y evitar "flasheo" al recargar
    if (animate) {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className={baseClasses}
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={baseClasses} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Sub-componentes para estructura semántica
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("mb-6", className)} {...props}>
      {children}
    </div>
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-bold text-gray-900 dark:text-slate-50 tracking-tight mb-2",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-gray-600 dark:text-slate-400 leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mt-6 pt-6 border-t border-gray-200 dark:border-charcoal-700", className)}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = "CardFooter";
