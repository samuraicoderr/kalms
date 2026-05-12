"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  to: string;
  message?: string;
};

export default function LegacyRouteRedirect({ to, message }: Props) {
  const router = useRouter();

  useEffect(() => {
    // Replace to avoid back-button landing on legacy page
    router.replace(to);
  }, [router, to]);

  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="text-sm text-black/60">{message ?? "Redirecting..."}</div>
    </div>
  );
}
