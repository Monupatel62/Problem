"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Play } from "lucide-react";

type DailyChallengeStatusProps = {
  date: string;
  slug: string;
  databaseStatus: {
    attempted: boolean;
    solved: boolean;
    attemptedToday: boolean;
    solvedToday: boolean;
    lastSubmissionAt?: string;
  };
};

function readJson<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "") as T;
  } catch {
    return fallback;
  }
}

export function DailyChallengeStatus({ date, slug, databaseStatus }: DailyChallengeStatusProps) {
  const [localAttempted, setLocalAttempted] = useState(false);
  const [localSolved, setLocalSolved] = useState(false);
  const [localSolvedToday, setLocalSolvedToday] = useState(false);

  useEffect(() => {
    const attempted = new Set(readJson<string[]>("wohotech-attempted-problems", []));
    const solved = new Set(readJson<string[]>("wohotech-solved-problems", []));
    const dailyCompletions = readJson<Record<string, string>>("wohotech-daily-completions", {});

    setLocalAttempted(attempted.has(slug));
    setLocalSolved(solved.has(slug));
    setLocalSolvedToday(dailyCompletions[date] === slug || solved.has(slug));
  }, [date, slug]);

  const status = useMemo(() => {
    const solvedToday = databaseStatus.solvedToday || localSolvedToday;
    const solved = databaseStatus.solved || localSolved || solvedToday;
    const attempted = databaseStatus.attempted || databaseStatus.attemptedToday || localAttempted || solved;

    if (solvedToday) return { label: "Completed Today", tone: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 };
    if (solved) return { label: "Solved Before", tone: "bg-blue-50 text-blue-700", icon: CheckCircle2 };
    if (attempted) return { label: "In Progress", tone: "bg-amber-50 text-amber-700", icon: Clock3 };
    return { label: "Ready", tone: "bg-slate-100 text-slate-700", icon: Play };
  }, [databaseStatus, localAttempted, localSolved, localSolvedToday]);

  const Icon = status.icon;

  return (
    <div className="mt-5">
      <div className={`mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black ${status.tone}`}>
        <Icon className="h-4 w-4" />
        {status.label}
      </div>
      <Link
        href={`/problems/${slug}`}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
      >
        <Play className="h-4 w-4 fill-current" />
        {status.label === "Completed Today" ? "Review Challenge" : "Start Challenge"}
      </Link>
    </div>
  );
}
