import {
  Card,
  PageHeader,
  SoftIcon,
  settingsGroups,
} from "../components/DashboardUI";
import { Bell, CheckCircle2, Moon, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Keep Kalms personal, private, and easy to return to."
        description="Manage account details, security, reminders, privacy controls, and how supportive notifications should feel."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {settingsGroups.map((group) => (
          <Card key={group.title}>
            <div className="flex items-center gap-3">
              <SoftIcon icon={group.icon} tone="purple" />
              <h2 className="text-xl font-semibold text-[#111827]">{group.title}</h2>
            </div>
            <div className="mt-5 space-y-3">
              {group.items.map((item) => (
                <button
                  key={item}
                  className="flex w-full items-center justify-between rounded-[18px] bg-[#f8fafc] p-4 text-left text-sm font-medium text-[#111827] transition hover:bg-[#fbfaff]"
                >
                  {item}
                  <span className="text-primary">Manage</span>
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          { icon: Bell, title: "Gentle reminders", body: "Daily check-in at 8:00 PM", enabled: true },
          { icon: Moon, title: "Quiet hours", body: "Mute nudges from 10:30 PM", enabled: true },
          { icon: ShieldCheck, title: "Privacy mode", body: "Hide sensitive previews", enabled: false },
        ].map((item) => (
          <Card key={item.title} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <SoftIcon icon={item.icon} tone="blue" />
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                item.enabled ? "bg-green-50 text-green-700" : "bg-slate-100 text-[#6b7280]"
              }`}>
                {item.enabled ? "On" : "Off"}
              </span>
            </div>
            <h2 className="mt-5 text-lg font-semibold text-[#111827]">{item.title}</h2>
            <p className="mt-2 text-sm text-[#6b7280]">{item.body}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-[#fbfaff]">
        <div className="flex gap-4">
          <SoftIcon icon={CheckCircle2} tone="green" />
          <div>
            <h2 className="text-xl font-semibold text-[#111827]">Your data belongs to you</h2>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">
              Future backend controls should let students export data, clear chat history, and manage assessment visibility from this settings area.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
