"use client";

import { Trophy } from "lucide-react";
import { CodeEditor } from "@/components/problems/code-editor";
import type { ProblemDefinition } from "@/lib/problems/bank";
import { type ColorTokens, type LanguageName, type LanguageStatus, languages } from "./practice-types";

type CodeEditorPanelProps = {
  problem: ProblemDefinition;
  isDark: boolean;
  c: ColorTokens;
  code: string;
  language: LanguageName;
  savedAt: string;
  isJudging: boolean;
  showAccepted: boolean;
  isSpecialProblem: boolean;
  isSqlProblem: boolean;
  isShellProblem: boolean;
  isConcurrencyProblem: boolean;
  isLanguageExecutable: boolean;
  currentLanguageStatus: LanguageStatus;
  onCodeChange: (value: string) => void;
  onLanguageChange: (lang: LanguageName) => void;
  onRun: () => void;
  onSave: () => void;
  onReset: () => void;
};

function AcceptedFlash({ show, dark }: { show: boolean; dark: boolean }) {
  if (!show) return null;
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-md transition-opacity duration-500 ${
        dark ? "bg-emerald-950/60" : "bg-emerald-50/80"
      }`}
    >
      <div className="flex flex-col items-center gap-3 text-center animate-in zoom-in-95 duration-300">
        <div className="relative">
          <Trophy className="h-12 w-12 text-emerald-500" />
          <div className="absolute -inset-2 animate-ping rounded-full bg-emerald-400/20" />
        </div>
        <p className="text-lg font-black text-emerald-600">Accepted!</p>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CodeEditorPanel({
  problem,
  isDark,
  c,
  code,
  language,
  savedAt,
  isJudging,
  showAccepted,
  isSpecialProblem,
  isSqlProblem,
  isShellProblem,
  isConcurrencyProblem,
  isLanguageExecutable,
  currentLanguageStatus,
  onCodeChange,
  onLanguageChange,
  onRun,
  onSave,
  onReset,
}: CodeEditorPanelProps) {
  const runnerLang = isSqlProblem
    ? "SQLite"
    : isShellProblem
      ? "Bash"
      : isConcurrencyProblem
        ? "Python"
        : language;

  const runnerMsg = isSqlProblem
    ? "Runs via SQLite on the external judge service."
    : isShellProblem
      ? "Bash pipeline runs on the external judge service."
      : isConcurrencyProblem
        ? "Tested via Python threading harness."
        : currentLanguageStatus.message;

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div className="min-h-0 flex-1">
        <CodeEditor
          value={code}
          language={isSqlProblem ? "SQL" : isShellProblem ? "Bash" : language}
          languages={isSpecialProblem ? (isSqlProblem ? ["SQL"] : isShellProblem ? ["Bash"] : [language]) as unknown as typeof languages : languages}
          savedAt={savedAt}
          disabled={isJudging}
          theme={isDark ? "dark" : "light"}
          onChange={onCodeChange}
          onLanguageChange={(l) => !isSpecialProblem && onLanguageChange(l as LanguageName)}
          onRun={onRun}
          onSave={onSave}
          onReset={onReset}
        />
      </div>

      {/* Accepted flash overlay */}
      <AcceptedFlash show={showAccepted} dark={isDark} />

      {/* Runner info bar */}
      <div className={`flex h-7 shrink-0 items-center gap-2 border-t px-3 text-[11px] transition-colors ${c.runnerBar}`}>
        <span className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
          {runnerLang}:
        </span>
        <span className={`truncate ${c.muted}`}>{runnerMsg}</span>
        <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
          isSpecialProblem || isLanguageExecutable
            ? isDark ? "bg-emerald-900/40 text-emerald-400" : "bg-emerald-50 text-emerald-600"
            : isDark ? "bg-amber-900/40 text-amber-400" : "bg-amber-50 text-amber-700"
        }`}>
          {isSpecialProblem ? "Live" : currentLanguageStatus.label}
        </span>
      </div>
    </div>
  );
}
