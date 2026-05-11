import {
  Card,
  EmptyState,
  PageHeader,
  PrimaryLink,
  SoftIcon,
  historyRows,
} from "../components/DashboardUI";
import { Routes } from "@/lib/api/FrontendRoutes";
import { CalendarDays, Download, History, Search } from "lucide-react";

export default function AssessmentHistoryPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Assessment history"
        title="A clear record of your wellbeing over time."
        description="Review past assessments, compare patterns, and revisit recommendations when you need them."
        action={
          <PrimaryLink href={Routes.dashboardRoutes.startAssessment}>
            New assessment
          </PrimaryLink>
        }
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
          {historyRows.map((row) => (
            <div
              key={`${row.date}-${row.assessment}`}
              className="grid gap-3 border-b border-[#e5e7eb] bg-white p-4 last:border-b-0 md:grid-cols-[0.7fr_1.4fr_0.8fr_0.7fr]"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-[#111827]">
                <CalendarDays size={16} className="text-primary" />
                {row.date}
              </span>
              <span className="text-sm text-[#6b7280]">{row.assessment}</span>
              <span className="text-sm font-semibold text-[#111827]">{row.score}</span>
              <span className="w-fit rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-semibold text-primary">
                {row.result}
              </span>
            </div>
          ))}
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
