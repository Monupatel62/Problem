"use client";

import { Filter, Grid3X3, List, Menu, Shuffle } from "lucide-react";

export type SortMode = "Default" | "Acceptance" | "Difficulty" | "Frequency";
export type ViewMode = "table" | "cards";
export type QuickTab = "all" | "favorites" | "recent";

export function ProblemsToolbar({
  viewMode,
  setViewMode,
  sortMode,
  setSortMode,
  quickTab,
  setQuickTab,
  totalCount,
  filteredCount,
  solvedCount,
  onRandomProblem,
  onToggleSidebar,
}: {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sortMode: SortMode;
  setSortMode: (mode: SortMode) => void;
  quickTab: QuickTab;
  setQuickTab: (tab: QuickTab) => void;
  totalCount: number;
  filteredCount: number;
  solvedCount: number;
  onRandomProblem: () => void;
  onToggleSidebar: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--bg)] text-[var(--muted)] lg:hidden"
          aria-label="Open filters"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Quick tabs */}
        <div className="flex rounded-lg bg-[var(--bg)] p-0.5">
          {([
            { key: "all", label: "All" },
            { key: "favorites", label: "⭐ Favorites" },
            { key: "recent", label: "Recent" },
          ] as { key: QuickTab; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setQuickTab(key)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                quickTab === key
                  ? "bg-[var(--surface)] text-[var(--text)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <span className="hidden text-xs text-[var(--muted)] sm:inline">
          Showing <span className="font-semibold text-[var(--text-soft)]">{filteredCount}</span> of {totalCount} problems
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Sort dropdown */}
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          className="h-8 rounded-lg bg-[var(--bg)] px-3 text-xs font-semibold text-[var(--text-soft)] outline-none cursor-pointer"
          aria-label="Sort problems"
        >
          <option value="Default">Sort: #Number</option>
          <option value="Acceptance">Sort: Acceptance</option>
          <option value="Difficulty">Sort: Difficulty</option>
          <option value="Frequency">Sort: Frequency</option>
        </select>

        {/* View toggle */}
        <div className="hidden sm:flex rounded-lg bg-[var(--bg)] p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`grid h-7 w-7 place-items-center rounded-md transition ${
              viewMode === "table" ? "bg-[var(--surface)] text-[var(--text)] shadow-sm" : "text-[var(--muted)]"
            }`}
            aria-label="Table view"
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`grid h-7 w-7 place-items-center rounded-md transition ${
              viewMode === "cards" ? "bg-[var(--surface)] text-[var(--text)] shadow-sm" : "text-[var(--muted)]"
            }`}
            aria-label="Card view"
          >
            <Grid3X3 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Random problem */}
        <button
          type="button"
          onClick={onRandomProblem}
          className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--bg)] text-[var(--muted)] transition hover:text-[var(--text)]"
          aria-label="Random problem"
        >
          <Shuffle className="h-3.5 w-3.5" />
        </button>

        {/* Solved badge */}
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">
          {solvedCount} solved
        </span>
      </div>
    </div>
  );
}
