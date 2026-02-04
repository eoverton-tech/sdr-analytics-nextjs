"use client";

import { useState } from "react";
import { reps, getCoachingScores, getDailyActivity } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Download, FileText, MessageSquare } from "lucide-react";

export default function OneOnOnesPage() {
  const [selectedRep, setSelectedRep] = useState(reps[0].id);
  const scores = getCoachingScores();
  const activities = getDailyActivity();

  const repScore = scores.find(s => s.rep_id === selectedRep)!;
  const repActivity = activities.find(a => a.rep_id === selectedRep)!;
  const rep = reps.find(r => r.id === selectedRep)!;

  const [notes, setNotes] = useState({
    discussion: "",
    actions: "",
    goals: "",
    general: "",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">1:1 Coaching Session</h1>
          <p className="text-slate-400">Prepare and document your coaching sessions</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedRep}
            onChange={(e) => setSelectedRep(e.target.value)}
            className="bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {reps.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Rep Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold mx-auto mb-3">
            {rep.initials}
          </div>
          <h2 className="text-lg font-semibold text-white">{rep.name}</h2>
          <p className="text-slate-400 text-sm">{rep.team} Team</p>
        </div>
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
          <div className="text-slate-400 text-sm">Current Week Score</div>
          <div className={cn(
            "text-4xl font-bold mt-2",
            repScore.overall_score >= 80 ? "text-green-400" :
            repScore.overall_score >= 60 ? "text-amber-400" : "text-red-400"
          )}>
            {repScore.overall_score}
          </div>
          <div className="text-slate-500 text-sm mt-1">+3 from last week</div>
        </div>
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
          <div className="text-slate-400 text-sm">Calls Analyzed</div>
          <div className="text-4xl font-bold text-white mt-2">{repScore.calls_analyzed}</div>
          <div className="text-slate-500 text-sm mt-1">this week</div>
        </div>
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
          <div className="text-slate-400 text-sm">Team Rank</div>
          <div className="text-4xl font-bold text-white mt-2">
            #{scores.sort((a, b) => b.overall_score - a.overall_score).findIndex(s => s.rep_id === selectedRep) + 1}
          </div>
          <div className="text-slate-500 text-sm mt-1">of {reps.length} reps</div>
        </div>
      </div>

      {/* Focus Areas */}
      <div className="bg-[#1e293b] rounded-xl border border-amber-500/30 p-6">
        <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Focus Areas This Week
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { category: "Introduction", score: repScore.introduction_quality },
            { category: "Objection Handling", score: repScore.objection_handling },
            { category: "Pain Discovery", score: repScore.uncovered_pain },
            { category: "Metrics", score: repScore.uncovered_metrics },
            { category: "Next Steps", score: repScore.scheduled_next_steps },
          ]
            .sort((a, b) => a.score - b.score)
            .slice(0, 2)
            .map(item => (
              <div key={item.category} className="bg-[#0f172a] rounded-lg p-4 border border-[#334155]">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{item.category}</span>
                  <span className={cn(
                    "px-2 py-1 rounded text-sm font-semibold",
                    item.score >= 70 ? "bg-green-500/20 text-green-400" :
                    item.score >= 50 ? "bg-amber-500/20 text-amber-400" :
                    "bg-red-500/20 text-red-400"
                  )}>
                    {item.score}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-2">
                  {item.score < 60 ? "Needs significant improvement" :
                   item.score < 75 ? "Room for growth" : "Performing well"}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Coaching Notes */}
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Coaching Notes
          </h3>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm transition-colors">
            Save Notes
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Discussion Points</label>
            <textarea
              value={notes.discussion}
              onChange={(e) => setNotes({ ...notes, discussion: e.target.value })}
              placeholder="Key topics to discuss..."
              className="w-full h-32 bg-[#0f172a] border border-[#334155] rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Action Items</label>
            <textarea
              value={notes.actions}
              onChange={(e) => setNotes({ ...notes, actions: e.target.value })}
              placeholder="Tasks for the rep to complete..."
              className="w-full h-32 bg-[#0f172a] border border-[#334155] rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Goals for Next Week</label>
            <textarea
              value={notes.goals}
              onChange={(e) => setNotes({ ...notes, goals: e.target.value })}
              placeholder="Specific goals to achieve..."
              className="w-full h-32 bg-[#0f172a] border border-[#334155] rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">General Notes</label>
            <textarea
              value={notes.general}
              onChange={(e) => setNotes({ ...notes, general: e.target.value })}
              placeholder="Additional observations..."
              className="w-full h-32 bg-[#0f172a] border border-[#334155] rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
