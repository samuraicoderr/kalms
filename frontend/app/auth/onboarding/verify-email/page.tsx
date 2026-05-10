"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { InputField, InlineAlert, PrimaryButton } from "../../components/AuthUI";
import OnboardingService from "@/lib/api/services/Onboarding.Service";
import { useAuth, getOnboardingRoute } from "@/lib/api/auth/authContext";
import { Routes } from "@/lib/api/FrontendRoutes";
import { interpretServerError } from "@/lib/utils";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function VerifyEmailPage() {
  const router = useRouter();
  const { partialUser, updatePartialUser } = useAuth();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const email = useMemo(() => partialUser?.email || "", [partialUser?.email]);

  useEffect(() => {
    if (!email) {
      router.replace(Routes.auth.login);
      return;
    }

    let cancelled = false;

    const start = async () => {
      setResending(true);
      try {
        await OnboardingService.sendEmailOtp({ email });
        if (!cancelled) {
          setMessage(`Verification code sent to ${email}`);
          setCooldown(RESEND_SECONDS);
        }
      } catch (err) {
        if (!cancelled) {
          const details = interpretServerError(err);
          setError(details[0] || "Could not send verification code.");
        }
      } finally {
        if (!cancelled) {
          setResending(false);
        }
      }
    };

    start();

    return () => {
      cancelled = true;
    };
  }, [email, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const verifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (otp.length !== OTP_LENGTH) {
      setError("Enter the 6-digit code sent to your email.");
      return;
    }

    if (!email) {
      router.replace(Routes.auth.login);
      return;
    }

    setLoading(true);
    try {
      const result = await OnboardingService.checkEmailOtp({ email, otp });
      updatePartialUser({ is_email_verified: true, onboarding_status: result.onboarding_status });
      if (result.onboarding_status) {
        const nextRoute = getOnboardingRoute(result.onboarding_status);
        router.replace(nextRoute);
      }
    } catch (err) {
      const details = interpretServerError(err);
      setError(details[0] || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (cooldown > 0 || !email) return;

    setError(null);
    setMessage(null);
    setResending(true);

    try {
      await OnboardingService.sendEmailOtp({ email });
      setMessage(`A new verification code was sent to ${email}`);
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      const details = interpretServerError(err);
      setError(details[0] || "Could not resend the code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div>
      {message && <InlineAlert tone="success" message={message} />}
      {error && <InlineAlert message={error} />}

      <form onSubmit={verifyOtp} className="space-y-4" noValidate>
        <InputField
          label="Verification code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={OTP_LENGTH}
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))}
          disabled={loading}
        />

        <PrimaryButton
          label="Verify email"
          loading={loading}
          disabled={loading || otp.length !== OTP_LENGTH}
          type="submit"
        />
      </form>

      <button
        type="button"
        className="mt-4 text-xs text-primary hover:text-primary-strong transition-colors disabled:opacity-60"
        onClick={resendOtp}
        disabled={cooldown > 0 || resending}
      >
        {cooldown > 0 ? `Resend code in ${cooldown}s` : resending ? "Sending..." : "Resend code"}
      </button>
    </div>
  );
}
