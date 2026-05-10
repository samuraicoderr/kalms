"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthShell,
  InlineAlert,
  OnboardingHeader,
  PrimaryButton,
} from "../../components/AuthUI";
import { useAuth } from "@/lib/api/auth/authContext";
import { Routes } from "@/lib/api/FrontendRoutes";
import { interpretServerError } from "@/lib/utils";

export default function CompletePage() {
  const router = useRouter();
  const { onboardingToken, exchangeOnboardingTokenForAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const completeOnboarding = async () => {
      if (!onboardingToken) {
        router.replace(Routes.auth.login);
        return;
      }

      try {
        await exchangeOnboardingTokenForAuth(onboardingToken);
        router.replace(Routes.home);
      } catch (err) {
        const details = interpretServerError(err);
        setError(details[0] || "Failed to complete onboarding. Please try logging in manually.");
        setLoading(false);
      }
    };

    completeOnboarding();
  }, [onboardingToken, exchangeOnboardingTokenForAuth, router]);

  const goHome = () => {
    router.replace(Routes.home);
  };

  return (
    <AuthShell>
      <OnboardingHeader
        stepKey="completed"
        title="Welcome to Kalms"
        subtitle="Your space is ready. We are taking you in now."
      />

      {error && <InlineAlert message={error} />}

      <div className="space-y-4">
        <PrimaryButton
          label={loading ? "Setting things up..." : "Get started"}
          loading={loading}
          disabled={loading}
          onClick={goHome}
        />
      </div>
    </AuthShell>
  );
}
