"use client";

import { getFunnelData, getTrendData } from "@/lib/data";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

export default function AnalyticsPage() {
  const funnel = getFunnelData();
  const trends = getTrendData();

  const funnelStages = [
    { name: "Contacts Reached", value: funnel.contacts_reached, color: "#3b82f6" },
    { name: "Conversations", value: funnel.conversations, color: "#6366f1" },
    { name: "Meetings Booked", value: funnel.meetings_booked, color: "#8b5cf6" },
    { name: "Opportunities", value: funnel.opportunities, color: "#a855f7" },
  ];

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

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Activity Trends (12 Weeks)</h2>
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
          <h2 className="text-lg font-semibold text-white mb-4">Outcomes (12 Weeks)</h2>
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
