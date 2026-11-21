import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found — WoHoTech",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl mb-6 select-none">📭</div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-700 dark:text-white/70 mb-4">Page Not Found</h2>
      <p className="text-slate-500 dark:text-white/40 max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
        Try searching or go back to the home page.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/"
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-all">
          ← Go Home
        </Link>
        <Link href="/subjects"
          className="rounded-xl border border-slate-200 dark:border-white/15 px-6 py-2.5 text-sm font-bold text-slate-700 dark:text-white hover:border-blue-400 transition-all">
          Coding Tutorials
        </Link>
      </div>
      <p className="mt-8 text-sm text-slate-400 dark:text-white/30">
        Looking for something specific?{" "}
        <Link href="/search" className="text-blue-600 dark:text-blue-400 hover:underline">Try search →</Link>
      </p>
    </div>
  );
}
