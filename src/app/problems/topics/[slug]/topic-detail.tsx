"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Circle, Info, Minus, Shuffle } from "lucide-react";
import { problemBank, type ProblemDifficulty } from "@/lib/problems/bank";
import { PROBLEM_CATALOG } from "@/lib/problems/catalog";
import { getTopicBySlug, tagToSlug, type TopicMeta } from "@/lib/problems/topics";

// Merge bank + catalog for accurate total counts (same as topics-hub)
const allProblemsForTopicDetail = [
  ...problemBank,
  ...PROBLEM_CATALOG
    .filter((entry) => !problemBank.some((p) => p.slug === entry.slug))
    .map((entry) => ({
      id: entry.id,
      slug: entry.slug,
      title: entry.title,
      difficulty: entry.difficulty as ProblemDifficulty,
      track: entry.track,
      acceptance: entry.acceptance,
      tags: entry.tags,
      companies: entry.companies,
      frequency: 50,
      premium: entry.premium ?? false,
      judgeReady: false as const,
      description: "",
      constraints: [] as string[],
      hints: [] as string[],
      examples: [] as Array<{ input: string; output: string; explanation?: string }>,
      sampleCases: [] as Array<{ input: unknown[]; expected: unknown }>,
      hiddenCases: [] as Array<{ input: unknown[]; expected: unknown }>,
      functionName: "solution",
      starterCode: {} as Record<string, string>,
    })),
];

// ─── Types ──────────────────────────────────────────────────────────────────

type DifficultyTab = "All" | "Easy" | "Medium" | "Hard";

type ProblemRow = {
  id: number;
  slug: string;
  title: string;
  difficulty: ProblemDifficulty;
  acceptance: string;
  tags: string[];
  status: "solved" | "attempted" | "none";
};

// ─── Main Component ─────────────────────────────────────────────────────────

