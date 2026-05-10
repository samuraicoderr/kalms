import type { Metadata } from "next";
import Link from "next/link";
import appConfig from "@/lib/appconfig";
import "./auth.css";

export const metadata: Metadata = {
  title: "Kalms — Sign In",
  description:
    "Sign in or create your Kalms account to manage your financial plans.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      {/* Branding panel — visible on desktop only */}
      <div className="auth-branding-panel">
        <div className="auth-branding-content">
          <Link href="/" className="auth-logo-link cursor-pointer">
            <div className="auth-logo">
              <img
                src={appConfig.logos.white_svg}
                alt={appConfig.appName}
                className="auth-logo-icon"
              />
              <span className="auth-logo-text-nofontfamily logo-text-font">
                {appConfig.appName}
              </span>
            </div>
          </Link>
          <h1 className="auth-branding-title">
            Your budget
            <br />
            will thank you.
          </h1>
          <p className="auth-branding-subtitle">
            Say goodbye to messy spreedsheets formulas and hello to
            effortless budgeting.
          </p>
          <div className="auth-branding-decoration">
            <div className="auth-branding-orb auth-branding-orb-1" />
            <div className="auth-branding-orb auth-branding-orb-2" />
            <div className="auth-branding-orb auth-branding-orb-3" />
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-form-panel h-screen overflow-y-auto">
        <div className="auth-form-container m-auto py-4">
          {/* Mobile logo — hidden on desktop */}
          <Link href="/" className="auth-mobile-logo-link cursor-pointer">
            <div className="auth-mobile-logo">
              <img
                src={appConfig.logos.green_svg}
                alt={appConfig.appName}
                className="auth-mobile-logo-icon"
              />
              <span className="auth-mobile-logo-text logo-text-font">
                {appConfig.appName}
              </span>
            </div>
          </Link>

          <div className="auth-fade-in">{children}</div>
        </div>
      </div>
    </div>
  );
}
