"use client";

import { useState, useEffect, useMemo } from "react";
import { reps, getCoachingScores, getDailyActivity, getEmailMetrics, getRolePlayHistory, kpiTargets } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Download, Calendar, ChevronLeft, ChevronRight, Save, Phone, Target, TrendingUp, ClipboardList, MessageSquare, Lightbulb } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Role Play Grading Criteria (matches coaching page)
const ROLEPLAY_CRITERIA = [
  { letter: 'I', name: 'Introduction', description: 'Clear, confident intro with name and company.' },
  { letter: 'R', name: 'Reason for Calling', description: 'Articulates a compelling, relevant reason.' },
  { letter: 'O', name: 'Overcome Objection', description: 'Handles objections smoothly with empathy.' },
  { letter: 'P', name: 'Uncover Pain', description: 'Asks probing questions to identify challenges.' },
  { letter: 'M', name: 'Metrics', description: 'Quantifies the problem/opportunity.' },
  { letter: 'N', name: 'Next Steps', description: 'Confidently schedules follow-up.' },
];

// Call Analysis interface
interface CallAnalysis {
  callId: string;
  prospect: string;
  duration: string;
  outcome: string;
  scores: { criteria: string; score: number; notes: string }[];
  bipsyCoaching: {
    behavior: string;
    impact: string;
    pattern: string;
    suggestion: string;
    yesAnd: string;
  };
}

