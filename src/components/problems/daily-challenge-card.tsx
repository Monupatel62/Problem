"use client";

import { CalendarDays, ChevronRight, Clock, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ProblemDefinition } from "@/lib/problems/bank";

function difficultyColor(difficulty: string) {
  if (difficulty === "Easy") return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
  if (difficulty === "Hard") return "bg-red-500/10 text-red-600 border-red-200";
  return "bg-amber-500/10 text-amber-600 border-amber-200";
}

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function calculateTimeLeft() {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${minutes}m`);
    }

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

export function DailyChallengeCard({ problem: propProblem }: { problem: ProblemDefinition | null }) {
  const timeLeft = useCountdown();
  // Fetch the REAL daily problem from the daily API, not from recommendations
  const [dailyProblem, setDailyProblem] = useState<ProblemDefinition | null>(propProblem);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/problems/daily")
      .then((r) => r.json())
      .then((data) => {
        if (data?.problem?.slug) {
          setDailyProblem(data.problem as ProblemDefinition);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const problem = dailyProblem;

  if (!problem) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--muted)]">
          <CalendarDays className="h-4 w-4" />
          Daily Challenge
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">Loading today's challenge...</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      {/* Accent gradient top border */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-pink-500 to-orange-400" />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-pink-500">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-[var(--muted)]">Daily Challenge</p>
            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[var(--muted)]">
              <Clock className="h-3 w-3" />
              Resets in {timeLeft}
            </div>
          </div>
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${difficultyColor(problem.difficulty)}`}>
          {problem.difficulty}
        </span>
      </div>

      <div className="mt-4">
        <p className="font-semibold text-[var(--text)] leading-snug">{problem.title}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {problem.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-md bg-[var(--bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)]">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <Link
        href={`/problems/${problem.slug}`}
        className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
      >
        Solve Now
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