export function TopicDetail({ slug }: { slug: string }) {
  const [mounted, setMounted] = useState(false);
  const [solvedSlugs, setSolvedSlugs] = useState<string[]>([]);
  const [attemptedSlugs, setAttemptedSlugs] = useState<string[]>([]);
  const [difficultyTab, setDifficultyTab] = useState<DifficultyTab>("All");
  const [sortBy, setSortBy] = useState<"number" | "difficulty" | "acceptance">("difficulty");

  const topic = getTopicBySlug(slug);

  useEffect(() => {
    setMounted(true);
    const localSolved = JSON.parse(window.localStorage.getItem("wohotech-solved-problems") ?? "[]") as string[];
    const localAttempted = JSON.parse(window.localStorage.getItem("wohotech-attempted-problems") ?? "[]") as string[];
    setSolvedSlugs(localSolved);
    setAttemptedSlugs(localAttempted);
  }, []);

  // Get all problems for this topic
  const topicProblems: ProblemRow[] = useMemo(() => {
    if (!topic) return [];

    return allProblemsForTopicDetail
      .filter((p) => p.tags.some((tag) => tagToSlug(tag) === slug))
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        difficulty: p.difficulty,
        acceptance: p.acceptance,
        tags: p.tags,
        status: solvedSlugs.includes(p.slug)
          ? ("solved" as const)
          : attemptedSlugs.includes(p.slug)
            ? ("attempted" as const)
            : ("none" as const),
      }));
  }, [topic, slug, solvedSlugs, attemptedSlugs]);

  // Filter + sort
  const filteredProblems = useMemo(() => {
    let result = topicProblems;

    if (difficultyTab !== "All") {
      result = result.filter((p) => p.difficulty === difficultyTab);
    }

    const diffRank = { Easy: 1, Medium: 2, Hard: 3 };

    if (sortBy === "difficulty") {
      result.sort((a, b) => diffRank[a.difficulty] - diffRank[b.difficulty] || a.id - b.id);
    } else if (sortBy === "number") {
      result.sort((a, b) => a.id - b.id);
    } else if (sortBy === "acceptance") {
      result.sort((a, b) => parseFloat(b.acceptance) - parseFloat(a.acceptance));
    }

    return result;
  }, [topicProblems, difficultyTab, sortBy]);

  // Stats
  const totalCount = topicProblems.length;
  const solvedCount = topicProblems.filter((p) => p.status === "solved").length;
  const attemptedCount = topicProblems.filter((p) => p.status === "attempted").length;
  const easyCount = topicProblems.filter((p) => p.difficulty === "Easy").length;
  const mediumCount = topicProblems.filter((p) => p.difficulty === "Medium").length;
  const hardCount = topicProblems.filter((p) => p.difficulty === "Hard").length;
  const easySolved = topicProblems.filter((p) => p.difficulty === "Easy" && p.status === "solved").length;
  const mediumSolved = topicProblems.filter((p) => p.difficulty === "Medium" && p.status === "solved").length;
  const hardSolved = topicProblems.filter((p) => p.difficulty === "Hard" && p.status === "solved").length;

  // Practice Random
  function handlePracticeRandom() {
    const unsolved = topicProblems.filter((p) => p.status !== "solved");
    if (unsolved.length === 0) return;
    const random = unsolved[Math.floor(Math.random() * unsolved.length)];
    window.location.href = `/problems/${random.slug}`;
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-[var(--text-soft)]">Topic not found</p>
          <Link href="/problems/topics" className="text-blue-500 hover:underline mt-2 inline-block">
            Back to Topics
          </Link>
        </div>
      </div>
    );
  }

  if (!mounted) {
    return <TopicDetailSkeleton topic={topic} />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-12">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        <Link
          href="/problems/topics"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-soft)] hover:text-[var(--text)] transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          All Topics
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] flex items-center gap-3">
              <span className="text-3xl">{topic.emoji}</span>
              {topic.name}
            </h1>
            <p className="text-[var(--text-soft)] mt-1 max-w-lg">
              {topic.description}
            </p>
          </div>

          <button
            onClick={handlePracticeRandom}
            disabled={solvedCount === totalCount}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm whitespace-nowrap"
          >
            <Shuffle size={16} />
            Practice Random
          </button>
        </div>

        {/* Progress Section */}
        <div className="mt-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[var(--text)]">
              Progress: {solvedCount}/{totalCount} solved
            </span>
            <span className="text-xs text-[var(--muted)]">
              {attemptedCount} attempted
            </span>
          </div>
          <div className="h-2.5 bg-[var(--border)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${totalCount > 0 ? (solvedCount / totalCount) * 100 : 0}%`,
                backgroundColor: topic.color,
              }}
            />
          </div>

          {/* Difficulty breakdown */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <DifficultyPill label="Easy" solved={easySolved} total={easyCount} color="text-green-500" bg="bg-green-500/10" />
            <DifficultyPill label="Medium" solved={mediumSolved} total={mediumCount} color="text-amber-500" bg="bg-amber-500/10" />
            <DifficultyPill label="Hard" solved={hardSolved} total={hardCount} color="text-red-500" bg="bg-red-500/10" />
          </div>
        </div>

        {/* Study Tips */}
        <div className="mt-4 bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 flex items-start gap-2.5">
          <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-[var(--text-soft)] leading-relaxed">
            <span className="font-medium text-[var(--text)]">Study Tip:</span>{" "}
            {topic.description} Start with Easy problems to build intuition, then tackle Medium and Hard for depth.
          </p>
        </div>
      </div>

      {/* Difficulty Tabs + Sort */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-1">
            {(["All", "Easy", "Medium", "Hard"] as DifficultyTab[]).map((tab) => {
              const count = tab === "All" ? totalCount : topicProblems.filter((p) => p.difficulty === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setDifficultyTab(tab)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    difficultyTab === tab
                      ? "bg-[var(--bg)] text-[var(--text)] shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--text-soft)]"
                  }`}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-xs bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-[var(--text-soft)] outline-none"
          >
            <option value="difficulty">Sort: Difficulty</option>
            <option value="number">Sort: Problem #</option>
            <option value="acceptance">Sort: Acceptance</option>
          </select>
        </div>

        {/* Problems Table */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[40px_1fr_90px_80px] sm:grid-cols-[40px_40px_1fr_100px_90px] gap-2 px-4 py-2.5 border-b border-[var(--border)] text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
            <span>St.</span>
            <span className="hidden sm:block">#</span>
            <span>Title</span>
            <span>Difficulty</span>
            <span className="text-right">Accept.</span>
          </div>

          {/* Table Rows */}
          {filteredProblems.length === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--muted)]">
              No problems found for this filter.
            </div>
          ) : (
            filteredProblems.map((problem) => (
              <ProblemRow key={problem.slug} problem={problem} />
            ))
          )}
        </div>

        {/* Footer count */}
        <p className="text-xs text-[var(--muted)] mt-3 text-center">
          Showing {filteredProblems.length} of {totalCount} problems
        </p>
      </div>
    </div>
  );
}

// ─── Problem Row ────────────────────────────────────────────────────────────

function ProblemRow({ problem }: { problem: ProblemRow }) {
  const diffColor = {
    Easy: "text-green-500",
    Medium: "text-amber-500",
    Hard: "text-red-500",
  }[problem.difficulty];

  return (
    <Link href={`/problems/${problem.slug}`}>
      <div className="grid grid-cols-[40px_1fr_90px_80px] sm:grid-cols-[40px_40px_1fr_100px_90px] gap-2 px-4 py-3 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg)] transition-colors cursor-pointer items-center">
        {/* Status */}
        <span className="flex items-center justify-center">
          {problem.status === "solved" ? (
            <CheckCircle2 size={16} className="text-green-500" />
          ) : problem.status === "attempted" ? (
            <Circle size={16} className="text-amber-500" />
          ) : (
            <Minus size={16} className="text-[var(--muted)]" />
          )}
        </span>

        {/* Number */}
        <span className="hidden sm:block text-xs text-[var(--muted)]">
          {problem.id}
        </span>

        {/* Title */}
        <span className="text-sm text-[var(--text)] font-medium truncate">
          {problem.title}
        </span>

        {/* Difficulty */}
        <span className={`text-xs font-medium ${diffColor}`}>
          {problem.difficulty}
        </span>

        {/* Acceptance */}
        <span className="text-xs text-[var(--muted)] text-right">
          {problem.acceptance}
        </span>
      </div>
    </Link>
  );
}

// ─── Difficulty Pill ────────────────────────────────────────────────────────

function DifficultyPill({
  label,
  solved,
  total,
  color,
  bg,
}: {
  label: string;
  solved: number;
  total: number;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-lg px-3 py-2 text-center`}>
      <p className={`text-sm font-semibold ${color}`}>
        {solved}/{total}
      </p>
      <p className="text-xs text-[var(--muted)] mt-0.5">{label}</p>
    </div>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function TopicDetailSkeleton({ topic }: { topic: TopicMeta }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        <div className="h-5 w-28 bg-[var(--border)] rounded animate-pulse mb-4" />
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{topic.emoji}</span>
          <div className="h-8 w-48 bg-[var(--border)] rounded animate-pulse" />
        </div>
        <div className="h-4 w-80 bg-[var(--border)] rounded animate-pulse mt-2" />
        <div className="mt-5 h-28 bg-[var(--surface)] border border-[var(--border)] rounded-xl animate-pulse" />
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-4">
        <div className="h-10 bg-[var(--border)] rounded-lg animate-pulse mb-4" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 bg-[var(--surface)] border-b border-[var(--border)] animate-pulse" />
        ))}
      </div>
    </div>
  );
}
