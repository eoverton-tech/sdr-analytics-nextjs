// Sample data for the SDR Analytics Dashboard

export interface Rep {
  id: string;
  name: string;
  initials: string;
  team: string;
  avatar?: string;
}

export interface DailyActivity {
  rep_id: string;
  date: string;
  calls: number;
  calls_target: number;
  emails: number;
  emails_target: number;
  connects: number;
  talk_percentage: number;
  opps: number;
  pipeline_value: number;
  status: 'active' | 'inactive' | 'away';
}

export interface CoachingScore {
  rep_id: string;
  week_start: string;
  introduction_quality: number;
  objection_handling: number;
  uncovered_pain: number;
  uncovered_metrics: number;
  scheduled_next_steps: number;
  overall_score: number;
  calls_analyzed: number;
  strengths: string[];
  improvements: string[];
}

export interface FunnelData {
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
  { id: '1', name: 'Sarah Johnson', initials: 'SJ', team: 'Enterprise' },
  { id: '2', name: 'Michael Chen', initials: 'MC', team: 'Enterprise' },
  { id: '3', name: 'Emily Rodriguez', initials: 'ER', team: 'Mid-Market' },
  { id: '4', name: 'David Kim', initials: 'DK', team: 'Mid-Market' },
  { id: '5', name: 'Jessica Williams', initials: 'JW', team: 'SMB' },
  { id: '6', name: 'James Brown', initials: 'JB', team: 'SMB' },
  { id: '7', name: 'Ashley Davis', initials: 'AD', team: 'Enterprise' },
  { id: '8', name: 'Ryan Martinez', initials: 'RM', team: 'Mid-Market' },
];

// Generate daily activity for today
export const getDailyActivity = (): DailyActivity[] => {
  return reps.map((rep, index) => ({
    rep_id: rep.id,
    date: new Date().toISOString().split('T')[0],
    calls: Math.floor(Math.random() * 40) + 30,
    calls_target: 50,
    emails: Math.floor(Math.random() * 40) + 30,
    emails_target: 50,
    connects: Math.floor(Math.random() * 6) + 1,
    talk_percentage: Math.floor(Math.random() * 30) + 35,
    opps: Math.floor(Math.random() * 3),
    pipeline_value: Math.floor(Math.random() * 100000) + 25000,
    status: index < 6 ? 'active' : (index === 6 ? 'away' : 'inactive'),
  }));
};

// Generate coaching scores
export const getCoachingScores = (): CoachingScore[] => {
  return reps.map(rep => ({
    rep_id: rep.id,
    week_start: new Date().toISOString().split('T')[0],
    introduction_quality: Math.floor(Math.random() * 30) + 60,
    objection_handling: Math.floor(Math.random() * 30) + 55,
    uncovered_pain: Math.floor(Math.random() * 30) + 50,
    uncovered_metrics: Math.floor(Math.random() * 30) + 45,
    scheduled_next_steps: Math.floor(Math.random() * 30) + 60,
    overall_score: Math.floor(Math.random() * 25) + 60,
    calls_analyzed: Math.floor(Math.random() * 10) + 8,
    strengths: [
      'Strong opening with clear value proposition',
      'Good follow-up questions',
      'Handles objections with empathy',
    ].slice(0, Math.floor(Math.random() * 2) + 1),
    improvements: [
      'Work on quantifying business impact',
      'Be more specific about next step timing',
      'Ask more probing questions about pain points',
    ].slice(0, Math.floor(Math.random() * 2) + 1),
  }));
};

// Team summary data
export const getTeamSummary = () => {
  const activity = getDailyActivity();
  return {
    totalCalls: activity.reduce((sum, a) => sum + a.calls, 0),
    callsTarget: activity.length * 50,
    totalEmails: activity.reduce((sum, a) => sum + a.emails, 0),
    emailsTarget: activity.length * 50,
    totalConnects: activity.reduce((sum, a) => sum + a.connects, 0),
    totalOpps: activity.reduce((sum, a) => sum + a.opps, 0),
    weeklyOppsTarget: 12.5,
    pipelineValue: activity.reduce((sum, a) => sum + a.pipeline_value, 0),
    pipelineTarget: 9000000,
    positiveConversations: Math.floor(Math.random() * 5) + 2,
    activeReps: activity.filter(a => a.status === 'active').length,
    totalReps: activity.length,
  };
};

// Funnel data
export const getFunnelData = (): FunnelData => ({
  contacts_reached: 1250,
  conversations: 156,
  meetings_booked: 42,
  opportunities: 18,
  pipeline_value: 845000,
});

// Trend data for charts (last 12 weeks)
export const getTrendData = (): TrendData[] => {
  const data: TrendData[] = [];
  const today = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - (i * 7));

    data.push({
      date: date.toISOString().split('T')[0],
      calls: Math.floor(Math.random() * 200) + 300,
      emails: Math.floor(Math.random() * 150) + 250,
      connects: Math.floor(Math.random() * 30) + 20,
      meetings: Math.floor(Math.random() * 15) + 5,
    });
  }

  return data;
};

// Coaching priorities
export const getCoachingPriorities = () => {
  const scores = getCoachingScores();
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
