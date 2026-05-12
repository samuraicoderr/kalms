"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  MetricCard,
  MiniTrend,
  PageHeader,
  PrimaryLink,
  SoftIcon,
  type Tone,
} from "../components/DashboardUI";
import { Routes } from "@/lib/api/FrontendRoutes";
import { DashboardService } from "@/lib/api/services/DashboardService";
import type { InsightsSummary } from "@/lib/api/types";
import { Brain, CalendarClock, Heart, LineChart, TrendingUp } from "lucide-react";

const metricIcons = {
  wellness_direction: TrendingUp,
  stress_average: CalendarClock,
  check_in_count: Heart,
} as const;

const metricTones: Record<string, Tone> = {
  wellness_direction: "green",
  stress_average: "amber",
  check_in_count: "purple",
};

function titleCase(value: string | null) {
  if (!value) return "No result yet";
  return value.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<InsightsSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    DashboardService.insights()
      .then(setInsights)
      .catch(() => setError("We could not load your insights yet."));
  }, []);

  const trendValues = useMemo(
    () =>
      insights?.trend_points
        .filter((point) => point.wellness_score !== null)
        .map((point) => Math.round(((point.wellness_score ?? 0) / 30) * 100)) ?? [],
    [insights]
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Insights"
        title="Patterns that help you care for yourself earlier."
        description="Kalms turns check-ins and assessments into readable trends, so you can notice pressure before it becomes too heavy."
        action={<PrimaryLink href={Routes.dashboardRoutes.moodTracker}>Log today</PrimaryLink>}
      />

      {error && <Card className="border-red-100 bg-red-50 text-sm font-medium text-red-700">{error}</Card>}

      <div className="grid gap-4 md:grid-cols-3">
        {(insights?.metrics ?? []).map((metric) => {
          const Icon = metricIcons[metric.key as keyof typeof metricIcons] ?? LineChart;
          return (
            <MetricCard
              key={metric.key}
              icon={Icon}
              label={metric.label}
              value={metric.value}
              detail={metric.helper}
              tone={metricTones[metric.key] ?? "blue"}
            />
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <p className="text-sm font-medium text-primary">Combined wellness index</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#111827]">
            {trendValues.length ? "Your recent check-ins are ready to review." : "Your check-ins will shape this view."}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#6b7280]">
            This combines mood, energy, and stress logs from the last seven days.
          </p>
          <div className="mt-6">
            <MiniTrend values={trendValues} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <SoftIcon icon={Brain} tone="purple" />
            <div>
              <p className="text-sm font-medium text-primary">AI summary</p>
              <h2 className="text-xl font-semibold text-[#111827]">This week&apos;s read</h2>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-[#6b7280]">
            Current status is {titleCase(insights?.summary.latest_category ?? null).toLowerCase()} with a{" "}
            {titleCase(insights?.summary.trend_signal ?? "unknown").toLowerCase()} trend. Keep logging mood and assessments
            to make this summary more specific.
          </p>
        </Card>
      </div>

      <div className="space-y-4">
        {(insights?.cards ?? []).map((card) => (
          <div key={card.key} className="flex gap-4 rounded-[18px] border border-[#e5e7eb] bg-white p-4">
            <SoftIcon icon={LineChart} tone={card.tone === "warning" ? "amber" : card.tone === "positive" ? "green" : "purple"} />
            <div>
              <h3 className="font-semibold text-[#111827]">{card.title}</h3>
              <p className="mt-1 text-sm leading-6 text-[#6b7280]">{card.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
