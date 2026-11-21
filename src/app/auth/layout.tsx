import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: { default: "WohoCode", template: "%s — WohoCode" } };
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-4">
      <div className="mb-8"><Link href="/" className="text-xl font-black text-white">WohoCode</Link></div>
      {children}
    </div>
  );
}
