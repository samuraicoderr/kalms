"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  Home,
  Clock,
  Star,
  Settings,
  HelpCircle,
  X,
  Crown,
  Trash2,
  BarChart3,
  MessageCircle,
  BookOpen,
  History,
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SidebarItem from "./SidebarItem";
import appConfig from "@/lib/appconfig";
import { useRouter } from "next/navigation";
import { FrontendRoutes } from "@/lib/api/FrontendRoutes";
import { useRequiredAuth } from "@/lib/api/auth/authContext";
import { SmartAvatar } from "@/components/ui/SmartAvatar";

interface SidebarProps {
  organizationName: string;
  organizationInitials?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  organizationName,
  organizationInitials,
  isOpen,
  onClose,
}: SidebarProps) {
  const router = useRouter();
  const { user, logout } = useRequiredAuth();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const userName = user ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() : "";
  const universityName = "University of Example"; // Placeholder
  const wellnessStatus = "Healthy"; // Placeholder
  const moodIndicator = "😊"; // Placeholder 

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "flex flex-col bg-white border-r border-gray-200 h-full z-50",
          // Desktop: always visible, fixed width
          "lg:relative lg:translate-x-0 lg:w-[320px] lg:flex-shrink-0",
          // Mobile/Tablet: slide-in drawer
          "fixed top-0 left-0 w-[320px] transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* TOP SECTION */}
        <div className="p-6 border-b border-gray-200 block lg:hidden">
          <div className="flex items-center gap-3">
            <img
              src={appConfig.logos.green}
              alt="Kalms"
              className="w-8 h-8 object-contain"
            />
            <div>
              <h1 className="cook-font text-xl font-bold text-gray-900">Kalms</h1>
              {/* <p className="text-xs text-gray-500">Mental Wellness Platform</p> */}
            </div>
          </div>
        </div>

        {/* USER PROFILE SECTION */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <SmartAvatar
              useSignedInUser={true}
              size={40}
              charsToUseFromName={2}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{userName}</p>
              <p className="text-sm text-gray-500 truncate">{universityName}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {wellnessStatus}
            </span>
            <span className="text-lg">{moodIndicator}</span>
          </div>
        </div>

        {/* MAIN NAVIGATION */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {/* Dashboard */}
          <div>
            <SidebarItem
              icon={Home}
              label="Dashboard"
              onClick={() => router.push(FrontendRoutes.dashboardRoutes.overview)}
            />
            {expandedSections.dashboard && (
              <div className="ml-6 space-y-1 mt-1">
                <SidebarItem
                  label="Overview"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.overview)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Latest Assessment"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.latestAssessment)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Quick Stats"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.quickStats)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Trend Summaries"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.trendSummaries)}
                  className="text-sm"
                />
              </div>
            )}
          </div>

          {/* Assessments */}
          <div>
            <SidebarItem
              icon={BarChart3}
              label="Assessments"
              onClick={() => toggleSection('assessments')}
              rightIcon={expandedSections.assessments ? ChevronDown : ChevronRight}
            />
            {expandedSections.assessments && (
              <div className="ml-6 space-y-1 mt-1">
                <SidebarItem
                  label="Start Assessment"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.startAssessment)}
                  className="text-sm"
                />
                <SidebarItem
                  label="PHQ-9"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.phq9)}
                  className="text-sm"
                />
                <SidebarItem
                  label="GAD-7"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.gad7)}
                  className="text-sm"
                />
                <SidebarItem
                  label="PSS-10"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.pss10)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Assessment Results"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.assessmentResults)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Saved Drafts"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.savedDrafts)}
                  className="text-sm"
                />
              </div>
            )}
          </div>

          {/* Mood Tracker */}
          <div>
            <SidebarItem
              icon={Heart}
              label="Mood Tracker"
              onClick={() => toggleSection('moodTracker')}
              rightIcon={expandedSections.moodTracker ? ChevronDown : ChevronRight}
            />
            {expandedSections.moodTracker && (
              <div className="ml-6 space-y-1 mt-1">
                <SidebarItem
                  label="Daily Check-in"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.dailyCheckIn)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Mood Calendar"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.moodCalendar)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Stress Tracker"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.stressTracker)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Energy Tracker"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.energyTracker)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Emotional Trends"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.emotionalTrends)}
                  className="text-sm"
                />
              </div>
            )}
          </div>

          {/* Chat with Kalms AI */}
          <div>
            <SidebarItem
              icon={MessageCircle}
              label="Chat with Kalms AI"
              onClick={() => toggleSection('chat')}
              rightIcon={expandedSections.chat ? ChevronDown : ChevronRight}
            />
            {expandedSections.chat && (
              <div className="ml-6 space-y-1 mt-1">
                <SidebarItem
                  label="AI Companion Chat"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.aiCompanion)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Previous Conversations"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.previousConversations)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Suggested Prompts"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.suggestedPrompts)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Wellness Tips"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.wellnessTips)}
                  className="text-sm"
                />
              </div>
            )}
          </div>

          {/* Journal */}
          <div>
            <SidebarItem
              icon={BookOpen}
              label="Journal"
              onClick={() => toggleSection('journal')}
              rightIcon={expandedSections.journal ? ChevronDown : ChevronRight}
            />
            {expandedSections.journal && (
              <div className="ml-6 space-y-1 mt-1">
                <SidebarItem
                  label="Daily Journal Entries"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.dailyEntries)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Private Notes"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.privateNotes)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Reflection Prompts"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.reflectionPrompts)}
                  className="text-sm"
                />
              </div>
            )}
          </div>

          <SidebarItem
            icon={History}
            label="Assessment History"
            onClick={() => router.push(FrontendRoutes.dashboardRoutes.assessmentHistory)}
          />

          {/* Insights & Trends */}
          <div>
            <SidebarItem
              icon={BarChart3}
              label="Insights & Trends"
              onClick={() => toggleSection('insights')}
              rightIcon={expandedSections.insights ? ChevronDown : ChevronRight}
            />
            {expandedSections.insights && (
              <div className="ml-6 space-y-1 mt-1">
                <SidebarItem
                  label="Emotional Trends"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.emotionalTrends)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Stress Patterns"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.stressPatterns)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Assessment Analytics"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.assessmentAnalytics)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Weekly Summaries"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.weeklySummaries)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Monthly Summaries"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.monthlySummaries)}
                  className="text-sm"
                />
              </div>
            )}
          </div>

          {/* Notifications */}
          <div>
            <SidebarItem
              icon={Bell}
              label="Notifications"
              onClick={() => toggleSection('notifications')}
              rightIcon={expandedSections.notifications ? ChevronDown : ChevronRight}
            />
            {expandedSections.notifications && (
              <div className="ml-6 space-y-1 mt-1">
                <SidebarItem
                  label="Reminders"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.reminders)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Streak Updates"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.streakUpdates)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Assessment Reminders"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.assessmentReminders)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Motivational Notifications"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.motivationalNotifications)}
                  className="text-sm"
                />
              </div>
            )}
          </div>

          {/* Settings */}
          <div>
            <SidebarItem
              icon={Settings}
              label="Settings"
              onClick={() => toggleSection('settings')}
              rightIcon={expandedSections.settings ? ChevronDown : ChevronRight}
            />
            {expandedSections.settings && (
              <div className="ml-6 space-y-1 mt-1">
                <SidebarItem
                  label="Profile Settings"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.profileSettings)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Password & Security"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.passwordSecurity)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Notification Preferences"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.notificationPreferences)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Privacy Settings"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.privacySettings)}
                  className="text-sm"
                />
                <SidebarItem
                  label="Theme Preferences"
                  onClick={() => router.push(FrontendRoutes.dashboardRoutes.themePreferences)}
                  className="text-sm"
                />
              </div>
            )}
          </div>
        </nav>

        {/* BOTTOM SECTION */}
        <div className="border-t border-gray-200 p-4 space-y-3">
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-sm font-medium text-purple-900 mb-1">Daily Wellness Quote</p>
            <p className="text-xs text-purple-700">"Every day is a new beginning. Take a deep breath and start again."</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Current Streak</p>
              <p className="text-xs text-gray-500">7 days</p>
            </div>
            <button
              onClick={() => {
                logout();
                router.push(FrontendRoutes.auth.login);
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
