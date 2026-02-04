"use client";

import { Sun, Settings, RefreshCw, BarChart3, Users, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/coaching", label: "Coaching", icon: Users },
  { href: "/trends", label: "Trends", icon: TrendingUp },
  { href: "/one-on-ones", label: "1:1 Prep", icon: Calendar },
];

export function Header() {
  const pathname = usePathname();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="border-b border-[#334155] bg-[#0f172a]">
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">SDR Analytics Dashboard</h1>
            <p className="text-slate-400 text-sm">Data for: {today}</p>
          </div>
          <nav className="flex items-center gap-1">
            <button className="p-2 rounded-lg hover:bg-[#1e293b] text-slate-400 hover:text-white transition-colors">
              <Sun className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-[#1e293b] text-slate-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                  pathname === item.href
                    ? "bg-[#1e293b] text-white"
                    : "text-slate-400 hover:bg-[#1e293b] hover:text-white"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            <button className="ml-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium flex items-center gap-2 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
