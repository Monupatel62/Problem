import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Woho Code Editor — Online Compiler | WoHoTech",
  description:
    "Run JavaScript, Python, C++, and Java code directly in your browser. Free online compiler with Monaco editor — no setup required.",
  keywords: ["online compiler", "code editor", "javascript online", "python online", "c++ online", "java online"],
  alternates: { canonical: "/code" },
  openGraph: {
    title: "Woho Code Editor — Online Compiler",
    description: "Write and run JavaScript, Python, C++, Java in your browser. Free, fast, no signup needed.",
    url: "/code",
    type: "website",
  },
};

export default function CodeEditorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
