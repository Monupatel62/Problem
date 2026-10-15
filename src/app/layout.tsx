import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://problem.wohotech.in"),
  title: { default: "Problem — Coding Practice", template: "%s | Problem" },
  description: "Practice coding problems with structured explanations, hints, test cases, and an online judge.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
