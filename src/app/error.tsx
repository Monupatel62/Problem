"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-8xl">⚠️</div>
      <h1 className="mb-2 text-3xl font-black text-slate-900 dark:text-white">Something went wrong</h1>
      <p className="mb-8 max-w-md text-slate-500 dark:text-white/40">
        An unexpected error occurred. Please try again or return to the home page.
      </p>
      {process.env.NODE_ENV !== "production" ? (
        <div className="mb-6 w-full max-w-2xl rounded-2xl border border-red-200 bg-red-50/80 p-4 text-left text-sm text-red-900 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-100">
          <p className="font-semibold">Debug error</p>
          <p className="mt-2 break-words">{error.message || "Unknown error"}</p>
          {error.digest ? <p className="mt-1 text-xs opacity-80">Digest: {error.digest}</p> : null}
        </div>
      ) : null}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-blue-400 dark:border-white/15 dark:text-white"
        >
          ← Go Home
        </Link>
      </div>
    </div>
  );
}
