"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { type ProblemDefinition } from "@/lib/problems/bank";
import { PROBLEM_CATALOG } from "@/lib/problems/catalog";

import { ProgressStats, type ProgressData } from "@/components/problems/progress-stats";
import { DailyChallengeCard } from "@/components/problems/daily-challenge-card";
import {
  ProblemsSidebar,
  type DifficultyFilter,
  type StatusFilter,
  type TopicStat,
  type CompanyStat,
} from "@/components/problems/problems-sidebar";
import { ProblemsToolbar, type SortMode, type ViewMode, type QuickTab } from "@/components/problems/problems-toolbar";
import { ProblemsTable } from "@/components/problems/problems-table";
import { PracticeCalendar } from "@/components/problems/practice-calendar";
import { RecommendationsSection, type RecommendationData } from "@/components/problems/recommendations-section";

// ─── Helpers ────────────────────────────────────────────────────────────────

const difficultyRank = { Easy: 1, Medium: 2, Hard: 3 };

const FREQUENCY_MAP: Record<string, number> = {
  "very-high": 95,
  "high": 75,
  "medium": 50,
  "low": 25,
};

// Client-side fallback: convert lightweight catalog entries to ProblemDefinition shape
const catalogFallback: ProblemDefinition[] = PROBLEM_CATALOG.map((entry) => ({
  id: entry.id,
  slug: entry.slug,
  title: entry.title,
  difficulty: entry.difficulty,
  track: entry.track,
  acceptance: entry.acceptance,
  tags: entry.tags,
  companies: entry.companies,
  frequency: FREQUENCY_MAP[entry.frequency] ?? 50,
  premium: entry.premium ?? false,
  judgeReady: entry.inBank ?? false,
  description: "",
  constraints: [],
  hints: [],
  examples: [],
  sampleCases: [],
  hiddenCases: [],
  functionName: "solution",
  starterCode: {},
}));