// Generate mock call analysis data based on rep and week
const generateCallAnalysis = (repName: string, weekStart: string): CallAnalysis[] => {
  // Seeded random for consistent data per rep/week
  const seed = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  const baseSeed = seed(repName + weekStart);
  const rand = (offset: number) => {
    const x = Math.sin(baseSeed + offset) * 10000;
    return x - Math.floor(x);
  };

  const prospects = [
    { name: 'Sarah Chen', company: 'TechFlow Inc', title: 'VP of Operations' },
    { name: 'Michael Roberts', company: 'DataSync Corp', title: 'Director of IT' },
    { name: 'Jennifer Walsh', company: 'CloudFirst Solutions', title: 'Head of Procurement' },
    { name: 'David Kim', company: 'Innovate Partners', title: 'CTO' },
    { name: 'Amanda Torres', company: 'Scale Ventures', title: 'Operations Manager' },
  ];

  const outcomes = ['Meeting Scheduled', 'Follow-up Call', 'Sent Information', 'Not Interested', 'Callback Requested'];

  // BIPSY coaching templates based on common improvement areas
  const bipsyTemplates = {
    introduction: {
      behavior: "Started the call without clearly stating your name and company in the first 5 seconds",
      impact: "The prospect seemed confused about who was calling, leading to immediate resistance",
      pattern: "This has occurred in 2 of 3 calls reviewed - tends to happen when eager to pitch",
      suggestion: "Use the 'Name-Company-Pause' technique: State your name, company, then pause for acknowledgment before continuing",
      yesAnd: "Your energy is great on calls - AND pairing that with a clear intro will help prospects feel more comfortable engaging"
    },
    reason: {
      behavior: "Jumped into product features before establishing relevance to the prospect's role",
      impact: "Prospect asked 'Why are you calling me?' indicating the reason wasn't clear",
      pattern: "Noticed this in calls where there's pressure to get through the script quickly",
      suggestion: "Lead with a trigger: 'I noticed [specific event/news] and thought it might relate to [their challenge]'",
      yesAnd: "You clearly know the product well - AND connecting features to their specific situation will increase engagement"
    },
    objection: {
      behavior: "Responded to 'We're not interested' by immediately offering a discount",
      impact: "This positioned us as desperate and didn't address their actual concern",
      pattern: "When faced with resistance, there's a tendency to retreat rather than explore",
      suggestion: "Use the 'Acknowledge-Curious-Pivot' method: 'I appreciate you sharing that. I'm curious - what would need to change for this to be worth exploring?'",
      yesAnd: "Your persistence is valuable - AND channeling it into curiosity will uncover real objections"
    },
    pain: {
      behavior: "Asked surface-level questions like 'What challenges are you facing?' without follow-up",
      impact: "Received generic answers that didn't reveal true pain points or urgency",
      pattern: "Questions tend to be broad rather than drilling down into specifics",
      suggestion: "Use the '3 Whys' technique: After each answer, ask 'Why is that important?' to get to root causes",
      yesAnd: "You're asking good initial questions - AND going 2-3 levels deeper will uncover compelling pain"
    },
    metrics: {
      behavior: "Discussed the problem without quantifying its impact on their business",
      impact: "Prospect couldn't justify prioritizing this conversation without understanding ROI",
      pattern: "Comfortable with qualitative discussion but hesitant to push for numbers",
      suggestion: "Prep 3 quantifying questions: 'How many hours/week?', 'What's the cost when X happens?', 'How does this affect your team size?'",
      yesAnd: "You build great rapport - AND adding metrics will help champions sell internally"
    },
    nextSteps: {
      behavior: "Ended call with 'I'll send you some information' without a specific follow-up time",
      impact: "No commitment means this likely goes into their 'maybe someday' pile",
      pattern: "Hesitancy to be assertive when asking for time commitment",
      suggestion: "Use the 'Assumptive Calendar' close: 'I'm looking at my calendar - does Tuesday at 2pm or Thursday at 10am work better for a 20-minute demo?'",
      yesAnd: "You're great at keeping conversations friendly - AND adding a clear ask will convert more conversations"
    }
  };

  const calls: CallAnalysis[] = [];

  for (let i = 0; i < 3; i++) {
    const prospectIdx = Math.floor(rand(i * 10) * prospects.length);
    const prospect = prospects[prospectIdx];
    const outcomeIdx = Math.floor(rand(i * 20) * outcomes.length);
    const duration = `${Math.floor(rand(i * 30) * 10) + 3}:${Math.floor(rand(i * 40) * 60).toString().padStart(2, '0')}`;

    // Generate IROPNM scores for this call
    const scores = ROLEPLAY_CRITERIA.map((criteria, idx) => {
      const score = Math.floor(rand(i * 100 + idx) * 4) + 1; // 1-5
      const notesOptions = [
        `Good attempt but could improve on ${criteria.name.toLowerCase()}`,
        `Solid execution of ${criteria.name.toLowerCase()}`,
        `Needs work on ${criteria.name.toLowerCase()} - see coaching notes`,
        `Strong ${criteria.name.toLowerCase()} skills demonstrated`,
        `Missed opportunity for better ${criteria.name.toLowerCase()}`,
      ];
      return {
        criteria: criteria.letter,
        score,
        notes: notesOptions[Math.floor(rand(i * 200 + idx) * notesOptions.length)]
      };
    });

    // Find the lowest scoring area for BIPSY coaching
    const lowestScore = scores.reduce((min, s) => s.score < min.score ? s : min, scores[0]);
    const criteriaKey = {
      'I': 'introduction',
      'R': 'reason',
      'O': 'objection',
      'P': 'pain',
      'M': 'metrics',
      'N': 'nextSteps'
    }[lowestScore.criteria] as keyof typeof bipsyTemplates;

    calls.push({
      callId: `CALL-${weekStart.replace(/-/g, '')}-${i + 1}`,
      prospect: `${prospect.name} (${prospect.title}, ${prospect.company})`,
      duration,
      outcome: outcomes[outcomeIdx],
      scores,
      bipsyCoaching: bipsyTemplates[criteriaKey]
    });
  }

  return calls;
};

// Form data interface
interface OneOnOneFormData {
  // Section 1: KPI & Opportunity Review
  calls: string;
  emails: string;
  sequences: string;
  opportunities: string;
  stalled: string;
  ghosted: string;
  pipelinePriority: string;
  creativeAction: string;
  // Section 2: Call Review & Coaching
  callActivity: string;
  positiveConversationRate: string;
  tractionNotes: string;
  callRecordings: string;
  strengthsAndImprovements: string;
  coachingNeeds: string;
  // Section 3: Role Play
  rolePlayScores: { score: number; notes: string }[];
  rolePlayFeedback: string;
  // Section 4: Action Items
  actionItems: string;
  commitments: string;
}

const defaultFormData: OneOnOneFormData = {
  calls: '',
  emails: '',
  sequences: '',
  opportunities: '',
  stalled: '',
  ghosted: '',
  pipelinePriority: '',
  creativeAction: '',
  callActivity: '',
  positiveConversationRate: '',
  tractionNotes: '',
  callRecordings: '',
  strengthsAndImprovements: '',
  coachingNeeds: '',
  rolePlayScores: ROLEPLAY_CRITERIA.map(() => ({ score: 2, notes: '' })),
  rolePlayFeedback: '',
  actionItems: '',
  commitments: '',
};

