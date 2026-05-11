import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Heart,
  LineChart,
  LockKeyhole,
  MessageCircle,
  Moon,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Routes } from "@/lib/api/FrontendRoutes";

export type Tone = "purple" | "blue" | "green" | "amber" | "rose" | "slate";

const toneClasses: Record<Tone, string> = {
  purple: "bg-[#f3e8ff] text-primary border-[#eadcff]",
  blue: "bg-[#dbeafe] text-[#1d4ed8] border-[#c7ddff]",
  green: "bg-[#dcfce7] text-[#15803d] border-[#c9f5d8]",
  amber: "bg-[#fef3c7] text-[#b45309] border-[#fde68a]",
  rose: "bg-[#fee2e2] text-[#b91c1c] border-[#fecaca]",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
};

export const wellnessScores = [
  { label: "PHQ-9", value: 6, max: 27, note: "mild", tone: "blue" as Tone },
  { label: "GAD-7", value: 5, max: 21, note: "low", tone: "green" as Tone },
  { label: "PSS-10", value: 17, max: 40, note: "moderate", tone: "amber" as Tone },
];

export const weeklyTrend = [42, 46, 40, 55, 49, 62, 68];

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

export const historyRows = [
  { date: "May 9", assessment: "PHQ-9 + GAD-7", result: "Healthy", score: "11 total", tone: "green" as Tone },
  { date: "May 2", assessment: "PSS-10", result: "At Risk", score: "19 stress", tone: "amber" as Tone },
  { date: "Apr 25", assessment: "Full wellness scan", result: "Healthy", score: "24 total", tone: "green" as Tone },
  { date: "Apr 18", assessment: "PHQ-9", result: "Mild", score: "7 mood", tone: "blue" as Tone },
];

export const chatMessages = [
  {
    role: "assistant",
    text: "I'm here with you. What feels heaviest right now: school pressure, relationships, sleep, or something else?",
  },
  {
    role: "user",
    text: "Mostly school pressure. I keep feeling behind even when I study.",
  },
  {
    role: "assistant",
    text: "That can feel exhausting. Let's slow it down and pick one small next step for the next 20 minutes.",
  },
];

