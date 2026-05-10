"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import AuthDivider from "../components/AuthDivider";
import OAuthButtons from "../components/OAuthButtons";
import {
  InlineAlert,
  InputField,
  PasswordToggle,
  PrimaryButton,
  containerVariants,
  itemVariants,
} from "../components/AuthUI";
import { useAuth, getOnboardingRoute } from "@/lib/api/auth/authContext";
import { Routes } from "@/lib/api/FrontendRoutes";
import { interpretServerError } from "@/lib/utils";

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, error, clearError, updatePartialUser, setOnboardingToken, isLoading } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (!EMAIL_RE.test(email.trim())) nextErrors.email = "Enter a valid email address.";
    if (password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormMessage(null);
    clearError();

    if (!validate()) return;

    try {
      const response = await register({
        email: email.trim(),
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });

      if (response.onboarding_token) {
        setOnboardingToken(response.onboarding_token);
      }

      updatePartialUser({
        onboarding_status: response.onboarding_status,
        onboarding_flow: response.onboarding_flow,
        email: response.email,
        first_name: response.first_name,
        last_name: response.last_name,
        username: response.username,
        profile_picture: response.profile_picture,
      });

      const nextRoute = getOnboardingRoute(response.onboarding_status);
      router.replace(nextRoute);
    } catch (err) {
      const serverErrors = interpretServerError(err);
      const fallback = error?.message || "Unable to create account. Please try again.";
      setFormMessage(serverErrors[0] || fallback);
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
        <h1 className="text-[22px] font-semibold cook-font">Create your account</h1>
        <p className="text-sm text-black/60 mt-2">
          Set up your profile in a few quick steps.
        </p>
      </motion.div>

      {formMessage && <InlineAlert message={formMessage} />}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Jane"
            autoComplete="given-name"
            error={formErrors.firstName}
            disabled={isLoading}
          />
          <InputField
            label="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            autoComplete="family-name"
            error={formErrors.lastName}
            disabled={isLoading}
          />
        </div>

        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          autoComplete="email"
          error={formErrors.email}
          disabled={isLoading}
        />

        <InputField
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          autoComplete="new-password"
          error={formErrors.password}
          disabled={isLoading}
          rightElement={
            <PasswordToggle
              shown={showPassword}
              onToggle={() => setShowPassword((prev) => !prev)}
            />
          }
        />

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                index <= strength ? "bg-primary" : "bg-black/10"
              }`}
            />
          ))}
          <span className="text-xs text-black/50">
            {strength >= 3 ? "Strong" : strength === 2 ? "Good" : strength === 1 ? "Fair" : ""}
          </span>
        </div>

        <InputField
          label="Confirm password"
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat your password"
          autoComplete="new-password"
          error={formErrors.confirmPassword}
          disabled={isLoading}
          rightElement={
            <PasswordToggle
              shown={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((prev) => !prev)}
            />
          }
        />

        <PrimaryButton
          label="Create account"
          loading={isLoading}
          disabled={isLoading}
          type="submit"
        />
      </form>

      <AuthDivider text="or sign up with" />
      <OAuthButtons mode="register" onError={(message) => setFormMessage(message)} />

      <motion.p variants={itemVariants} className="text-center text-xs text-black/60">
        Already have an account?{" "}
        <Link
          href={Routes.auth.login}
          className="font-semibold text-primary hover:text-primary-strong transition-colors"
        >
          Sign in
        </Link>
      </motion.p>
    </motion.div>
  );
}
