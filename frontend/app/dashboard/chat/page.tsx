import {
  Card,
  CompanionPreview,
  PageHeader,
  SafetyNote,
  SoftIcon,
} from "../components/DashboardUI";
import { MessageCircle, Sparkles, Wind } from "lucide-react";

const prompts = [
  "I feel overwhelmed and need to slow down.",
  "Help me plan a calmer study session.",
  "I want to understand why my stress keeps rising.",
  "Give me a short grounding exercise.",
];

export default function ChatPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Chat companion"
        title="Talk things through with Kalms AI Companion."
        description="A warm, patient space for reflection, coping ideas, and gentle next steps. It does not diagnose or replace professional care."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <CompanionPreview />

        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-3">
              <SoftIcon icon={MessageCircle} tone="purple" />
              <div>
                <p className="text-sm font-medium text-primary">Suggested prompts</p>
                <h2 className="text-xl font-semibold text-[#111827]">Start gently</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  className="rounded-[18px] border border-[#e5e7eb] bg-[#f8fafc] p-4 text-left text-sm font-medium leading-6 text-[#111827] transition hover:border-primary/25 hover:bg-[#fbfaff]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex gap-4">
              <SoftIcon icon={Wind} tone="blue" />
              <div>
                <h2 className="text-xl font-semibold text-[#111827]">Quick reset</h2>
                <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                  Breathe in for four, hold for four, breathe out for six. Repeat three times before replying.
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-[#fbfaff]">
            <div className="flex gap-4">
              <SoftIcon icon={Sparkles} tone="purple" />
              <div>
                <h2 className="text-xl font-semibold text-[#111827]">Companion boundaries</h2>
                <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                  Kalms can help you reflect and find coping steps. If you feel unsafe or at risk of harm, contact emergency services or a trusted person immediately.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <SafetyNote />
    </div>
  );
}
