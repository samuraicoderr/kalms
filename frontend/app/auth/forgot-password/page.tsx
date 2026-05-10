"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  InlineAlert,
  InputField,
  PasswordToggle,
  PrimaryButton,
  containerVariants,
  itemVariants,
} from "../components/AuthUI";
import { Routes } from "@/lib/api/FrontendRoutes";
import { apiClient } from "@/lib/api/ApiClient";
import { BackendRoutes } from "@/lib/api/BackendRoutes";
import { interpretServerError } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

type Stage = "request" | "reset";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [stage, setStage] = useState<Stage>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const sendOtp = async () => {
    setError(null);
    setMessage(null);

    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(
        BackendRoutes.auth.sendForgotPasswordOtp,
        { email: email.trim() },
        { requiresAuth: false }
      );
      setStage("reset");
      setCooldown(RESEND_SECONDS);
      setMessage(`We sent a reset code to ${email.trim()}.`);
    } catch (err) {
      const details = interpretServerError(err);
      setError(details[0] || "Could not send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (cooldown > 0 || resending || loading) return;
    setError(null);
    setMessage(null);
    setResending(true);

    try {
      await apiClient.post(
        BackendRoutes.auth.sendForgotPasswordOtp,
        { email: email.trim() },
        { requiresAuth: false }
      );
      setCooldown(RESEND_SECONDS);
      setMessage(`A new code was sent to ${email.trim()}.`);
    } catch (err) {
      const details = interpretServerError(err);
      setError(details[0] || "Could not resend the code.");
    } finally {
      setResending(false);
    }
  };

  const resetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    if (otp.length !== OTP_LENGTH) {
      setError("Enter the 6-digit code we sent to your email.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(
        BackendRoutes.auth.resetForgotPassword,
        { email: email.trim(), otp, new_password: password },
        { requiresAuth: false }
      );
      setMessage("Password reset successful. Redirecting to login...");
      setTimeout(() => router.replace(Routes.auth.login), 1200);
    } catch (err) {
      const details = interpretServerError(err);
      setError(details[0] || "Could not reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-[22px] font-semibold cook-font">Reset your password</h1>
        <p className="text-sm text-black/60 mt-2">
          {stage === "request"
            ? "We will send a secure reset code to your email."
            : "Enter the code and set a new password."}
        </p>
      </motion.div>

      {message && <InlineAlert tone="success" message={message} />}
      {error && <InlineAlert message={error} />}

      {stage === "request" ? (
        <div className="space-y-4">
          <InputField
            label="Email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <PrimaryButton
            label="Send reset code"
            loading={loading}
            onClick={sendOtp}
          />
        </div>
      ) : (
        <form onSubmit={resetPassword} className="space-y-4" noValidate>
          <InputField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <InputField
            label="Verification code"
            inputMode="numeric"
            maxLength={OTP_LENGTH}
            placeholder="000000"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))
            }
          />

          <InputField
            label="New password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            rightElement={
              <PasswordToggle
                shown={showPassword}
                onToggle={() => setShowPassword((prev) => !prev)}
              />
            }
          />

          <InputField
            label="Confirm password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Repeat new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            rightElement={
              <PasswordToggle
                shown={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((prev) => !prev)}
              />
            }
          />

          <PrimaryButton label="Reset password" type="submit" loading={loading} />

          <motion.button
            variants={itemVariants}
            type="button"
            onClick={resendOtp}
            disabled={cooldown > 0 || resending}
            className="w-full text-xs text-primary hover:text-primary-strong transition-colors disabled:opacity-60"
          >
            {cooldown > 0
              ? `Resend code in ${cooldown}s`
              : resending
                ? "Sending..."
                : "Resend code"}
          </motion.button>
        </form>
      )}

      <motion.p variants={itemVariants} className="text-center text-xs text-black/60">
        Remembered your password?{" "}
        <Link
          href={Routes.auth.login}
          className="font-semibold text-primary hover:text-primary-strong transition-colors"
        >
          Back to sign in
        </Link>
      </motion.p>
    </motion.div>
  );
}
