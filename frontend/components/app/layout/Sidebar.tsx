"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpenCheck,
  Heart,
  Home,
  LineChart,
  LogOut,
  MessageCircle,
  X,
} from "lucide-react";
import appConfig from "@/lib/appconfig";
import { FrontendRoutes } from "@/lib/api/FrontendRoutes";
import { useRequiredAuth } from "@/lib/api/auth/authContext";
import { DashboardService } from "@/lib/api/services/DashboardService";
import type { DashboardSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { SmartAvatar } from "@/components/ui/SmartAvatar";

interface SidebarProps {
  organizationName: string;
  organizationInitials?: string;
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Overview", href: FrontendRoutes.dashboardRoutes.overview, icon: Home },
  { label: "Assessments", href: FrontendRoutes.dashboardRoutes.assessments, icon: BookOpenCheck },
  { label: "Mood tracker", href: FrontendRoutes.dashboardRoutes.moodTracker, icon: Heart },
  { label: "Chat companion", href: FrontendRoutes.dashboardRoutes.chat, icon: MessageCircle },
  { label: "History", href: FrontendRoutes.dashboardRoutes.assessmentHistory, icon: BarChart3 },
  { label: "Insights", href: FrontendRoutes.dashboardRoutes.insights, icon: LineChart },
];

function titleCase(value: string | null) {
  if (!value) return "No result";
  return value.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useRequiredAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    DashboardService.summary().then(setSummary).catch(() => setSummary(null));
  }, []);

  const userName =
    user?.username ||
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
    "Student";

  const goTo = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <button
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-[300px] flex-col border-r border-[#e5e7eb] bg-white transition-transform duration-300 lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <button
            onClick={() => goTo(FrontendRoutes.dashboardRoutes.overview)}
            className="flex items-center gap-3"
          >
            <Image
              src={appConfig.logos.green_svg}
              alt={appConfig.appName}
              width={40}
              height={40}
              className="h-10 w-10"
              priority
            />
            <span className="logo-font text-[24px] leading-none">Kalms</span>
          </button>
          <button
            aria-label="Close navigation"
            onClick={onClose}
            className="rounded-full p-2 text-[#6b7280] hover:bg-slate-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mx-4 rounded-[22px] border border-[#e5e7eb] bg-[#fbfaff] p-4">
          <div className="flex items-center gap-3">
            <SmartAvatar useSignedInUser size={42} charsToUseFromName={2} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#111827]">{userName}</p>
              <p className="text-xs text-[#6b7280]">Student wellness space</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-2xl bg-white p-3">
              <p className="text-[#9ca3af]">Status</p>
              <p className="mt-1 font-semibold text-green-700">{titleCase(summary?.latest_category ?? null)}</p>
            </div>
            <div className="rounded-2xl bg-white p-3">
              <p className="text-[#9ca3af]">Streak</p>
              <p className="mt-1 font-semibold text-primary">{summary?.current_streak ?? 0} days</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === FrontendRoutes.dashboardRoutes.chat && pathname.startsWith("/dashboard/chats/")) ||
              (item.href !== FrontendRoutes.dashboardRoutes.overview &&
                pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <button
                key={item.href}
                onClick={() => goTo(item.href)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-medium transition",
                  isActive
                    ? "bg-primary text-white shadow-[0_8px_24px_rgba(var(--primary-rgb),0.2)]"
                    : "text-[#6b7280] hover:bg-[#f8fafc] hover:text-[#111827]"
                )}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-[#e5e7eb] p-4">
          <div className="mb-3 rounded-[18px] bg-[#ede7ff] p-4">
            <p className="text-sm font-semibold text-primary">Today&apos;s anchor</p>
            <p className="mt-1 text-xs leading-5 text-primary/75">
              One honest check-in is enough progress for today.
            </p>
          </div>
          <button
            onClick={async () => {
              await logout();
              router.push(FrontendRoutes.auth.login);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[#e5e7eb] px-4 py-3 text-sm font-semibold text-[#6b7280] transition hover:bg-slate-50 hover:text-[#111827]"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
