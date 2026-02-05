// SDR Analytics Dashboard Data
// Data structure designed for integration with Salesforce, Groove, and CoPilot

export interface Rep {
  id: string;
  name: string;
  initials: string;
  team: string;
  avatar?: string;
}

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly';

// Data source indicators
export interface DataSource {
  salesforce: boolean;
  groove: boolean;
  copilot: boolean;
}

export interface DailyActivity {
  rep_id: string;
  date: string;
  // Salesforce metrics
  calls: number;
  calls_target: number;
  connects: number;
  opps: number;
  pipeline_value: number;
  meetings_booked: number;
  // Groove metrics (emails)
  emails: number;
  emails_target: number;
  open_rate: number;
  response_rate: number;
  personalization_score: number;
  // CoPilot metrics (call quality)
  talk_percentage: number;
  introduction_score: number;
  reason_for_calling_score: number;
  objection_handling_score: number;
  pain_discovery_score: number;
  metrics_score: number;
  next_steps_score: number;
  // Status
  status: 'active' | 'inactive' | 'away';
}

export interface CoachingScore {
  rep_id: string;
  week_start: string;
  // CoPilot-derived scores
  introduction_quality: number;
  objection_handling: number;
  uncovered_pain: number;
  uncovered_metrics: number;
  scheduled_next_steps: number;
  reason_for_calling: number;
  overall_score: number;
  calls_analyzed: number;
  strengths: string[];
  improvements: string[];
}

export interface RolePlayScore {
  rep_id: string;
  week_start: string;
  introduction: number;
  reason_for_calling: number;
  overcome_objection: number;
  uncover_pain: number;
  metrics: number;
  next_steps: number;
  overall_percentage: number;
  notes: string;
}

export interface EmailMetrics {
  rep_id: string;
  period: TimePeriod;
  emails_sent: number;
  emails_target: number;
  open_rate: number;
  response_rate: number;
  personalization_score: number;
  sequences_active: number;
  sequences_completed: number;
}

export interface FunnelData {
  rep_id?: string; // Optional - if null, it's team-level
  period: TimePeriod;
  contacts_reached: number;
  conversations: number;
  meetings_booked: number;
  opportunities: number;
  pipeline_value: number;
}

export interface TrendData {
  date: string;
  calls: number;
  emails: number;
  connects: number;
  meetings: number;
}

// Sample Reps
export const reps: Rep[] = [
  { id: '1', name: 'Jordan Conneely', initials: 'JC', team: 'Enterprise' },
  { id: '2', name: 'Ryan Sherman', initials: 'RS', team: 'Enterprise' },
  { id: '3', name: 'John Brown', initials: 'JB', team: 'Mid-Market' },
  { id: '4', name: 'Misti Gibbens', initials: 'MG', team: 'Mid-Market' },
  { id: '5', name: 'Allison Jean-Pierre', initials: 'AJ', team: 'SMB' },
];

// KPI Targets
export const kpiTargets = {
  daily: {
    calls: 50,
    emails: 50,
    connects: 5,
    meetings: 2,
    opps: 1,
    pipeline: 25000,
    talk_percentage: 50,
  },
  weekly: {
    calls: 250,
    emails: 250,
    connects: 25,
    meetings: 10,
    opps: 3,
    pipeline: 100000,
    talk_percentage: 50,
  },
  monthly: {
    calls: 1000,
    emails: 1000,
    connects: 100,
    meetings: 40,
    opps: 12,
    pipeline: 400000,
    talk_percentage: 50,
  },
  quarterly: {
    calls: 3000,
    emails: 3000,
    connects: 300,
    meetings: 120,
    opps: 36,
    pipeline: 1200000,
    talk_percentage: 50,
  },
};

// Seeded random number generator for consistent data per week/rep
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Generate a seed from a date string and rep id
const generateSeed = (dateStr: string, repId: string, offset: number = 0) => {
  const dateNum = new Date(dateStr).getTime();
  const repNum = parseInt(repId) * 1000;
  return dateNum + repNum + offset;
};

