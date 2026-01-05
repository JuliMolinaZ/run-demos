"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "./button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  variant?: "default" | "minimal";
  className?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  variant = "default",
  className,
}: EmptyStateProps) => {
  if (variant === "minimal") {
    return (
      <div className={cn("text-center py-12", className)}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-charcoal-800/50 flex items-center justify-center">
            <Icon className="w-8 h-8 text-slate-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-300 mb-1">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-500">{description}</p>
          </div>
          {action && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                variant="secondary"
                size="sm"
                onClick={action.onClick}
                leftIcon={action.icon}
              >
                {action.label}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn("glass-premium rounded-lg p-12 text-center", className)}>
      <div className="flex flex-col items-center gap-4">
        {/* Icon simple */}
        <div className="w-16 h-16 rounded-lg bg-charcoal-800 border border-charcoal-700 flex items-center justify-center">
          <Icon className="w-8 h-8 text-slate-600" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-300">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-slate-500 max-w-md">{description}</p>
        </div>

        {/* Action */}
        {action && (
          <div className="mt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={action.onClick}
              leftIcon={action.icon}
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

EmptyState.displayName = "EmptyState";
