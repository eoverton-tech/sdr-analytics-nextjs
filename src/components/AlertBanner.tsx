"use client";

import { Bell, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface AlertBannerProps {
  message: string;
  type: 'warning' | 'info';
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function AlertBanner({ message, type, actionText, actionHref, onAction }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className={`
      flex items-center justify-between px-4 py-3 rounded-lg mb-3
      ${type === 'warning' ? 'bg-red-500/10 border border-red-500/20' : 'bg-blue-500/10 border border-blue-500/20'}
    `}>
      <div className="flex items-center gap-3">
        <Bell className={`w-5 h-5 ${type === 'warning' ? 'text-red-400' : 'text-blue-400'}`} />
        <span className="text-white">{message}</span>
      </div>
      <div className="flex items-center gap-3">
        {actionText && actionHref ? (
          <Link
            href={actionHref}
            className={`text-sm font-medium ${type === 'warning' ? 'text-red-400 hover:text-red-300' : 'text-blue-400 hover:text-blue-300'}`}
          >
            {actionText}
          </Link>
        ) : actionText && onAction ? (
          <button
            onClick={onAction}
            className={`text-sm font-medium ${type === 'warning' ? 'text-red-400 hover:text-red-300' : 'text-blue-400 hover:text-blue-300'}`}
          >
            {actionText}
          </button>
        ) : null}
        <button onClick={() => setDismissed(true)} className="text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
