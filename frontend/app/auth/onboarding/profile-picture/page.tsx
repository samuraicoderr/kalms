"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { InlineAlert, PrimaryButton } from "../../components/AuthUI";
import OnboardingService from "@/lib/api/services/Onboarding.Service";
import { useAuth, getOnboardingRoute } from "@/lib/api/auth/authContext";
import { Routes } from "@/lib/api/FrontendRoutes";
import { interpretServerError, isInvalidOrExpiredOnboardingTokenError } from "@/lib/utils";
import { storeAuthRedirectMessage } from "@/lib/api/auth/redirect";

export default function ProfilePicturePage() {
  const router = useRouter();
  const { onboardingToken, partialUser, updatePartialUser, exchangeOnboardingTokenForAuth, setOnboardingToken } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => {
    return onboardingToken || partialUser?.onboarding_token || "";
  }, [onboardingToken, partialUser?.onboarding_token]);

  const redirectExpiredOnboarding = useCallback(() => {
    setOnboardingToken(null);
    storeAuthRedirectMessage("Your onboarding session expired. Please sign in again.");
    router.replace(Routes.auth.login);
  }, [router, setOnboardingToken]);

  useEffect(() => {
    if (!token) {
      router.replace(Routes.auth.login);
      return;
    }

    // Fetch latest user data from backend
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
        // Update preview with fetched data
        if (userData.profile_picture) {
          const pp = userData.profile_picture;
          const previewUrl = typeof pp === 'string' ? pp : (pp.medium_square_crop || pp.original || null);
          setPreview(previewUrl);
        } else {
          setPreview(null);
        }
      } catch (err) {
        if (isInvalidOrExpiredOnboardingTokenError(err)) {
          redirectExpiredOnboarding();
          return;
        }
      }
    };

    fetchUserData();
  }, [redirectExpiredOnboarding, token, router, updatePartialUser]);

  const onFile = (nextFile: File | null) => {
    if (!nextFile) return;
    if (!nextFile.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    setError(null);
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    onFile(e.dataTransfer.files[0] || null);
  };

  const submit = async () => {
    if (!token || !file) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await OnboardingService.setProfilePicture(token, file);
      updatePartialUser({
        onboarding_status: result.onboarding_status,
        profile_picture: result.profile_picture,
      });
      
      // Check if onboarding is completed and auto-login
      if (result.onboarding_status === "completed") {
        await exchangeOnboardingTokenForAuth(token);
        router.replace(Routes.dashboard);
      } else if (result.onboarding_status) {
        const nextRoute = getOnboardingRoute(result.onboarding_status);
        router.replace(nextRoute);
      }
    } catch (err) {
      if (isInvalidOrExpiredOnboardingTokenError(err)) {
        redirectExpiredOnboarding();
        return;
      }
      const details = interpretServerError(err);
      setError(details[0] || "Could not upload profile picture.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <InlineAlert message={error} />}

      <div
        className={`w-full rounded-[18px] border-2 border-dashed px-6 py-10 text-center transition-all cursor-pointer ${
          dragActive ? "border-primary bg-primary/5" : "border-black/10 bg-white"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        {preview ? (
          <img
            className="mx-auto h-32 w-32 rounded-full object-cover border border-black/10"
            src={preview}
            alt="Profile preview"
          />
        ) : (
          <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-semibold">
            {partialUser?.first_name?.[0] || "K"}
          </div>
        )}

        <p className="mt-4 text-sm text-black/60">
          <span className="text-primary font-semibold">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-black/40 mt-1">PNG, JPG, WEBP up to 5MB</p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => onFile(e.target.files?.[0] || null)}
        />
      </div>

      <div className="mt-6">
        <PrimaryButton
          label="Save and continue"
          loading={loading}
          disabled={loading || !file}
          onClick={submit}
        />
      </div>
    </div>
  );
}
