import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  Heart,
  LineChart,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Routes } from "@/lib/api/FrontendRoutes";
import type { WeeklyMoodPoint } from "@/lib/api/types";

export type Tone = "purple" | "blue" | "green" | "amber" | "rose" | "slate";

const toneClasses: Record<Tone, string> = {
  purple: "bg-[#f3e8ff] text-primary border-[#eadcff]",
  blue: "bg-[#dbeafe] text-[#1d4ed8] border-[#c7ddff]",
  green: "bg-[#dcfce7] text-[#15803d] border-[#c9f5d8]",
  amber: "bg-[#fef3c7] text-[#b45309] border-[#fde68a]",
  rose: "bg-[#fee2e2] text-[#b91c1c] border-[#fecaca]",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
};

export const assessmentCards = [
  {
    title: "PHQ-9",
    subtitle: "Depression screening",
    body: "Nine quick prompts that help you reflect on mood, sleep, energy, and interest.",
    duration: "3 min",
    questions: "9 questions",
    tone: "blue" as Tone,
    href: Routes.dashboardRoutes.phq9,
  },
  {
    title: "GAD-7",
    subtitle: "Anxiety check",
    body: "A focused check-in for worry, restlessness, tension, and concentration.",
    duration: "2 min",
    questions: "7 questions",
    tone: "green" as Tone,
    href: Routes.dashboardRoutes.gad7,
  },
  {
    title: "PSS-10",
    subtitle: "Stress reflection",
    body: "A calm look at perceived stress, control, overload, and recovery capacity.",
    duration: "4 min",
    questions: "10 questions",
    tone: "amber" as Tone,
    href: Routes.dashboardRoutes.pss10,
  },
];

export const settingsGroups = [
  {
    title: "Account",
    icon: UserRound,
    items: ["Profile details", "University information", "Connected email"],
  },
  {
    title: "Security",
    icon: LockKeyhole,
    items: ["Password", "Active sessions", "Recovery options"],
  },
  {
    title: "Privacy",
    icon: ShieldCheck,
    items: ["Data export", "Assessment visibility", "Chat history controls"],
  },
  {
    title: "Notifications",
    icon: SlidersHorizontal,
    items: ["Check-in reminders", "Assessment nudges", "Motivation tone"],
  },
];

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow && (
          <p className="mb-2 text-sm font-medium text-primary">{eyebrow}</p>
        )}
        <h1 className="text-3xl font-semibold tracking-tight text-[#111827] md:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-base leading-7 text-[#6b7280]">{description}</p>
      </div>
      {action}
    </section>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </section>
  );
}

export function SoftIcon({
  icon: Icon,
  tone = "purple",
}: {
  icon: LucideIcon;
  tone?: Tone;
}) {
  return (
    <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${toneClasses[tone]}`}>
      <Icon size={20} />
    </span>
  );
}

export function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(var(--primary-rgb),0.22)] transition hover:bg-primary-strong"
    >
      {children}
      <ArrowRight size={16} />
    </Link>
  );
}

export function SecondaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/15 bg-[#ede7ff] px-5 py-3 text-sm font-semibold text-primary transition hover:border-primary/25 hover:bg-[#e5d8ff]"
    >
      {children}
    </Link>
  );
}

export function MetricCard({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  tone: Tone;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <SoftIcon icon={icon} tone={tone} />
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-[#6b7280]">
          {detail}
        </span>
      </div>
      <p className="mt-5 text-sm text-[#6b7280]">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-[#111827]">{value}</p>
    </Card>
  );
}

export function MiniTrend({ values }: { values: number[] }) {
  if (values.length < 2) {
    return (
      <div className="flex h-36 w-full items-center justify-center rounded-2xl bg-slate-50 text-sm font-medium text-[#6b7280]">
        Add more check-ins to see a trend.
      </div>
    );
  }

  const points = values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * 100;
      const y = 100 - Math.min(100, Math.max(0, value));
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" className="h-36 w-full overflow-visible" role="img" aria-label="Seven day wellness trend">
      <defs>
        <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3a0c8a" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#3a0c8a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={`0,100 ${points} 100,100`}
        fill="url(#trendFill)"
        stroke="none"
      />
      <polyline
        points={points}
        fill="none"
        stroke="#3a0c8a"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
    </svg>
  );
}

export function AssessmentCard({
  item,
}: {
  item: (typeof assessmentCards)[number];
}) {
  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <SoftIcon icon={BookOpenCheck} tone={item.tone} />
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-[#6b7280]">
          {item.duration}
        </span>
      </div>
      <div className="mt-5 flex-1">
        <p className="text-sm font-medium text-primary">{item.subtitle}</p>
        <h2 className="mt-2 text-2xl font-semibold text-[#111827]">{item.title}</h2>
        <p className="mt-3 text-sm leading-6 text-[#6b7280]">{item.body}</p>
      </div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="text-sm text-[#6b7280]">{item.questions}</span>
        <Link href={item.href} className="text-sm font-semibold text-primary hover:text-primary-strong">
          Preview
        </Link>
      </div>
    </Card>
  );
}

export function SafetyNote() {
  return (
    <Card className="border-primary/10 bg-[#fbfaff]">
      <div className="flex gap-4">
        <SoftIcon icon={ShieldCheck} tone="purple" />
        <div>
          <h2 className="text-lg font-semibold text-[#111827]">Private, supportive, non-diagnostic</h2>
          <p className="mt-2 text-sm leading-6 text-[#6b7280]">
            Kalms helps you notice patterns and reflect on your wellbeing. It does not replace professional care, and urgent concerns should be shared with a trusted person or local emergency support.
          </p>
        </div>
      </div>
    </Card>
  );
}

export const quickActions = [
  { icon: BookOpenCheck, title: "Start assessment", href: Routes.dashboardRoutes.startAssessment },
  { icon: MessageCircle, title: "Open companion", href: Routes.dashboardRoutes.chat },
  { icon: Heart, title: "Log mood", href: Routes.dashboardRoutes.moodTracker },
  { icon: LineChart, title: "View insights", href: Routes.dashboardRoutes.insights },
];

export function MoodBars({ points }: { points: WeeklyMoodPoint[] }) {
  const hasLogs = points.some((point) => point.has_log);

  if (!hasLogs) {
    return (
      <div className="mt-6 flex h-40 items-center justify-center rounded-2xl bg-slate-50 text-center text-sm font-medium text-[#6b7280]">
        Your saved mood logs will appear here.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-7 items-end gap-3 pt-6">
      {points.map((item) => {
        const value = item.wellness_score === null ? 0 : Math.round((item.wellness_score / 30) * 100);
        return (
          <div key={item.date} className="text-center">
            <div className="mx-auto flex h-40 w-full max-w-10 items-end rounded-full bg-slate-100 p-1">
              <div
                className={`w-full rounded-full ${item.has_log ? "bg-primary" : "bg-slate-200"}`}
                style={{ height: `${Math.max(8, value)}%` }}
              />
            </div>
            <p className="mt-3 text-xs font-medium text-[#111827]">{item.day_label}</p>
            <p className="mt-1 text-[11px] text-[#9ca3af]">{item.has_log ? item.mood_label : "no log"}</p>
          </div>
        );
      })}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <Card className="text-center">
      <div className="mx-auto flex justify-center">
        <SoftIcon icon={icon} tone="purple" />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-[#111827]">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#6b7280]">{body}</p>
    </Card>
  );
}

export { BarChart3, CheckCircle2, Clock3, MessageCircle, Sparkles };
