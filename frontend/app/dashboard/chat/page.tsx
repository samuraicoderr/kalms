"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, PageHeader } from "../components/DashboardUI";
import { ChatService } from "@/lib/api/services/ChatService";
import { Routes } from "@/lib/api/FrontendRoutes";

export default function ChatLandingPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    ChatService.activeConversation()
      .then((conversation) => router.replace(Routes.dashboardRoutes.chatThread(conversation.id)))
      .catch(() => setError("We could not open your chat yet."));
  }, [router]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Chat companion"
        title="Opening Kalms AI Companion..."
        description="Your conversations stay organized in threads so you can return to them later."
      />
      <Card>
        <p className="text-sm font-medium text-[#6b7280]">
          {error || "Preparing your latest chat thread."}
        </p>
      </Card>
    </div>
  );
}
