"use client";

import {
  BookOpen,
  ChevronDown,
  Layers,
  Code2,
  Database,
  GraduationCap,
  Library,
  ListFilter,
  Lock,
  RotateCcw,
  Search,
  Shell,
  Sparkles,
  Star,
  Sword,
  X,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export type TopicStat = { label: string; count: number };
export type CompanyStat = { label: string; count: number };
export type DifficultyFilter = "All" | "Easy" | "Medium" | "Hard";
export type StatusFilter = "All" | "Todo" | "Solved" | "Attempted" | "Premium";

const sidebarNavItems = [
  { label: "Library", icon: Library },
  { label: "Quest", icon: Sword },
  { label: "Explore", icon: BookOpen },
  { label: "Study Plan", icon: GraduationCap },
] as const;

const baseTrackTabs = [
  { label: "All Topics", icon: ListFilter },
  { label: "Algorithms", icon: Sparkles },
  { label: "Database", icon: Database },
  { label: "Shell", icon: Shell },
  { label: "Concurrency", icon: Code2 },
] as const;

export function ProblemsSidebar({
  activeSidebar,
  setActiveSidebar,
  selectedTopic,
  setSelectedTopic,
  selectedTrack,
  setSelectedTrack,
  difficultyFilter,
  setDifficultyFilter,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  topicStats,
  companyStats,
  availableTracks,
  statusFilters,
  onCompanyClick,
  isOpen,
  onClose,
}: {
  activeSidebar: string;
  setActiveSidebar: (value: string) => void;
  selectedTopic: string;
  setSelectedTopic: (value: string) => void;
  selectedTrack: string;
  setSelectedTrack: (value: string) => void;
  difficultyFilter: DifficultyFilter;
  setDifficultyFilter: (value: DifficultyFilter) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (value: StatusFilter) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  topicStats: TopicStat[];
  companyStats: CompanyStat[];
  availableTracks: Set<string>;
  statusFilters: StatusFilter[];
  onCompanyClick: (company: string) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [expandedTopics, setExpandedTopics] = useState(false);
  const [expandedCompanies, setExpandedCompanies] = useState(false);

  const trackTabs = baseTrackTabs.filter(
    (tab) => tab.label === "All Topics" || availableTracks.has(tab.label)
  );

  const hasActiveFilters =
    difficultyFilter !== "All" ||
    statusFilter !== "All" ||
    selectedTopic !== "All" ||
    selectedTrack !== "All Topics" ||
    searchQuery.trim() !== "";

  function resetFilters() {
    setDifficultyFilter("All");
    setStatusFilter("All");
    setSelectedTopic("All");
    setSelectedTrack("All Topics");
    setSearchQuery("");
  }

  const visibleTopics = expandedTopics ? topicStats : topicStats.slice(0, 10);
  const visibleCompanies = expandedCompanies ? companyStats : companyStats.slice(0, 8);

  const content = (
    <div className="flex h-full flex-col overflow-y-auto pb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[rgba(217,70,168,0.08)] shrink-0"
            style={{ color: "var(--text)" }}
            aria-label="Go back"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <img src="/images/logos/WohoTech_logo.png" alt="WoHoTech" className="h-8 w-8 object-contain" />
          <div>
            <p className="text-sm font-black text-[var(--text)]">WoHoTech</p>
            <p className="text-[11px] text-[var(--muted)]">Problems</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-7 w-7 place-items-center rounded-md text-[var(--muted)] hover:bg-[var(--bg)] lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <label className="flex h-9 items-center gap-2 rounded-lg bg-[var(--bg)] px-3 text-sm text-[var(--muted)]">
          <Search className="h-3.5 w-3.5 shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems..."
            className="min-w-0 flex-1 bg-transparent text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
          />
        </label>
      </div>

      {/* Nav items */}
      <nav className="px-3 space-y-0.5">
        {sidebarNavItems.map(({ label, icon: Icon }) => {
          const isActive = activeSidebar === label;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setActiveSidebar(label)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-[var(--bg)] text-[var(--text)] font-semibold"
                  : "text-[var(--text-soft)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setActiveSidebar("Favorite")}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            activeSidebar === "Favorite"
              ? "bg-[var(--bg)] text-[var(--text)] font-semibold"
              : "text-[var(--text-soft)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
          }`}
        >
          <Star className={`h-4 w-4 ${activeSidebar === "Favorite" ? "fill-orange-400 text-orange-400" : ""}`} />
          Favorites
        </button>
      </nav>

      {/* Topics Hub Link */}
      <div className="px-3 mt-1">
        <Link
          href="/problems/topics"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-500/20"
        >
          <Layers className="h-4 w-4" />
          Topics Explorer
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 my-4 border-t border-[var(--border)]" />

      {/* Difficulty Filter */}
      <div className="px-4 mb-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Difficulty</p>
        <div className="flex flex-wrap gap-1.5">
          {(["All", "Easy", "Medium", "Hard"] as DifficultyFilter[]).map((item) => {
            const isActive = difficultyFilter === item;
            const colorMap: Record<string, string> = {
              All: isActive ? "bg-[var(--text)] text-[var(--surface)]" : "bg-[var(--bg)] text-[var(--text-soft)]",
              Easy: isActive ? "bg-emerald-500 text-white" : "bg-emerald-500/10 text-emerald-600",
              Medium: isActive ? "bg-amber-500 text-white" : "bg-amber-500/10 text-amber-600",
              Hard: isActive ? "bg-red-500 text-white" : "bg-red-500/10 text-red-600",
            };
            return (
              <button
                key={item}
                type="button"
                onClick={() => setDifficultyFilter(item)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${colorMap[item]}`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Filter */}
      <div className="px-4 mb-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Status</p>
        <div className="flex flex-wrap gap-1.5">
          {statusFilters.map((item) => {
            const isActive = statusFilter === item;
            const icons: Record<string, string> = { Solved: "✅", Attempted: "🟡", Todo: "○", Premium: "💎" };
            return (
              <button
                key={item}
                type="button"
                onClick={() => setStatusFilter(item)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                  isActive ? "bg-pink-500 text-white" : "bg-[var(--bg)] text-[var(--text-soft)] hover:bg-[var(--surface)]"
                }`}
              >
                {item !== "All" && <span className="mr-1">{icons[item]}</span>}
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Track Filter */}
      <div className="px-4 mb-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Track</p>
        <div className="flex flex-wrap gap-1.5">
          {trackTabs.map(({ label, icon: Icon }) => {
            const isActive = selectedTrack === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setSelectedTrack(label)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  isActive ? "bg-[var(--text)] text-[var(--surface)]" : "bg-[var(--bg)] text-[var(--text-soft)] hover:bg-[var(--surface)]"
                }`}
              >
                <Icon className="h-3 w-3" />
                {label === "All Topics" ? "All" : label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Topic/Tag Filter */}
      <div className="px-4 mb-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Topics</p>
        <div className="flex flex-wrap gap-1.5 max-h-[200px] overflow-y-auto">
          {visibleTopics.map(({ label, count }) => {
            const isActive = selectedTopic === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setSelectedTopic(selectedTopic === label ? "All" : label)}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                  isActive
                    ? "bg-pink-500 text-white"
                    : "bg-[var(--bg)] text-[var(--text-soft)] hover:bg-[var(--surface)]"
                }`}
              >
                {label}
                <span className={`text-[10px] ${isActive ? "text-pink-100" : "text-[var(--muted)]"}`}>{count}</span>
              </button>
            );
          })}
        </div>
        {topicStats.length > 10 && (
          <button
            type="button"
            onClick={() => setExpandedTopics(!expandedTopics)}
            className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
          >
            {expandedTopics ? "Show less" : `+${topicStats.length - 10} more`}
            <ChevronDown className={`h-3 w-3 transition ${expandedTopics ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {/* Company Filter */}
      {companyStats.length > 0 && (
        <div className="px-4 mb-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Companies</p>
          <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto">
            {visibleCompanies.map(({ label, count }) => (
              <button
                key={label}
                type="button"
                onClick={() => onCompanyClick(label)}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-soft)] transition hover:bg-[var(--surface)]"
              >
                {label}
                <span className="text-[10px] text-[var(--muted)]">{count}</span>
              </button>
            ))}
          </div>
          {companyStats.length > 8 && (
            <button
              type="button"
              onClick={() => setExpandedCompanies(!expandedCompanies)}
              className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
            >
              {expandedCompanies ? "Show less" : `+${companyStats.length - 8} more`}
              <ChevronDown className={`h-3 w-3 transition ${expandedCompanies ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
      )}

      {/* Reset Filters */}
      {hasActiveFilters && (
        <div className="px-4 mt-2">
          <button
            type="button"
            onClick={resetFilters}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--muted)] transition hover:bg-[var(--bg)] hover:text-[var(--text)]"
          >
            <RotateCcw className="h-3 w-3" />
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block h-full border-r border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        {content}
      </aside>

      {/* Mobile slide-out */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[200] bg-black/40 lg:hidden" onClick={onClose} />
          <aside className="fixed inset-y-0 left-0 z-[201] w-[280px] bg-[var(--surface)] shadow-2xl lg:hidden">
            {content}
          </aside>
        </>
      )}
    </>
  );
}
