"use client";

import { cn } from "@/lib/utils";
import { getCoachingPriorities } from "@/lib/data";

export function CoachingPriorities() {
  const priorities = getCoachingPriorities();

  return (
    <div className="bg-[#1e293b] rounded-xl border border-[#334155] h-full">
      <div className="p-4 border-b border-[#334155]">
        <h2 className="text-lg font-semibold text-white">Coaching Priorities</h2>
        <p className="text-sm text-slate-400">Click a rep to see full analysis</p>
      </div>
      <div className="p-4 space-y-3">
        {priorities.map(({ rep, score, focus, priority }) => (
          <div
            key={rep.id}
            className="p-3 rounded-lg bg-[#0f172a] border border-[#334155] hover:border-[#475569] cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium">
                  {rep.initials}
                </div>
                <span className="text-white font-medium">{rep.name}</span>
              </div>
              <span className={cn(
                "px-2 py-1 rounded text-xs font-medium",
                priority === 'High' ? "bg-red-500/20 text-red-400" :
                priority === 'Medium' ? "bg-amber-500/20 text-amber-400" :
                "bg-green-500/20 text-green-400"
              )}>
                {priority}
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Focus: <span className="text-slate-300">{focus}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
