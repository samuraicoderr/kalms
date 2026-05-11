import {
  Card,
  MiniTrend,
  PageHeader,
  PrimaryLink,
  SecondaryLink,
  SoftIcon,
  WellnessScoreList,
  recommendations,
} from "../../components/DashboardUI";
import { Routes } from "@/lib/api/FrontendRoutes";
import { Brain, HeartPulse, Lightbulb, ShieldCheck } from "lucide-react";

export default function AssessmentResultsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Assessment results"
        title="Your current pattern looks stable, with stress worth watching."
        description="This summary combines questionnaire scores with recent mood check-ins to suggest practical next steps."
        action={
          <div className="flex flex-wrap gap-3">
            <PrimaryLink href={Routes.dashboardRoutes.chat}>Discuss results</PrimaryLink>
            <SecondaryLink href={Routes.dashboardRoutes.assessmentHistory}>
              View history
            </SecondaryLink>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="bg-[#fbfaff]">
          <SoftIcon icon={Brain} tone="purple" />
          <p className="mt-6 text-sm font-medium text-primary">AI wellness category</p>
          <h2 className="mt-2 text-4xl font-semibold text-[#111827]">Healthy</h2>
          <p className="mt-3 text-sm leading-6 text-[#6b7280]">
            Your scores are mostly low, with moderate perceived stress. Keep an eye on workload, sleep, and recovery time.
          </p>
          <div className="mt-6 rounded-[18px] bg-white p-4">
            <p className="text-sm font-semibold text-[#111827]">Confidence signal</p>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div className="h-full w-[82%] rounded-full bg-primary" />
            </div>
            <p className="mt-2 text-xs text-[#6b7280]">Based on current scores and recent check-ins</p>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-medium text-primary">Score breakdown</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#111827]">
            Three assessment lenses
          </h2>
          <div className="mt-6">
            <WellnessScoreList />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-3">
            <SoftIcon icon={HeartPulse} tone="blue" />
            <div>
              <p className="text-sm font-medium text-primary">Trend context</p>
              <h2 className="text-xl font-semibold text-[#111827]">Recent movement</h2>
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
            {recommendations.map((item) => (
              <div key={item} className="flex gap-3 rounded-[18px] bg-[#f8fafc] p-4">
                <ShieldCheck size={18} className="mt-0.5 text-primary" />
                <p className="text-sm leading-6 text-[#6b7280]">{item}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
