"use client";

import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
}

export function Progress({ value, max = 100, className, indicatorClassName }: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("h-2 w-full bg-slate-700 rounded-full overflow-hidden", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300",
          percentage >= 100 ? "bg-green-500" : percentage >= 60 ? "bg-amber-500" : "bg-blue-500",
          indicatorClassName
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
