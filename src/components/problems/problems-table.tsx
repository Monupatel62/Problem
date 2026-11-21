"use client";

import { CheckCircle2, ChevronLeft, ChevronRight, Lock, Star } from "lucide-react";
import Link from "next/link";
import type { ProblemDefinition } from "@/lib/problems/bank";
import { useState } from "react";
import type { ViewMode } from "./problems-toolbar";

const ITEMS_PER_PAGE = 30;

function difficultyBadge(difficulty: string) {
  const styles: Record<string, string> = {
    Easy: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    Medium: "bg-amber-500/10 text-amber-600 border-amber-200",
    Hard: "bg-red-500/10 text-red-600 border-red-200",
  };
  return styles[difficulty] ?? "bg-[var(--bg)] text-[var(--muted)]";
}

function StatusIcon({ isSolved, isAttempted, isPremium }: { isSolved: boolean; isAttempted: boolean; isPremium?: boolean }) {
  if (isSolved) return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (isAttempted) return <div className="h-3 w-3 rounded-full border-2 border-amber-400 bg-amber-400/20" />;
  if (isPremium) return <Lock className="h-3.5 w-3.5 text-[var(--muted)]" />;
  return <div className="h-3 w-3 rounded-full border-2 border-[var(--border)]" />;
}

function ProblemRow({
  problem,
  isSolved,
  isAttempted,
  isFavorite,
  onToggleFavorite,
}: {
  problem: ProblemDefinition;
  isSolved: boolean;
  isAttempted: boolean;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
}) {
  const trackBadge: Record<string, { label: string; cls: string }> = {
    Database: { label: "SQL", cls: "bg-blue-500/10 text-blue-600" },
    Shell: { label: "Shell", cls: "bg-purple-500/10 text-purple-600" },
    Concurrency: { label: "Concurrency", cls: "bg-amber-500/10 text-amber-600" },
  };
  const badge = trackBadge[problem.track];

  return (
    <div
      className={`group grid grid-cols-[28px_minmax(0,1fr)_80px_80px_44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:bg-[var(--bg)] hover:border-l-2 hover:border-l-pink-500 ${
        isSolved ? "bg-emerald-500/[0.03]" : ""
      }`}
    >
      {/* Status */}
      <div className="flex justify-center">
        <StatusIcon isSolved={isSolved} isAttempted={isAttempted} isPremium={problem.premium} />
      </div>

      {/* Title + Tags */}
      <Link href={`/problems/${problem.slug}`} className="min-w-0 flex items-center gap-3">
        <span className="w-8 shrink-0 text-right text-xs font-mono text-[var(--muted)]">{problem.id}</span>
        <div className="min-w-0">
          <span className="block truncate font-semibold text-[var(--text)] group-hover:text-pink-600 transition">
            {problem.title}
          </span>
          <div className="mt-0.5 flex flex-wrap items-center gap-1">
            {badge && (
              <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold ${badge.cls}`}>
                {badge.label}
              </span>
            )}
            {problem.judgeReady === false && (
              <span className="inline-flex rounded bg-[var(--bg)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--muted)]">
                Coming Soon
              </span>
            )}
            {problem.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="hidden sm:inline-flex rounded bg-[var(--bg)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted)]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>

      {/* Acceptance */}
      <span className="text-right text-xs text-[var(--muted)]">{problem.acceptance}</span>

      {/* Difficulty */}
      <span className={`text-right`}>
        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${difficultyBadge(problem.difficulty)}`}>
          {problem.difficulty}
        </span>
      </span>

      {/* Favorite */}
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); onToggleFavorite(problem.slug); }}
        className="grid h-7 w-7 place-items-center rounded-md transition hover:bg-orange-50"
        aria-label={isFavorite ? `Remove ${problem.title} from favorites` : `Add ${problem.title} to favorites`}
      >
        <Star className={`h-3.5 w-3.5 transition ${isFavorite ? "fill-orange-400 text-orange-400" : "text-[var(--muted)] opacity-0 group-hover:opacity-100"}`} />
      </button>
    </div>
  );
}