// Generate daily activity for a specific week (simulating Salesforce + Groove + CoPilot data)
export const getDailyActivity = (period: TimePeriod = 'daily', weekStart?: string): DailyActivity[] => {
  const multiplier = period === 'daily' ? 1 : period === 'weekly' ? 5 : period === 'monthly' ? 20 : 60;
  const dateStr = weekStart || new Date().toISOString().split('T')[0];

  return reps.map((rep, index) => {
    const seed = generateSeed(dateStr, rep.id, 0);
    const rand = (offset: number) => seededRandom(seed + offset);

    return {
      rep_id: rep.id,
      date: dateStr,
      // Salesforce metrics
      calls: Math.floor((rand(1) * 40 + 30) * multiplier),
      calls_target: kpiTargets[period]?.calls || 50 * multiplier,
      connects: Math.floor((rand(2) * 6 + 1) * multiplier),
      opps: Math.floor(rand(3) * 3 * (multiplier / 5)),
      pipeline_value: Math.floor((rand(4) * 100000 + 25000) * (multiplier / 5)),
      meetings_booked: Math.floor((rand(5) * 3 + 1) * (multiplier / 5)),
      // Groove metrics
      emails: Math.floor((rand(6) * 40 + 30) * multiplier),
      emails_target: kpiTargets[period]?.emails || 50 * multiplier,
      open_rate: Math.floor(rand(7) * 30) + 40,
      response_rate: Math.floor(rand(8) * 15) + 5,
      personalization_score: Math.floor(rand(9) * 30) + 60,
      // CoPilot metrics
      talk_percentage: Math.floor(rand(10) * 30) + 35,
      introduction_score: Math.floor(rand(11) * 3) + 2,
      reason_for_calling_score: Math.floor(rand(12) * 3) + 2,
      objection_handling_score: Math.floor(rand(13) * 3) + 2,
      pain_discovery_score: Math.floor(rand(14) * 3) + 2,
      metrics_score: Math.floor(rand(15) * 3) + 2,
      next_steps_score: Math.floor(rand(16) * 3) + 2,
      status: index < 5 ? 'active' : (index === 5 ? 'away' : 'inactive'),
    };
  });
};

// Generate coaching scores for a specific week (CoPilot data)
export const getCoachingScores = (weekStart?: string): CoachingScore[] => {
  const dateStr = weekStart || new Date().toISOString().split('T')[0];

  return reps.map(rep => {
    const seed = generateSeed(dateStr, rep.id, 100);
    const rand = (offset: number) => seededRandom(seed + offset);

    const strengthOptions = [
      'Strong opening with clear value proposition',
      'Good follow-up questions',
      'Handles objections with empathy',
      'Excellent rapport building',
      'Clear and confident communication',
    ];

    const improvementOptions = [
      'Work on quantifying business impact',
      'Be more specific about next step timing',
      'Ask more probing questions about pain points',
      'Practice handling budget objections',
      'Focus on active listening',
    ];

    const numStrengths = Math.floor(rand(20) * 2) + 1;
    const numImprovements = Math.floor(rand(21) * 2) + 1;

    return {
      rep_id: rep.id,
      week_start: dateStr,
      introduction_quality: Math.floor(rand(1) * 30) + 60,
      objection_handling: Math.floor(rand(2) * 30) + 55,
      uncovered_pain: Math.floor(rand(3) * 30) + 50,
      uncovered_metrics: Math.floor(rand(4) * 30) + 45,
      scheduled_next_steps: Math.floor(rand(5) * 30) + 60,
      reason_for_calling: Math.floor(rand(6) * 30) + 55,
      overall_score: Math.floor(rand(7) * 25) + 60,
      calls_analyzed: Math.floor(rand(8) * 10) + 8,
      strengths: strengthOptions.slice(0, numStrengths),
      improvements: improvementOptions.slice(0, numImprovements),
    };
  });
};

