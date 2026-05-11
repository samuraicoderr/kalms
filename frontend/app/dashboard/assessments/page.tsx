import {
  AssessmentCard,
  Card,
  PageHeader,
  PrimaryLink,
  SafetyNote,
  assessmentCards,
} from "../components/DashboardUI";
import { Routes } from "@/lib/api/FrontendRoutes";

export default function AssessmentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Assessments"
        title="Understand how you are doing, one calm step at a time."
        description="Choose a validated questionnaire or take the full wellness scan. Results are private and designed to guide reflection, not label you."
        action={
          <PrimaryLink href={Routes.dashboardRoutes.startAssessment}>
            Start full scan
          </PrimaryLink>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {assessmentCards.map((item) => (
          <AssessmentCard key={item.title} item={item} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <SafetyNote />
        <Card>
          <p className="text-sm font-medium text-primary">What happens after?</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              ["1", "Answer privately", "Large, simple choices keep the assessment focused."],
              ["2", "Review scores", "See PHQ-9, GAD-7, and PSS-10 results clearly."],
              ["3", "Get next steps", "Receive supportive recommendations matched to your pattern."],
            ].map(([step, title, body]) => (
              <div key={step} className="rounded-[18px] bg-[#f8fafc] p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                  {step}
                </span>
                <h2 className="mt-4 font-semibold text-[#111827]">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#6b7280]">{body}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
