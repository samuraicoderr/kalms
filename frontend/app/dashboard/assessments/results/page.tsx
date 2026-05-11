"use client";

import { useEffect, useState } from "react";
import { Card, MiniTrend, PageHeader, PrimaryLink, SecondaryLink, SoftIcon } from "../../components/DashboardUI";
import { Routes } from "@/lib/api/FrontendRoutes";
import { AssessmentService } from "@/lib/api/services/AssessmentService";
import type { Assessment } from "@/lib/api/types";
import { Brain, HeartPulse, Lightbulb, ShieldCheck } from "lucide-react";

function label(value?: string | null) {
  return value ? value.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "No result yet";
}

export default function AssessmentResultsPage() {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AssessmentService.latest()
      .then(setAssessment)
      .finally(() => setLoading(false));
  }, []);

  const prediction = assessment?.prediction;
  const scores = assessment?.score_summary ?? { phq9: null, gad7: null, pss10: null, total: 0 };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Assessment results"
        title={loading ? "Loading your latest result..." : prediction ? `Your current category is ${label(prediction.category)}.` : "No assessment result yet."}
        description="This summary combines questionnaire scores with recent mood check-ins to suggest practical next steps."
        action={
          <div className="flex flex-wrap gap-3">
            <PrimaryLink href={Routes.dashboardRoutes.chat}>Discuss results</PrimaryLink>
            <SecondaryLink href={Routes.dashboardRoutes.assessmentHistory}>View history</SecondaryLink>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="bg-[#fbfaff]">
          <SoftIcon icon={Brain} tone="purple" />
          <p className="mt-6 text-sm font-medium text-primary">AI wellness category</p>
          <h2 className="mt-2 text-4xl font-semibold text-[#111827]">{label(prediction?.category)}</h2>
          <p className="mt-3 text-sm leading-6 text-[#6b7280]">
            {prediction?.explanation || "Complete an assessment to generate a private wellness summary."}
          </p>
          <div className="mt-6 rounded-[18px] bg-white p-4">
            <p className="text-sm font-semibold text-[#111827]">Confidence signal</p>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(Number(prediction?.confidence ?? 0) * 100)}%` }} />
            </div>
            <p className="mt-2 text-xs text-[#6b7280]">Based on current scores and recent check-ins</p>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-medium text-primary">Score breakdown</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#111827]">Three assessment lenses</h2>
          <div className="mt-6 space-y-4">
            {[
              ["PHQ-9", scores.phq9, 27],
              ["GAD-7", scores.gad7, 21],
              ["PSS-10", scores.pss10, 40],
            ].map(([name, value, max]) => (
              <div key={name as string}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-[#111827]">{name}</span>
                  <span className="text-[#6b7280]">{value ?? "-"}/{max}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${value ? Math.round((Number(value) / Number(max)) * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-3">
            <SoftIcon icon={HeartPulse} tone="blue" />
            <div>
              <p className="text-sm font-medium text-primary">Trend context</p>
              <h2 className="text-xl font-semibold text-[#111827]">{label(prediction?.trend_signal)}</h2>
            </div>
          </div>
          <div className="mt-4">
            <MiniTrend values={[54, 50, 48, 53, 57, 61, 65]} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <SoftIcon icon={Lightbulb} tone="amber" />
            <div>
              <p className="text-sm font-medium text-primary">Recommendations</p>
              <h2 className="text-xl font-semibold text-[#111827]">Small next steps</h2>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {(prediction?.recommendations ?? []).map((item) => (
              <div key={item.id} className="flex gap-3 rounded-[18px] bg-[#f8fafc] p-4">
                <ShieldCheck size={18} className="mt-0.5 text-primary" />
                <p className="text-sm leading-6 text-[#6b7280]">{item.body}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
