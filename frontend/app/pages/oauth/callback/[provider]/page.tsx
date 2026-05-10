"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  AuthShell,
  InlineAlert,
  PrimaryButton,
  itemVariants,
} from "../../../components/AuthUI";
import { motion } from "motion/react";
import OAuthService from "@/lib/api/services/OAuth.Service";
import { Routes } from "@/lib/api/FrontendRoutes";
import { OAuthLoginResponse, OAuthProviders, type OAuthProviderType } from "@/lib/api/types/auth";
import { interpretServerError } from "@/lib/utils";
import { useLoginSuccess } from "@/app/auth/hooks/useLoginSuccess";

function isOAuthProvider(value: string): value is OAuthProviderType {
  return Object.values(OAuthProviders).includes(value as OAuthProviderType);
}

function OAuthCallbackPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ provider: string }>();
  const providerParam = params.provider;
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginResponse, setLoginResponse] = useState<OAuthLoginResponse | null>(null);

  const provider = useMemo(() => {
    if (!providerParam || !isOAuthProvider(providerParam)) {
      return null;
    }
    return providerParam;
  }, [providerParam]);

  useLoginSuccess(loginResponse);

  const handleOAuthCallback = useCallback(async () => {
    if (!provider) {
      setError("Unknown or unsupported OAuth provider.");
      setIsLoading(false);
      return;
    }

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const oauthError = searchParams.get("error");

    if (oauthError) {
      const description = searchParams.get("error_description") || oauthError;
      setError(description);
      setIsLoading(false);
      return;
    }

    if (!code) {
      setError("No authorization code received from provider. Please try again.");
      setIsLoading(false);
      return;
    }

    if (state && !OAuthService.validateState(provider, state)) {
      setError("Session has expired.");
      setIsLoading(false);
      return;
    }

    try {
      const redirectUri = OAuthService.getRedirectUri(provider, window.location.origin);
      const response = await OAuthService.loginOrRegister(provider, {
        code,
        state: state || undefined,
        redirect_uri: redirectUri,
      });

      setLoginResponse(response);
      setError(null);
    } catch (err: any) {
      const message =
        interpretServerError(err) ||
        err?.response?.data?.details ||
        err?.response?.data?.error ||
        "OAuth authentication failed. Please try again.";
      setError(String(message));
    } finally {
      sessionStorage.removeItem("oauth_provider");
      setIsLoading(false);
    }
  }, [provider, searchParams]);

  useEffect(() => {
    handleOAuthCallback();
  }, [handleOAuthCallback]);

  return (
    <AuthShell>
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="text-[22px] font-semibold cook-font">Finishing sign-in</h1>
        <p className="text-sm text-black/60 mt-2">
          {provider ? `Connecting your ${provider} account.` : "Preparing your session."}
        </p>
      </motion.div>

      {error ? (
        <div className="space-y-4">
          <InlineAlert message={error} />
          <PrimaryButton
            label="Back to login"
            onClick={() => router.replace(Routes.auth.login)}
          />
        </div>
      ) : (
        <InlineAlert tone="info" message={isLoading ? "Please wait..." : "Redirecting..."} />
      )}
    </AuthShell>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<div className="text-sm text-black/60">Finishing OAuth sign-in...</div>}>
      <OAuthCallbackPageContent />
    </Suspense>
  );
}
