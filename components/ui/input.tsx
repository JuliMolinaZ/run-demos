"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      leftIcon,
      rightIcon,
      helperText,
      size = "md",
      fullWidth = false,
      className,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "py-2 px-3 text-sm",
      md: "py-3 px-4 text-base",
      lg: "py-4 px-5 text-lg",
    };

    const hasError = !!error;
    const hasSuccess = !!success;

    return (
      <div className={cn("flex flex-col gap-2", fullWidth && "w-full")}>
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-500">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            {...(props["aria-required"] !== undefined && { "aria-required": props["aria-required"] })}
            {...(props["aria-invalid"] !== undefined && { "aria-invalid": props["aria-invalid"] })}
            {...(props["aria-describedby"] && { "aria-describedby": props["aria-describedby"] })}
            className={cn(
              // Base styles
              "glass-light rounded-xl transition-all duration-normal border",
              "text-gray-900 dark:text-slate-50 placeholder:text-gray-400 dark:placeholder:text-slate-500",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-charcoal-950",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              // Size
              sizeClasses[size],
              // Icon padding
              leftIcon && "pl-10",
              (rightIcon || hasError || hasSuccess) && "pr-10",
              // States
              hasError && [
                "border-error focus:ring-error",
                "focus:border-error",
              ],
              hasSuccess && [
                "border-success focus:ring-success",
                "focus:border-success",
              ],
              !hasError && !hasSuccess && [
                "border-gray-300 dark:border-charcoal-700 focus:border-corporate-500",
                "focus:ring-corporate-500/30",
              ],
              // Full width
              fullWidth && "w-full",
              className
            )}
            {...props}
          />

          {/* Right icon or status icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {hasError && <AlertCircle className="w-5 h-5 text-error" />}
            {hasSuccess && !hasError && <CheckCircle2 className="w-5 h-5 text-success" />}
            {!hasError && !hasSuccess && rightIcon}
          </div>
        </div>

        {/* Helper/Error/Success text */}
        {(error || success || helperText) && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "text-xs",
              hasError && "text-red-700 dark:text-error",
              hasSuccess && "text-green-700 dark:text-success",
              !hasError && !hasSuccess && "text-gray-600 dark:text-slate-400"
            )}
          >
            {error || success || helperText}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
