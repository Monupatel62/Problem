"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ThumbsUp,
  ThumbsDown,
  Eye,
  EyeOff,
  AlertTriangle,
  Lightbulb,
  BarChart2,
  MessageSquare,
} from "lucide-react";
import type { ProblemDefinition } from "@/lib/problems/bank";

// ─── Tiny markdown-lite renderer ─────────────────────────────────────────────
// Handles: **bold**, `inline code`, newlines → <br>, and blank-line paragraph breaks.
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

// ─── Description body renderer ───────────────────────────────────────────────
function DescriptionBody({ text, dark }: { text: string; dark: boolean }) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className={`space-y-3 text-sm leading-7 ${dark ? "text-slate-300" : "text-slate-700"}`}>
      {paragraphs.map((para, i) => {
        const lines = para.split(/\n/).map((l) => l.trim());

        if (lines.every((l) => /^[-*•]/.test(l)))
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.replace(/^[-*•]\s*/, ""), dark)}</li>
              ))}
            </ul>
          );

        if (lines.every((l) => /^\d+\./.test(l)))
          return (
            <ol key={i} className="list-decimal space-y-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.replace(/^\d+\.\s*/, ""), dark)}</li>
              ))}
            </ol>
          );

        return (
          <p key={i}>
            {lines.map((line, j) => (
              <span key={j}>
                {j > 0 && " "}
                {renderInline(line, dark)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

// ─── Hint accordion row ──────────────────────────────────────────────────────
function HintRow({ hint, index, dark }: { hint: string; index: number; dark: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-xl border ${dark ? "border-[#1e293b]" : "border-slate-200"}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition rounded-xl ${
          dark ? "text-slate-300 hover:bg-[#1e293b]" : "text-slate-700 hover:bg-slate-50"
        }`}
      >
        <span className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          Hint {index + 1}
        </span>
        {open ? (
          <EyeOff className="h-3.5 w-3.5 text-slate-400" />
        ) : (
          <Eye className="h-3.5 w-3.5 text-slate-400" />
        )}
      </button>
      {open && (
        <div
          className={`border-t px-4 py-3 text-sm leading-6 rounded-b-xl ${
            dark ? "border-[#1e293b] text-slate-300" : "border-slate-100 text-slate-600"
          }`}
        >
          {renderInline(hint, dark)}
        </div>
      )}
    </div>
  );
}

// ─── Difficulty badge ────────────────────────────────────────────────────────
function DifficultyBadge({ difficulty }: { difficulty: "Easy" | "Medium" | "Hard" }) {
  const styles = {
    Easy: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
    Medium: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
    Hard: "text-rose-500 bg-rose-50 dark:bg-rose-950/30",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[difficulty]}`}>
      {difficulty}
    </span>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────
type Props = {
  problem: ProblemDefinition;
  dark?: boolean;
  isJudgeReady?: boolean;
};

// ─── Description Tab Component ───────────────────────────────────────────────
export function ProblemDescriptionTab({ problem, dark = false, isJudgeReady = true }: Props) {
  const [liked, setLiked] = useState<boolean | null>(null);

  const likeCount = (problem.likes ?? 0) + (liked === true ? 1 : 0);
  const dislikeCount = (problem.dislikes ?? 0) + (liked === false ? 1 : 0);

  const t = {
    primary: dark ? "text-slate-100" : "text-slate-900",
    secondary: dark ? "text-slate-400" : "text-slate-500",
    muted: dark ? "text-slate-500" : "text-slate-400",
    body: dark ? "text-slate-300" : "text-slate-700",
    border: dark ? "border-[#1e293b]" : "border-slate-200",
    exampleBg: dark ? "bg-[#131c2e]" : "bg-slate-50",
    inlineCode: dark ? "bg-[#1e293b] text-sky-300" : "bg-slate-100 text-slate-800",
    tagBg: dark
      ? "bg-[#1e293b] text-slate-300 hover:bg-[#334155]"
      : "bg-slate-100 text-slate-600 hover:bg-slate-200",
    companyBg: dark
      ? "bg-blue-950/40 text-blue-400 border border-blue-900/40"
      : "bg-blue-50 text-blue-700 border border-blue-100",
  };

  return (
    <div className="flex flex-col gap-0">
      {/* ── Meta row: difficulty · acceptance · likes ─────────────── */}
      <div className="px-5 pt-5">
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <DifficultyBadge difficulty={problem.difficulty} />

          {/* Acceptance rate */}
          <span className={`flex items-center gap-1 text-xs ${t.secondary}`}>
            <BarChart2 className="h-3.5 w-3.5" />
            {problem.acceptance} accepted
          </span>

          {/* Discussion count */}
          {(problem.discussionCount ?? 0) > 0 && (
            <span className={`flex items-center gap-1 text-xs ${t.secondary}`}>
              <MessageSquare className="h-3.5 w-3.5" />
              {problem.discussionCount!.toLocaleString()}
            </span>
          )}

          {/* Like / dislike */}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLiked((l) => (l === true ? null : true))}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition ${
                liked === true
                  ? "text-emerald-600 bg-emerald-50"
                  : `${t.secondary} hover:text-emerald-600`
              }`}
              title="Like"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              {likeCount > 0 ? likeCount.toLocaleString() : ""}
            </button>
            <button
              type="button"
              onClick={() => setLiked((l) => (l === false ? null : false))}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition ${
                liked === false
                  ? "text-rose-600 bg-rose-50"
                  : `${t.secondary} hover:text-rose-600`
              }`}
              title="Dislike"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              {dislikeCount > 0 ? dislikeCount.toLocaleString() : ""}
            </button>
          </div>
        </div>
      </div>

      <div className={`mx-5 mt-4 border-t ${t.border}`} />

      {/* ── Judge unavailable banner ─────────────────────────────── */}
      {!isJudgeReady && (
        <div
          className={`mx-5 mt-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            dark
              ? "border-amber-800/40 bg-amber-950/20 text-amber-300"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div>
            <p className="font-semibold">Judge runner not yet enabled</p>
            <p className={`mt-0.5 text-xs ${dark ? "text-amber-400" : "text-amber-700"}`}>
              You can read and plan your solution, but Run and Submit are disabled for this problem.
            </p>
          </div>
        </div>
      )}

      {/* ── Problem description ──────────────────────────────────── */}
      <div className="px-5 pt-5">
        <DescriptionBody text={problem.description} dark={dark} />
      </div>

      {/* ── Examples ─────────────────────────────────────────────── */}
      {problem.examples.length > 0 && (
        <div className="mt-6 space-y-4 px-5">
          {problem.examples.map((example, i) => (
            <div key={i}>
              <p className={`mb-2 text-sm font-semibold ${t.primary}`}>Example {i + 1}</p>
              <div className={`overflow-hidden rounded-xl border ${t.border}`}>
                <div
                  className={`flex gap-3 border-b px-4 py-2.5 ${t.border} ${t.exampleBg}`}
                >
                  <span
                    className={`w-20 shrink-0 pt-0.5 text-xs font-bold uppercase tracking-wide ${t.muted}`}
                  >
                    Input
                  </span>
                  <code
                    className={`font-mono text-xs leading-6 ${
                      dark ? "text-slate-200" : "text-slate-800"
                    }`}
                  >
                    {example.input}
                  </code>
                </div>
                <div
                  className={`flex gap-3 px-4 py-2.5 ${
                    example.explanation ? `border-b ${t.border}` : ""
                  } ${t.exampleBg}`}
                >
                  <span
                    className={`w-20 shrink-0 pt-0.5 text-xs font-bold uppercase tracking-wide ${t.muted}`}
                  >
                    Output
                  </span>
                  <code
                    className={`font-mono text-xs leading-6 ${
                      dark ? "text-emerald-400" : "text-emerald-700"
                    }`}
                  >
                    {example.output}
                  </code>
                </div>
                {example.explanation && (
                  <div className={`flex gap-3 px-4 py-2.5 ${t.exampleBg}`}>
                    <span
                      className={`w-20 shrink-0 pt-0.5 text-xs font-bold uppercase tracking-wide ${t.muted}`}
                    >
                      Explain
                    </span>
                    <span className={`text-xs leading-6 ${t.body}`}>
                      {renderInline(example.explanation, dark)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Constraints ──────────────────────────────────────────── */}
      {problem.constraints.length > 0 && (
        <div className="mt-6 px-5">
          <p className={`mb-3 text-sm font-semibold ${t.primary}`}>Constraints</p>
          <ul className={`space-y-1.5 ${t.body}`}>
            {problem.constraints.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span
                  className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${
                    dark ? "bg-slate-600" : "bg-slate-400"
                  }`}
                />
                <code className={`rounded px-1.5 py-0.5 font-mono text-xs leading-6 ${t.inlineCode}`}>
                  {c}
                </code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Hints accordion ──────────────────────────────────────── */}
      {problem.hints.length > 0 && (
        <div className="mt-6 px-5">
          <p className={`mb-3 text-sm font-semibold ${t.primary}`}>Hints</p>
          <div className="space-y-2">
            {problem.hints.map((hint, i) => (
              <HintRow key={i} hint={hint} index={i} dark={dark} />
            ))}
          </div>
        </div>
      )}

      {/* ── Topic tags ───────────────────────────────────────────── */}
      {problem.tags.length > 0 && (
        <div className="mt-6 px-5">
          <p className={`mb-3 text-sm font-semibold ${t.primary}`}>Topics</p>
          <div className="flex flex-wrap gap-2">
            {problem.tags.map((tag) => (
              <Link
                key={tag}
                href={`/problems?topic=${encodeURIComponent(tag)}`}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${t.tagBg}`}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Companies ────────────────────────────────────────────── */}
      {(problem.companies?.length ?? 0) > 0 && (
        <div className="mt-5 px-5">
          <p className={`mb-3 text-sm font-semibold ${t.primary}`}>Companies</p>
          <div className="flex flex-wrap gap-2">
            {problem.companies!.map((company) => (
              <span
                key={company}
                className={`rounded-full px-3 py-1 text-xs font-medium ${t.companyBg}`}
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="h-8" />
    </div>
  );
}
