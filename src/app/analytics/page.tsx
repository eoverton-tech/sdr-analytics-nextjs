"use client";

import { getFunnelData, getTrendData, reps, getDailyActivity, getCoachingScores } from "@/lib/data";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const funnel = getFunnelData();
  const trends = getTrendData();
  const activities = getDailyActivity();
  const coachingScores = getCoachingScores();

  const funnelStages = [
    { name: "Contacts Reached", value: funnel.contacts_reached, color: "#3b82f6" },
    { name: "Conversations", value: funnel.conversations, color: "#6366f1" },
    { name: "Meetings Booked", value: funnel.meetings_booked, color: "#8b5cf6" },
    { name: "Opportunities", value: funnel.opportunities, color: "#a855f7" },
  ];

  // SDR Performance Data
  const sdrPerformanceData = activities.map(activity => {
    const rep = reps.find(r => r.id === activity.rep_id)!;
    const score = coachingScores.find(s => s.rep_id === activity.rep_id)!;
    return {
      name: rep.name.split(' ')[0],
      fullName: rep.name,
      calls: activity.calls,
      emails: activity.emails,
      connects: activity.connects,
      pipeline: Math.round(activity.pipeline_value / 1000),
      opps: activity.opps,
      talkPercent: activity.talk_percentage,
      coachingScore: score.overall_score,
    };
  });

  // SDR Activity Comparison (stacked bar chart data)
  const sdrActivityComparison = sdrPerformanceData.map(sdr => ({
    name: sdr.name,
    Calls: sdr.calls,
    Emails: sdr.emails,
  }));

  // SDR Outcomes Comparison
  const sdrOutcomesData = sdrPerformanceData.map(sdr => ({
    name: sdr.name,
    Connects: sdr.connects,
    Opps: sdr.opps,
    'Pipeline ($K)': sdr.pipeline,
  }));

  // Team averages for comparison
  const teamAvg = {
    calls: Math.round(activities.reduce((sum, a) => sum + a.calls, 0) / activities.length),
    emails: Math.round(activities.reduce((sum, a) => sum + a.emails, 0) / activities.length),
    connects: Math.round(activities.reduce((sum, a) => sum + a.connects, 0) / activities.length),
    talkPercent: Math.round(activities.reduce((sum, a) => sum + a.talk_percentage, 0) / activities.length),
    coachingScore: Math.round(coachingScores.reduce((sum, s) => sum + s.overall_score, 0) / coachingScores.length),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>

      {/* Funnel Section */}
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Conversion Funnel</h2>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {funnelStages.map((stage, index) => (
            <div key={stage.name} className="text-center">
              <div
                className="mx-auto mb-2 rounded-lg p-4"
                style={{
                  backgroundColor: `${stage.color}20`,
                  width: `${100 - index * 15}%`,
                }}
              >
                <div className="text-3xl font-bold text-white">{stage.value.toLocaleString()}</div>
              </div>
              <div className="text-sm text-slate-400">{stage.name}</div>
              {index > 0 && (
                <div className="text-xs text-green-400 mt-1">
                  {((stage.value / funnelStages[index - 1].value) * 100).toFixed(1)}% conversion
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-[#334155]">
          <div>
            <span className="text-slate-400">Total Pipeline Value</span>
            <div className="text-3xl font-bold text-green-400">${funnel.pipeline_value.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-slate-400">Avg Deal Size</span>
            <div className="text-3xl font-bold text-white">${Math.round(funnel.pipeline_value / funnel.opportunities).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* SDR Performance Comparison */}
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">SDR Performance Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Rep</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Calls</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Emails</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Connects</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Talk %</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Opps</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Pipeline</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Coaching Score</th>
              </tr>
            </thead>
            <tbody>
              {sdrPerformanceData.map((sdr, index) => (
                <tr key={index} className="border-b border-[#334155] hover:bg-[#334155]/30 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{sdr.fullName}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "px-2 py-1 rounded text-sm font-medium",
                      sdr.calls >= teamAvg.calls ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    )}>
                      {sdr.calls}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "px-2 py-1 rounded text-sm font-medium",
                      sdr.emails >= teamAvg.emails ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    )}>
                      {sdr.emails}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "px-2 py-1 rounded text-sm font-medium",
                      sdr.connects >= teamAvg.connects ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"
                    )}>
                      {sdr.connects}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "px-2 py-1 rounded text-sm font-medium",
                      sdr.talkPercent >= 50 ? "bg-green-500/20 text-green-400" :
                      sdr.talkPercent >= 40 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                    )}>
                      {sdr.talkPercent}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-white font-medium">{sdr.opps}</td>
                  <td className="px-4 py-3 text-center text-green-400 font-medium">${sdr.pipeline}k</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "px-2 py-1 rounded text-sm font-medium",
                      sdr.coachingScore >= 75 ? "bg-green-500/20 text-green-400" :
                      sdr.coachingScore >= 60 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                    )}>
                      {sdr.coachingScore}
                    </span>
                  </td>
                </tr>
              ))}
              {/* Team Average Row */}
              <tr className="bg-[#0f172a]">
                <td className="px-4 py-3 text-slate-400 font-medium">Team Average</td>
                <td className="px-4 py-3 text-center text-slate-400">{teamAvg.calls}</td>
                <td className="px-4 py-3 text-center text-slate-400">{teamAvg.emails}</td>
                <td className="px-4 py-3 text-center text-slate-400">{teamAvg.connects}</td>
                <td className="px-4 py-3 text-center text-slate-400">{teamAvg.talkPercent}%</td>
                <td className="px-4 py-3 text-center text-slate-400">-</td>
                <td className="px-4 py-3 text-center text-slate-400">-</td>
                <td className="px-4 py-3 text-center text-slate-400">{teamAvg.coachingScore}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Green = above team average | Red = below team average
        </p>
      </div>

      {/* SDR Activity & Outcomes Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">SDR Activity (Calls & Emails)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sdrActivityComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="Calls" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Emails" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">SDR Outcomes (Connects & Opps)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sdrOutcomesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="Connects" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Opps" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Team Activity Trends (12 Weeks)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Area type="monotone" dataKey="calls" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Calls" />
              <Area type="monotone" dataKey="emails" stackId="2" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Emails" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Team Outcomes (12 Weeks)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="connects" fill="#10b981" name="Connects" radius={[4, 4, 0, 0]} />
              <Bar dataKey="meetings" fill="#f59e0b" name="Meetings" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
