"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { InlineAlert, PrimaryButton, containerVariants, itemVariants } from "../../../components/AuthUI";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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

    // Extract OAuth params from query string
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const oauthError = searchParams.get("error");
    console.log("OAuth callback received with code:", code, "state:", state, "error:", oauthError);

    // Clean OAuth params from URL immediately
    // window.history.replaceState({}, "", window.location.pathname);
    // console.log("cleaned url removed ?... part", window.location.search);

    // Provider returned an error (e.g. user denied access)
    if (oauthError) {
      const description = searchParams.get("error_description") || oauthError;
      setError(description);
      setIsLoading(false);
      return;
    }

    // No authorization code means this isn't a valid callback
    if (!code) {
      setError(
        "No authorization code received from provider. Please try again.",
      );
      setIsLoading(false);
      return;
    }

    // Validate state (CSRF protection)
    if (state && !OAuthService.validateState(provider, state)) {
      setError(
        "Session has expired",
      );
      setIsLoading(false);
      return;
    }

    try {
      const redirectUri = OAuthService.getRedirectUri(
        provider,
        window.location.origin,
      );

      const response = await OAuthService.loginOrRegister(provider, {
        code,
        state: state || undefined,
        redirect_uri: redirectUri,
      });

      setLoginResponse(response);
    } catch (err: unknown) {
      console.dir(err);
      const details = interpretServerError(err);
      const message =
        details[0] ||
        "OAuth authentication failed. Please try again.";
      setError(message);
    } finally {
      sessionStorage.removeItem("oauth_provider");
      setIsLoading(false);
    }
  }, [provider, searchParams]);

  useEffect(() => {
    handleOAuthCallback();
  }, [handleOAuthCallback]);

  // Invalid provider in URL
  if (!provider) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-[22px] font-semibold cook-font">Invalid provider</h1>
          <p className="text-sm text-black/60 mt-2">
            We could not verify that OAuth provider.
          </p>
        </motion.div>
        <InlineAlert message={`Unknown OAuth provider: "${providerParam}"`} />
        <PrimaryButton
          label="Back to login"
          onClick={() => router.replace(Routes.auth.login)}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-[22px] font-semibold cook-font">Finishing sign-in</h1>
        <p className="text-sm text-black/60 mt-2">
          We are connecting your {provider} account.
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
    </motion.div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<div className="text-sm text-black/60">Finishing OAuth sign in...</div>}>
      <OAuthCallbackPageContent />
    </Suspense>
  );
}
