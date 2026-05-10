"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthShell,
  InputField,
  InlineAlert,
  OnboardingHeader,
  PasswordToggle,
  PrimaryButton,
} from "../../components/AuthUI";
import OnboardingService from "@/lib/api/services/Onboarding.Service";
import { useAuth, getOnboardingRoute } from "@/lib/api/auth/authContext";
import { Routes } from "@/lib/api/FrontendRoutes";
import { interpretServerError } from "@/lib/utils";

export default function SetPasswordPage() {
  const router = useRouter();
  const { onboardingToken, partialUser, updatePartialUser, exchangeOnboardingTokenForAuth } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => onboardingToken || partialUser?.onboarding_token || "", [
    onboardingToken,
    partialUser?.onboarding_token,
  ]);

  useEffect(() => {
    if (!token) {
      router.replace(Routes.auth.login);
      return;
    }

    const fetchUserData = async () => {
      try {
        const userData = await OnboardingService.getUserData(token);
        updatePartialUser({
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          profile_picture: userData.profile_picture,
          onboarding_status: userData.onboarding_status,
          onboarding_flow: userData.onboarding_flow,
        });
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };

    fetchUserData();
  }, [token, router, updatePartialUser]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      router.replace(Routes.auth.login);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const result = await OnboardingService.setPassword({
        onboarding_token: token,
        password,
      });
      updatePartialUser({ onboarding_status: result.onboarding_status });

      if (result.onboarding_status === "completed") {
        await exchangeOnboardingTokenForAuth(token);
        router.replace(Routes.dashboard);
      } else if (result.onboarding_status) {
        const nextRoute = getOnboardingRoute(result.onboarding_status);
        router.replace(nextRoute);
      }
    } catch (err) {
      const details = interpretServerError(err);
      setError(details[0] || "Could not set password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <OnboardingHeader
        stepKey="needs_password"
        title="Create a secure password"
        subtitle="Pick something strong so your account stays safe."
      />

      {error && <InlineAlert message={error} />}

      <form onSubmit={submit} className="space-y-4" noValidate>
        <InputField
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          autoComplete="new-password"
          disabled={loading}
          rightElement={
            <PasswordToggle
              shown={showPassword}
              onToggle={() => setShowPassword((prev) => !prev)}
              disabled={loading}
            />
          }
        />

        <InputField
          label="Confirm password"
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          autoComplete="new-password"
          disabled={loading}
          rightElement={
            <PasswordToggle
              shown={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((prev) => !prev)}
              disabled={loading}
            />
          }
        />

        <PrimaryButton
          label="Continue"
          type="submit"
          loading={loading}
          disabled={!password || !confirmPassword}
        />
      </form>
    </AuthShell>
  );
}