// Get Role Play scores for a specific week
export const getRolePlayScores = (weekStart?: string): RolePlayScore[] => {
  const dateStr = weekStart || new Date().toISOString().split('T')[0];

  return reps.map(rep => {
    const seed = generateSeed(dateStr, rep.id, 200);
    const rand = (offset: number) => seededRandom(seed + offset);

    const scores = {
      introduction: Math.floor(rand(1) * 3) + 2,
      reason_for_calling: Math.floor(rand(2) * 3) + 2,
      overcome_objection: Math.floor(rand(3) * 3) + 2,
      uncover_pain: Math.floor(rand(4) * 3) + 2,
      metrics: Math.floor(rand(5) * 3) + 2,
      next_steps: Math.floor(rand(6) * 3) + 2,
    };
    const total = Object.values(scores).reduce((sum, s) => sum + s, 0);
    return {
      rep_id: rep.id,
      week_start: dateStr,
      ...scores,
      overall_percentage: Math.round((total / 30) * 100),
      notes: '',
    };
  });
};

// Get Email metrics for a specific week (Groove data)
export const getEmailMetrics = (period: TimePeriod = 'weekly', weekStart?: string): EmailMetrics[] => {
  const multiplier = period === 'daily' ? 1 : period === 'weekly' ? 5 : period === 'monthly' ? 20 : 60;
  const dateStr = weekStart || new Date().toISOString().split('T')[0];

  return reps.map(rep => {
    const seed = generateSeed(dateStr, rep.id, 300);
    const rand = (offset: number) => seededRandom(seed + offset);

    return {
      rep_id: rep.id,
      period,
      emails_sent: Math.floor((rand(1) * 40 + 30) * multiplier),
      emails_target: kpiTargets[period]?.emails || 50 * multiplier,
      open_rate: Math.floor(rand(2) * 30) + 40,
      response_rate: Math.floor(rand(3) * 15) + 5,
      personalization_score: Math.floor(rand(4) * 30) + 60,
      sequences_active: Math.floor(rand(5) * 5) + 3,
      sequences_completed: Math.floor(rand(6) * 10) + 5,
    };
  });
};

// Team summary data
export const getTeamSummary = (period: TimePeriod = 'weekly', weekStart?: string) => {
  const activity = getDailyActivity(period, weekStart);
  const targets = kpiTargets[period];
  return {
    totalCalls: activity.reduce((sum, a) => sum + a.calls, 0),
    callsTarget: activity.length * (targets?.calls || 250),
    totalEmails: activity.reduce((sum, a) => sum + a.emails, 0),
    emailsTarget: activity.length * (targets?.emails || 250),
    totalConnects: activity.reduce((sum, a) => sum + a.connects, 0),
    totalOpps: activity.reduce((sum, a) => sum + a.opps, 0),
    weeklyOppsTarget: targets?.opps || 12.5,
    pipelineValue: activity.reduce((sum, a) => sum + a.pipeline_value, 0),
    pipelineTarget: 9000000,
    totalMeetings: activity.reduce((sum, a) => sum + a.meetings_booked, 0),
    positiveConversations: Math.floor(seededRandom(new Date(weekStart || new Date()).getTime()) * 5) + 2,
    activeReps: activity.filter(a => a.status === 'active').length,
    totalReps: activity.length,
    avgTalkPercent: Math.round(activity.reduce((sum, a) => sum + a.talk_percentage, 0) / activity.length),
    avgOpenRate: Math.round(activity.reduce((sum, a) => sum + a.open_rate, 0) / activity.length),
    avgResponseRate: Math.round(activity.reduce((sum, a) => sum + a.response_rate, 0) / activity.length),
  };
};

// Funnel data - now supports per-rep, time periods, and specific weeks
export const getFunnelData = (period: TimePeriod = 'weekly', repId?: string, weekStart?: string): FunnelData => {
  const multiplier = period === 'daily' ? 0.2 : period === 'weekly' ? 1 : period === 'monthly' ? 4 : 12;
  const dateStr = weekStart || new Date().toISOString().split('T')[0];
  const seed = generateSeed(dateStr, repId || '0', 400);
  const rand = (offset: number) => seededRandom(seed + offset);

  if (repId) {
    // Individual rep funnel
    return {
      rep_id: repId,
      period,
      contacts_reached: Math.floor((rand(1) * 100 + 150) * multiplier),
      conversations: Math.floor((rand(2) * 20 + 20) * multiplier),
      meetings_booked: Math.floor((rand(3) * 5 + 5) * multiplier),
      opportunities: Math.floor((rand(4) * 2 + 2) * multiplier),
      pipeline_value: Math.floor((rand(5) * 50000 + 100000) * multiplier),
    };
  }

  // Team funnel
  return {
    period,
    contacts_reached: Math.floor(1250 * multiplier),
    conversations: Math.floor(156 * multiplier),
    meetings_booked: Math.floor(42 * multiplier),
    opportunities: Math.floor(18 * multiplier),
    pipeline_value: Math.floor(845000 * multiplier),
  };
};

