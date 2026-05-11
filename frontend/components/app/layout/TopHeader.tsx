"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu, Search } from "lucide-react";
import UserDropdown from "../fragments/UserDropdown";
import { useRequiredAuth } from "@/lib/api/auth/authContext";
import appConfig from "@/lib/appconfig";
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
  [FrontendRoutes.dashboardRoutes.settings]: "Settings",
  [FrontendRoutes.dashboardRoutes.profile]: "Profile",
};

export default function TopHeader({ onMenuToggle }: TopHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useRequiredAuth();

  const title = pageTitles[pathname] || "Kalms";
  const userName =
    user?.username ||
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
    "Student";
  const avatarUrl =
    user?.profile_picture || user?.picture_url || appConfig.media.avatarExample;

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

      <div className="hidden max-w-sm flex-1 items-center rounded-full border border-[#e5e7eb] bg-[#f8fafc] px-4 py-2 md:flex">
        <Search size={16} className="text-[#9ca3af]" />
        <input
          aria-label="Search Kalms"
          placeholder="Search insights, assessments..."
          className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-[#9ca3af]"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          className="relative rounded-full p-2 text-[#6b7280] transition hover:bg-slate-100 hover:text-[#111827]"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
        </button>
        <UserDropdown
          userName={userName}
          avatarUrl={avatarUrl as string}
          onLogout={logout}
          onProfileClick={() => router.push(FrontendRoutes.dashboardRoutes.profile)}
        />
      </div>
    </header>
  );
}
