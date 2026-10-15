"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Database,
  Maximize2,
  Minimize2,
  Moon,
  Play,
  Send,
  Sun,
  Terminal,
  Zap,
} from "lucide-react";
import type { ProblemDefinition } from "@/lib/problems/bank";
import { type ColorTokens, difficultyStyle } from "./practice-types";

type PracticeHeaderProps = {
  problem: ProblemDefinition;
  isDark: boolean;
  c: ColorTokens;
  isJudging: boolean;
  canJudge: boolean;
  isEditorMaximized: boolean;
  isSpecialProblem: boolean;
  onRun: () => void;
  onSubmit: () => void;
  onToggleTheme: () => void;
  onToggleMaximize: () => void;
};

function trackIcon(track: string) {
  if (track === "Database") return <Database className="h-3.5 w-3.5" />;
  if (track === "Shell") return <Terminal className="h-3.5 w-3.5" />;
  if (track === "Concurrency") return <Zap className="h-3.5 w-3.5" />;
  return null;
}

function JudgingPulse({ active, dark }: { active: boolean; dark: boolean }) {
  if (!active) return null;
  return (
    <div className={`flex items-center gap-2 text-xs font-semibold ${dark ? "text-sky-400" : "text-sky-600"}`}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
      </span>
      Judging...
    </div>
  );
}

export function PracticeHeader({
  problem,
  isDark,
  c,
  isJudging,
  canJudge,
  isEditorMaximized,
  isSpecialProblem,
  onRun,
  onSubmit,
  onToggleTheme,
  onToggleMaximize,
}: PracticeHeaderProps) {
  return (
    <header className={`flex h-13 min-h-[52px] shrink-0 items-center justify-between border-b px-3 transition-colors ${c.header}`}>
      {/* Left: back + problem title */}
      <div className="flex min-w-0 items-center gap-2">
        <Link
          href="/problems"
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition hover:opacity-80 ${
            isDark ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"
          }`}
          aria-label="Back to problems"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className={`h-5 w-px shrink-0 ${c.divider}`} />

        {/* Problem number + title */}
        <div className="flex min-w-0 items-center gap-2">
          <span className={`shrink-0 text-xs font-bold ${c.muted}`}>#{problem.id}</span>
          <span className={`truncate text-sm font-bold ${c.headerText} max-w-[180px] sm:max-w-xs`}>
            {problem.title}
          </span>
        </div>

        {/* Difficulty badge */}
        <span className={`hidden shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold sm:inline-flex ${difficultyStyle(problem.difficulty)}`}>
          {problem.difficulty}
        </span>

        {/* Track badge */}
        {isSpecialProblem && (
          <span className={`hidden shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold sm:inline-flex ${
            isDark ? "border-sky-800 bg-sky-950/50 text-sky-400" : "border-sky-200 bg-sky-50 text-sky-700"
          }`}>
            {trackIcon(problem.track)}
            {problem.track}
          </span>
        )}
      </div>

      {/* Center: Run / Submit (desktop) */}
      <div className="hidden items-center gap-2 md:flex">
        {isJudging && <JudgingPulse active dark={isDark} />}
        <button
          type="button"
          disabled={isJudging || !canJudge}
          onClick={onRun}
          className={`inline-flex h-8 items-center gap-1.5 rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${c.btnRun}`}
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          Run
        </button>
        <button
          type="button"
          disabled={isJudging || !canJudge}
          onClick={onSubmit}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-gradient-to-r from-emerald-500 to-green-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-400 hover:to-green-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          Submit
        </button>
      </div>

      {/* Right: theme + maximize + nav */}
      <div className="flex items-center gap-2">
        {/* Prev/next problem navigation */}
        <div className="hidden items-center sm:flex">
          <Link
            href="/problems"
            className={`grid h-8 w-8 place-items-center rounded-l-md border transition ${
              isDark ? "border-[#1e293b] text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
            title="Back to problems"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <Link
            href="/problems"
            className={`grid h-8 w-8 place-items-center rounded-r-md border-y border-r transition ${
              isDark ? "border-[#1e293b] text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
            title="Next problem"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          className={`grid h-8 w-8 place-items-center rounded-md border transition ${
            isDark
              ? "border-[#1e293b] text-amber-400 hover:bg-slate-800"
              : "border-slate-200 text-slate-500 hover:bg-slate-100"
          }`}
          title={isDark ? "Light mode" : "Dark mode"}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Maximize editor */}
        <button
          type="button"
          onClick={onToggleMaximize}
          className={`hidden h-8 w-8 place-items-center rounded-md border transition md:grid ${
            isDark
              ? "border-[#1e293b] text-slate-400 hover:bg-slate-800"
              : "border-slate-200 text-slate-500 hover:bg-slate-100"
          }`}
          title={isEditorMaximized ? "Restore" : "Maximize editor"}
        >
          {isEditorMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}

// ─── Mobile Action Bar ────────────────────────────────────────────────────────
export function MobileActionBar({
  isDark,
  c,
  isJudging,
  canJudge,
  onRun,
  onSubmit,
}: {
  isDark: boolean;
  c: ColorTokens;
  isJudging: boolean;
  canJudge: boolean;
  onRun: () => void;
  onSubmit: () => void;
}) {
  return (
    <>
      {/* Run/Submit buttons */}
      <div className={`grid grid-cols-2 gap-2 border-b px-2 py-2 md:hidden ${c.mobileBar}`}>
        <button
          type="button"
          disabled={isJudging || !canJudge}
          onClick={onRun}
          className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${c.btnRun}`}
        >
          {isJudging ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
          {isJudging ? "Running..." : "Run"}
        </button>
        <button
          type="button"
          disabled={isJudging || !canJudge}
          onClick={onSubmit}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-sm font-bold text-white transition hover:from-emerald-400 hover:to-green-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {isJudging ? "Submitting..." : "Submit"}
        </button>
      </div>

      {/* Section nav */}
      <div className={`grid grid-cols-3 gap-1.5 border-b px-2 py-2 md:hidden ${c.mobileBar}`}>
        {(["problem-panel", "code-workspace", "test-panel"] as const).map((id, idx) => {
          const labels = ["Problem", "Code", "Tests"];
          return (
            <a
              key={id}
              href={`#${id}`}
              className={`rounded-md py-2 text-center text-xs font-bold transition ${
                isDark ? "bg-[#1e293b] text-slate-300 hover:bg-[#334155]" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {labels[idx]}
            </a>
          );
        })}
      </div>
    </>
  );
}
