"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/app/layout/Sidebar";
import TopHeader from "@/components/app/layout/TopHeader";
import { ProtectedRoute } from "@/lib/api/auth/authContext";


export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isFullPageChat = pathname.startsWith("/dashboard/chats/");
  
  return (    
    <ProtectedRoute
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] text-sm text-[#6b7280]">
          Preparing your dashboard...
        </div>
      }
    >
      <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc] font-sans text-[#111827]">
        <Sidebar
          organizationName={"Kalms"}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex min-w-0 flex-1 flex-col bg-[#f8fafc]">
          <TopHeader
            onMenuToggle={() => setSidebarOpen((prev) => !prev)}
            teamName={"Kalms"} 
          />

          <div className={`flex-1 overflow-y-auto scrollbar-hide ${isFullPageChat ? "min-h-0" : ""}`}>
            <div className={isFullPageChat ? "h-full" : "mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8"}>
              {children}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}


