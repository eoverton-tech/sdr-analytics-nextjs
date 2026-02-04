"use client";

import { cn } from "@/lib/utils";
import { reps, getDailyActivity } from "@/lib/data";

export function TeamActivity() {
  const activities = getDailyActivity();
  const activeCount = activities.filter(a => a.status === 'active').length;

  return (
    <div className="bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden">
      <div className="p-4 border-b border-[#334155] flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Team Activity</h2>
        <span className="text-slate-400 text-sm">{activeCount} of {reps.length} reps active today</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#334155]">
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Rep</th>
              <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Calls</th>
              <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Emails</th>
              <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Connects</th>
              <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Talk %</th>
              <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Opps</th>
              <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => {
              const rep = reps.find(r => r.id === activity.rep_id)!;
              return (
                <tr key={activity.rep_id} className="border-b border-[#334155] hover:bg-[#334155]/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                        activity.status === 'active' ? 'bg-blue-600' : 'bg-slate-600'
                      )}>
                        {rep.initials}
                      </div>
                      <span className="text-white font-medium">{rep.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "font-medium",
                      activity.calls >= activity.calls_target ? "text-green-400" : "text-white"
                    )}>
                      {activity.calls}
                    </span>
                    <span className="text-slate-500">/{activity.calls_target}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "font-medium",
                      activity.emails >= activity.emails_target ? "text-green-400" : "text-white"
                    )}>
                      {activity.emails}
                    </span>
                    <span className="text-slate-500">/{activity.emails_target}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-white">{activity.connects}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "font-medium",
                      activity.talk_percentage >= 50 ? "text-green-400" : activity.talk_percentage >= 40 ? "text-amber-400" : "text-red-400"
                    )}>
                      {activity.talk_percentage}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-white">{activity.opps}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      activity.status === 'active' ? "bg-green-500/20 text-green-400" :
                      activity.status === 'away' ? "bg-amber-500/20 text-amber-400" :
                      "bg-slate-500/20 text-slate-400"
                    )}>
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
