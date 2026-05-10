"use client";

import React, { useState } from "react";
import Sidebar from "@/components/app/layout/Sidebar";
import TopHeader from "@/components/app/layout/TopHeader";
import { ProtectedRoute } from "@/lib/api/auth/authContext";
import LoadingScreen from "@/components/app/loading/LoadingScreen";


export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (    
    <ProtectedRoute fallback={
      <div>Loading Dashboard...</div>
    }>
      <div className="flex h-screen w-full bg-white font-sans text-gray-900 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          organizationName={"Kalms"}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-white">
          <TopHeader
            onMenuToggle={() => setSidebarOpen((prev) => !prev)}
            teamName={"Kalms"} 
          />

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {children}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}


