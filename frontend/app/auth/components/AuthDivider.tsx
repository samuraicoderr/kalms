import React from "react";

export default function AuthDivider({ text = "or continue with" }: { text?: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="h-px flex-1 bg-black/10" />
      <span className="text-xs text-black/40">{text}</span>
      <div className="h-px flex-1 bg-black/10" />
    </div>
  );
}
