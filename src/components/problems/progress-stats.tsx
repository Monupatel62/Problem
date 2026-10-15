"use client";

import { Flame, Target, Trophy, TrendingUp } from "lucide-react";

export type ProgressData = {
  totalProblems: number;
  solvedProblems: number;
  attemptedProblems: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  streakDays: number;
  score: number;
  rankLabel: string;
  persisted: boolean;
};

function CircularProgress({ value, max, size = 64, strokeWidth = 5 }: { value: number; max: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = max > 0 ? Math.min(1, value / max) : 0;
  const offset = circumference * (1 - percent);

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#22c55e"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
}

function DifficultyBar({ label, solved, total, color }: { label: string; solved: number; total: number; color: string }) {
  const percent = total > 0 ? Math.min(100, Math.round((solved / total) * 100)) : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="w-14 text-xs font-semibold" style={{ color }}>{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-12 text-right text-xs font-bold text-[var(--text-soft)]">
        {solved}/{total}
      </span>
    </div>
  );
}

export function ProgressStats({
  data,
  easyTotal,
  mediumTotal,
  hardTotal,
}: {
  data: ProgressData;
  easyTotal: number;
  mediumTotal: number;
  hardTotal: number;
}) {
  const solvedPercent = data.totalProblems > 0
    ? Math.round((data.solvedProblems / data.totalProblems) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {/* Total Progress Card */}
      <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <CircularProgress value={data.solvedProblems} max={data.totalProblems} size={56} strokeWidth={5} />
        <div className="min-w-0">
          <p className="text-2xl font-black text-[var(--text)]">{data.solvedProblems}</p>
          <p className="text-xs text-[var(--muted)]">of {data.totalProblems} solved</p>
          <p className="mt-0.5 text-xs font-semibold text-emerald-500">{solvedPercent}% complete</p>
        </div>
      </div>

      {/* Difficulty Breakdown Card */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
          <Target className="h-3.5 w-3.5" />
          Difficulty Breakdown
        </div>
        <div className="mt-3 space-y-2">
          <DifficultyBar label="Easy" solved={data.easySolved} total={easyTotal} color="#22c55e" />
          <DifficultyBar label="Medium" solved={data.mediumSolved} total={mediumTotal} color="#eab308" />
          <DifficultyBar label="Hard" solved={data.hardSolved} total={hardTotal} color="#ef4444" />
        </div>
      </div>

      {/* Streak Card */}
      <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-orange-50">
          <Flame className="h-6 w-6 text-orange-500" />
        </div>
        <div>
          <p className="text-2xl font-black text-[var(--text)]">{data.streakDays}</p>
          <p className="text-xs text-[var(--muted)]">Day streak 🔥</p>
        </div>
      </div>

      {/* Score & Rank Card */}
      <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-violet-50">
          <Trophy className="h-6 w-6 text-violet-500" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-black text-[var(--text)]">{data.score}</p>
          <p className="truncate text-xs text-[var(--muted)]">{data.rankLabel}</p>
        </div>
      </div>
    </div>
  );
}
