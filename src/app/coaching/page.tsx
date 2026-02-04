"use client";

import { useState } from "react";
import { reps, getCoachingScores } from "@/lib/data";
import { cn } from "@/lib/utils";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function CoachingPage() {
  const [selectedRep, setSelectedRep] = useState(reps[0].id);
  const scores = getCoachingScores();
  const repScore = scores.find(s => s.rep_id === selectedRep)!;
  const rep = reps.find(r => r.id === selectedRep)!;

  const radarData = [
    { category: "Introduction", score: repScore.introduction_quality, fullMark: 100 },
    { category: "Objection\nHandling", score: repScore.objection_handling, fullMark: 100 },
    { category: "Pain\nDiscovery", score: repScore.uncovered_pain, fullMark: 100 },
    { category: "Metrics", score: repScore.uncovered_metrics, fullMark: 100 },
    { category: "Next\nSteps", score: repScore.scheduled_next_steps, fullMark: 100 },
  ];

  const teamComparison = scores.map(s => {
    const r = reps.find(rep => rep.id === s.rep_id)!;
    return {
      name: r.name.split(' ')[0],
      score: s.overall_score,
      isSelected: s.rep_id === selectedRep,
    };
  }).sort((a, b) => b.score - a.score);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/20";
    if (score >= 60) return "bg-amber-500/20";
    return "bg-red-500/20";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Coaching Report Card</h1>
        <select
          value={selectedRep}
          onChange={(e) => setSelectedRep(e.target.value)}
          className="bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {reps.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {/* Overall Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              {rep.initials}
            </div>
            <h2 className="text-xl font-semibold text-white">{rep.name}</h2>
            <p className="text-slate-400">{rep.team} Team</p>
            <div className={cn("text-5xl font-bold mt-4", getScoreColor(repScore.overall_score))}>
              {repScore.overall_score}
            </div>
            <p className="text-slate-400 mt-1">Overall Score</p>
            <div className="mt-4 text-sm text-slate-400">
              {repScore.calls_analyzed} calls analyzed this week
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Score Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Scores */}
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Category Scores</h3>
          <div className="space-y-3">
            {[
              { name: "Introduction Quality", score: repScore.introduction_quality },
              { name: "Objection Handling", score: repScore.objection_handling },
              { name: "Uncovered Pain", score: repScore.uncovered_pain },
              { name: "Uncovered Metrics", score: repScore.uncovered_metrics },
              { name: "Next Steps", score: repScore.scheduled_next_steps },
            ].map(cat => (
              <div key={cat.name} className="flex items-center justify-between">
                <span className="text-slate-300">{cat.name}</span>
                <span className={cn("px-3 py-1 rounded-lg font-semibold", getScoreBg(cat.score), getScoreColor(cat.score))}>
                  {cat.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1e293b] rounded-xl border border-green-500/30 p-6">
          <h3 className="text-lg font-semibold text-green-400 mb-4">Strengths</h3>
          <ul className="space-y-2">
            {repScore.strengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-300">
                <span className="text-green-400 mt-1">✓</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-[#1e293b] rounded-xl border border-amber-500/30 p-6">
          <h3 className="text-lg font-semibold text-amber-400 mb-4">Areas for Improvement</h3>
          <ul className="space-y-2">
            {repScore.improvements.map((improvement, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-300">
                <span className="text-amber-400 mt-1">→</span>
                {improvement}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Team Comparison */}
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Team Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={teamComparison} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
            <YAxis type="category" dataKey="name" stroke="#94a3b8" width={80} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Bar
              dataKey="score"
              radius={[0, 4, 4, 0]}
              fill="#3b82f6"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
