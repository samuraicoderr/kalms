import {
  Card,
  PageHeader,
  PrimaryLink,
  SafetyNote,
  SoftIcon,
} from "../../components/DashboardUI";
import { Routes } from "@/lib/api/FrontendRoutes";
import { Brain, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";

const sampleQuestion = {
  title: "Over the last two weeks, how often have you felt little interest or pleasure in doing things?",
  options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
};

export default function StartAssessmentPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Start assessment"
        title="A private wellness scan that moves at your pace."
        description="You will answer PHQ-9, GAD-7, and PSS-10 prompts. The experience is designed to feel focused, readable, and non-judgmental."
        action={
          <PrimaryLink href={Routes.dashboardRoutes.assessmentResults}>
            Begin preview
          </PrimaryLink>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <div className="flex items-start gap-4">
            <SoftIcon icon={Brain} tone="purple" />
            <div>
              <h2 className="text-xl font-semibold text-[#111827]">Full wellness scan</h2>
              <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                Estimated time: 8-10 minutes. You can pause between sections and come back later.
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {[
              ["PHQ-9", "Mood and depression symptoms"],
              ["GAD-7", "Anxiety and worry patterns"],
              ["PSS-10", "Perceived stress and control"],
            ].map(([title, body]) => (
              <div key={title} className="flex items-center gap-3 rounded-[18px] bg-[#f8fafc] p-4">
                <CheckCircle2 size={18} className="text-primary" />
                <div>
                  <p className="font-semibold text-[#111827]">{title}</p>
                  <p className="text-sm text-[#6b7280]">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">Question preview</p>
              <h2 className="mt-2 text-xl font-semibold text-[#111827]">
                One question at a time
              </h2>
            </div>
            <SoftIcon icon={Clock3} tone="blue" />
          </div>
          <p className="mt-6 text-xl font-semibold leading-8 text-[#111827]">
            {sampleQuestion.title}
          </p>
          <div className="mt-6 grid gap-3">
            {sampleQuestion.options.map((option, index) => (
              <button
                key={option}
                className={`rounded-[18px] border px-4 py-4 text-left text-sm font-medium transition ${
                  index === 1
                    ? "border-primary bg-[#ede7ff] text-primary"
                    : "border-[#e5e7eb] bg-white text-[#111827] hover:border-primary/25"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <SafetyNote />

      <Card>
        <div className="flex gap-4">
          <SoftIcon icon={ShieldCheck} tone="green" />
          <div>
            <h2 className="text-lg font-semibold text-[#111827]">Before you begin</h2>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">
              Find a quiet minute, answer based on your recent experience, and avoid judging the result. The goal is awareness and better support.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
