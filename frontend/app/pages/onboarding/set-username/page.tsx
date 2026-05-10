"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthShell,
  InputField,
  InlineAlert,
  OnboardingHeader,
  PrimaryButton,
} from "../../components/AuthUI";
import OnboardingService from "@/lib/api/services/Onboarding.Service";
import { useAuth, getOnboardingRoute } from "@/lib/api/auth/authContext";
import { Routes } from "@/lib/api/FrontendRoutes";
import { interpretServerError } from "@/lib/utils";

const USERNAME_RE = /^[A-Za-z0-9_]{3,30}$/;

export default function SetUsernamePage() {
  const router = useRouter();
  const { onboardingToken, partialUser, updatePartialUser, exchangeOnboardingTokenForAuth } = useAuth();

  const [username, setUsername] = useState(partialUser?.username || "");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
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
        if (userData.username) setUsername(userData.username);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };

    fetchUserData();
  }, [token, router, updatePartialUser]);

  useEffect(() => {
    if (!username || !USERNAME_RE.test(username)) {
      setAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setChecking(true);
      try {
        const result = await OnboardingService.checkUsername(username, token);
        setAvailable(result.available);
      } catch {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username, token]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!USERNAME_RE.test(username)) {
      setError("Username must be 3-30 chars and can only contain letters, numbers, and underscores.");
      return;
    }

    if (!token) {
      router.replace(Routes.auth.login);
      return;
    }

    setLoading(true);
    try {
      const result = await OnboardingService.setUsername({
        onboarding_token: token,
        new_username: username,
      });
      updatePartialUser({ onboarding_status: result.onboarding_status, username });

      if (result.onboarding_status === "completed") {
        await exchangeOnboardingTokenForAuth(token);
        router.replace(Routes.dashboard);
      } else if (result.onboarding_status) {
        const nextRoute = getOnboardingRoute(result.onboarding_status);
        router.replace(nextRoute);
      }
    } catch (err) {
      const details = interpretServerError(err);
      setError(details[0] || "Could not save username. Please try another one.");
    } finally {
      setLoading(false);
    }
  };

  const statusText = checking
    ? "Checking availability..."
    : available === true
      ? "Username is available"
      : available === false
        ? "Username is already taken"
        : null;

  const statusTone = checking ? "info" : available ? "success" : available === false ? "error" : undefined;

  return (
    <AuthShell>
      <OnboardingHeader
        stepKey="needs_profile_username"
        title="Pick a username"
        subtitle="Make it memorable and easy to find."
      />

      {error && <InlineAlert message={error} />}

      <form onSubmit={submit} className="space-y-4" noValidate>
        <InputField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value.trim())}
          placeholder="jane_doe"
          disabled={loading}
        />

        {statusText && statusTone && <InlineAlert tone={statusTone} message={statusText} />}

        <PrimaryButton
          label="Continue"
          type="submit"
          loading={loading}
          disabled={loading || available === false || !username}
        />
      </form>
    </AuthShell>
  );
}
