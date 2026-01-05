"use client";

import { forwardRef, HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

// Table Root
interface TableProps extends HTMLAttributes<HTMLTableElement> {
  className?: string;
  children: React.ReactNode;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="w-full overflow-x-auto">
        <table
          ref={ref}
          className={cn(
            "w-full border-collapse",
            className
          )}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);
Table.displayName = "Table";

// Table Header
interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
  children: React.ReactNode;
}

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={cn(
          "border-b border-charcoal-700",
          className
        )}
        {...props}
      >
        {children}
      </thead>
    );
  }
);
TableHeader.displayName = "TableHeader";

// Table Body
interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
  children: React.ReactNode;
}

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={cn("divide-y divide-charcoal-800/50", className)}
        {...props}
      >
        {children}
      </tbody>
    );
  }
);
TableBody.displayName = "TableBody";

// Table Row
interface TableRowProps extends Omit<HTMLAttributes<HTMLTableRowElement>,
  'className' | 'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragOver' | 'onDragEnter' | 'onDragLeave' | 'onDrop'
> {
  className?: string;
  children: React.ReactNode;
  clickable?: boolean;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, children, clickable = false, ...props }, ref) => {
    return (
      <motion.tr
        ref={ref}
        whileHover={clickable ? { backgroundColor: "rgba(28, 31, 38, 0.5)" } : undefined}
        className={cn(
          "transition-colors duration-normal",
          clickable && "cursor-pointer hover:bg-charcoal-900/50",
          className
        )}
        {...props}
      >
        {children}
      </motion.tr>
    );
  }
);
TableRow.displayName = "TableRow";

// Table Head Cell
interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  className?: string;
  children: React.ReactNode;
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={cn(
          "px-6 py-4 text-left",
          "text-xs font-semibold tracking-wider uppercase",
          "text-slate-400",
          className
        )}
        {...props}
      >
        {children}
      </th>
    );
  }
);
TableHead.displayName = "TableHead";

// Table Cell
interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  className?: string;
  children: React.ReactNode;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn(
          "px-6 py-4",
          "text-sm text-slate-300",
          className
        )}
        {...props}
      >
        {children}
      </td>
    );
  }
);
TableCell.displayName = "TableCell";

// Table Container (with glass effect)
interface TableContainerProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const TableContainer = forwardRef<HTMLDivElement, TableContainerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass-premium rounded-2xl overflow-hidden border border-charcoal-700",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TableContainer.displayName = "TableContainer";

// Table Empty State
interface TableEmptyProps {
  message?: string;
  icon?: React.ReactNode;
}

export const TableEmpty = ({ message = "No hay datos disponibles", icon }: TableEmptyProps) => {
  return (
    <TableRow>
      <TableCell colSpan={100} className="py-12 text-center">
        <div className="flex flex-col items-center gap-3">
          {icon && <div className="text-slate-600 opacity-50">{icon}</div>}
          <p className="text-slate-500 text-sm font-medium">{message}</p>
        </div>
      </TableCell>
    </TableRow>
  );
};
TableEmpty.displayName = "TableEmpty";