function getTopicStats(problems: ProblemDefinition[]): TopicStat[] {
  const counts = new Map<string, number>();
  for (const problem of problems) {
    for (const tag of problem.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function getCompanyStats(problems: ProblemDefinition[]): CompanyStat[] {
  const counts = new Map<string, number>();
  for (const problem of problems) {
    for (const company of problem.companies ?? []) {
      counts.set(company, (counts.get(company) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

// ─── Types ──────────────────────────────────────────────────────────────────

type ProblemAnalytics = {
  totalProblems: number;
  solvedProblems: number;
  attemptedProblems: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  recentSubmissions: Array<{
    id: string;
    slug: string;
    title: string;
    status: string;
    language: string;
    runtimeMs: number;
    createdAt: string;
  }>;
  topicStats: Array<{ topic: string; solved: number; total: number }>;
  streakDays: number;
  score: number;
  rankLabel: string;
  source: "database" | "local";
  persisted: boolean;
  reason?: string;
};

type ProblemRecommendation = {
  daily: ProblemDefinition[];
  weakTopics: Array<{ topic: string; solved: number; total: number }>;
  nextUp: ProblemDefinition[];
  source: "database" | "local";
  persisted: boolean;
};

// ─── Language Cards ─────────────────────────────────────────────────────────

const editorLanguageCards = [
  {
    label: "JavaScript",
    href: "/subjects/javascript-complete-guide",
    description: "Functions, arrays, async logic, DOM, and interview basics.",
    tone: "from-amber-400 to-orange-500",
    mark: "JS",
  },
  {
    label: "Python",
    href: "/subjects/python-master-course",
    description: "Beginner syntax, loops, functions, projects, and practice flow.",
    tone: "from-sky-500 to-blue-600",
    mark: "PY",
  },
  {
    label: "C++",
    href: "/subjects/data-structures-algorithms",
    description: "DSA patterns, arrays, strings, pointers, and interview practice.",
    tone: "from-indigo-500 to-violet-600",
    mark: "C++",
  },
  {
    label: "Java",
    href: "/subjects/java-master-course",
    description: "Core Java, OOP, collections, and DSA preparation.",
    tone: "from-rose-500 to-red-600",
    mark: "JV",
  },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export function ProblemsWorkspace({
  initialProblems = [],
  dataSource = "fallback",
}: {
  initialProblems?: ProblemDefinition[];
  dataSource?: "database" | "fallback";
}) {
  // ── Sidebar state ──
  const [activeSidebar, setActiveSidebar] = useState("Library");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [selectedTrack, setSelectedTrack] = useState("All Topics");
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Toolbar state ──
  const [sortMode, setSortMode] = useState<SortMode>("Default");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [quickTab, setQuickTab] = useState<QuickTab>("all");

  // ── User data ──
  const [solvedSlugs, setSolvedSlugs] = useState<string[]>([]);
  const [attemptedSlugs, setAttemptedSlugs] = useState<string[]>([]);
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);
  const [localPracticeDates, setLocalPracticeDates] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<ProblemAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<ProblemRecommendation | null>(null);

  // ── Derived data ──
  const catalogProblems = initialProblems.length ? initialProblems : catalogFallback;
  const topicStats = useMemo(() => getTopicStats(catalogProblems), [catalogProblems]);
  const companyStats = useMemo(() => getCompanyStats(catalogProblems), [catalogProblems]);
  const hasPremiumProblems = useMemo(
    () => catalogProblems.some((p) => p.premium),
    [catalogProblems]
  );
  const statusFilters = useMemo(
    () =>
      (hasPremiumProblems
        ? ["All", "Todo", "Solved", "Attempted", "Premium"]
        : ["All", "Todo", "Solved", "Attempted"]) as StatusFilter[],
    [hasPremiumProblems]
  );
  const availableTracks = useMemo(
    () => new Set(catalogProblems.map((p) => p.track as string)),
    [catalogProblems]
  );

  // ── Load user progress ──
  useEffect(() => {
    if (typeof window === "undefined") return;
    const localSolved = JSON.parse(window.localStorage.getItem("wohotech-solved-problems") ?? "[]") as string[];
    const localAttempted = JSON.parse(window.localStorage.getItem("wohotech-attempted-problems") ?? "[]") as string[];
    const localFavorites = JSON.parse(window.localStorage.getItem("wohotech-favorite-problems") ?? "[]") as string[];
    const practiceDates = JSON.parse(window.localStorage.getItem("wohotech-practice-days") ?? "[]") as string[];
    setSolvedSlugs(localSolved);
    setAttemptedSlugs(localAttempted);
    setFavoriteSlugs(localFavorites);
    setLocalPracticeDates(practiceDates);

    void fetch("/api/problems/statuses")
      .then((response) => response.json())
      .then((payload) => {
        if (!Array.isArray(payload.statuses)) return;
        const dbSolved = payload.statuses.filter((s: { solved?: boolean }) => s.solved).map((s: { slug: string }) => s.slug);
        const dbAttempted = payload.statuses.filter((s: { attempted?: boolean }) => s.attempted).map((s: { slug: string }) => s.slug);
        const dbFavorites = payload.statuses.filter((s: { favorite?: boolean }) => s.favorite).map((s: { slug: string }) => s.slug);
        const nextSolved = [...new Set([...localSolved, ...dbSolved])];
        const nextAttempted = [...new Set([...localAttempted, ...dbAttempted])];
        const nextFavorites = [...new Set([...localFavorites, ...dbFavorites])];
        setSolvedSlugs(nextSolved);
        setAttemptedSlugs(nextAttempted);
        setFavoriteSlugs(nextFavorites);
        window.localStorage.setItem("wohotech-solved-problems", JSON.stringify(nextSolved));
        window.localStorage.setItem("wohotech-attempted-problems", JSON.stringify(nextAttempted));
        window.localStorage.setItem("wohotech-favorite-problems", JSON.stringify(nextFavorites));
      })
      .catch(() => {});
  }, []);

  // ── Reset invalid filters ──
  useEffect(() => {
    if (selectedTopic !== "All" && !topicStats.some((t) => t.label === selectedTopic)) {
      setSelectedTopic("All");
    }
  }, [selectedTopic, topicStats]);

  useEffect(() => {
    if (selectedTrack !== "All Topics" && !availableTracks.has(selectedTrack)) {
      setSelectedTrack("All Topics");
    }
  }, [selectedTrack, availableTracks]);

  // ── Fetch analytics ──
  useEffect(() => {
    let cancelled = false;
    void fetch("/api/problems/analytics")
      .then((r) => r.json())
      .then((payload) => {
        if (cancelled) return;
        setAnalytics({
          totalProblems: Number(payload.totalProblems ?? 0),
          solvedProblems: Number(payload.solvedProblems ?? 0),
          attemptedProblems: Number(payload.attemptedProblems ?? 0),
          easySolved: Number(payload.easySolved ?? 0),
          mediumSolved: Number(payload.mediumSolved ?? 0),
          hardSolved: Number(payload.hardSolved ?? 0),
          recentSubmissions: Array.isArray(payload.recentSubmissions) ? payload.recentSubmissions : [],
          topicStats: Array.isArray(payload.topicStats) ? payload.topicStats : [],
          streakDays: Number(payload.streakDays ?? 0),
          score: Number(payload.score ?? 0),
          rankLabel: typeof payload.rankLabel === "string" ? payload.rankLabel : "Beginner",
          source: payload.source === "database" ? "database" : "local",
          persisted: Boolean(payload.persisted),
          reason: typeof payload.reason === "string" ? payload.reason : undefined,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setAnalytics({
            totalProblems: catalogProblems.length,
            solvedProblems: solvedSlugs.length,
            attemptedProblems: attemptedSlugs.length,
            easySolved: catalogProblems.filter((p) => p.difficulty === "Easy" && solvedSlugs.includes(p.slug)).length,
            mediumSolved: catalogProblems.filter((p) => p.difficulty === "Medium" && solvedSlugs.includes(p.slug)).length,
            hardSolved: catalogProblems.filter((p) => p.difficulty === "Hard" && solvedSlugs.includes(p.slug)).length,
            recentSubmissions: [],
            topicStats: [],
            streakDays: 0,
            score: 0,
            rankLabel: "Beginner",
            source: "local",
            persisted: false,
            reason: "Analytics unavailable.",
          });
        }
      });
    return () => { cancelled = true; };
  }, [attemptedSlugs, catalogProblems, solvedSlugs]);

  // ── Fetch recommendations ──
  useEffect(() => {
    let cancelled = false;
    void fetch("/api/problems/recommendations")
      .then((r) => r.json())
      .then((payload) => {
        if (cancelled) return;
        setRecommendations({
          daily: Array.isArray(payload.daily) ? payload.daily : [],
          weakTopics: Array.isArray(payload.weakTopics) ? payload.weakTopics : [],
          nextUp: Array.isArray(payload.nextUp) ? payload.nextUp : [],
          source: payload.source === "database" ? "database" : "local",
          persisted: Boolean(payload.persisted),
        });
      })
      .catch(() => {
        if (!cancelled) {
          setRecommendations({
            daily: catalogProblems.slice(0, 3),
            weakTopics: [],
            nextUp: catalogProblems.slice(0, 5),
            source: "local",
            persisted: false,
          });
        }
      });
    return () => { cancelled = true; };
  }, [catalogProblems]);

  // ── Computed values ──
  const progressAnalytics = analytics ?? {
    totalProblems: catalogProblems.length,
    solvedProblems: solvedSlugs.length,
    attemptedProblems: attemptedSlugs.length,
    easySolved: catalogProblems.filter((p) => p.difficulty === "Easy" && solvedSlugs.includes(p.slug)).length,
    mediumSolved: catalogProblems.filter((p) => p.difficulty === "Medium" && solvedSlugs.includes(p.slug)).length,
    hardSolved: catalogProblems.filter((p) => p.difficulty === "Hard" && solvedSlugs.includes(p.slug)).length,
    recentSubmissions: [],
    topicStats: [],
    streakDays: 0,
    score: 0,
    rankLabel: "Beginner",
    source: "local" as const,
    persisted: false,
  };

  const practicePlan: RecommendationData = recommendations ?? {
    daily: catalogProblems.slice(0, 3),
    weakTopics: [],
    nextUp: catalogProblems.slice(0, 5),
    persisted: false,
  };

  const catalogTopicProgress = topicStats.map((topic) => ({
    topic: topic.label,
    solved: catalogProblems.filter((p) => solvedSlugs.includes(p.slug) && p.tags.includes(topic.label)).length,
    total: topic.count,
  }));

  const easyTotal = catalogProblems.filter((p) => p.difficulty === "Easy").length;
  const mediumTotal = catalogProblems.filter((p) => p.difficulty === "Medium").length;
  const hardTotal = catalogProblems.filter((p) => p.difficulty === "Hard").length;

  // ── Filter & Sort ──
  const filteredProblems = useMemo(() => {
    return catalogProblems
      .filter((problem) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !query ||
          problem.title.toLowerCase().includes(query) ||
          problem.slug.includes(query) ||
          problem.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          problem.companies?.some((c) => c.toLowerCase().includes(query));
        const matchesTopic = selectedTopic === "All" || problem.tags?.includes(selectedTopic);
        const matchesTrack = selectedTrack === "All Topics" || problem.track === selectedTrack;
        const matchesDifficulty = difficultyFilter === "All" || problem.difficulty === difficultyFilter;
        const isSolved = solvedSlugs.includes(problem.slug);
        const isAttempted = attemptedSlugs.includes(problem.slug);
        const matchesStatus =
          statusFilter === "All" ||
          (statusFilter === "Solved" && isSolved) ||
          (statusFilter === "Attempted" && isAttempted && !isSolved) ||
          (statusFilter === "Todo" && !isAttempted && !isSolved) ||
          (statusFilter === "Premium" && problem.premium);
        const matchesSidebar =
          activeSidebar === "Library" ||
          (activeSidebar === "Quest" && !problem.premium) ||
          (activeSidebar === "Explore" && problem.difficulty !== "Easy") ||
          (activeSidebar === "Study Plan" &&
            ["Array", "String", "Dynamic Programming"].some((tag) => problem.tags?.includes(tag))) ||
          (activeSidebar === "Favorite" && favoriteSlugs.includes(problem.slug));
        const matchesQuickTab =
          quickTab === "all" ||
          (quickTab === "favorites" && favoriteSlugs.includes(problem.slug));
        return matchesSearch && matchesTopic && matchesTrack && matchesDifficulty && matchesStatus && matchesSidebar && matchesQuickTab;
      })
      .sort((a, b) => {
        if (sortMode === "Acceptance") return Number.parseFloat(b.acceptance) - Number.parseFloat(a.acceptance);
        if (sortMode === "Difficulty") return difficultyRank[a.difficulty] - difficultyRank[b.difficulty];
        if (sortMode === "Frequency") return (b.frequency ?? 0) - (a.frequency ?? 0);
        return a.id - b.id;
      });
  }, [
    catalogProblems, searchQuery, selectedTopic, selectedTrack,
    difficultyFilter, statusFilter, activeSidebar, quickTab,
    sortMode, solvedSlugs, attemptedSlugs, favoriteSlugs,
  ]);

  // ── Handlers ──
  function toggleFavorite(slug: string) {
    const nextFavorite = !favoriteSlugs.includes(slug);
    setFavoriteSlugs((current) => {
      const next = nextFavorite ? [...new Set([...current, slug])] : current.filter((s) => s !== slug);
      window.localStorage.setItem("wohotech-favorite-problems", JSON.stringify(next));
      return next;
    });
    void fetch(`/api/problems/${slug}/favorite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorite: nextFavorite }),
    }).catch(() => {});
  }

  function handleRandomProblem() {
    const pool = filteredProblems.length ? filteredProblems : catalogProblems;
    const target = pool[Math.floor(Math.random() * pool.length)];
    if (target) window.location.href = `/problems/${target.slug}`;
  }

  const progressData: ProgressData = {
    totalProblems: progressAnalytics.totalProblems,
    solvedProblems: progressAnalytics.solvedProblems,
    attemptedProblems: progressAnalytics.attemptedProblems,
    easySolved: progressAnalytics.easySolved,
    mediumSolved: progressAnalytics.mediumSolved,
    hardSolved: progressAnalytics.hardSolved,
    streakDays: progressAnalytics.streakDays,
    score: progressAnalytics.score,
    rankLabel: progressAnalytics.rankLabel,
    persisted: progressAnalytics.persisted,
  };

  const dailyChallengeProblem = practicePlan.daily.length > 0 ? practicePlan.daily[0] : null;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <div className="grid h-full lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Sidebar */}
        <ProblemsSidebar
          activeSidebar={activeSidebar}
          setActiveSidebar={setActiveSidebar}
          selectedTopic={selectedTopic}
          setSelectedTopic={setSelectedTopic}
          selectedTrack={selectedTrack}
          setSelectedTrack={setSelectedTrack}
          difficultyFilter={difficultyFilter}
          setDifficultyFilter={setDifficultyFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          topicStats={topicStats}
          companyStats={companyStats}
          availableTracks={availableTracks}
          statusFilters={statusFilters}
          onCompanyClick={(company) => setSearchQuery(company)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content area */}
        <main className="overflow-y-auto">
          <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8">
            {/* Top row: Stats + Daily Challenge */}
            <section className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
              <ProgressStats
                data={progressData}
                easyTotal={easyTotal}
                mediumTotal={mediumTotal}
                hardTotal={hardTotal}
              />
              <DailyChallengeCard problem={dailyChallengeProblem} />
            </section>

            {/* Language cards */}
            <section className="mb-6 flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 xl:grid-cols-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {editorLanguageCards.map((language) => (
                <Link
                  key={language.label}
                  href={language.href}
                  className={`group relative min-h-[96px] w-[210px] shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${language.tone} p-4 text-white outline-none transition hover:-translate-y-0.5 hover:shadow-lg sm:w-auto`}
                >
                  <div className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-lg border border-white/20 bg-white/10 text-sm font-black backdrop-blur-sm">
                    {language.mark}
                  </div>
                  <div className="relative max-w-[180px] pr-10 sm:max-w-[200px]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/70">Learn</p>
                    <h2 className="mt-1 text-lg font-black leading-tight">{language.label}</h2>
                    <p className="mt-1.5 line-clamp-2 text-[11px] font-medium leading-4 text-white/80">
                      {language.description}
                    </p>
                  </div>
                </Link>
              ))}
            </section>

            {/* Toolbar */}
            <section className="mb-4">
              <ProblemsToolbar
                viewMode={viewMode}
                setViewMode={setViewMode}
                sortMode={sortMode}
                setSortMode={setSortMode}
                quickTab={quickTab}
                setQuickTab={setQuickTab}
                totalCount={catalogProblems.length}
                filteredCount={filteredProblems.length}
                solvedCount={solvedSlugs.length}
                onRandomProblem={handleRandomProblem}
                onToggleSidebar={() => setSidebarOpen(true)}
              />
            </section>

            {/* Active filter indicators */}
            {(selectedTopic !== "All" || selectedTrack !== "All Topics") && (
              <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
                {selectedTopic !== "All" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-500/10 px-3 py-1 text-xs font-bold text-pink-600">
                    {selectedTopic}
                    <button type="button" onClick={() => setSelectedTopic("All")} className="hover:text-pink-800">×</button>
                  </span>
                )}
                {selectedTrack !== "All Topics" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600">
                    {selectedTrack}
                    <button type="button" onClick={() => setSelectedTrack("All Topics")} className="hover:text-blue-800">×</button>
                  </span>
                )}
                <span className="text-xs text-[var(--muted)]">
                  {filteredProblems.length} problem{filteredProblems.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* Problems Table */}
            <section className="mb-8">
              <ProblemsTable
                problems={filteredProblems}
                solvedSlugs={solvedSlugs}
                attemptedSlugs={attemptedSlugs}
                favoriteSlugs={favoriteSlugs}
                onToggleFavorite={toggleFavorite}
                viewMode={viewMode}
              />
            </section>

            {/* Bottom row: Calendar + Recommendations */}
            <section className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-[320px_1fr]">
              <PracticeCalendar
                practiceDates={localPracticeDates}
                streakDays={progressAnalytics.streakDays}
              />
              <RecommendationsSection
                data={practicePlan}
                topicProgress={
                  progressAnalytics.topicStats.length
                    ? progressAnalytics.topicStats
                    : catalogTopicProgress
                }
                recentSubmissions={progressAnalytics.recentSubmissions}
                onTopicClick={(topic) => setSelectedTopic(topic)}
              />
            </section>

            {/* Data source indicator */}
            <p className="pb-4 text-center text-[11px] text-[var(--muted)]">
              {dataSource === "database" ? "📊 Database catalog" : "📁 Local fallback catalog"}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
