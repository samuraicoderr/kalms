import {
  Card,
  DailyCheckInCard,
  MoodBars,
  PageHeader,
  PrimaryLink,
  SoftIcon,
  moodWeek,
} from "../components/DashboardUI";
import { Routes } from "@/lib/api/FrontendRoutes";
import { CalendarDays, Heart, NotebookPen, Wind, Zap } from "lucide-react";

export default function MoodTrackerPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Mood tracker"
        title="Track feelings without turning them into homework."
        description="Log mood, energy, stress, and optional notes. Over time, Kalms turns small check-ins into helpful patterns."
        action={
          <PrimaryLink href={Routes.dashboardRoutes.dailyCheckIn}>
            New check-in
          </PrimaryLink>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <DailyCheckInCard />
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">This week</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#111827]">
                Your mood lifted after rest days.
              </h2>
            </div>
            <SoftIcon icon={CalendarDays} tone="blue" />
          </div>
          <MoodBars />
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Heart, title: "Mood average", value: "7.1/10", body: "Mostly calm and hopeful", tone: "purple" as const },
          { icon: Zap, title: "Energy average", value: "6.4/10", body: "Better after midday breaks", tone: "green" as const },
          { icon: Wind, title: "Stress average", value: "4.8/10", body: "Rises near deadlines", tone: "amber" as const },
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
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4">
            <SoftIcon icon={NotebookPen} tone="purple" />
            <div>
              <h2 className="text-xl font-semibold text-[#111827]">Reflection notes</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
                Add a few words about what shaped your day. These notes stay private and make future insights more useful.
              </p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-7 lg:min-w-[420px]">
            {moodWeek.map((item) => (
              <div key={item.day} className="rounded-2xl bg-[#f8fafc] p-3 text-center">
                <p className="text-xs font-semibold text-[#111827]">{item.day}</p>
                <p className="mt-1 text-[11px] text-[#6b7280]">{item.mood}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
