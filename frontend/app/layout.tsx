import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { AuthProviderClient } from "@/lib/api/auth/AuthProviderClient";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bobbleboddy = localFont({
  src: "../public/fonts/Bobbleboddy.ttf",
  variable: "--font-logo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kalms — Mental health app",
  description:
    "Kalms is a Mental health app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scrollbar-hide">
      <body
        className={`scrollbar-hide ${geistSans.variable} ${geistMono.variable} ${bobbleboddy.variable} antialiased`}
      >
        <AuthProviderClient>{children}</AuthProviderClient>
      </body>
    </html>
  );
}
