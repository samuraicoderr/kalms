import {
  Card,
  InsightList,
  MetricCard,
  MiniTrend,
  PageHeader,
  PrimaryLink,
} from "../components/DashboardUI";
import { Routes } from "@/lib/api/FrontendRoutes";
import { Brain, CalendarClock, Heart, TrendingUp } from "lucide-react";

export default function InsightsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Insights"
        title="Patterns that help you care for yourself earlier."
        description="Kalms turns check-ins and assessments into readable trends, so you can notice pressure before it becomes too heavy."
        action={
          <PrimaryLink href={Routes.dashboardRoutes.moodTracker}>
            Log today
          </PrimaryLink>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={TrendingUp}
          label="Wellness direction"
          value="Improving"
          detail="+8%"
          tone="green"
        />
        <MetricCard
          icon={CalendarClock}
          label="High stress window"
          value="Thu"
          detail="weekly"
          tone="amber"
        />
        <MetricCard
          icon={Heart}
          label="Best support habit"
          value="Check-ins"
          detail="5/7 days"
          tone="purple"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <p className="text-sm font-medium text-primary">Combined wellness index</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#111827]">
            Your recovery days are making a visible difference.
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#6b7280]">
            The most positive movement appears after sleep, lighter study blocks, and social contact.
          </p>
          <div className="mt-6">
            <MiniTrend values={[44, 48, 43, 56, 60, 66, 72]} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ede7ff] text-primary">
              <Brain size={20} />
            </span>
            <div>
              <p className="text-sm font-medium text-primary">AI summary</p>
              <h2 className="text-xl font-semibold text-[#111827]">This week's read</h2>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-[#6b7280]">
            Your mood remains generally stable, but stress rises when tasks are unclear. Planning smaller study blocks before deadlines may reduce the Thursday spike.
          </p>
        </Card>
      </div>

      <InsightList />
    </div>
  );
}