// Generate all weeks from Feb 9, 2025 through end of 2026
const generateWeeks = () => {
  const weeks: { value: string; label: string; startDate: Date; endDate: Date }[] = [];
  const startDate = new Date(2025, 1, 9); // Feb 9, 2025
  const endOfYear = new Date(2026, 11, 31); // Dec 31, 2026

  let currentStart = new Date(startDate);
  let weekNumber = 1;

  while (currentStart <= endOfYear) {
    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + 6);

    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    weeks.push({
      value: currentStart.toISOString().split('T')[0],
      label: `Week ${weekNumber}: ${formatDate(currentStart)} - ${formatDate(currentEnd)}`,
      startDate: new Date(currentStart),
      endDate: new Date(currentEnd),
    });

    currentStart.setDate(currentStart.getDate() + 7);
    weekNumber++;
  }

  return weeks;
};

export default function OneOnOnesPage() {
  const [selectedRep, setSelectedRep] = useState(reps[0].id);
  const [formData, setFormData] = useState<Record<string, Record<string, OneOnOneFormData>>>({});
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Generate weeks list
  const weeks = useMemo(() => generateWeeks(), []);

  // Find current week or default to first week
  const getCurrentWeek = () => {
    const today = new Date();
    const currentWeek = weeks.find(w => today >= w.startDate && today <= w.endDate);
    return currentWeek?.value || weeks[0].value;
  };

  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());

  const selectedWeekData = weeks.find(w => w.value === selectedWeek);
  const selectedWeekIndex = weeks.findIndex(w => w.value === selectedWeek);

  // Get data for the selected week
  const scores = getCoachingScores(selectedWeek);
  const activities = getDailyActivity('weekly', selectedWeek);
  const emailMetrics = getEmailMetrics('weekly', selectedWeek);

  const repScore = scores.find(s => s.rep_id === selectedRep)!;
  const repActivity = activities.find(a => a.rep_id === selectedRep)!;
  const repEmails = emailMetrics.find(e => e.rep_id === selectedRep)!;
  const rep = reps.find(r => r.id === selectedRep)!;

  const targets = kpiTargets.weekly;

  // Load form data from localStorage
  useEffect(() => {
    const storedData = localStorage.getItem('sdr-one-on-one-forms');
    if (storedData) {
      setFormData(JSON.parse(storedData));
    }
  }, []);

  // Get current form data for selected week and rep
  // Pre-populate with data from Salesforce/Groove/CoPilot if no saved data exists
  const getCurrentFormData = (): OneOnOneFormData => {
    const savedData = formData[selectedWeek]?.[rep.name];
    if (savedData) {
      return savedData;
    }

    // Pre-populate with actual data from the data sources
    return {
      // Section 1: KPI data from Salesforce/Groove
      calls: repActivity?.calls?.toString() || '',
      emails: repActivity?.emails?.toString() || '',
      sequences: repEmails?.sequences_active?.toString() || '',
      opportunities: repActivity?.opps?.toString() || '',
      stalled: '', // User input
      ghosted: '', // User input
      pipelinePriority: '',
      creativeAction: '',
      // Section 2: Call data
      callActivity: repActivity?.calls?.toString() || '',
      positiveConversationRate: `${repActivity?.talk_percentage || 0}%`,
      tractionNotes: '',
      callRecordings: '',
      strengthsAndImprovements: repScore?.strengths?.join(', ') || '',
      coachingNeeds: repScore?.improvements?.join(', ') || '',
      // Section 3: Role Play - use CoPilot scores as starting point
      rolePlayScores: [
        { score: Math.min(5, Math.max(1, Math.round(repActivity?.introduction_score || 2))), notes: '' },
        { score: Math.min(5, Math.max(1, Math.round(repActivity?.reason_for_calling_score || 2))), notes: '' },
        { score: Math.min(5, Math.max(1, Math.round(repActivity?.objection_handling_score || 2))), notes: '' },
        { score: Math.min(5, Math.max(1, Math.round(repActivity?.pain_discovery_score || 2))), notes: '' },
        { score: Math.min(5, Math.max(1, Math.round(repActivity?.metrics_score || 2))), notes: '' },
        { score: Math.min(5, Math.max(1, Math.round(repActivity?.next_steps_score || 2))), notes: '' },
      ],
      rolePlayFeedback: '',
      // Section 4: Action Items
      actionItems: '',
      commitments: '',
    };
  };

  // Update form field
  const updateField = (field: keyof OneOnOneFormData, value: string | { score: number; notes: string }[]) => {
    setSaveStatus('unsaved');
    const newFormData = { ...formData };
    if (!newFormData[selectedWeek]) {
      newFormData[selectedWeek] = {};
    }
    if (!newFormData[selectedWeek][rep.name]) {
      newFormData[selectedWeek][rep.name] = { ...defaultFormData };
    }
    newFormData[selectedWeek][rep.name] = {
      ...newFormData[selectedWeek][rep.name],
      [field]: value,
    };
    setFormData(newFormData);
  };

  // Update role play score
  const updateRolePlayScore = (idx: number, score: number) => {
    const currentScores = getCurrentFormData().rolePlayScores;
    const newScores = [...currentScores];
    newScores[idx] = { ...newScores[idx], score };
    updateField('rolePlayScores', newScores);
  };

  // Save form data
  const saveFormData = () => {
    setSaveStatus('saving');
    localStorage.setItem('sdr-one-on-one-forms', JSON.stringify(formData));
    setTimeout(() => setSaveStatus('saved'), 500);
  };

  // Auto-save when form data changes
  useEffect(() => {
    if (saveStatus === 'unsaved') {
      const timer = setTimeout(() => {
        saveFormData();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [formData, saveStatus]);

  // Get role play history for trend chart
  const rolePlayHistory = getRolePlayHistory(selectedRep, 8, selectedWeek);

  const rolePlayTrendData = useMemo(() => {
    const startIdx = Math.max(0, selectedWeekIndex - 7);
    const relevantWeeks = weeks.slice(startIdx, selectedWeekIndex + 1);

    return relevantWeeks.map(week => {
      const weekFormData = formData[week.value]?.[rep.name];
      const weekScores = weekFormData?.rolePlayScores || ROLEPLAY_CRITERIA.map(() => ({ score: 2, notes: '' }));
      const overall = (weekScores.reduce((sum, s) => sum + s.score, 0) / (ROLEPLAY_CRITERIA.length * 5)) * 100;

      return {
        week: new Date(week.value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        overall: overall,
      };
    });
  }, [selectedWeekIndex, weeks, formData, rep.name]);

  // Navigation functions
  const goToPreviousWeek = () => {
    if (selectedWeekIndex > 0) {
      setSelectedWeek(weeks[selectedWeekIndex - 1].value);
    }
  };

  const goToNextWeek = () => {
    if (selectedWeekIndex < weeks.length - 1) {
      setSelectedWeek(weeks[selectedWeekIndex + 1].value);
    }
  };

  const currentData = getCurrentFormData();

  // Calculate overall role play percentage
  const overallRolePlayPercentage = (currentData.rolePlayScores.reduce((sum, s) => sum + s.score, 0) / (ROLEPLAY_CRITERIA.length * 5)) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">1:1 Coaching Prep</h1>
          <p className="text-slate-400">Weekly check-in form for SDR performance tracking</p>
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
          <button
            onClick={saveFormData}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors",
              saveStatus === 'saved' ? "bg-green-600 hover:bg-green-700" :
              saveStatus === 'saving' ? "bg-amber-600" : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            <Save className="w-4 h-4" />
            {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Save'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg text-white transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Week Selector */}
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span className="text-slate-400 text-sm">Select Week:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousWeek}
              disabled={selectedWeekIndex === 0}
              className={cn(
                "p-2 rounded-lg transition-colors",
                selectedWeekIndex === 0
                  ? "text-slate-600 cursor-not-allowed"
                  : "text-slate-400 hover:text-white hover:bg-[#334155]"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[280px]"
            >
              {weeks.map(week => (
                <option key={week.value} value={week.value}>{week.label}</option>
              ))}
            </select>
            <button
              onClick={goToNextWeek}
              disabled={selectedWeekIndex === weeks.length - 1}
              className={cn(
                "p-2 rounded-lg transition-colors",
                selectedWeekIndex === weeks.length - 1
                  ? "text-slate-600 cursor-not-allowed"
                  : "text-slate-400 hover:text-white hover:bg-[#334155]"
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="text-xs text-slate-500">
            Week {selectedWeekIndex + 1} of {weeks.length}
          </div>
        </div>
      </div>

      {/* Rep Header Card */}
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">
            {rep.initials}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{rep.name}</h2>
            <p className="text-slate-400 text-sm">{rep.team} Team • {selectedWeekData?.label}</p>
          </div>
          <div className="ml-auto flex items-center gap-6">
            <div className="text-center">
              <div className={cn(
                "text-2xl font-bold",
                overallRolePlayPercentage >= 70 ? "text-green-400" :
                overallRolePlayPercentage >= 50 ? "text-amber-400" : "text-red-400"
              )}>
                {overallRolePlayPercentage.toFixed(0)}%
              </div>
              <div className="text-xs text-slate-500">Role Play Score</div>
            </div>
            <div className="text-center">
              <div className={cn(
                "text-2xl font-bold",
                repScore.overall_score >= 75 ? "text-green-400" :
                repScore.overall_score >= 60 ? "text-amber-400" : "text-red-400"
              )}>
                {repScore.overall_score}
              </div>
              <div className="text-xs text-slate-500">CoPilot Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Summary - Pulled from Salesforce/Groove/CoPilot */}
      <div className="bg-[#0f172a] rounded-xl border border-[#334155] p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-slate-300">Data Pulled for {selectedWeekData?.label}</h4>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Salesforce</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span>Groove</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>CoPilot</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="bg-[#1e293b] rounded-lg p-2 text-center">
            <div className="text-xs text-blue-400 mb-1">Calls</div>
            <div className="text-lg font-bold text-white">{repActivity?.calls || 0}</div>
            <div className="text-xs text-slate-500">/ {targets.calls}</div>
          </div>
          <div className="bg-[#1e293b] rounded-lg p-2 text-center">
            <div className="text-xs text-purple-400 mb-1">Emails</div>
            <div className="text-lg font-bold text-white">{repActivity?.emails || 0}</div>
            <div className="text-xs text-slate-500">/ {targets.emails}</div>
          </div>
          <div className="bg-[#1e293b] rounded-lg p-2 text-center">
            <div className="text-xs text-blue-400 mb-1">Connects</div>
            <div className="text-lg font-bold text-white">{repActivity?.connects || 0}</div>
            <div className="text-xs text-slate-500">/ {targets.connects}</div>
          </div>
          <div className="bg-[#1e293b] rounded-lg p-2 text-center">
            <div className="text-xs text-blue-400 mb-1">Meetings</div>
            <div className="text-lg font-bold text-white">{repActivity?.meetings_booked || 0}</div>
            <div className="text-xs text-slate-500">/ {targets.meetings}</div>
          </div>
          <div className="bg-[#1e293b] rounded-lg p-2 text-center">
            <div className="text-xs text-blue-400 mb-1">Opps</div>
            <div className="text-lg font-bold text-white">{repActivity?.opps || 0}</div>
            <div className="text-xs text-slate-500">/ {targets.opps}</div>
          </div>
          <div className="bg-[#1e293b] rounded-lg p-2 text-center">
            <div className="text-xs text-green-400 mb-1">Talk %</div>
            <div className="text-lg font-bold text-white">{repActivity?.talk_percentage || 0}%</div>
            <div className="text-xs text-slate-500">/ 50%</div>
          </div>
          <div className="bg-[#1e293b] rounded-lg p-2 text-center">
            <div className="text-xs text-purple-400 mb-1">Open Rate</div>
            <div className="text-lg font-bold text-white">{repEmails?.open_rate || 0}%</div>
          </div>
          <div className="bg-[#1e293b] rounded-lg p-2 text-center">
            <div className="text-xs text-blue-400 mb-1">Pipeline</div>
            <div className="text-lg font-bold text-white">${((repActivity?.pipeline_value || 0) / 1000).toFixed(0)}k</div>
          </div>
        </div>
      </div>

      {/* Section 1: KPI & Opportunity Review (30 min) */}
      <div className="bg-[#1e293b] rounded-xl border border-blue-500/30 p-6">
        <div className="flex items-center gap-2 mb-6">
          <ClipboardList className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-blue-400">1. KPI & Opportunity Review (30 min)</h3>
        </div>

        {/* KPIs vs Targets */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-300 mb-3">KPIs vs. Targets: Goal {targets.calls} calls & {targets.emails} emails</h4>
          <p className="text-xs text-slate-500 mb-3">Review current performance</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Calls</label>
              <input
                type="text"
                value={currentData.calls}
                onChange={(e) => updateField('calls', e.target.value)}
                placeholder={`Target: ${targets.calls}`}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Emails</label>
              <input
                type="text"
                value={currentData.emails}
                onChange={(e) => updateField('emails', e.target.value)}
                placeholder={`Target: ${targets.emails}`}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Sequences</label>
              <input
                type="text"
                value={currentData.sequences}
                onChange={(e) => updateField('sequences', e.target.value)}
                placeholder="Active sequences"
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Pipeline & Opportunities */}
        <div className="mb-6 border-t border-[#334155] pt-4">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Pipeline & Opportunities: Goal {targets.opps} opps</h4>
          <p className="text-xs text-slate-500 mb-3">Walk through pipeline: new opps, stalled deals, ghosted</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Opportunities</label>
              <input
                type="text"
                value={currentData.opportunities}
                onChange={(e) => updateField('opportunities', e.target.value)}
                placeholder="New opportunities"
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Stalled</label>
              <input
                type="text"
                value={currentData.stalled}
                onChange={(e) => updateField('stalled', e.target.value)}
                placeholder="Stalled deals"
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Ghosted</label>
              <input
                type="text"
                value={currentData.ghosted}
                onChange={(e) => updateField('ghosted', e.target.value)}
                placeholder="Ghosted deals"
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">What&apos;s your top priority for pipeline growth this week?</label>
            <textarea
              value={currentData.pipelinePriority}
              onChange={(e) => updateField('pipelinePriority', e.target.value)}
              placeholder="Describe your top priority..."
              rows={2}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Creative Action */}
        <div className="border-t border-[#334155] pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <label className="block text-sm font-medium text-slate-300">One creative action to move something forward?</label>
          </div>
          <textarea
            value={currentData.creativeAction}
            onChange={(e) => updateField('creativeAction', e.target.value)}
            placeholder="Describe a creative action you'll take..."
            rows={2}
            className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>

      {/* Section 2: Call Review & Coaching (30 min) */}
      <div className="bg-[#1e293b] rounded-xl border border-green-500/30 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Phone className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-green-400">2. Call Review & Coaching (30 min)</h3>
        </div>

        {/* Call Activity */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Call Activity: Goal {targets.calls} Calls</h4>
          <p className="text-xs text-slate-500 mb-3">Review call volume, connect rates, and conversion trends</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Calls</label>
              <input
                type="text"
                value={currentData.callActivity}
                onChange={(e) => updateField('callActivity', e.target.value)}
                placeholder="Total calls made"
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Positive Conversation Rate</label>
              <input
                type="text"
                value={currentData.positiveConversationRate}
                onChange={(e) => updateField('positiveConversationRate', e.target.value)}
                placeholder="e.g., 15%"
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Which calls or sequences are getting the best traction? Why?</label>
            <textarea
              value={currentData.tractionNotes}
              onChange={(e) => updateField('tractionNotes', e.target.value)}
              placeholder="Describe what's working..."
              rows={2}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Call Recording Review */}
        <div className="border-t border-[#334155] pt-4">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Call Recording Review</h4>
          <p className="text-xs text-slate-500 mb-3">Listen to 1-2 recent calls together</p>

          <div className="mb-4">
            <label className="block text-xs text-slate-400 mb-1">Call Recording Links/Notes</label>
            <textarea
              value={currentData.callRecordings}
              onChange={(e) => updateField('callRecordings', e.target.value)}
              placeholder="Paste call recording links or notes..."
              rows={2}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs text-slate-400 mb-1">Discuss strengths and areas for improvement</label>
            <textarea
              value={currentData.strengthsAndImprovements}
              onChange={(e) => updateField('strengthsAndImprovements', e.target.value)}
              placeholder="Note strengths and improvement areas from call review..."
              rows={2}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Where do you feel stuck or want coaching?</label>
            <textarea
              value={currentData.coachingNeeds}
              onChange={(e) => updateField('coachingNeeds', e.target.value)}
              placeholder="Describe areas where you need help..."
              rows={2}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Call Analysis Section with IROPNM & BIPSY */}
        <div className="border-t border-[#334155] pt-4 mt-4">
          <div className="flex items-center gap-2 mb-4">
            <h4 className="text-sm font-medium text-slate-300">Call Analysis (IROPNM Scoring + BIPSY Coaching)</h4>
            <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">AI Analysis</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">Analysis of 3 recent calls using IROPNM criteria with BIPSY coaching methodology</p>

          {/* Call Analysis Cards */}
          <div className="space-y-4">
            {generateCallAnalysis(rep.name, selectedWeek).map((call, callIdx) => (
              <div key={call.callId} className="bg-[#0f172a] rounded-lg border border-[#334155] overflow-hidden">
                {/* Call Header */}
                <div className="flex items-center justify-between p-3 bg-[#1a2536] border-b border-[#334155]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm font-bold">
                      {callIdx + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{call.prospect}</div>
                      <div className="text-xs text-slate-400">Duration: {call.duration} | {call.callId}</div>
                    </div>
                  </div>
                  <div className={cn(
                    "text-xs px-2 py-1 rounded",
                    call.outcome === 'Meeting Scheduled' ? "bg-green-500/20 text-green-400" :
                    call.outcome === 'Follow-up Call' || call.outcome === 'Callback Requested' ? "bg-blue-500/20 text-blue-400" :
                    call.outcome === 'Sent Information' ? "bg-amber-500/20 text-amber-400" :
                    "bg-red-500/20 text-red-400"
                  )}>
                    {call.outcome}
                  </div>
                </div>

                {/* IROPNM Scores */}
                <div className="p-3 border-b border-[#334155]">
                  <div className="text-xs text-slate-400 mb-2 font-medium">IROPNM Scores</div>
                  <div className="grid grid-cols-6 gap-2">
                    {call.scores.map((score, idx) => {
                      const criteria = ROLEPLAY_CRITERIA[idx];
                      return (
                        <div key={score.criteria} className="text-center" title={score.notes}>
                          <div className={cn(
                            "w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-xs font-bold",
                            score.score >= 4 ? "bg-green-500/20 text-green-400" :
                            score.score >= 3 ? "bg-amber-500/20 text-amber-400" :
                            "bg-red-500/20 text-red-400"
                          )}>
                            {score.score}
                          </div>
                          <div className="text-xs text-slate-500">{criteria.letter}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-center mt-2 gap-2 text-xs text-slate-400">
                    <span>Average:</span>
                    <span className={cn(
                      "font-bold",
                      (call.scores.reduce((sum, s) => sum + s.score, 0) / call.scores.length) >= 3.5 ? "text-green-400" :
                      (call.scores.reduce((sum, s) => sum + s.score, 0) / call.scores.length) >= 2.5 ? "text-amber-400" :
                      "text-red-400"
                    )}>
                      {(call.scores.reduce((sum, s) => sum + s.score, 0) / call.scores.length).toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* BIPSY Coaching Feedback */}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-slate-300">BIPSY Coaching Feedback</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                      Focus: {ROLEPLAY_CRITERIA.find(c => c.letter === call.scores.reduce((min, s) => s.score < min.score ? s : min, call.scores[0]).criteria)?.name}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex gap-2">
                      <span className="w-20 text-purple-400 font-medium shrink-0">Behavior:</span>
                      <span className="text-slate-300">{call.bipsyCoaching.behavior}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-20 text-blue-400 font-medium shrink-0">Impact:</span>
                      <span className="text-slate-300">{call.bipsyCoaching.impact}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-20 text-amber-400 font-medium shrink-0">Pattern:</span>
                      <span className="text-slate-300">{call.bipsyCoaching.pattern}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-20 text-green-400 font-medium shrink-0">Suggestion:</span>
                      <span className="text-slate-300">{call.bipsyCoaching.suggestion}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-20 text-cyan-400 font-medium shrink-0">Yes-And:</span>
                      <span className="text-slate-300">{call.bipsyCoaching.yesAnd}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* BIPSY Legend */}
          <div className="mt-4 p-3 bg-[#0f172a] rounded-lg border border-[#334155]">
            <div className="text-xs font-medium text-slate-300 mb-2">BIPSY Coaching Methodology</div>
            <div className="grid grid-cols-5 gap-2 text-xs">
              <div className="text-center">
                <span className="text-purple-400 font-bold">B</span>
                <span className="text-slate-500"> - Behavior</span>
              </div>
              <div className="text-center">
                <span className="text-blue-400 font-bold">I</span>
                <span className="text-slate-500"> - Impact</span>
              </div>
              <div className="text-center">
                <span className="text-amber-400 font-bold">P</span>
                <span className="text-slate-500"> - Pattern</span>
              </div>
              <div className="text-center">
                <span className="text-green-400 font-bold">S</span>
                <span className="text-slate-500"> - Suggestion</span>
              </div>
              <div className="text-center">
                <span className="text-cyan-400 font-bold">Y</span>
                <span className="text-slate-500"> - Yes-And</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Role Play Progress */}
      <div className="bg-[#1e293b] rounded-xl border border-amber-500/30 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-amber-400">3. Role Play Scorecard</h3>
          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 ml-2">IROPNM</span>
        </div>

        {/* Current Scores - Editable */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
          {ROLEPLAY_CRITERIA.map((criteria, idx) => {
            const score = currentData.rolePlayScores[idx]?.score || 2;
            return (
              <div key={criteria.letter} className="bg-[#0f172a] rounded-lg p-3 text-center">
                <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-bold bg-amber-500/20 text-amber-400">
                  {criteria.letter}
                </div>
                <div className="text-xs text-slate-400 mb-2">{criteria.name}</div>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      onClick={() => updateRolePlayScore(idx, s)}
                      className={cn(
                        "w-6 h-6 rounded text-xs font-medium transition-all",
                        score === s
                          ? s >= 4 ? "bg-green-500 text-white" : s >= 3 ? "bg-amber-500 text-white" : "bg-red-500 text-white"
                          : "bg-[#334155] text-slate-400 hover:bg-[#475569]"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Overall Score */}
        <div className="flex items-center justify-center gap-4 mb-6 p-4 bg-[#0f172a] rounded-lg">
          <span className="text-slate-400">Overall Score:</span>
          <span className={cn(
            "text-3xl font-bold",
            overallRolePlayPercentage >= 70 ? "text-green-400" :
            overallRolePlayPercentage >= 50 ? "text-amber-400" : "text-red-400"
          )}>
            {overallRolePlayPercentage.toFixed(0)}%
          </span>
          <div className="w-32 bg-slate-700 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all",
                overallRolePlayPercentage >= 70 ? "bg-green-500" :
                overallRolePlayPercentage >= 50 ? "bg-amber-500" : "bg-red-500"
              )}
              style={{ width: `${overallRolePlayPercentage}%` }}
            />
          </div>
        </div>

        {/* Week-over-Week Trend */}
        <div className="border-t border-[#334155] pt-4 mb-4">
          <h4 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Week-over-Week Progress
          </h4>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={rolePlayTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
                formatter={(value) => `${Number(value).toFixed(0)}%`}
              />
              <Line type="monotone" dataKey="overall" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Overall %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Role Play Feedback */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Role Play Feedback & Notes</label>
          <textarea
            value={currentData.rolePlayFeedback}
            onChange={(e) => updateField('rolePlayFeedback', e.target.value)}
            placeholder="Notes from role play session..."
            rows={3}
            className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>

      {/* Section 4: Action Items & Commitments */}
      <div className="bg-[#1e293b] rounded-xl border border-purple-500/30 p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-purple-400">4. Action Items & Commitments</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Action Items for Next Week</label>
            <textarea
              value={currentData.actionItems}
              onChange={(e) => updateField('actionItems', e.target.value)}
              placeholder="List action items..."
              rows={4}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Commitments & Goals</label>
            <textarea
              value={currentData.commitments}
              onChange={(e) => updateField('commitments', e.target.value)}
              placeholder="What are you committing to this week?"
              rows={4}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Score Legend */}
      <div className="bg-[#0f172a] rounded-lg border border-[#334155] p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="text-sm text-slate-400">
            <span className="font-medium text-slate-300">Role Play Scoring:</span>{' '}
            1 = Needs Work | 2 = Developing | 3 = Competent | 4 = Strong | 5 = Excellent
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Salesforce
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Groove
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              CoPilot
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
