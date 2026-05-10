"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon?: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  rightIcon?: React.ElementType;
  className?: string;
}

export default function SidebarItem({
  icon: Icon,
  label,
  active = false,
  onClick,
  rightIcon: RightIcon,
  className = "",
}: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 group text-left",
        active
          ? "bg-gray-100 text-gray-900 font-medium"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700",
        className
      )}
    >
      {Icon && (
        <Icon
          size={20}
          className={cn(
            "transition-colors flex-shrink-0",
            active
              ? "text-gray-900"
              : "text-gray-400 group-hover:text-gray-600"
          )}
        />
      )}
      <span className="text-sm truncate flex-1">{label}</span>
      {RightIcon && (
        <RightIcon
          size={16}
          className={cn(
            "transition-colors flex-shrink-0",
            active
              ? "text-gray-900"
              : "text-gray-400 group-hover:text-gray-600"
          )}
        />
      )}
    </button>
  );
}
