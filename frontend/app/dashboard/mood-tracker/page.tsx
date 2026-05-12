"use client";

import { useEffect, useState } from "react";
import { Card, MoodBars, PageHeader, PrimaryLink, SoftIcon } from "../components/DashboardUI";
import { DailyCheckInForm } from "../components/DailyCheckInForm";
import { Routes } from "@/lib/api/FrontendRoutes";
import { MoodService } from "@/lib/api/services/MoodService";
import type { MoodLog, MoodSummary } from "@/lib/api/types";
import { CalendarDays, Heart, NotebookPen, Wind, Zap } from "lucide-react";

export default function MoodTrackerPage() {
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [summary, setSummary] = useState<MoodSummary | null>(null);

  useEffect(() => {
    MoodService.list().then(setLogs).catch(() => setLogs([]));
    MoodService.summary(7).then(setSummary).catch(() => setSummary(null));
  }, []);

  const average = (key: "mood" | "energy" | "stress") => {
    const value = summary?.averages[key];
    return value === null || value === undefined ? "0.0" : value.toFixed(1);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Mood tracker"
        title="Track feelings without turning them into homework."
        description="Log mood, energy, stress, and optional notes. Over time, Kalms turns small check-ins into helpful patterns."
        action={<PrimaryLink href={Routes.dashboardRoutes.dailyCheckIn}>New check-in</PrimaryLink>}
      />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <DailyCheckInForm />
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">This week</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#111827]">
                {summary?.count ? "Your check-ins are building a pattern." : "Your first check-in will start the trend."}
              </h2>
            </div>
            <SoftIcon icon={CalendarDays} tone="blue" />
          </div>
          <MoodBars points={summary?.points ?? []} />
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Heart, title: "Mood average", value: `${average("mood")}/10`, body: "Based on this week", tone: "purple" as const },
          { icon: Zap, title: "Energy average", value: `${average("energy")}/10`, body: "Based on this week", tone: "green" as const },
          { icon: Wind, title: "Stress average", value: `${average("stress")}/10`, body: "Based on this week", tone: "amber" as const },
        ].map((item) => (
          <Card key={item.title} className="p-5">
            <SoftIcon icon={item.icon} tone={item.tone} />
            <p className="mt-5 text-sm text-[#6b7280]">{item.title}</p>
            <p className="mt-1 text-3xl font-semibold text-[#111827]">{item.value}</p>
            <p className="mt-2 text-sm text-[#6b7280]">{item.body}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex gap-4">
          <SoftIcon icon={NotebookPen} tone="purple" />
          <div>
            <h2 className="text-xl font-semibold text-[#111827]">Reflection notes</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
              Your latest notes stay private and help future insights feel more grounded.
            </p>
            <div className="mt-4 space-y-3">
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} className="rounded-[18px] bg-[#f8fafc] p-4">
                  <p className="text-sm font-semibold text-[#111827]">{log.log_date}</p>
                  <p className="mt-1 text-sm text-[#6b7280]">{log.note || "No note added."}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
