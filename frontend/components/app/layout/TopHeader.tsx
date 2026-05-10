"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Bell, Menu } from "lucide-react";
import appConfig from "@/lib/appconfig";
import UserDropdown from "../fragments/UserDropdown";
import PlanUpgradeDropdown from "../fragments/PlanUpgradeDropdown";
import { useRequiredAuth } from "@/lib/api/auth/authContext";
import { FrontendRoutes, Routes } from "@/lib/api/FrontendRoutes";

interface TopHeaderProps {
  onMenuToggle: () => void;
  teamName?: string;
  onSendInvites?: (emails: string[]) => Promise<void>;
  inviteLink?: string;
}

export default function TopHeader({
  onMenuToggle,
  teamName = "Your team",
  onSendInvites,
  inviteLink,
}: TopHeaderProps) {
  const router = useRouter();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const { user, logout } = useRequiredAuth();

  const userName =
    user?.username ||
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
    "you";

  const avatarUrl =
    user?.profile_picture || user?.picture_url || appConfig.media.avatarExample;

  const handleLogout = () => {
    logout();
  };

  const handleCopyInviteLink = async () => {
    const fallbackLink = `${window.location.origin}${window.location.pathname}`;
    const value = inviteLink ?? fallbackLink;

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  };

  const handleSendInvites = async (emails: string[]) => {
    if (onSendInvites) {
      await onSendInvites(emails);
      return;
    }

    // Temporary fallback until backend invite endpoint is wired.
    await new Promise((resolve) => setTimeout(resolve, 700));
  };

  const handleUpgrade = async () => {
    // Placeholder for billing flow integration.
    await new Promise((resolve) => setTimeout(resolve, 700));
    console.log("Upgrade flow triggered");
  };

  return (
    <header className="h-14 sm:h-16 border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 bg-white">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Hamburger — visible on mobile/tablet */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <img
            src={appConfig.logos.green}
            alt={appConfig.appName}
            className="w-7 h-7 object-contain"
          />
          <span className="cook-font text-lg sm:text-xl tracking-tight text-gray-900 hidden sm:inline">
            {appConfig.appName}
          </span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-4">

        <div className="flex items-center gap-1 sm:gap-3 sm:pl-2 sm:border-l sm:border-gray-200">
          <button
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors relative"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {/* Notification dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>

          <UserDropdown userName={userName} avatarUrl={avatarUrl as string} onLogout={handleLogout} onProfileClick={
            ()=>{
              router.push(FrontendRoutes.dashboardRoutes.profile);
            }
          }/>
        </div>
      </div>

    </header>
  );
}
