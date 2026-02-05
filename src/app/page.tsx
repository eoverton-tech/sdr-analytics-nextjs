"use client";

import { Phone, Mail, MessageSquare, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { TeamActivity } from "@/components/TeamActivity";
import { CoachingPriorities } from "@/components/CoachingPriorities";
import { AlertBanner } from "@/components/AlertBanner";
import { getTeamSummary } from "@/lib/data";

export default function Home() {
  const summary = getTeamSummary();

  return (
    <div className="space-y-6">
      {/* Alerts */}
      <AlertBanner
        message="2 reps need immediate attention"
        type="warning"
        actionText="Review now"
        actionHref="/coaching"
      />
      <AlertBanner
        message={`Only ${summary.totalOpps} opps this week - team is behind pace`}
        type="info"
        actionText="View analytics"
        actionHref="/analytics"
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Weekly Opps"
          value={summary.totalOpps}
          target={summary.weeklyOppsTarget}
          icon={TrendingUp}
          iconColor="text-blue-500"
        />
        <MetricCard
          title="Today's Calls"
          value={summary.totalCalls}
          target={summary.callsTarget}
          icon={Phone}
          iconColor="text-amber-500"
        />
        <MetricCard
          title="Today's Emails"
          value={summary.totalEmails}
          target={summary.emailsTarget}
          icon={Mail}
          iconColor="text-purple-500"
        />
        <MetricCard
          title="Positive Conversations"
          value={summary.positiveConversations}
          icon={MessageSquare}
          iconColor="text-orange-500"
          showProgress={false}
        />
        <MetricCard
          title="$9M Progress"
          value={`$${Math.round(summary.pipelineValue / 1000)}k`}
          suffix="this week"
          icon={TrendingUp}
          iconColor="text-green-500"
          showProgress={false}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TeamActivity />
        </div>
        <div>
          <CoachingPriorities />
        </div>
      </div>
    </div>
  );
}
