"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Shield,
  Heart,
  Loader2,
} from "lucide-react";

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
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

const logoVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
    },
  },
};

// ─── Kalms Brand Logo SVG ────────────────────────────────
const KalmsLogo = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 120 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Kalms"
  >
    <path
      d="M12 8L4 16L12 24"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24 8L32 16L24 24"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 6L14 26"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <text
      x="42"
      y="22"
      fill="currentColor"
      fontFamily="Inter, sans-serif"
      fontSize="20"
      fontWeight="700"
    >
      Kalms
    </text>
  </svg>
);

// ─── Input Component ─────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
  error?: string;
}

const InputField = ({
  label,
  icon,
  error,
  type = "text",
  className = "",
  ...props
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <motion.div variants={itemVariants} className="w-full">
      <label className="block text-sm font-medium text-[#111827] mb-2">
        {label}
      </label>
      <div className="relative">
        <div
          className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
            isFocused ? "text-[#3a0c8a]" : "text-[#9ca3af]"
          }`}
        >
          {icon}
        </div>
        <input
          type={inputType}
          className={`
            w-full rounded-[18px] border bg-white py-[14px] pr-4 pl-12
            text-[16px] text-[#111827] placeholder:text-[#9ca3af]
            transition-all duration-200 outline-none
            ${
              error
                ? "border-[#ef4444] focus:border-[#ef4444] focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]"
                : "border-[#e5e7eb] focus:border-[#3a0c8a] focus:shadow-[0_0_0_4px_rgba(58,12,138,0.1)]"
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
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280] transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 text-sm text-[#ef4444]"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Trust Badge Component ───────────────────────────────
const TrustBadge = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <motion.div
    variants={itemVariants}
    className="flex items-center gap-2 text-sm text-[#6b7280]"
  >
    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#dcfce7] text-[#22c55e]">
      {icon}
    </div>
    <span>{text}</span>
  </motion.div>
);

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
    <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background ambient gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#ede7ff] rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#dbeafe] rounded-full blur-3xl opacity-60" />
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo Section */}
        <motion.div
          variants={logoVariants}
          initial="hidden"
          animate="visible"
          className="flex justify-center mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3a0c8a] flex items-center justify-center">
              <KalmsLogo className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#3a0c8a] tracking-tight">
              Kalms
            </span>
          </div>
        </motion.div>

        {/* Main Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-[24px] border border-[#e5e7eb] p-6 sm:p-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-[24px] font-semibold text-[#111827] mb-2">
              Welcome back
            </h1>
            <p className="text-[16px] text-[#6b7280]">
              Sign in to continue your wellness journey
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              label="Email address"
              icon={<Mail size={20} />}
              type="email"
              placeholder="you@university.edu"
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={errors.email}
              autoComplete="email"
              autoFocus
            />

            <InputField
              label="Password"
              icon={<Lock size={20} />}
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, password: e.target.value }));
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={errors.password}
              autoComplete="current-password"
            />

            {/* Remember & Forgot */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-between"
            >
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  className={`
                    relative w-5 h-5 rounded-[6px] border-2 transition-all duration-200
                    flex items-center justify-center
                    ${
                      rememberMe
                        ? "bg-[#3a0c8a] border-[#3a0c8a]"
                        : "border-[#d1d5db] group-hover:border-[#3a0c8a]"
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  {rememberMe && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 text-white"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M2 6L5 9L10 3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.svg>
                  )}
                </div>
                <span className="text-sm text-[#6b7280] select-none">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm font-medium text-[#3a0c8a] hover:text-[#4c13b5] transition-colors"
              >
                Forgot password?
              </button>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.01, boxShadow: "0 12px 40px rgba(58,12,138,0.15)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`
                w-full rounded-[999px] py-[14px] px-6
                bg-[#3a0c8a] text-white font-medium text-[16px]
                flex items-center justify-center gap-2
                transition-all duration-200
                hover:bg-[#4c13b5]
                disabled:opacity-70 disabled:cursor-not-allowed
                shadow-[0_8px_30px_rgba(58,12,138,0.12)]
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e5e7eb]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm text-[#9ca3af]">
                or continue with
              </span>
            </div>
          </motion.div>

          {/* SSO Buttons */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-[18px] border border-[#e5e7eb] bg-white py-3 px-4 text-sm font-medium text-[#374151] hover:bg-[#f9fafb] hover:border-[#d1d5db] transition-all duration-200"
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
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-[18px] border border-[#e5e7eb] bg-white py-3 px-4 text-sm font-medium text-[#374151] hover:bg-[#f9fafb] hover:border-[#d1d5db] transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.793-.26.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.42-1.305.763-1.605-2.665-.305-5.467-1.334-5.467-5.93 0-1.31.468-2.382 1.235-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23A11.51 11.51 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.838 1.233 1.91 1.233 3.22 0 4.61-2.807 5.625-5.48 5.92.43.372.823 1.102.823 2.222v3.293c0 .32.192.694.801.576C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={itemVariants}
            className="mt-6 pt-6 border-t border-[#f3f4f6] space-y-2.5"
          >
            <TrustBadge
              icon={<Shield size={12} />}
              text="End-to-end encrypted"
            />
            <TrustBadge
              icon={<Heart size={12} />}
              text="FERPA & HIPAA compliant"
            />
            <TrustBadge
              icon={<Sparkles size={12} />}
              text="AI-powered, human-guided"
            />
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center mt-6 text-sm text-[#6b7280]"
        >
          Don't have an account?{" "}
          <button
            onClick={onSignUp}
            className="font-medium text-[#3a0c8a] hover:text-[#4c13b5] transition-colors"
          >
            Get started
          </button>
        </motion.p>
      </div>
    </div>
  );
}