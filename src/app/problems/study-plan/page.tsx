import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { ArrowLeft, BookOpen, CalendarDays, Flame, Gauge, Target, Trophy } from "lucide-react";
import { authOptions } from "@/lib/auth-options";
import { getProblemAnalytics, getProblemRecommendations } from "@/lib/problems/service";

export const metadata: Metadata = {
  title: "Problem Study Plan | WoHoTech",
  description: "Personalized coding practice recommendations and progress tracking on WoHoTech.",
};

function difficultyTone(difficulty: string) {
  if (difficulty === "Easy") return "text-emerald-600 bg-emerald-50";
  if (difficulty === "Hard") return "text-rose-600 bg-rose-50";
  return "text-amber-600 bg-amber-50";
}

export default async function ProblemStudyPlanPage() {
  const session = await getServerSession(authOptions).catch(() => null);
  const [analytics, recommendations] = await Promise.all([
    getProblemAnalytics(session?.user?.id ?? null),
    getProblemRecommendations(session?.user?.id ?? null),
  ]);

  const completion = Math.min(100, Math.round((analytics.solvedProblems / Math.max(1, analytics.totalProblems)) * 100));

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/problems" className="inline-flex items-center gap-2 rounded-md bg-[var(--surface)] px-3 py-2 text-sm font-bold text-[var(--text)] shadow-sm">
            <ArrowLeft className="h-4 w-4" />
            Problems
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/problems/daily" className="inline-flex items-center gap-2 rounded-md bg-[var(--surface)] px-3 py-2 text-sm font-bold text-[var(--text)] shadow-sm">
              <CalendarDays className="h-4 w-4" />
              Daily Challenge
            </Link>
            <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--muted)] shadow-sm">
              {recommendations.persisted ? "Personalized plan" : "Starter plan"}
            </span>
          </div>
        </div>

        <section className="rounded-lg bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase text-blue-600">WoHoTech Problem Lab</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Study Plan</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-soft)]">
                Practice the next best problems, repair weak topics, and build a daily interview rhythm.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-lg bg-[var(--bg)] px-4 py-3">
                <Flame className="mx-auto h-5 w-5 text-orange-500" />
                <p className="mt-2 font-black">{analytics.streakDays}</p>
                <p className="text-xs text-[var(--muted)]">Streak</p>
              </div>
              <div className="rounded-lg bg-[var(--bg)] px-4 py-3">
                <Trophy className="mx-auto h-5 w-5 text-amber-500" />
                <p className="mt-2 font-black">{analytics.score}</p>
                <p className="text-xs text-[var(--muted)]">Score</p>
              </div>
              <div className="rounded-lg bg-[var(--bg)] px-4 py-3">
                <Gauge className="mx-auto h-5 w-5 text-blue-500" />
                <p className="mt-2 font-black">{analytics.rankLabel}</p>
                <p className="text-xs text-[var(--muted)]">Rank</p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-bold text-[var(--text)]">Overall completion</span>
              <span className="text-[var(--muted)]">{analytics.solvedProblems}/{analytics.totalProblems}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--bg)]">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${completion}%` }} />
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-lg bg-[var(--surface)] p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-black">Daily Queue</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {recommendations.daily.map((problem, index) => (
                <Link key={problem.slug} href={`/problems/${problem.slug}`} className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4 transition hover:border-blue-200 hover:bg-blue-50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black text-[var(--muted)]">Step {index + 1}</p>
                      <h3 className="mt-1 font-black text-[var(--text)]">{problem.id}. {problem.title}</h3>
                      <p className="mt-2 text-xs text-[var(--muted)]">{problem.tags.slice(0, 4).join(" / ")}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${difficultyTone(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-lg bg-[var(--surface)] p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-black">Weak Topics</h2>
            </div>
            <div className="mt-4 space-y-4">
              {(recommendations.weakTopics.length ? recommendations.weakTopics : analytics.topicStats).slice(0, 6).map((topic) => (
                <div key={topic.topic}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-bold text-[var(--text)]">{topic.topic}</span>
                    <span className="text-[var(--muted)]">{topic.solved}/{topic.total}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--bg)]">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.round((topic.solved / Math.max(1, topic.total)) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-lg bg-[var(--surface)] p-5 shadow-sm">
          <h2 className="text-lg font-black">Next Up</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.nextUp.map((problem) => (
              <Link key={problem.slug} href={`/problems/${problem.slug}`} className="rounded-lg border border-[var(--border)] p-4 transition hover:border-blue-200 hover:bg-[var(--surface)]">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate font-black">{problem.title}</h3>
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${difficultyTone(problem.difficulty)}`}>{problem.difficulty}</span>
                </div>
                <p className="mt-2 text-xs text-[var(--muted)]">{problem.tags.slice(0, 3).join(" / ")}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
