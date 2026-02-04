"use client";

import { useState, useEffect } from "react";
import { reps, getCoachingScores } from "@/lib/data";
import { cn } from "@/lib/utils";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

// Role Play Grading Criteria
const ROLEPLAY_CRITERIA = [
  { letter: 'I', name: 'Introduction', description: 'Clear, confident intro with name and company. Sets professional tone.' },
  { letter: 'R', name: 'Reason for Calling', description: 'Articulates a compelling, relevant reason for the call. Creates curiosity.' },
  { letter: 'O', name: 'Overcome Objection', description: 'Handles objections smoothly without being defensive. Uses empathy and pivots.' },
  { letter: 'P', name: 'Uncover Pain', description: 'Asks probing questions to identify real business challenges and impact.' },
  { letter: 'M', name: 'Metrics', description: 'Quantifies the problem/opportunity. Establishes value and urgency.' },
  { letter: 'N', name: 'Next Steps', description: 'Confidently schedules a follow-up meeting or demo. Gets commitment.' },
];

interface RolePlayScore {
  score: number;
  notes: string;
}

interface ScoreHistoryEntry {
  from: number;
  to: number;
  date: string;
}

export default function CoachingPage() {
  const [selectedRep, setSelectedRep] = useState(reps[0].id);
  const [rolePlayScores, setRolePlayScores] = useState<Record<string, RolePlayScore[]>>({});
  const [scoreHistory, setScoreHistory] = useState<Record<string, ScoreHistoryEntry[]>>({});
  const [showScoreModal, setShowScoreModal] = useState<{ repName: string; criteriaIdx: number } | null>(null);

  const scores = getCoachingScores();
  const repScore = scores.find(s => s.rep_id === selectedRep)!;
  const rep = reps.find(r => r.id === selectedRep)!;

  // Load role play scores from localStorage
  useEffect(() => {
    const storedScores = localStorage.getItem('sdr-roleplay-scores');
    if (storedScores) {
      setRolePlayScores(JSON.parse(storedScores));
    } else {
      // Initialize with default scores
      const defaultScores: Record<string, RolePlayScore[]> = {};
      reps.forEach(r => {
        defaultScores[r.name] = ROLEPLAY_CRITERIA.map(() => ({
          score: 2,
          notes: ''
        }));
      });
      setRolePlayScores(defaultScores);
    }

    const storedHistory = localStorage.getItem('sdr-roleplay-history');
    if (storedHistory) {
      setScoreHistory(JSON.parse(storedHistory));
    }
  }, []);

  const updateRolePlayScore = (repName: string, criteriaIdx: number, score: number) => {
    const newScores = { ...rolePlayScores };
    if (!newScores[repName]) {
      newScores[repName] = ROLEPLAY_CRITERIA.map(() => ({ score: 2, notes: '' }));
    }

    // Record history
    const oldScore = newScores[repName][criteriaIdx]?.score || 2;
    if (oldScore !== score) {
      const newHistory = { ...scoreHistory };
      const key = `${repName}-${criteriaIdx}`;
      if (!newHistory[key]) newHistory[key] = [];
      newHistory[key].unshift({
        from: oldScore,
        to: score,
        date: new Date().toISOString(),
      });
      newHistory[key] = newHistory[key].slice(0, 10);
      setScoreHistory(newHistory);
      localStorage.setItem('sdr-roleplay-history', JSON.stringify(newHistory));
    }

    newScores[repName][criteriaIdx].score = score;
    setRolePlayScores(newScores);
    localStorage.setItem('sdr-roleplay-scores', JSON.stringify(newScores));
  };

  const getOverallRolePlayScore = (repName: string) => {
    if (!rolePlayScores[repName]) return 0;
    const total = rolePlayScores[repName].reduce((sum, item) => sum + item.score, 0);
    return (total / (ROLEPLAY_CRITERIA.length * 5)) * 100;
  };

  const getTeamAverageScore = (criteriaIdx: number) => {
    let total = 0;
    let count = 0;
    Object.values(rolePlayScores).forEach(scores => {
      if (scores[criteriaIdx]) {
        total += scores[criteriaIdx].score;
        count++;
      }
    });
    return count > 0 ? total / count : 0;
  };

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

  const getScoreBadgeColor = (score: number) => {
    const colors: Record<number, string> = {
      1: 'bg-red-500/20 text-red-400',
      2: 'bg-orange-500/20 text-orange-400',
      3: 'bg-yellow-500/20 text-yellow-400',
      4: 'bg-green-500/20 text-green-400',
      5: 'bg-emerald-500/20 text-emerald-400',
    };
    return colors[score] || colors[2];
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

      {/* Role Play Scorecard */}
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-purple-400">🎯</span>
            Role Play Scorecard
            <span className="text-xs font-normal text-slate-400 ml-2">
              (Click any score to edit)
            </span>
          </h3>
          <span className="text-sm text-slate-400">Twice-weekly role play sessions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f172a]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">Rep</th>
                {ROLEPLAY_CRITERIA.map((c, idx) => (
                  <th key={idx} className="px-2 py-3 text-center text-xs font-medium uppercase text-slate-400" title={c.name}>
                    {c.letter}
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-slate-400">Overall</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {reps.map((r) => (
                <tr
                  key={r.id}
                  className={cn(
                    "transition-colors",
                    selectedRep === r.id ? "bg-blue-500/10" : "hover:bg-[#0f172a]/50"
                  )}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedRep(r.id)}
                      className="text-sm font-medium text-white hover:text-blue-400 transition"
                    >
                      {r.name}
                    </button>
                  </td>
                  {ROLEPLAY_CRITERIA.map((_, idx) => {
                    const score = rolePlayScores[r.name]?.[idx]?.score || 2;
                    return (
                      <td key={idx} className="px-2 py-3 text-center">
                        <button
                          onClick={() => setShowScoreModal({ repName: r.name, criteriaIdx: idx })}
                          className="group relative"
                        >
                          <span className={cn(
                            "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-transform hover:scale-110",
                            getScoreBadgeColor(score)
                          )}>
                            {score}
                          </span>
                        </button>
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 rounded-full h-2 bg-[#334155]">
                        <div
                          className={cn(
                            "h-2 rounded-full transition-all",
                            getOverallRolePlayScore(r.name) >= 70 ? "bg-green-500" :
                            getOverallRolePlayScore(r.name) >= 50 ? "bg-yellow-500" : "bg-red-500"
                          )}
                          style={{ width: `${getOverallRolePlayScore(r.name)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-300">
                        {getOverallRolePlayScore(r.name).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="bg-[#0f172a]">
                <td className="px-4 py-3 text-sm font-medium text-slate-300">Team Average</td>
                {ROLEPLAY_CRITERIA.map((_, idx) => (
                  <td key={idx} className="px-2 py-3 text-center text-sm text-slate-400">
                    {getTeamAverageScore(idx).toFixed(1)}
                  </td>
                ))}
                <td className="px-4 py-3"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {ROLEPLAY_CRITERIA.map((c, idx) => (
            <span key={idx} className="px-2 py-1 rounded bg-[#0f172a] text-slate-400">
              <strong className="text-slate-300">{c.letter}</strong> = {c.name}
            </span>
          ))}
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

      {/* Score Edit Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1e293b] rounded-xl shadow-xl max-w-md w-full mx-4 border border-[#334155]">
            <div className="flex items-center justify-between p-4 border-b border-[#334155]">
              <h2 className="text-lg font-semibold text-white">
                Edit Score: {showScoreModal.repName}
              </h2>
              <button
                onClick={() => setShowScoreModal(null)}
                className="p-2 rounded-lg hover:bg-[#334155] transition"
              >
                <span className="text-slate-400 text-xl">×</span>
              </button>
            </div>

            <div className="p-4">
              <div className="text-center mb-4">
                <span className="inline-flex items-center justify-center w-12 h-12 font-bold text-xl rounded-full bg-purple-500/20 text-purple-400">
                  {ROLEPLAY_CRITERIA[showScoreModal.criteriaIdx].letter}
                </span>
                <h3 className="mt-2 font-medium text-white">
                  {ROLEPLAY_CRITERIA[showScoreModal.criteriaIdx].name}
                </h3>
                <p className="text-sm text-slate-400">
                  {ROLEPLAY_CRITERIA[showScoreModal.criteriaIdx].description}
                </p>
              </div>

              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map(score => (
                  <button
                    key={score}
                    onClick={() => {
                      updateRolePlayScore(showScoreModal.repName, showScoreModal.criteriaIdx, score);
                      setShowScoreModal(null);
                    }}
                    className={cn(
                      "w-12 h-12 rounded-full border-2 text-lg font-medium transition",
                      (rolePlayScores[showScoreModal.repName]?.[showScoreModal.criteriaIdx]?.score || 2) === score
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "border-[#334155] text-slate-300 hover:border-purple-400 hover:bg-purple-500/10"
                    )}
                  >
                    {score}
                  </button>
                ))}
              </div>

              <div className="text-xs text-center text-slate-400">
                1 = Needs Work | 2 = Developing | 3 = Competent | 4 = Strong | 5 = Excellent
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
