import React from "react";
import { motion } from "framer-motion";

/**
 * Loading Component - Corporate Premium
 * Spinners y skeletons para estados de carga
 */

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} rounded-full border-charcoal-700 border-t-corporate-500`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

interface LoadingSkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

export function LoadingSkeleton({
  width = "100%",
  height = "1rem",
  className = "",
  variant = "rectangular",
}: LoadingSkeletonProps) {
  const variantClasses = {
    text: "rounded-md",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  return (
    <div
      className={`${variantClasses[variant]} bg-charcoal-800 overflow-hidden ${className}`}
      style={{
        width,
        height: variant === "circular" ? width : height,
      }}
    >
      <motion.div
        className="h-full w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(71, 85, 105, 0.1) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
        }}
        animate={{
          backgroundPosition: ["-200% 0", "200% 0"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

interface LoadingDotsProps {
  className?: string;
}

export function LoadingDots({ className = "" }: LoadingDotsProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 rounded-full bg-corporate-500"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2,
          }}
        />
      ))}
    </div>
  );
}

interface LoadingCardSkeletonProps {
  count?: number;
  className?: string;
}

export function LoadingCardSkeleton({ count = 3, className = "" }: LoadingCardSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="glass-premium rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <LoadingSkeleton variant="circular" width="3rem" height="3rem" />
            <div className="flex-1 space-y-3">
              <LoadingSkeleton width="60%" height="1.25rem" />
              <LoadingSkeleton width="100%" height="0.875rem" />
              <LoadingSkeleton width="40%" height="0.875rem" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface LoadingTableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function LoadingTableSkeleton({
  rows = 5,
  columns = 4,
  className = "",
}: LoadingTableSkeletonProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="grid gap-4 pb-4 border-b border-charcoal-700" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <LoadingSkeleton key={i} height="1rem" width="80%" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4 py-3"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <LoadingSkeleton key={colIndex} height="0.875rem" width="70%" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Full Page Loading - Para transiciones de página
 */
export function LoadingPage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-charcoal-950 z-modal">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-slate-400">Cargando...</p>
      </div>
    </div>
  );
}

/**
 * Inline Loading - Para botones y elementos inline
 */
interface InlineLoadingProps {
  text?: string;
  className?: string;
}

export function InlineLoading({ text = "Cargando", className = "" }: InlineLoadingProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LoadingSpinner size="sm" />
      <span className="text-sm text-slate-400">{text}</span>
    </div>
  );
}
