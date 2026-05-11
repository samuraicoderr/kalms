import { DailyCheckInForm } from "../../components/DailyCheckInForm";
import { PageHeader } from "../../components/DashboardUI";

export default function DailyCheckInPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Daily check-in"
        title="Log how today feels."
        description="Mood, energy, stress, and a short note are enough. Small data points become useful patterns over time."
      />
      <DailyCheckInForm />
    </div>
  );
}
