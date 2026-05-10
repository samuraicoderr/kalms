import React from "react";

interface StepMeta {
  route: string;
  statusKey: string;
  title: string;
  subtitle: string;
}

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  steps?: StepMeta[];
  onStepClick?: (stepIndex: number) => void;
}

export default function OnboardingProgress({
  currentStep,
  totalSteps,
  steps = [],
  onStepClick,
}: OnboardingProgressProps) {
  const safeTotal = Math.max(1, totalSteps);
  const safeStep = Math.min(Math.max(0, currentStep), safeTotal - 1);
  const progress = Math.round(((safeStep + 1) / safeTotal) * 100);

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between text-xs text-black/60">
        <span>
          Step {safeStep + 1} of {safeTotal}
        </span>
        <span className="text-primary">{progress}% complete</span>
      </div>

      <div
        className="mt-3 flex items-center gap-2"
        role="progressbar"
        aria-valuenow={safeStep + 1}
        aria-valuemin={1}
        aria-valuemax={safeTotal}
      >
        {Array.from({ length: safeTotal }, (_, i) => {
          const step = steps[i];
          const isCompleted = i < safeStep;
          const isActive = i === safeStep;
          const isClickable = Boolean(onStepClick && i <= safeStep);
          const stateClass = isCompleted
            ? "bg-primary"
            : isActive
              ? "bg-primary/60"
              : "bg-black/10";

          return (
            <button
              key={step?.statusKey || i}
              type="button"
              onClick={() => isClickable && onStepClick?.(i)}
              disabled={!isClickable}
              className={`h-1.5 flex-1 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${stateClass} ${
                isClickable ? "cursor-pointer hover:bg-primary/80" : "cursor-default"
              }`}
              aria-label={step?.title || `Step ${i + 1}`}
              title={step?.title}
            />
          );
        })}
      </div>
    </div>
  );
}
