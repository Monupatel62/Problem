"use client";

import { Lightbulb } from "lucide-react";
import type { ProblemDefinition } from "@/lib/problems/bank";

// ─── Tiny markdown-lite inline renderer ──────────────────────────────────────
function renderInline(text: string, dark = false) {
  const parts: React.ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith("`")) {
      parts.push(
        <code
          key={key++}
          className={`rounded px-1.5 py-0.5 font-mono text-[0.8em] ${
            dark ? "bg-[#1e293b] text-sky-300" : "bg-slate-100 text-slate-800"
          }`}
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    }
    last = match.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// ─── Props ───────────────────────────────────────────────────────────────────
type Props = {
  problem: ProblemDefinition;
  dark?: boolean;
};

// ─── Editorial Tab Component ─────────────────────────────────────────────────
export function ProblemEditorialTab({ problem, dark = false }: Props) {
  const t = {
    primary: dark ? "text-slate-100" : "text-slate-900",
    secondary: dark ? "text-slate-400" : "text-slate-500",
    border: dark ? "border-[#1e293b]" : "border-slate-200",
    surface: dark ? "bg-[#1a2235]" : "bg-slate-50",
    approach: dark ? "bg-[#1a2235] border-[#1e293b]" : "bg-white border-slate-200",
  };

  const hasEditorial = (problem.editorial?.length ?? 0) > 0;
  const hasApproaches = (problem.solutionApproaches?.length ?? 0) > 0;

  return (
    <div className="px-5 py-5">
      <div className="flex items-center gap-2 mb-5">
        <Lightbulb className="h-5 w-5 text-amber-400" />
        <h2 className={`text-base font-bold ${t.primary}`}>Editorial</h2>
      </div>

      {!hasEditorial && !hasApproaches ? (
        <div className={`rounded-lg border px-4 py-6 text-center text-sm ${t.border} ${t.secondary}`}>
          Editorial content is being prepared for this problem.
        </div>
      ) : null}

      {/* Editorial paragraphs */}
      {hasEditorial && (
        <div className={`space-y-3 text-sm leading-7 ${dark ? "text-slate-300" : "text-slate-700"}`}>
          {problem.editorial!.map((para, i) => (
            <p key={i}>{renderInline(para)}</p>
          ))}
        </div>
      )}

      {/* Solution approaches */}
      {hasApproaches && (
        <div className={`${hasEditorial ? "mt-8" : ""} space-y-4`}>
          {hasEditorial && <h3 className={`text-sm font-semibold ${t.primary}`}>Approaches</h3>}
          {problem.solutionApproaches!.map((approach, i) => (
            <div key={i} className={`rounded-lg border p-4 ${t.approach}`}>
              <div className="flex items-start justify-between gap-3">
                <p className={`font-semibold ${t.primary}`}>{approach.title}</p>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    dark
                      ? "bg-emerald-950/40 text-emerald-400"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {approach.complexity}
                </span>
              </div>
              <p className={`mt-2 text-sm leading-6 ${dark ? "text-slate-300" : "text-slate-600"}`}>
                {renderInline(approach.explanation)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
