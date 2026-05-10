"use client";

import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AuthShell,
  InputField,
  InlineAlert,
  PasswordToggle,
  PrimaryButton,
  GhostButton,
  itemVariants,
} from "../components/AuthUI";
import {
  AppleIcon,
  GitHubIcon,
  GoogleIcon,
  TwitterIcon,
} from "@/app/auth/components/AuthComponents";
import { useAuth, getOnboardingRoute } from "@/lib/api/auth/authContext";
import { Routes } from "@/lib/api/FrontendRoutes";
import OAuthService from "@/lib/api/services/OAuth.Service";
import { OAuthProviders, type OAuthProviderType } from "@/lib/api/types/auth";
import { interpretServerError } from "@/lib/utils";

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PROVIDERS: Array<{
  key: OAuthProviderType;
  label: string;
  icon: React.ReactNode;
  primary?: boolean;
}> = [
  {
    key: OAuthProviders.GOOGLE,
    label: "Continue with Google",
    icon: <GoogleIcon />,
    primary: true,
  },
  {
    key: OAuthProviders.GITHUB,
    label: "GitHub",
    icon: <GitHubIcon />,
  },
  {
    key: OAuthProviders.APPLE,
    label: "Apple",
    icon: <AppleIcon />,
  },
  {
    key: OAuthProviders.TWITTER,
    label: "Twitter",
    icon: <TwitterIcon />,
  },
];

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
  const [loadingProvider, setLoadingProvider] = useState<OAuthProviderType | null>(null);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (!EMAIL_RE.test(email.trim())) nextErrors.email = "Enter a valid email address.";
    if (password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    if (confirmPassword !== password) nextErrors.confirmPassword = "Passwords do not match.";

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

  const startOAuth = (provider: OAuthProviderType) => {
    setLoadingProvider(provider);
    const redirectUri = OAuthService.getRedirectUri(provider, window.location.origin);
    const authUrl = OAuthService.getOAuthUrl(provider, redirectUri);

    if (!authUrl) {
      setLoadingProvider(null);
      setFormMessage(`OAuth for ${provider} is not configured yet.`);
      return;
    }

    sessionStorage.setItem("oauth_provider", provider);
    window.location.href = authUrl;
  };

  return (
    <AuthShell>
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-[22px] font-semibold cook-font">Create your account</h1>
        <p className="text-sm text-black/60 mt-2">
          Start your calm journey in just a few steps.
        </p>
      </motion.div>

      {formMessage && <InlineAlert message={formMessage} />}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="First name"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (formErrors.firstName) {
                setFormErrors((prev) => ({ ...prev, firstName: undefined }));
              }
            }}
            error={formErrors.firstName}
            autoComplete="given-name"
          />
          <InputField
            label="Last name"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              if (formErrors.lastName) {
                setFormErrors((prev) => ({ ...prev, lastName: undefined }));
              }
            }}
            error={formErrors.lastName}
            autoComplete="family-name"
          />
        </div>

        <InputField
          label="Email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (formErrors.email) {
              setFormErrors((prev) => ({ ...prev, email: undefined }));
            }
          }}
          error={formErrors.email}
          autoComplete="email"
        />

        <InputField
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Create a password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (formErrors.password) {
              setFormErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
          error={formErrors.password}
          autoComplete="new-password"
          rightElement={
            <PasswordToggle
              shown={showPassword}
              onToggle={() => setShowPassword((prev) => !prev)}
              disabled={isLoading}
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
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (formErrors.confirmPassword) {
              setFormErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }
          }}
          error={formErrors.confirmPassword}
          autoComplete="new-password"
          rightElement={
            <PasswordToggle
              shown={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((prev) => !prev)}
              disabled={isLoading}
            />
          }
        />

        <PrimaryButton label="Create account" type="submit" loading={isLoading} />
      </form>

      <motion.div variants={itemVariants} className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-black/10" />
        <span className="text-xs text-black/40">or continue with</span>
        <div className="h-px flex-1 bg-black/10" />
      </motion.div>

      <div className="space-y-3">
        {PROVIDERS.map((provider) => (
          <GhostButton
            key={provider.key}
            label={
              loadingProvider === provider.key
                ? "Connecting..."
                : provider.label
            }
            icon={provider.icon}
            onClick={() => startOAuth(provider.key)}
            disabled={loadingProvider !== null}
          />
        ))}
      </div>

      <motion.p variants={itemVariants} className="text-center mt-8 text-xs text-black/60">
        Already have an account?{" "}
        <Link
          href={Routes.auth.login}
          className="font-semibold text-primary hover:text-primary-strong transition-colors"
        >
          Sign in
        </Link>
      </motion.p>
    </AuthShell>
  );
}
