"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import appConfig from "@/lib/appconfig";

// ─── Types ───────────────────────────────────────────────
interface LoginFormData {
  email: string;
  password: string;
}

interface LoginPageProps {
  onSubmit?: (data: LoginFormData) => Promise<void>;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
}

// ─── Animation Variants ──────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

const itemVariants = {
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

// ─── Hero Slides Data ────────────────────────────────────
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

// ─── Input Component ─────────────────────────────────────
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const InputField = ({
  label,
  error,
  type = "text",
  className = "",
  ...props
}: InputFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <motion.div variants={itemVariants} className="w-full">
      <label className="block text-xs font-medium text-black/60 mb-1.5 tracking-wide">
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          className={`
            w-full rounded-[12px] border bg-[#f8fafc] py-3 pr-4 pl-4
            text-[15px] text-black/60 placeholder:text-black/60
            transition-all duration-200 outline-none
            ${
              error
                ? "border-[#ef4444] focus:border-[#ef4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)]"
                : "border-[#e5e7eb] focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(var(--primary-rgb),0.08)]"
            }
            ${className}
          `}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280] transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
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
};

// ─── Toggle Switch Component ─────────────────────────────
const ToggleSwitch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`
      relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent
      transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
      ${checked ? "bg-primary" : "bg-primary-strong"}
    `}
  >
    <span
      className={`
        pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0
        transition duration-200 ease-in-out
        ${checked ? "translate-x-4" : "translate-x-0"}
      `}
    />
  </button>
);

// ─── Hero Panel Component ────────────────────────────────
const HeroPanel = () => {
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
      className="hero-pan hidden lg:flex relative w-full h-full flex-col justify-end overflow-hidden rounded-[24px] bg-[#0a0a0f]"
      style={{
        backgroundImage: `url(${appConfig.backgrounds.authScreens})`,
        backgroundPosition: "top left",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/45" />
      {/* Abstract gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#3a0c8a] via-[#6d28d9] to-transparent opacity-40 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#1e1b4b] via-[#312e81] to-transparent opacity-50 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] opacity-20 blur-[100px]" />
        {/* Subtle noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="absolute top-[18%] left-[50%] translate-x-[-50%] opacity-[90%] flex items-center justify-center">
        <img
          src={appConfig.logos.white_svg}
          alt="Kalms Logo"
          className="object-contain w-[10vw] hidden"
        />
      </div>

      {/* Content */}
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

        {/* Dots */}
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
};

// ─── Main Login Page ─────────────────────────────────────
export default function LoginPage({
  onSubmit,
  onForgotPassword,
  onSignUp,
}: LoginPageProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validate = useCallback((): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await onSubmit?.(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex">
      {/* Left: Form Panel */}
      <div className="w-full lg:w-1/2 xl:w-[55%] relative flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <Image
            src={appConfig.logos.green_svg}
            alt={appConfig.appName}
            width={48}
            height={48}
            className="w-12 h-12"
            priority
          />
          <span className="logo-font text-2xl font-bold tracking-tight">
            {appConfig.appName}
          </span>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[400px] pt-16"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-[22px] font-semibold cook-font">
              Welcome Back !
            </h1>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Email"
              type="email"
              placeholder="Email or phone number"
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                if (errors.email)
                  setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={errors.email}
              autoComplete="email"
              autoFocus
            />

            <InputField
              label="Password"
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, password: e.target.value }));
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={errors.password}
              autoComplete="current-password"
            />

            {/* Remember & Forgot */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-between pt-1"
            >
              <div className="flex items-center gap-2.5">
                <ToggleSwitch checked={rememberMe} onChange={setRememberMe} />
                <span className="text-xs text-black/60 select-none">
                  Remember me
                </span>
              </div>

              <button
                type="button"
                onClick={onForgotPassword}
                className="text-xs font-medium text-primary hover:text-primary-strong transition-colors"
              >
                Forgot password?
              </button>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`
                w-full rounded-[12px] py-3 px-6 mt-2
                bg-primary text-white font-medium text-[15px]
                flex items-center justify-center gap-2
                transition-all duration-200
                hover:bg-primary-strong
                disabled:opacity-70 disabled:cursor-not-allowed
                shadow-[0_4px_14px_rgba(var(--primary-rgb),0.25)]
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </motion.button>

            {/* Google SSO */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="
                w-full rounded-[12px] py-3 px-6
                bg-white text-black/60 font-medium text-[15px]
                flex items-center justify-center gap-2.5
                border border-[#e5e7eb]
                transition-all duration-200
                hover:bg-[#f9fafb] hover:border-[#d1d5db]
              "
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </motion.button>
          </form>

          {/* Footer */}
          <motion.p
            variants={itemVariants}
            className="text-center mt-8 text-xs text-black/60"
          >
            Don't have an account?{" "}
            <button
              onClick={onSignUp}
              className="font-semibold text-primary hover:text-primary-strong transition-colors"
            >
              Sign up now
            </button>
          </motion.p>
        </motion.div>
      </div>

      {/* Right: Hero Panel */}
      <div className="hidden lg:block w-1/2 xl:w-[45%] p-4 pl-0">
        <HeroPanel />
      </div>
    </div>
  );
}
