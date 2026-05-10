"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useRequiredAuth } from "@/lib/api/auth/authContext";
import type { UserType, ProfilePictureUrls } from "@/lib/api/types/auth";

const DEFAULT_PROFILE_PICTURE = "/default_user.webp";

type ImageSize = "original" | "thumbnail" | "medium_square_crop" | "small_square_crop";

type SmartAvatarProps = {
  url?: string;
  name?: string;
  charsToUseFromName?: 1 | 2;
  useSignedInUser?: boolean;
  size?: number; // optional for flexibility (defaults to 40px)
  className?: string;
  preferredImageSize?: ImageSize; // preferred size from profile_picture object
};

function resolveProfilePicture(
  profile_picture: UserType["profile_picture"],
  picture_url: string | null,
  preferredImageSize?: ImageSize
): string | null {
  if (!profile_picture && !picture_url) return null;

  // If profile_picture is string
  if (typeof profile_picture === "string") {
    return profile_picture;
  }

  // If profile_picture is object
  if (
    profile_picture &&
    typeof profile_picture === "object" &&
    "medium_square_crop" in profile_picture
  ) {
    // Try preferred size first if specified
    if (preferredImageSize && preferredImageSize in profile_picture) {
      const preferred = profile_picture[preferredImageSize as keyof typeof profile_picture];
      if (preferred) return preferred;
    }

    // Fallback chain: medium_square_crop > small_square_crop > original
    return (
      profile_picture.medium_square_crop ||
      profile_picture.small_square_crop ||
      profile_picture.original ||
      null
    );
  }

  // Fallback to picture_url if available
  if (picture_url) return picture_url;

  return null;
}

export const SmartAvatar: React.FC<SmartAvatarProps> = ({
  url,
  name,
  charsToUseFromName = 1,
  useSignedInUser = false,
  size = 40,
  className = "",
  preferredImageSize,
}) => {
  const { user } = useRequiredAuth();
  const [imgError, setImgError] = useState(false);

  const resolvedName = useMemo(() => {
    if (name) return name;
    if (useSignedInUser && user) {
      return `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
    }
    return "";
  }, [name, useSignedInUser, user]);

  const initials = useMemo(() => {
    if (!resolvedName) return "";

    const parts = resolvedName.trim().split(/\s+/);

    if (charsToUseFromName === 1) {
      return parts[0]?.[0]?.toUpperCase() ?? "";
    }

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return (
      (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")
    ).toUpperCase();
  }, [resolvedName, charsToUseFromName]);

  const resolvedUrl = useMemo(() => {
    if (url) return url;

    if (useSignedInUser && user) {
      return resolveProfilePicture(user.profile_picture, user.picture_url, preferredImageSize);
    }

    return null;
  }, [url, useSignedInUser, user, preferredImageSize]);

  const finalImageSrc = resolvedUrl && !imgError ? resolvedUrl : DEFAULT_PROFILE_PICTURE;

  // console.log({
  //   finalImageSrc: finalImageSrc,
  //   user: user,
  //   resolvedUrl: resolvedUrl,
  // });

  const showImage = !!resolvedUrl;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-gray-200 text-gray-700 font-medium select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label={resolvedName || "User avatar"}
    >
      {showImage ? (
        <img
          src={finalImageSrc || DEFAULT_PROFILE_PICTURE}
          alt={resolvedName || "User avatar"}
          width={size}
          height={size}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span
          className="flex items-center justify-center w-full h-full"
          style={{ fontSize: size * 0.4 }}
        >
          {initials}
        </span>
      )}
    </div>
  );
};