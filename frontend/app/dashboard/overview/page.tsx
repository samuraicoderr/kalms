"use client";

import { useEffect, useState } from "react";
import {
  Card,
  MetricCard,
  MiniTrend,
  PageHeader,
  PrimaryLink,
  SecondaryLink,
  quickActions,
} from "../components/DashboardUI";
import { DailyCheckInForm } from "../components/DailyCheckInForm";
import { Routes } from "@/lib/api/FrontendRoutes";
import { DashboardService } from "@/lib/api/services/DashboardService";
import type { DashboardSummary } from "@/lib/api/types";
import { BookOpenCheck, Brain, Target, TrendingUp } from "lucide-react";

function titleCase(value: string | null) {
  if (!value) return "No result yet";
  return value.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function OverviewPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    DashboardService.summary()
      .then(setSummary)
      .catch(() => setError("We could not load your dashboard yet."));
  }, []);

  const date = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const weeklyValues = summary?.weekly_mood.map((point) => point.wellness_score ?? 45) ?? [42, 46, 40, 55, 49, 62, 68];
  const scores = summary?.latest_scores ?? { phq9: null, gad7: null, pss10: null, total: 0 };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={date}
        title="Good to see you. Let's check in gently."
        description="A calm snapshot of your assessments, mood logs, and the small habits helping you stay steady."
        action={
          <div className="flex flex-wrap gap-3">
            <PrimaryLink href={Routes.dashboardRoutes.startAssessment}>Start assessment</PrimaryLink>
            <SecondaryLink href={Routes.dashboardRoutes.chat}>Talk to Kalms</SecondaryLink>
          </div>
        }
      />

      {error && <Card className="border-red-100 bg-red-50 text-sm font-medium text-red-700">{error}</Card>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={BookOpenCheck} label="Assessments" value={String(summary?.total_assessments ?? 0)} detail="completed" tone="purple" />
        <MetricCard icon={Target} label="Check-in streak" value={`${summary?.current_streak ?? 0} days`} detail="current" tone="green" />
        <MetricCard icon={Brain} label="Current status" value={titleCase(summary?.latest_category ?? null)} detail="latest" tone="blue" />
        <MetricCard icon={TrendingUp} label="Trend" value={titleCase(summary?.trend_signal ?? "unknown")} detail="weekly" tone="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Wellness trend</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#111827]">
                {summary ? "Your recent check-ins are ready to review." : "Loading your wellness pattern..."}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
                Mood, energy, and stress logs feed this weekly signal. Keep checking in to make the chart more useful.
              </p>
            </div>
            <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              {titleCase(summary?.trend_signal ?? "unknown")}
            </span>
          </div>
          <div className="mt-6">
            <MiniTrend values={weeklyValues} />
          </div>
        </Card>

        <DailyCheckInForm />
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <p className="text-sm font-medium text-primary">Latest assessment</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#111827]">{titleCase(summary?.latest_category ?? null)}</h2>
          <p className="mt-2 text-sm leading-6 text-[#6b7280]">
            {summary?.latest_assessment ? "Your latest result is stored privately and available in history." : "Complete an assessment to see your score breakdown here."}
          </p>
          <div className="mt-6 space-y-4">
            {[
              ["PHQ-9", scores.phq9, 27],
              ["GAD-7", scores.gad7, 21],
              ["PSS-10", scores.pss10, 40],
            ].map(([label, value, max]) => (
              <div key={label as string}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-[#111827]">{label}</span>
                  <span className="text-[#6b7280]">{value ?? "-"}/{max}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${value ? Math.round((Number(value) / Number(max)) * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-sm font-medium text-primary">Quick actions</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <a key={action.title} href={action.href} className="flex items-center justify-between rounded-[18px] border border-[#e5e7eb] bg-[#f8fafc] p-4 transition hover:border-primary/20 hover:bg-[#fbfaff]">
                  <span className="flex items-center gap-3 text-sm font-semibold text-[#111827]">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-primary">
                      <Icon size={18} />
                    </span>
                    {action.title}
                  </span>
                  <span className="text-primary">Go</span>
                </a>
              );
            })}
          </div>
        </Card>
      </div>

      {summary?.recommendations.length ? (
        <Card>
          <p className="text-sm font-medium text-primary">Recommendations</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {summary.recommendations.map((item) => (
              <div key={item.id} className="rounded-[18px] bg-[#f8fafc] p-4">
                <p className="font-semibold text-[#111827]">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-[#6b7280]">{item.body}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
