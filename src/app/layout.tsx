import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SessionProviderWrapper } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: {
    default: "WohoCode — Practice Coding",
    template: "%s | WohoCode",
  },
  description: "Practice 800+ coding problems with online judge. DSA, algorithms, competitive programming — all in one place.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f0f0f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#1a1a1a] text-[#eff1f6] antialiased">
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
