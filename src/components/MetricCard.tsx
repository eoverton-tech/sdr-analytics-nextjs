"use client";

import { cn } from "@/lib/utils";
import { Progress } from "./ui/progress";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  target?: number;
  suffix?: string;
  icon?: LucideIcon;
  iconColor?: string;
  showProgress?: boolean;
  className?: string;
}

export function MetricCard({
  title,
  value,
  target,
  suffix,
  icon: Icon,
  iconColor = "text-blue-500",
  showProgress = true,
  className,
}: MetricCardProps) {
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
  const percentage = target ? (numericValue / target) * 100 : 0;

  return (
    <div className={cn("bg-[#1e293b] rounded-xl p-4 border border-[#334155]", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-sm">{title}</span>
        {Icon && <Icon className={cn("w-5 h-5", iconColor)} />}
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        {target && <span className="text-slate-500">/ {target}</span>}
        {suffix && <span className="text-slate-400 text-sm ml-1">{suffix}</span>}
      </div>
      {showProgress && target && (
        <>
          <Progress value={numericValue} max={target} className="mb-1" />
          <span className="text-xs text-slate-500">{Math.round(percentage)}% of target</span>
        </>
      )}
    </div>
  );
}
