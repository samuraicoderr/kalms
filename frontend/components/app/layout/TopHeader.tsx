"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import UserDropdown from "../fragments/UserDropdown";
import { useRequiredAuth } from "@/lib/api/auth/authContext";
import { FrontendRoutes } from "@/lib/api/FrontendRoutes";

interface TopHeaderProps {
  onMenuToggle: () => void;
  teamName?: string;
  onSendInvites?: (emails: string[]) => Promise<void>;
  inviteLink?: string;
}

const pageTitles: Record<string, string> = {
  [FrontendRoutes.dashboardRoutes.overview]: "Overview",
  [FrontendRoutes.dashboardRoutes.assessments]: "Assessments",
  [FrontendRoutes.dashboardRoutes.startAssessment]: "Start assessment",
  [FrontendRoutes.dashboardRoutes.assessmentResults]: "Assessment results",
  [FrontendRoutes.dashboardRoutes.moodTracker]: "Mood tracker",
  [FrontendRoutes.dashboardRoutes.chat]: "Chat companion",
  [FrontendRoutes.dashboardRoutes.assessmentHistory]: "Assessment history",
  [FrontendRoutes.dashboardRoutes.insights]: "Insights",
};

export default function TopHeader({ onMenuToggle }: TopHeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useRequiredAuth();

  const title = pageTitles[pathname] || "Kalms";
  const userName =
    user?.username ||
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
    "Student";

  return (
    <header className="flex min-h-16 flex-shrink-0 items-center justify-between gap-3 border-b border-[#e5e7eb] bg-white/90 px-4 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-full p-2 text-[#6b7280] transition hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#9ca3af]">Kalms dashboard</p>
          <h1 className="truncate text-base font-semibold text-[#111827] md:text-lg">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <UserDropdown
          userName={userName}
          onLogout={logout}
        />
      </div>
    </header>
  );
}
