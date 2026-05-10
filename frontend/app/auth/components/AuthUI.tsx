"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import appConfig from "@/lib/appconfig";

const heroSlides = [
  {
    title: "Your mental health matters.",
    body: "Kalms helps you track your mood, understand your patterns, and find calm — all in one safe space.",
  },
  {
    title: "Check in, breathe out.",
    body: "Daily wellness check-ins designed to reduce stress and help you stay emotionally balanced.",
  },
  {
    title: "AI companion, human care.",
    body: "Get supportive guidance from Kalms AI, backed by evidence-based mental health practices.",
  },
];

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.12 },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 28 },
  },
};

const fadeSlideIn = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 30, delay: 0.2 },
  },
};

export function HeroPanel({className}:{
    className?: string
}) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      variants={fadeSlideIn}
      initial="hidden"
      animate="visible"
      className={`hero-pan hidden lg:flex relative w-full h-full flex-col justify-end overflow-hidden rounded-[24px] bg-[#0a0a0f] ${className || ""}`}
      style={{
        backgroundImage: `url(${appConfig.backgrounds.authScreens})`,
        backgroundPosition: "top left",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#3a0c8a] via-[#6d28d9] to-transparent opacity-40 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#1e1b4b] via-[#312e81] to-transparent opacity-50 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] opacity-20 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative z-10 px-[3vw] pb-[3vw]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-8"
          >
            <h2 className="text-[4vw] font-bold text-white leading-tight mb-4">
              {heroSlides[activeSlide].title}
            </h2>
            <p className="text-[1.2vw] text-white/70 leading-relaxed max-w-[90%]">
              {heroSlides[activeSlide].body}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-3">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={`
                h-[1vw] rounded-full transition-all duration-300
                ${i === activeSlide ? "w-[3vw] bg-white" : "w-[1vw] bg-white/30 hover:bg-white/50"}
              `}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function InputField({
  label,
  error,
  rightElement,
  className = "",
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  rightElement?: React.ReactNode;
}) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <motion.div variants={itemVariants} className="w-full">
      <label
        htmlFor={inputId}
        className="block text-xs font-medium text-black/60 mb-1.5 tracking-wide"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          className={`
            w-full rounded-[12px] border bg-[#f8fafc] py-3 pl-4
            ${rightElement ? "pr-12" : "pr-4"}
            text-[15px] text-black/60 placeholder:text-black/60
            transition-all duration-200 outline-none
            ${
              error
                ? "border-[#ef4444] focus:border-[#ef4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)]"
                : "border-[#e5e7eb] focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(var(--primary-rgb),0.08)]"
            }
            ${className}
          `}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={errorId}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            id={errorId}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 text-xs text-[#ef4444]"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function PasswordToggle({
  shown,
  onToggle,
  disabled,
}: {
  shown: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-[#9ca3af] hover:text-[#6b7280] transition-colors"
      aria-label={shown ? "Hide password" : "Show password"}
      disabled={disabled}
    >
      {shown ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );
}

export function PrimaryButton({
  label,
  loading,
  disabled,
  type = "button",
  onClick,
}: {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}) {
  const isDisabled = disabled || loading;
  return (
    <motion.button
      variants={itemVariants}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        w-full rounded-[12px] py-3 px-6
        bg-primary text-white font-medium text-[15px]
        flex items-center justify-center gap-2
        transition-all duration-200
        hover:bg-primary-strong
        disabled:opacity-70 disabled:cursor-not-allowed
        shadow-[0_4px_14px_rgba(var(--primary-rgb),0.25)]
      `}
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>Working...</span>
        </>
      ) : (
        <span>{label}</span>
      )}
    </motion.button>
  );
}

export function GhostButton({
  label,
  icon,
  onClick,
  disabled,
  type = "button",
}: {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <motion.button
      variants={itemVariants}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-[12px] py-3 px-6 border border-black/10 text-black/70 font-medium text-[15px] transition-all duration-200 hover:border-black/20 hover:bg-black/5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}

export function InlineAlert({
  tone = "error",
  message,
}: {
  tone?: "error" | "success" | "info";
  message: string;
}) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : tone === "info"
        ? "bg-slate-50 text-slate-700 border-slate-200"
        : "bg-rose-50 text-rose-700 border-rose-100";

  return (
    <motion.div
      variants={itemVariants}
      className={`rounded-[12px] border px-3 py-2 text-xs ${toneClass}`}
      role="status"
    >
      {message}
    </motion.div>
  );
}

export function OnboardingHeader({
  currentStep,
  totalSteps,
  title,
  subtitle,
}: {
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle: string;
}) {
  const clampedTotal = Math.max(1, totalSteps);
  const step = Math.min(Math.max(0, currentStep), clampedTotal - 1);
  const progress = Math.round(((step + 1) / clampedTotal) * 100);

  return (
    <motion.div variants={itemVariants} className="mb-8">
      <div className="flex items-center justify-between text-xs text-black/60">
        <span>
          Step {step + 1} of {clampedTotal}
        </span>
        <span className="text-primary">{progress}% complete</span>
      </div>
      <div className="mt-3 h-1.5 w-full rounded-full bg-black/10">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-6">
        <h1 className="text-[22px] font-semibold cook-font">{title}</h1>
        <p className="text-sm text-black/60 mt-2">{subtitle}</p>
      </div>
    </motion.div>
  );
}

export function LogoMark({
    className
}: {
    className?: string
}) {
  return (
    <div className={"flex items-center gap-3 " + className || ""}>
      <Image
        src={appConfig.logos.green_svg}
        alt={appConfig.appName}
        width={48}
        height={48}
        className="w-12 h-12"
        priority
      />
      <span className="logo-font text-2xl font-bold tracking-tight ">
        {appConfig.appName}
      </span>
    </div>
  );
}
