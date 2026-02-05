"use client";

import { useState } from "react";
import { getFunnelData, getTrendData, reps, getDailyActivity, getCoachingScores, getAllRepFunnels, TimePeriod } from "@/lib/data";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('weekly');

  const funnel = getFunnelData(timePeriod);
  const repFunnels = getAllRepFunnels(timePeriod);
  const trends = getTrendData(timePeriod);
  const activities = getDailyActivity(timePeriod);
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
    const repFunnel = repFunnels.find(f => f.rep_id === activity.rep_id)!;
    return {
      name: rep.name.split(' ')[0],
      fullName: rep.name,
      calls: activity.calls,
      emails: activity.emails,
      connects: activity.connects,
      pipeline: Math.round(repFunnel.pipeline_value / 1000),
      opps: repFunnel.opportunities,
      meetings: repFunnel.meetings_booked,
      talkPercent: activity.talk_percentage,
      coachingScore: score.overall_score,
      contactsReached: repFunnel.contacts_reached,
      conversations: repFunnel.conversations,
    };
  });

  // SDR Funnel Comparison
  const sdrFunnelData = sdrPerformanceData.map(sdr => ({
    name: sdr.name,
    'Contacts': sdr.contactsReached,
    'Conversations': sdr.conversations,
    'Meetings': sdr.meetings,
    'Opps': sdr.opps,
  }));

  // Team averages for comparison
  const teamAvg = {
    calls: Math.round(activities.reduce((sum, a) => sum + a.calls, 0) / activities.length),
    emails: Math.round(activities.reduce((sum, a) => sum + a.emails, 0) / activities.length),
    connects: Math.round(activities.reduce((sum, a) => sum + a.connects, 0) / activities.length),
    talkPercent: Math.round(activities.reduce((sum, a) => sum + a.talk_percentage, 0) / activities.length),
    coachingScore: Math.round(coachingScores.reduce((sum, s) => sum + s.overall_score, 0) / coachingScores.length),
    meetings: Math.round(repFunnels.reduce((sum, f) => sum + f.meetings_booked, 0) / repFunnels.length),
    opps: Math.round(repFunnels.reduce((sum, f) => sum + f.opportunities, 0) / repFunnels.length),
  };

  const periodLabels = {
    daily: 'Today',
    weekly: 'This Week',
    monthly: 'This Month',
    quarterly: 'This Quarter',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
          className="bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
        </select>
      </div>

      {/* Team Conversion Funnel */}
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Team Conversion Funnel - {periodLabels[timePeriod]}</h2>
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
            <div className="text-3xl font-bold text-white">
              ${funnel.opportunities > 0 ? Math.round(funnel.pipeline_value / funnel.opportunities).toLocaleString() : 0}
            </div>
          </div>
        </div>
      </div>

      {/* SDR Funnel Comparison */}
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">SDR Funnel Comparison - {periodLabels[timePeriod]}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sdrFunnelData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Bar dataKey="Contacts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Conversations" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Meetings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Opps" fill="#a855f7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* SDR Performance Comparison Table */}
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">SDR Performance - {periodLabels[timePeriod]}</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Rep</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Calls</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Emails</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Connects</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Meetings</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Opps</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Pipeline</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Talk %</th>
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
                      sdr.meetings >= teamAvg.meetings ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"
                    )}>
                      {sdr.meetings}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "px-2 py-1 rounded text-sm font-medium",
                      sdr.opps >= teamAvg.opps ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"
                    )}>
                      {sdr.opps}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-green-400 font-medium">${sdr.pipeline}k</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "px-2 py-1 rounded text-sm font-medium",
                      sdr.talkPercent >= 50 ? "bg-green-500/20 text-green-400" :
                      sdr.talkPercent >= 40 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                    )}>
                      {sdr.talkPercent}%
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
                <td className="px-4 py-3 text-center text-slate-400">{teamAvg.meetings}</td>
                <td className="px-4 py-3 text-center text-slate-400">{teamAvg.opps}</td>
                <td className="px-4 py-3 text-center text-slate-400">-</td>
                <td className="px-4 py-3 text-center text-slate-400">{teamAvg.talkPercent}%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Green = above team average | Red/Amber = at or below team average
        </p>
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Activity Trends</h2>
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
          <h2 className="text-lg font-semibold text-white mb-4">Outcomes Trends</h2>
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

      {/* Data Sources Footer */}
      <div className="bg-[#0f172a] rounded-lg border border-[#334155] p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Data Sources:</span>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Salesforce (Calls, Opps, Pipeline)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Groove (Emails, Sequences)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              CoPilot (Talk %, Quality Scores)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
