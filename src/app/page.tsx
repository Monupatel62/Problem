import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WohoCode — Practice Coding Problems",
  description: "Practice 94+ coding problems with an online judge. Sign in to start solving.",
};

export default async function HomePage() {
  const session = await getServerSession(authOptions).catch(() => null);

  // Logged in → go straight to problems
  if (session?.user) {
    redirect("/problems");
  }

  // Not logged in → show landing page
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2">
          <img src="/images/logos/WohoTech_logo.png" alt="WohoCode" className="h-8 w-8 object-contain" />
          <span className="text-lg font-black">WohoCode</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-[#aaa] hover:text-white transition">
            Sign In
          </Link>
          <Link href="/auth/signup"
            className="rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-2 text-sm font-black text-white hover:from-pink-600 hover:to-violet-600 transition">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#2d2d2d] bg-[#1a1a1a] px-4 py-1.5 text-xs font-bold text-[#888]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          94 Problems · 4 Languages · Live Judge
        </div>

        <h1 className="mb-4 text-4xl font-black leading-tight sm:text-6xl">
          Level Up Your
          <br />
          <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
            Coding Skills
          </span>
        </h1>

        <p className="mb-8 max-w-lg text-base text-[#888] sm:text-lg">
          Practice real interview problems with an online judge. JavaScript, TypeScript, Python, Java — all supported.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/auth/signup"
            className="rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 px-8 py-3 text-sm font-black text-white shadow-lg hover:from-pink-600 hover:to-violet-600 transition">
            Start Coding Free →
          </Link>
          <Link href="/auth/login"
            className="rounded-xl border border-[#2d2d2d] bg-[#1a1a1a] px-8 py-3 text-sm font-semibold text-[#ccc] hover:bg-[#222] transition">
            Sign In
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-[#1e1e1e] px-6 py-10">
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { label: "Problems", value: "94+" },
            { label: "Languages", value: "4" },
            { label: "Live Judge", value: "✓" },
            { label: "Free Forever", value: "✓" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-[#1e1e1e] bg-[#111] p-4 text-center">
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="mt-1 text-xs text-[#666]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Language cards */}
      <section className="px-6 py-10 border-t border-[#1e1e1e]">
        <p className="mb-6 text-center text-xs font-bold uppercase tracking-widest text-[#555]">Supported Languages</p>
        <div className="mx-auto grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "JavaScript", color: "from-amber-400 to-orange-500", mark: "JS" },
            { label: "TypeScript", color: "from-blue-400 to-blue-600", mark: "TS" },
            { label: "Python", color: "from-sky-400 to-blue-500", mark: "PY" },
            { label: "Java", color: "from-rose-400 to-red-500", mark: "JV" },
          ].map((lang) => (
            <div key={lang.label}
              className={`rounded-xl bg-gradient-to-br ${lang.color} p-4 text-white text-center`}>
              <p className="text-2xl font-black">{lang.mark}</p>
              <p className="mt-1 text-xs font-semibold opacity-90">{lang.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="border-t border-[#1e1e1e] px-6 py-12 text-center">
        <h2 className="mb-3 text-2xl font-black sm:text-3xl">Ready to start?</h2>
        <p className="mb-6 text-sm text-[#666]">Free account. No credit card needed.</p>
        <Link href="/auth/signup"
          className="inline-flex rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 px-10 py-3 text-sm font-black text-white shadow-lg hover:from-pink-600 hover:to-violet-600 transition">
          Create Free Account →
        </Link>
      </section>

      <footer className="border-t border-[#1e1e1e] px-6 py-4 text-center text-xs text-[#444]">
        © 2026 WohoTech · <a href="https://wohotech.in" className="hover:text-[#888] transition">wohotech.in</a>
      </footer>
    </main>
  );
}
