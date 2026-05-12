"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InlineAlert, PrimaryButton } from "../../components/AuthUI";
import { useAuth } from "@/lib/api/auth/authContext";
import { Routes } from "@/lib/api/FrontendRoutes";
import { interpretServerError, isInvalidOrExpiredOnboardingTokenError } from "@/lib/utils";
import { storeAuthRedirectMessage } from "@/lib/api/auth/redirect";

export default function CompletePage() {
  const router = useRouter();
  const { onboardingToken, exchangeOnboardingTokenForAuth, setOnboardingToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const completeOnboarding = async () => {
      if (!onboardingToken) {
        // No onboarding token, redirect to login
        router.replace(Routes.auth.login);
        return;
      }

      try {
        await exchangeOnboardingTokenForAuth(onboardingToken);
        // Successfully exchanged tokens and logged in, redirect to home
        router.replace(Routes.home);
      } catch (err) {
        if (isInvalidOrExpiredOnboardingTokenError(err)) {
          setOnboardingToken(null);
          storeAuthRedirectMessage("Your onboarding session expired. Please sign in again.");
          router.replace(Routes.auth.login);
          return;
        }

        const details = interpretServerError(err);
        setError(details[0] || "Failed to complete onboarding. Please try logging in manually.");
        setLoading(false);
      }
    };

    completeOnboarding();
  }, [onboardingToken, exchangeOnboardingTokenForAuth, router, setOnboardingToken]);

  const goHome = () => {
    router.replace(Routes.home);
  };

  if (loading) {
    return (
      <div className="text-center">
        <h2 className="text-[22px] font-semibold cook-font mb-2">
          Welcome to Kalms
        </h2>
        <p className="text-sm text-black/60 mb-6">Setting up your account...</p>
        <PrimaryButton label="Loading..." disabled loading />
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="text-[22px] font-semibold cook-font mb-2">
        Welcome to Kalms
      </h2>
      <p className="text-sm text-black/60 mb-6">
        Your account is ready. Let&apos;s get started.
      </p>
      {error && <InlineAlert message={error} />}
      <PrimaryButton label="Get started" type="button" onClick={goHome} />
    </div>
  );
}
