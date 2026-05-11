import {
  Card,
  DailyCheckInCard,
  MetricCard,
  MiniTrend,
  PageHeader,
  PrimaryLink,
  SecondaryLink,
  WellnessScoreList,
  dashboardMetrics,
  quickActions,
} from "../components/DashboardUI";
import { Routes } from "@/lib/api/FrontendRoutes";

export default function OverviewPage() {
  const date = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={date}
        title="Good to see you. Let's check in gently."
        description="A calm snapshot of your assessments, mood logs, and the small habits helping you stay steady."
        action={
          <div className="flex flex-wrap gap-3">
            <PrimaryLink href={Routes.dashboardRoutes.startAssessment}>
              Start assessment
            </PrimaryLink>
            <SecondaryLink href={Routes.dashboardRoutes.chat}>
              Talk to Kalms
            </SecondaryLink>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Wellness trend</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#111827]">
                Your week is moving in a steadier direction.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
                Mood and energy have improved since midweek. Stress is still the main area to watch before upcoming academic deadlines.
              </p>
            </div>
            <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              Improving
            </span>
          </div>
          <div className="mt-6">
            <MiniTrend />
          </div>
        </Card>

        <DailyCheckInCard />
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <p className="text-sm font-medium text-primary">Latest assessment</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#111827]">
            Low current risk
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#6b7280]">
            Your most recent scores suggest healthy functioning with mild stress. Keep watching sleep and workload balance.
          </p>
          <div className="mt-6">
            <WellnessScoreList />
          </div>
        </Card>

        <Card>
          <p className="text-sm font-medium text-primary">Quick actions</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <a
                  key={action.title}
                  href={action.href}
                  className="flex items-center justify-between rounded-[18px] border border-[#e5e7eb] bg-[#f8fafc] p-4 transition hover:border-primary/20 hover:bg-[#fbfaff]"
                >
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
    </div>
  );
}