export const recommendations = [
  "Try a 4-minute breathing reset before your next study block.",
  "Your stress scores rise near assessment weeks. Plan lighter evenings on those days.",
  "Keep logging energy in the morning; it is your strongest signal for burnout prevention.",
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

export function MiniTrend({ values = weeklyTrend }: { values?: number[] }) {
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * 100;
      const y = 100 - value;
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

export function WellnessScoreList() {
  return (
    <div className="space-y-4">
      {wellnessScores.map((score) => {
        const width = Math.round((score.value / score.max) * 100);
        return (
          <div key={score.label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-[#111827]">{score.label}</span>
              <span className="text-[#6b7280]">
                {score.value}/{score.max} - {score.note}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DailyCheckInCard() {
  const sliders = [
    { label: "Mood", value: 7, icon: Heart },
    { label: "Energy", value: 6, icon: Zap },
    { label: "Stress", value: 4, icon: Wind },
  ];

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Daily check-in</p>
          <h2 className="mt-2 text-xl font-semibold text-[#111827]">
            How are you arriving today?
          </h2>
        </div>
        <SoftIcon icon={Heart} tone="purple" />
      </div>
      <div className="mt-6 space-y-5">
        {sliders.map((item) => (
          <label key={item.label} className="block">
            <span className="mb-2 flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2 font-medium text-[#111827]">
                <item.icon size={16} className="text-primary" />
                {item.label}
              </span>
              <span className="text-[#6b7280]">{item.value}/10</span>
            </span>
            <input
              type="range"
              min={1}
              max={10}
              defaultValue={item.value}
              className="w-full accent-primary"
            />
          </label>
        ))}
      </div>
      <button className="mt-6 w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-strong">
        Save today's check-in
      </button>
    </Card>
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

export const dashboardMetrics = [
  { icon: BookOpenCheck, label: "Assessments", value: "12", detail: "3 this month", tone: "purple" as Tone },
  { icon: Target, label: "Check-in streak", value: "7 days", detail: "steady", tone: "green" as Tone },
  { icon: Brain, label: "Current status", value: "Healthy", detail: "low risk", tone: "blue" as Tone },
  { icon: TrendingUp, label: "Trend", value: "+8%", detail: "improving", tone: "amber" as Tone },
];

export const quickActions = [
  { icon: BookOpenCheck, title: "Start assessment", href: Routes.dashboardRoutes.startAssessment },
  { icon: MessageCircle, title: "Open companion", href: Routes.dashboardRoutes.chat },
  { icon: Heart, title: "Log mood", href: Routes.dashboardRoutes.moodTracker },
  { icon: LineChart, title: "View insights", href: Routes.dashboardRoutes.insights },
];

export const moodWeek = [
  { day: "Mon", mood: "calm", value: 72 },
  { day: "Tue", mood: "tired", value: 58 },
  { day: "Wed", mood: "steady", value: 64 },
  { day: "Thu", mood: "stressed", value: 46 },
  { day: "Fri", mood: "hopeful", value: 70 },
  { day: "Sat", mood: "rested", value: 82 },
  { day: "Sun", mood: "clear", value: 76 },
];

export function MoodBars() {
  return (
    <div className="grid grid-cols-7 items-end gap-3 pt-6">
      {moodWeek.map((item) => (
        <div key={item.day} className="text-center">
          <div className="mx-auto flex h-40 w-full max-w-10 items-end rounded-full bg-slate-100 p-1">
            <div
              className="w-full rounded-full bg-primary"
              style={{ height: `${item.value}%` }}
            />
          </div>
          <p className="mt-3 text-xs font-medium text-[#111827]">{item.day}</p>
          <p className="mt-1 text-[11px] text-[#9ca3af]">{item.mood}</p>
        </div>
      ))}
    </div>
  );
}

export function CompanionPreview() {
  return (
    <Card className="min-h-[520px]">
      <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4">
        <div className="flex items-center gap-3">
          <SoftIcon icon={Sparkles} tone="purple" />
          <div>
            <h2 className="font-semibold text-[#111827]">Kalms AI Companion</h2>
            <p className="text-sm text-[#6b7280]">Supportive guidance, not diagnosis</p>
          </div>
        </div>
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">Online</span>
      </div>
      <div className="mt-6 space-y-4">
        {chatMessages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <p
              className={`max-w-[82%] rounded-[22px] px-4 py-3 text-sm leading-6 ${
                message.role === "user"
                  ? "bg-primary text-white"
                  : "bg-slate-50 text-[#111827]"
              }`}
            >
              {message.text}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-[22px] border border-[#e5e7eb] bg-slate-50 p-3">
        <div className="flex items-center gap-3">
          <input
            aria-label="Message Kalms AI Companion"
            placeholder="Type what you are feeling..."
            className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-[#9ca3af]"
          />
          <button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">
            Send
          </button>
        </div>
      </div>
    </Card>
  );
}

export function InsightList() {
  const insights = [
    { icon: Moon, title: "Sleep has the strongest link to your mood", body: "Lower energy logs usually follow shorter nights. Protect one consistent bedtime this week." },
    { icon: CalendarDays, title: "Stress rises before deadlines", body: "Your highest stress days appear 24-48 hours before academic submissions." },
    { icon: Activity, title: "Check-ins are becoming steadier", body: "You logged five of the last seven days, enough to start seeing useful patterns." },
  ];

  return (
    <div className="space-y-4">
      {insights.map((insight) => (
        <div key={insight.title} className="flex gap-4 rounded-[18px] border border-[#e5e7eb] bg-white p-4">
          <SoftIcon icon={insight.icon} tone="purple" />
          <div>
            <h3 className="font-semibold text-[#111827]">{insight.title}</h3>
            <p className="mt-1 text-sm leading-6 text-[#6b7280]">{insight.body}</p>
          </div>
        </div>
      ))}
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
