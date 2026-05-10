import type { Metadata } from "next";
import Link from "next/link";
import { HeroPanel, LogoMark } from "./components/AuthUI";

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
    <div className="min-h-screen w-full bg-white flex overflow-y-auto scrollbar-hide">
      <div className="w-full lg:w-1/2 xl:w-[55%] relative flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12 scrollbar-hide">
        <div className="w-full max-w-[440px] pt-9">
          <Link href="/" className="block w-fit mx-auto mb-15 no-underline">
            <LogoMark className=""/>
          </Link>
          {children}
          </div>
      </div>

      <div className="hidden lg:block w-1/2 xl:w-[45%] p-4 pl-0 scrollbar-hide">
        <div className="fixed top-0 h-full flex items-center justify-center p-5">
          <HeroPanel />
        </div>
      </div>
    </div>
  );
}
