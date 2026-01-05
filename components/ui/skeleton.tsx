import { cn } from "@/lib/utils/cn";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  className?: string;
}

/**
 * Componente Skeleton para estados de carga
 * Mejora el LCP (Largest Contentful Paint) mostrando estructura mientras carga
 */
export function Skeleton({
  variant = "rectangular",
  width,
  height,
  className,
  ...props
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200 dark:bg-charcoal-800 rounded";

  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
      {...props}
    />
  );
}

/**
 * Skeleton para cards de demo
 */
export function DemoCardSkeleton() {
  return (
    <div className="bg-white dark:bg-charcoal-900 rounded-xl border border-gray-200 dark:border-charcoal-800 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="text" width={100} height={20} />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" width="80%" height={24} />
        <Skeleton variant="text" width="60%" height={16} />
      </div>
      <Skeleton variant="rectangular" width={80} height={24} />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width="100%" height={36} />
        <Skeleton variant="rectangular" width={36} height={36} />
      </div>
    </div>
  );
}

/**
 * Skeleton para lista de demos
 */
export function DemosListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <DemoCardSkeleton key={i} />
      ))}
    </div>
  );
}

