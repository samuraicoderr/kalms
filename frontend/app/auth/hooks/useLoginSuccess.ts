import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authUtils } from "@/lib/api/auth/TokenManager";
import { useAuth, getOnboardingRoute } from "@/lib/api/auth/authContext";
import { Routes } from "@/lib/api/FrontendRoutes";
import { OAuthLoginResponse } from "@/lib/api/types/auth";
import {
  isMFARequired,
  isAuthTokens,
  isOnboardingRequired,
} from "@/lib/api/types/auth";

export function useLoginSuccess(response: OAuthLoginResponse | null) {
  
  const router = useRouter();
  const { fetchCurrentUser, setOnboardingToken, updatePartialUser } = useAuth();
  useEffect(() => {
    if (!response || authUtils.isAuthenticated()) return;
    
    (async () => {
      // --- Normal auth (JWT tokens) ---
      if (isAuthTokens(response)) {
        authUtils.initializeAuth({
          access: response.access,
          refresh: response.refresh,
          access_expiry: response.access_expiry || "",
          refresh_expiry: response.refresh_expiry || "",
        });
        await fetchCurrentUser();
        router.replace(Routes.home);
        return;
      }

      // --- Onboarding (new user, incomplete profile) ---
      else if (isOnboardingRequired(response)) {
        setOnboardingToken(response.onboarding_token);
        updatePartialUser({
          onboarding_status: response.onboarding_status,
          onboarding_flow: response.onboarding_flow,
          onboarding_token: response.onboarding_token,
          email: response.user?.email,
          first_name: response.user?.first_name,
          last_name: response.user?.last_name,
          username: response.user?.username,
          profile_picture: response.user?.profile_picture,
        });

        const onboardingRoute = getOnboardingRoute(response.onboarding_status);
        router.replace(onboardingRoute);
        return;
      }

      // --- MFA required ---
      else if (isMFARequired(response)) {
        // Store session token so the MFA verification page can use it
        sessionStorage.setItem("mfa_session_token", response.mfa_session_token);
        router.replace(Routes.auth.mfa);
        return;
      }

      else {
        console.warn("⚠️ Unrecognized login response format, redirecting to home.");
        return;
      }
    })();
  }, [response]);
}
