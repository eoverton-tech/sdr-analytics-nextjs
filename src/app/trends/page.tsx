"use client";

import { useState } from "react";
import { getTrendData, reps, getDailyActivity, getEmailMetrics, getCoachingScores, TimePeriod, kpiTargets } from "@/lib/data";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, BarChart, Bar } from "recharts";
import { cn } from "@/lib/utils";

export default function TrendsPage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('weekly');

  const trends = getTrendData(timePeriod);
  const activities = getDailyActivity(timePeriod);
  const emailMetrics = getEmailMetrics(timePeriod);
  const coachingScores = getCoachingScores();

  // Calculate period-over-period changes
  const prevPeriod = trends[trends.length - 2];
  const thisPeriod = trends[trends.length - 1];

  const changes = prevPeriod ? {
    calls: ((thisPeriod.calls - prevPeriod.calls) / prevPeriod.calls * 100).toFixed(1),
    emails: ((thisPeriod.emails - prevPeriod.emails) / prevPeriod.emails * 100).toFixed(1),
    connects: ((thisPeriod.connects - prevPeriod.connects) / prevPeriod.connects * 100).toFixed(1),
    meetings: ((thisPeriod.meetings - prevPeriod.meetings) / prevPeriod.meetings * 100).toFixed(1),
  } : { calls: '0', emails: '0', connects: '0', meetings: '0' };

  const periodLabels = {
    daily: { current: 'Today', change: 'DoD', chartTitle: '14 Days' },
    weekly: { current: 'This Week', change: 'WoW', chartTitle: '12 Weeks' },
    monthly: { current: 'This Month', change: 'MoM', chartTitle: '12 Months' },
    quarterly: { current: 'This Quarter', change: 'QoQ', chartTitle: '8 Quarters' },
  };

  // Create rep trend data for individual performance tracking
  const repTrendData = reps.map(rep => {
    const activity = activities.find(a => a.rep_id === rep.id)!;
    const emails = emailMetrics.find(e => e.rep_id === rep.id)!;
    const coaching = coachingScores.find(c => c.rep_id === rep.id)!;
    const targets = kpiTargets[timePeriod];

    return {
      name: rep.name.split(' ')[0],
      fullName: rep.name,
      team: rep.team,
      // Salesforce metrics
      calls: activity.calls,
      callsTarget: targets?.calls || activity.calls_target,
      connects: activity.connects,
      opps: activity.opps,
      pipeline: activity.pipeline_value,
      meetings: activity.meetings_booked,
      // Groove metrics
      emails: activity.emails,
      emailsTarget: targets?.emails || activity.emails_target,
      openRate: activity.open_rate,
      responseRate: activity.response_rate,
      personalization: activity.personalization_score,
      // CoPilot metrics
      talkPercent: activity.talk_percentage,
      introScore: activity.introduction_score,
      objectionScore: activity.objection_handling_score,
      painScore: activity.pain_discovery_score,
      overallCoaching: coaching.overall_score,
    };
  });

  // Team totals
  const teamTotals = {
    calls: activities.reduce((sum, a) => sum + a.calls, 0),
    emails: activities.reduce((sum, a) => sum + a.emails, 0),
    connects: activities.reduce((sum, a) => sum + a.connects, 0),
    meetings: activities.reduce((sum, a) => sum + a.meetings_booked, 0),
    opps: activities.reduce((sum, a) => sum + a.opps, 0),
    pipeline: activities.reduce((sum, a) => sum + a.pipeline_value, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Trends & Performance</h1>
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

      {/* Period-over-Period Changes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Calls", value: changes.calls, current: thisPeriod.calls, source: "Salesforce" },
          { label: "Emails", value: changes.emails, current: thisPeriod.emails, source: "Groove" },
          { label: "Connects", value: changes.connects, current: thisPeriod.connects, source: "Salesforce" },
          { label: "Meetings", value: changes.meetings, current: thisPeriod.meetings, source: "Salesforce" },
        ].map(metric => (
          <div key={metric.label} className="bg-[#1e293b] rounded-xl border border-[#334155] p-4">
            <div className="flex items-center justify-between">
              <div className="text-slate-400 text-sm">{metric.label} ({periodLabels[timePeriod].change})</div>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">{metric.source}</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">{metric.current.toLocaleString()}</div>
            <div className={`text-sm mt-1 ${parseFloat(metric.value) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {parseFloat(metric.value) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(metric.value))}%
            </div>
          </div>
        ))}
      </div>

      {/* Activity Trend Chart */}
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Activity Trends ({periodLabels[timePeriod].chartTitle})</h2>
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
            <Line type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Calls (SF)" />
            <Line type="monotone" dataKey="emails" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} name="Emails (Groove)" />
            <Line type="monotone" dataKey="connects" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Connects (SF)" />
            <Line type="monotone" dataKey="meetings" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Meetings (SF)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* SDR Performance Table - Salesforce Data */}
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">SDR Performance - {periodLabels[timePeriod].current}</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-xs text-slate-400">Salesforce</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Rep</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Calls</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Connects</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Meetings</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Opps</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Pipeline</th>
              </tr>
            </thead>
            <tbody>
              {repTrendData.map(rep => {
                const callsTarget = kpiTargets[timePeriod]?.calls || 50;
                const meetingsTarget = kpiTargets[timePeriod]?.meetings || 10;
                return (
                  <tr key={rep.fullName} className="border-b border-[#334155] hover:bg-[#334155]/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-white font-medium">{rep.fullName}</div>
                      <div className="text-xs text-slate-400">{rep.team}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "px-2 py-1 rounded text-sm font-medium",
                        rep.calls >= callsTarget ? 'bg-green-500/20 text-green-400' :
                        rep.calls >= callsTarget * 0.7 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                      )}>
                        {rep.calls}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-white">{rep.connects}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "px-2 py-1 rounded text-sm font-medium",
                        rep.meetings >= meetingsTarget ? 'bg-green-500/20 text-green-400' :
                        rep.meetings >= meetingsTarget * 0.5 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                      )}>
                        {rep.meetings}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-white">{rep.opps}</td>
                    <td className="px-4 py-3 text-center text-green-400">${(rep.pipeline / 1000).toFixed(0)}k</td>
                  </tr>
                );
              })}
              <tr className="bg-[#0f172a]">
                <td className="px-4 py-3 text-slate-400 font-medium">Team Total</td>
                <td className="px-4 py-3 text-center text-slate-300 font-medium">{teamTotals.calls}</td>
                <td className="px-4 py-3 text-center text-slate-300 font-medium">{teamTotals.connects}</td>
                <td className="px-4 py-3 text-center text-slate-300 font-medium">{teamTotals.meetings}</td>
                <td className="px-4 py-3 text-center text-slate-300 font-medium">{teamTotals.opps}</td>
                <td className="px-4 py-3 text-center text-green-400 font-medium">${(teamTotals.pipeline / 1000).toFixed(0)}k</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Metrics - Groove Data */}
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Email Performance - {periodLabels[timePeriod].current}</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span className="text-xs text-slate-400">Groove</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Rep</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Emails Sent</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Open Rate</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Response Rate</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Personalization</th>
              </tr>
            </thead>
            <tbody>
              {repTrendData.map(rep => (
                <tr key={rep.fullName} className="border-b border-[#334155] hover:bg-[#334155]/30 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{rep.fullName}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "px-2 py-1 rounded text-sm font-medium",
                      rep.emails >= rep.emailsTarget ? 'bg-green-500/20 text-green-400' :
                      rep.emails >= rep.emailsTarget * 0.7 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                    )}>
                      {rep.emails}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "px-2 py-1 rounded text-sm font-medium",
                      rep.openRate >= 50 ? 'bg-green-500/20 text-green-400' :
                      rep.openRate >= 40 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                    )}>
                      {rep.openRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "px-2 py-1 rounded text-sm font-medium",
                      rep.responseRate >= 15 ? 'bg-green-500/20 text-green-400' :
                      rep.responseRate >= 10 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                    )}>
                      {rep.responseRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "px-2 py-1 rounded text-sm font-medium",
                      rep.personalization >= 80 ? 'bg-green-500/20 text-green-400' :
                      rep.personalization >= 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                    )}>
                      {rep.personalization}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CoPilot Quality Scores */}
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Call Quality Scores - {periodLabels[timePeriod].current}</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-xs text-slate-400">CoPilot</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Rep</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Talk %</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Intro</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Objections</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Pain Discovery</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Overall</th>
              </tr>
            </thead>
            <tbody>
              {repTrendData.map(rep => (
                <tr key={rep.fullName} className="border-b border-[#334155] hover:bg-[#334155]/30 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{rep.fullName}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "px-2 py-1 rounded text-sm font-medium",
                      rep.talkPercent >= 50 ? 'bg-green-500/20 text-green-400' :
                      rep.talkPercent >= 40 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                    )}>
                      {rep.talkPercent}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "px-2 py-1 rounded text-sm",
                      rep.introScore >= 4 ? 'text-green-400' : rep.introScore >= 3 ? 'text-amber-400' : 'text-red-400'
                    )}>
                      {rep.introScore}/5
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "px-2 py-1 rounded text-sm",
                      rep.objectionScore >= 4 ? 'text-green-400' : rep.objectionScore >= 3 ? 'text-amber-400' : 'text-red-400'
                    )}>
                      {rep.objectionScore}/5
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "px-2 py-1 rounded text-sm",
                      rep.painScore >= 4 ? 'text-green-400' : rep.painScore >= 3 ? 'text-amber-400' : 'text-red-400'
                    )}>
                      {rep.painScore}/5
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "px-3 py-1 rounded text-sm font-semibold",
                      rep.overallCoaching >= 75 ? 'bg-green-500/20 text-green-400' :
                      rep.overallCoaching >= 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                    )}>
                      {rep.overallCoaching}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Sources Footer */}
      <div className="bg-[#0f172a] rounded-lg border border-[#334155] p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Data Sources:</span>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Salesforce (Calls, Connects, Opps, Pipeline)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Groove (Emails, Open Rate, Response Rate)
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
