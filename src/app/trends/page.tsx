"use client";

import { getTrendData, reps, getDailyActivity } from "@/lib/data";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts";

export default function TrendsPage() {
  const trends = getTrendData();
  const activities = getDailyActivity();

  // Calculate week-over-week changes
  const lastWeek = trends[trends.length - 2];
  const thisWeek = trends[trends.length - 1];

  const changes = {
    calls: ((thisWeek.calls - lastWeek.calls) / lastWeek.calls * 100).toFixed(1),
    emails: ((thisWeek.emails - lastWeek.emails) / lastWeek.emails * 100).toFixed(1),
    connects: ((thisWeek.connects - lastWeek.connects) / lastWeek.connects * 100).toFixed(1),
    meetings: ((thisWeek.meetings - lastWeek.meetings) / lastWeek.meetings * 100).toFixed(1),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Trends & Performance</h1>

      {/* WoW Changes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Calls", value: changes.calls, current: thisWeek.calls },
          { label: "Emails", value: changes.emails, current: thisWeek.emails },
          { label: "Connects", value: changes.connects, current: thisWeek.connects },
          { label: "Meetings", value: changes.meetings, current: thisWeek.meetings },
        ].map(metric => (
          <div key={metric.label} className="bg-[#1e293b] rounded-xl border border-[#334155] p-4">
            <div className="text-slate-400 text-sm">{metric.label} (WoW)</div>
            <div className="text-2xl font-bold text-white mt-1">{metric.current}</div>
            <div className={`text-sm mt-1 ${parseFloat(metric.value) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {parseFloat(metric.value) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(metric.value))}%
            </div>
          </div>
        ))}
      </div>

      {/* Activity Trend Chart */}
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Activity Trends (12 Weeks)</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
              labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            />
            <Legend />
            <Line type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Calls" />
            <Line type="monotone" dataKey="emails" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} name="Emails" />
            <Line type="monotone" dataKey="connects" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Connects" />
            <Line type="monotone" dataKey="meetings" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Meetings" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Rep Performance Heatmap Style */}
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Rep Performance Today</h2>
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
              </tr>
            </thead>
            <tbody>
              {activities.map(activity => {
                const rep = reps.find(r => r.id === activity.rep_id)!;
                return (
                  <tr key={activity.rep_id} className="border-b border-[#334155]">
                    <td className="px-4 py-3 text-white font-medium">{rep.name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded ${activity.calls >= 50 ? 'bg-green-500/20 text-green-400' : activity.calls >= 30 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                        {activity.calls}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded ${activity.emails >= 50 ? 'bg-green-500/20 text-green-400' : activity.emails >= 30 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                        {activity.emails}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-white">{activity.connects}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded ${activity.talk_percentage >= 50 ? 'bg-green-500/20 text-green-400' : activity.talk_percentage >= 40 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                        {activity.talk_percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-white">{activity.opps}</td>
                    <td className="px-4 py-3 text-center text-green-400">${(activity.pipeline_value / 1000).toFixed(0)}k</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
