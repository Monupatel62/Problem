"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Code2, Building2 } from "lucide-react";
import type { ProblemDefinition } from "@/lib/problems/bank";

export function ProblemComingSoon({ problem }: { problem: ProblemDefinition }) {
  const difficultyColor: Record<string, string> = {
    Easy: "text-emerald-500 bg-emerald-500/10 border-emerald-200",
    Medium: "text-amber-500 bg-amber-500/10 border-amber-200",
    Hard: "text-red-500 bg-red-500/10 border-red-200",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg)] p-6">
      <div className="w-full max-w-xl text-center">
        {/* Back link */}
        <Link
          href="/problems"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--text)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Problems
        </Link>

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20">
          <Clock className="h-10 w-10 text-pink-500" />
        </div>

        {/* Title */}
        <h1 className="mb-2 text-2xl font-bold text-[var(--text)]">
          {problem.id}. {problem.title}
        </h1>

        {/* Badges */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          <span
            className={`rounded-full border px-3 py-0.5 text-xs font-bold ${difficultyColor[problem.difficulty] ?? ""}`}
          >
            {problem.difficulty}
          </span>
          {problem.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[var(--bg)] border border-[var(--border)] px-2.5 py-0.5 text-xs font-medium text-[var(--muted)]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Coming Soon message */}
        <div className="mx-auto mb-6 max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="mb-3 flex items-center justify-center gap-2 text-sm font-semibold text-[var(--text)]">
            <Code2 className="h-4 w-4 text-pink-500" />
            Full Problem Coming Soon
          </div>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            This problem is part of our expanded catalog of top interview questions.
            Full problem description, test cases, and an interactive coding environment are being prepared.
          </p>
        </div>

        {/* Companies */}
        {problem.companies && problem.companies.length > 0 && (
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              <Building2 className="h-3.5 w-3.5" />
              Asked at
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {problem.companies.map((company) => (
                <span
                  key={company}
                  className="rounded-lg bg-blue-500/5 border border-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-600"
                >
                  {company}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <Link
          href="/problems"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:shadow-xl hover:brightness-110"
        >
          Browse Available Problems
        </Link>
      </div>
    </div>
  );
}
