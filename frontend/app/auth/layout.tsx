import type { Metadata } from "next";
import Link from "next/link";
import { HeroPanel, LogoMark } from "./components/AuthUI";

export const metadata: Metadata = {
  title: "Kalms - Sign In",
  description: "Sign in or create your Kalms account to continue your care journey.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-white">
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-16 xl:w-[55%] xl:px-24">
        <div className="w-full max-w-[440px] py-6">
          <Link href="/" className="mx-auto mb-12 block w-fit no-underline">
            <LogoMark />
          </Link>
          {children}
        </div>
      </div>

      <div className="hidden fixed top-0 right-0 h-screen w-1/2 p-4 pl-0 lg:block xl:w-[45%]">
        <HeroPanel />
      </div>
    </div>
  );
}
