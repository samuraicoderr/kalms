"use client";

import {
  Card,
  PageHeader,
  PrimaryLink,
  SoftIcon,
} from "../components/DashboardUI";
import { Routes } from "@/lib/api/FrontendRoutes";
import { useRequiredAuth } from "@/lib/api/auth/authContext";
import { SmartAvatar } from "@/components/ui/SmartAvatar";
import { GraduationCap, Mail, ShieldCheck, UserRound } from "lucide-react";

export default function ProfilePage() {
  const { user } = useRequiredAuth();
  const fullName =
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
    user?.username ||
    "Student";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Profile"
        title="Your student wellness profile."
        description="Keep your identity, institution context, and wellbeing preferences clear so Kalms can feel more personal."
        action={
          <PrimaryLink href={Routes.dashboardRoutes.settings}>
            Edit settings
          </PrimaryLink>
        }
      />

      <Card className="overflow-hidden p-0">
        <div className="h-32 bg-[linear-gradient(135deg,#ede7ff,#dbeafe,#dcfce7)]" />
        <div className="-mt-12 flex flex-col gap-5 p-6 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-4">
            <div className="rounded-full border-4 border-white bg-white">
              <SmartAvatar useSignedInUser size={96} charsToUseFromName={2} />
            </div>
            <div className="pb-2">
              <h2 className="text-2xl font-semibold text-[#111827]">{fullName}</h2>
              <p className="text-sm text-[#6b7280]">
                {user?.email || "student@university.edu"}
              </p>
            </div>
          </div>
          <span className="w-fit rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
            Healthy status
          </span>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: UserRound, label: "Username", value: user?.username || "student" },
          { icon: Mail, label: "Email", value: user?.email || "Not connected" },
          { icon: GraduationCap, label: "Institution", value: "University student" },
          { icon: ShieldCheck, label: "Privacy", value: "Protected" },
        ].map((item) => (
          <Card key={item.label} className="p-5">
            <SoftIcon icon={item.icon} tone="purple" />
            <p className="mt-5 text-sm text-[#6b7280]">{item.label}</p>
            <p className="mt-1 truncate text-lg font-semibold text-[#111827]">{item.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold text-[#111827]">Wellness preferences</h2>
          <div className="mt-5 space-y-3">
            {["Evening check-in reminders", "Gentle motivation tone", "Privacy-safe previews"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-[18px] bg-[#f8fafc] p-4">
                <span className="text-sm font-medium text-[#111827]">{item}</span>
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  Active
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-[#111827]">Support context</h2>
          <p className="mt-3 text-sm leading-6 text-[#6b7280]">
            Kalms can use optional profile context, recent assessments, and mood logs to shape recommendations while keeping the experience student-centered and non-diagnostic.
          </p>
          <div className="mt-5 rounded-[18px] bg-[#fbfaff] p-4 text-sm leading-6 text-primary">
            Suggested next step: add your academic workload pattern so insights can better anticipate stressful weeks.
          </div>
        </Card>
      </div>
    </div>
  );
}
