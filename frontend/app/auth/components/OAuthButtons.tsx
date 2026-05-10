"use client";

import React, { useMemo, useState } from "react";
import { OAuthProviders, type OAuthProviderType } from "@/lib/api/types/auth";
import OAuthService from "@/lib/api/services/OAuth.Service";
import {
  AppleIcon,
  GitHubIcon,
  GoogleIcon,
  TwitterIcon,
} from "./AuthComponents";
import { GhostButton } from "./AuthUI";

interface OAuthButtonsProps {
  mode: "login" | "register";
  onError?: (message: string) => void;
  onSuccess?: (data: any) => void;
}

interface ProviderConfig {
  key: OAuthProviderType;
  label: string;
  icon: React.ReactNode;
  primary?: boolean;
}

const PROVIDERS: ProviderConfig[] = [
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

export default function OAuthButtons({ mode, onError, onSuccess }: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<OAuthProviderType | null>(null);

  const cta = useMemo(() => {
    return mode === "login" ? "Sign in" : "Sign up";
  }, [mode]);

  const startOAuth = (provider: OAuthProviderType) => {
    setLoadingProvider(provider);

    const redirectUri = OAuthService.getRedirectUri(provider, window.location.origin);
    const authUrl = OAuthService.getOAuthUrl(provider, redirectUri);

    if (!authUrl) {
      setLoadingProvider(null);
      onError?.(`OAuth for ${provider} is not configured yet.`);
      return;
    }

    // Store which provider we're using so we know on return
    sessionStorage.setItem("oauth_provider", provider);

    // Redirect to Google/GitHub/etc.
    window.location.href = authUrl;
  };

  return (
    <div className="space-y-3">
      {PROVIDERS.map((provider) => {
        const configured = OAuthService.isProviderConfigured(provider.key);
        const label = configured
          ? provider.label
          : `${provider.label} (coming soon)`;

        return (
          <GhostButton
            key={provider.key}
            label={
              loadingProvider === provider.key
                ? "Connecting..."
                : label
            }
            icon={provider.icon}
            onClick={() => startOAuth(provider.key)}
            disabled={!configured || loadingProvider !== null}
          />
        );
      })}
    </div>
  );
}