function ProblemCard({
  problem,
  isSolved,
  isAttempted,
  isFavorite,
  onToggleFavorite,
}: {
  problem: ProblemDefinition;
  isSolved: boolean;
  isAttempted: boolean;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
}) {
  return (
    <div className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:shadow-md hover:border-pink-200">
      <div className="flex items-start justify-between">
        <StatusIcon isSolved={isSolved} isAttempted={isAttempted} isPremium={problem.premium} />
        <button
          type="button"
          onClick={() => onToggleFavorite(problem.slug)}
          className="grid h-6 w-6 place-items-center rounded transition"
          aria-label="Toggle favorite"
        >
          <Star className={`h-3.5 w-3.5 ${isFavorite ? "fill-orange-400 text-orange-400" : "text-[var(--muted)]"}`} />
        </button>
      </div>
      <Link href={`/problems/${problem.slug}`} className="block mt-3">
        <p className="text-xs font-mono text-[var(--muted)]">#{problem.id}</p>
        <p className="mt-1 font-semibold text-[var(--text)] leading-snug line-clamp-2 group-hover:text-pink-600 transition">
          {problem.title}
        </p>
      </Link>
      <div className="mt-3 flex items-center justify-between">
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${difficultyBadge(problem.difficulty)}`}>
          {problem.difficulty}
        </span>
        <span className="text-[11px] text-[var(--muted)]">{problem.acceptance}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {problem.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded bg-[var(--bg)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted)]">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ProblemsTable({
  problems,
  solvedSlugs,
  attemptedSlugs,
  favoriteSlugs,
  onToggleFavorite,
  viewMode,
}: {
  problems: ProblemDefinition[];
  solvedSlugs: string[];
  attemptedSlugs: string[];
  favoriteSlugs: string[];
  onToggleFavorite: (slug: string) => void;
  viewMode: ViewMode;
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(problems.length / ITEMS_PER_PAGE);
  const paginated = problems.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  // Reset page when problems change
  if (page >= totalPages && page > 0) {
    setPage(0);
  }

  if (problems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] py-16">
        <div className="text-4xl">🔍</div>
        <p className="mt-3 text-sm font-semibold text-[var(--muted)]">No matching problems found</p>
        <p className="mt-1 text-xs text-[var(--muted)]">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div>
      {/* Table Header (table view only) */}
      {viewMode === "table" && (
        <div className="hidden sm:grid grid-cols-[28px_minmax(0,1fr)_80px_80px_44px] items-center gap-3 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
          <span className="text-center">✓</span>
          <span className="pl-11">Title</span>
          <span className="text-right">Acceptance</span>
          <span className="text-right">Difficulty</span>
          <span />
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="space-y-0.5">
          {paginated.map((problem) => (
            <ProblemRow
              key={problem.slug}
              problem={problem}
              isSolved={solvedSlugs.includes(problem.slug)}
              isAttempted={attemptedSlugs.includes(problem.slug)}
              isFavorite={favoriteSlugs.includes(problem.slug)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Cards View */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {paginated.map((problem) => (
            <ProblemCard
              key={problem.slug}
              problem={problem}
              isSolved={solvedSlugs.includes(problem.slug)}
              isAttempted={attemptedSlugs.includes(problem.slug)}
              isFavorite={favoriteSlugs.includes(problem.slug)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--bg)] text-[var(--muted)] transition hover:text-[var(--text)] disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i;
              } else if (page < 4) {
                pageNum = i;
              } else if (page > totalPages - 5) {
                pageNum = totalPages - 7 + i;
              } else {
                pageNum = page - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-semibold transition ${
                    page === pageNum
                      ? "bg-[var(--text)] text-[var(--surface)]"
                      : "text-[var(--muted)] hover:bg-[var(--bg)]"
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--bg)] text-[var(--muted)] transition hover:text-[var(--text)] disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
