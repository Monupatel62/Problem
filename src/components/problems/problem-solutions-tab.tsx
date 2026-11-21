"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { ProblemDefinition } from "@/lib/problems/bank";
import type { ColorTokens } from "./practice-types";

type Props = {
  problem: ProblemDefinition;
  dark: boolean;
  c: ColorTokens;
};

const LANG_COLORS: Record<string, string> = {
  JavaScript: "bg-yellow-400/20 text-yellow-600 border-yellow-300",
  TypeScript: "bg-blue-400/20 text-blue-600 border-blue-300",
  Python: "bg-sky-400/20 text-sky-600 border-sky-300",
  Java: "bg-orange-400/20 text-orange-600 border-orange-300",
  "C++": "bg-purple-400/20 text-purple-600 border-purple-300",
  SQL: "bg-green-400/20 text-green-600 border-green-300",
  Bash: "bg-gray-400/20 text-gray-600 border-gray-300",
};

export function ProblemSolutionsTab({ problem, dark, c }: Props) {
  const solutions = problem.solutions ?? {};
  const langs = Object.keys(solutions);

  const [activeLang, setActiveLang] = useState(() => {
    // Pick preferred language order
    for (const l of ["JavaScript", "TypeScript", "Python", "Java", "C++"]) {
      if (solutions[l]) return l;
    }
    return langs[0] ?? "JavaScript";
  });

  const [copied, setCopied] = useState(false);

  if (!langs.length) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
        <div className={`mb-3 text-4xl`}>🔒</div>
        <p className={`text-sm font-semibold ${c.sub}`}>Solution not available yet.</p>
        <p className={`mt-1 text-xs ${c.muted}`}>Submit an accepted solution to unlock community solutions.</p>
      </div>
    );
  }

  const code = solutions[activeLang] ?? "";

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Simple syntax highlight — just line rendering with monospace
  function renderCode(code: string) {
    return code.split("\n").map((line, i) => (
      <div key={i} className="flex">
        <span className={`select-none w-9 shrink-0 text-right pr-3 text-[11px] ${dark ? "text-slate-600" : "text-slate-400"}`}>
          {i + 1}
        </span>
        <span className="flex-1 whitespace-pre">{line || "\n"}</span>
      </div>
    ));
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${dark ? "border-slate-700/60" : "border-slate-200"}`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          {langs.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition ${
                activeLang === lang
                  ? LANG_COLORS[lang] ?? "bg-sky-400/20 text-sky-600 border-sky-300"
                  : dark
                    ? "border-slate-700 text-slate-500 hover:text-slate-300"
                    : "border-slate-200 text-slate-500 hover:text-slate-700"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition ${
            dark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          }`}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Complexity badge */}
      {problem.solutionApproaches?.find(a => a.title.toLowerCase().includes("hash") || a.title.toLowerCase().includes("optimal") || a.title.toLowerCase().includes(activeLang.toLowerCase())) && (() => {
        const approach = problem.solutionApproaches!.at(-1)!;
        return (
          <div className={`px-4 py-2 flex items-center gap-3 text-xs border-b ${dark ? "border-slate-700/60 bg-slate-800/30" : "border-slate-100 bg-slate-50"}`}>
            <span className={`font-semibold ${c.sub}`}>{approach.title}</span>
            <span className={`px-2 py-0.5 rounded-full font-mono ${dark ? "bg-emerald-900/40 text-emerald-400" : "bg-emerald-50 text-emerald-700"}`}>
              {approach.complexity}
            </span>
          </div>
        );
      })()}

      {/* Code */}
      <div className={`flex-1 overflow-auto p-4 font-mono text-xs leading-5 ${dark ? "bg-[#0d1117] text-[#e6edf3]" : "bg-white text-slate-800"}`}>
        {renderCode(code)}
      </div>

      {/* Footer note */}
      <div className={`px-4 py-2.5 text-xs border-t ${dark ? "border-slate-700/60 text-slate-500" : "border-slate-100 text-slate-400"}`}>
        This is the optimal reference solution. Try solving it yourself first!
      </div>
    </div>
  );
}
