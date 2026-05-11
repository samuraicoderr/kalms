"use client";

import { useEffect, useState } from "react";
import { Card, EmptyState, PageHeader, PrimaryLink, SoftIcon } from "../components/DashboardUI";
import { Routes } from "@/lib/api/FrontendRoutes";
import { AssessmentService } from "@/lib/api/services/AssessmentService";
import type { Assessment } from "@/lib/api/types";
import { CalendarDays, Download, History, Search } from "lucide-react";

function label(value: string) {
  return value.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AssessmentHistoryPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  useEffect(() => {
    AssessmentService.history().then(setAssessments).catch(() => setAssessments([]));
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Assessment history"
        title="A clear record of your wellbeing over time."
        description="Review past assessments, compare patterns, and revisit recommendations when you need them."
        action={<PrimaryLink href={Routes.dashboardRoutes.startAssessment}>New assessment</PrimaryLink>}
      />

      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <SoftIcon icon={History} tone="purple" />
            <div>
              <h2 className="text-xl font-semibold text-[#111827]">Recent assessments</h2>
              <p className="text-sm text-[#6b7280]">Sorted by newest first</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-full border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#6b7280]">
              <Search size={16} />
              Filter
            </button>
            <button className="inline-flex items-center gap-2 rounded-full border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#6b7280]">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[18px] border border-[#e5e7eb]">
          {assessments.map((assessment) => (
            <div key={assessment.id} className="grid gap-3 border-b border-[#e5e7eb] bg-white p-4 last:border-b-0 md:grid-cols-[0.8fr_1.2fr_0.8fr_0.8fr]">
              <span className="flex items-center gap-2 text-sm font-medium text-[#111827]">
                <CalendarDays size={16} className="text-primary" />
                {assessment.completed_at ? new Date(assessment.completed_at).toLocaleDateString() : "Draft"}
              </span>
              <span className="text-sm text-[#6b7280]">{label(assessment.assessment_type)}</span>
              <span className="text-sm font-semibold text-[#111827]">{assessment.score_summary.total} total</span>
              <span className="w-fit rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-semibold text-primary">
                {assessment.prediction ? label(assessment.prediction.category) : "Pending"}
              </span>
            </div>
          ))}
          {!assessments.length && (
            <div className="bg-white p-6 text-sm text-[#6b7280]">No completed assessments yet.</div>
          )}
        </div>
      </Card>

      <EmptyState
        icon={History}
        title="Older records will stay organized here."
        body="As you complete more assessments, Kalms will group trends by month and highlight meaningful changes without making the page feel crowded."
      />
    </div>
  );
}