// Get individual rep funnel data for all reps
export const getAllRepFunnels = (period: TimePeriod = 'weekly', weekStart?: string): FunnelData[] => {
  return reps.map(rep => getFunnelData(period, rep.id, weekStart));
};

// Trend data for charts (last 12 weeks from a specific date)
export const getTrendData = (period: TimePeriod = 'weekly', weekStart?: string): TrendData[] => {
  const data: TrendData[] = [];
  const baseDate = weekStart ? new Date(weekStart) : new Date();
  const intervals = period === 'daily' ? 14 : period === 'weekly' ? 12 : period === 'monthly' ? 12 : 8;
  const dayMultiplier = period === 'daily' ? 1 : period === 'weekly' ? 7 : period === 'monthly' ? 30 : 90;

  for (let i = intervals - 1; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - (i * dayMultiplier));
    const dateStr = date.toISOString().split('T')[0];
    const seed = generateSeed(dateStr, '0', 500);
    const rand = (offset: number) => seededRandom(seed + offset);

    data.push({
      date: dateStr,
      calls: Math.floor(rand(1) * 200) + 300,
      emails: Math.floor(rand(2) * 150) + 250,
      connects: Math.floor(rand(3) * 30) + 20,
      meetings: Math.floor(rand(4) * 15) + 5,
    });
  }

  return data;
};

// Coaching priorities for a specific week
export const getCoachingPriorities = (weekStart?: string) => {
  const scores = getCoachingScores(weekStart);
  return scores
    .map(score => {
      const rep = reps.find(r => r.id === score.rep_id)!;
      const lowestCategory = Object.entries({
        'Introduction': score.introduction_quality,
        'Objection Handling': score.objection_handling,
        'Pain Discovery': score.uncovered_pain,
        'Metrics': score.uncovered_metrics,
        'Next Steps': score.scheduled_next_steps,
      }).sort((a, b) => a[1] - b[1])[0];

      return {
        rep,
        score: score.overall_score,
        focus: lowestCategory[0],
        priority: score.overall_score < 60 ? 'High' : score.overall_score < 75 ? 'Medium' : 'Low',
      };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);
};

// Get week-over-week history for role plays (going back from a specific week)
export const getRolePlayHistory = (repId: string, weeks: number = 8, fromWeekStart?: string): RolePlayScore[] => {
  const history: RolePlayScore[] = [];
  const baseDate = fromWeekStart ? new Date(fromWeekStart) : new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekDate = new Date(baseDate);
    weekDate.setDate(weekDate.getDate() - (i * 7));
    const dateStr = weekDate.toISOString().split('T')[0];

    const seed = generateSeed(dateStr, repId, 200);
    const rand = (offset: number) => seededRandom(seed + offset);

    const scores = {
      introduction: Math.floor(rand(1) * 3) + 2,
      reason_for_calling: Math.floor(rand(2) * 3) + 2,
      overcome_objection: Math.floor(rand(3) * 3) + 2,
      uncover_pain: Math.floor(rand(4) * 3) + 2,
      metrics: Math.floor(rand(5) * 3) + 2,
      next_steps: Math.floor(rand(6) * 3) + 2,
    };
    const total = Object.values(scores).reduce((sum, s) => sum + s, 0);

    history.push({
      rep_id: repId,
      week_start: dateStr,
      ...scores,
      overall_percentage: Math.round((total / 30) * 100),
      notes: '',
    });
  }

  return history;
};
