import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, Code2, Target } from "lucide-react";
import { authOptions } from "@/lib/auth-options";
import { getDailyProblem } from "@/lib/problems/service";
import { DailyChallengeStatus } from "./daily-challenge-status";

export const metadata: Metadata = {
  title: "Daily Problem | WoHoTech",
  description: "Solve today's WoHoTech coding challenge with examples, constraints, and tags.",
};

function difficultyTone(difficulty: string) {
  if (difficulty === "Easy") return "bg-emerald-50 text-emerald-700";
  if (difficulty === "Hard") return "bg-rose-50 text-rose-700";
  return "bg-amber-50 text-amber-700";
}

export default async function DailyProblemPage() {
  const session = await getServerSession(authOptions).catch(() => null);
  const daily = await getDailyProblem(session?.user?.id ?? null);
  const problem = daily.problem;

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/problems" className="inline-flex items-center gap-2 rounded-md bg-[var(--surface)] px-3 py-2 text-sm font-bold text-[var(--text)] shadow-sm">
            <ArrowLeft className="h-4 w-4" />
            Problems
          </Link>
          <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--muted)] shadow-sm">
            {daily.persisted ? "Database backed" : "Local fallback"}
          </span>
        </div>

        <section className="overflow-hidden rounded-lg bg-[var(--surface)] shadow-sm">
          <div className="border-b border-[var(--border)] bg-slate-950 px-6 py-5 text-white">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-blue-200">
                  <CalendarDays className="h-4 w-4" />
                  Daily Challenge / {daily.date}
                </div>
                <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  {problem.id}. {problem.title}
                </h1>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${difficultyTone(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="border-b border-[var(--border)] p-6 lg:border-b-0 lg:border-r">
              <div className="flex flex-wrap gap-2">
                {problem.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[var(--bg)] px-3 py-1 text-xs font-bold text-[var(--text-soft)]">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="mt-6 text-sm leading-7 text-[var(--text)]">{problem.description}</p>

              <div className="mt-6">
                <h2 className="flex items-center gap-2 text-sm font-black uppercase text-[var(--muted)]">
                  <Target className="h-4 w-4" />
                  Examples
                </h2>
                <div className="mt-3 space-y-3">
                  {problem.examples.map((example, index) => (
                    <div key={`${problem.slug}-example-${index}`} className="rounded-lg bg-[var(--bg)] p-4 text-sm">
                      <p className="font-black text-[var(--text)]">Example {index + 1}</p>
                      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-md bg-[var(--surface)] p-3 text-xs text-[var(--text)]">{`Input: ${example.input}
Output: ${example.output}${example.explanation ? `\nExplanation: ${example.explanation}` : ""}`}</pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="p-6">
              <div className="rounded-lg bg-[var(--bg)] p-5">
                <h2 className="flex items-center gap-2 font-black">
                  <Code2 className="h-5 w-5 text-blue-600" />
                  Today's Goal
                </h2>
                <ul className="mt-4 space-y-3 text-sm text-[var(--text-soft)]">
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    Understand input, output, and edge cases.
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    Run sample cases before submit.
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    Submit against hidden judge tests.
                  </li>
                </ul>
                <DailyChallengeStatus date={daily.date} slug={problem.slug} databaseStatus={daily.status} />
              </div>

              <div className="mt-5 rounded-lg border border-[var(--border)] p-5">
                <h2 className="font-black">Constraints</h2>
                <ul className="mt-3 space-y-2 text-sm text-[var(--text-soft)]">
                  {problem.constraints.map((constraint) => (
                    <li key={constraint} className="rounded-md bg-[var(--bg)] px-3 py-2">
                      {constraint}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
