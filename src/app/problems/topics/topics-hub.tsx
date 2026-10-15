"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import { problemBank } from "@/lib/problems/bank";
import { PROBLEM_CATALOG } from "@/lib/problems/catalog";
import { TOPICS, tagToSlug, type TopicMeta } from "@/lib/problems/topics";

// ─── Types ──────────────────────────────────────────────────────────────────

type TopicWithStats = TopicMeta & {
  total: number;
  easy: number;
  medium: number;
  hard: number;
  solved: number;
  attempted: number;
};

// Merge bank + catalog for accurate total counts
const allProblemsForTopics = [
  ...problemBank,
  ...PROBLEM_CATALOG
    .filter((entry) => !problemBank.some((p) => p.slug === entry.slug))
    .map((entry) => ({
      id: entry.id,
      slug: entry.slug,
      title: entry.title,
      difficulty: entry.difficulty as "Easy" | "Medium" | "Hard",
      track: entry.track,
      acceptance: entry.acceptance,
      tags: entry.tags,
      companies: entry.companies,
      frequency: 50,
      premium: entry.premium ?? false,
      judgeReady: false,
      description: "",
      constraints: [],
      hints: [],
      examples: [],
      sampleCases: [],
      hiddenCases: [],
      functionName: "solution",
      starterCode: {},
    })),
];

// ─── Main Component ─────────────────────────────────────────────────────────

export function TopicsHub() {
  const [mounted, setMounted] = useState(false);
  const [solvedSlugs, setSolvedSlugs] = useState<string[]>([]);
  const [attemptedSlugs, setAttemptedSlugs] = useState<string[]>([]);
  const [apiProgress, setApiProgress] = useState<Record<string, { solved: number; attempted: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const localSolved = JSON.parse(window.localStorage.getItem("wohotech-solved-problems") ?? "[]") as string[];
    const localAttempted = JSON.parse(window.localStorage.getItem("wohotech-attempted-problems") ?? "[]") as string[];
    setSolvedSlugs(localSolved);
    setAttemptedSlugs(localAttempted);

    fetch("/api/problems/topics")
      .then((res) => res.json())
      .then((data) => {
        if (data.userProgress) {
          setApiProgress(data.userProgress);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const topicsWithStats: TopicWithStats[] = useMemo(() => {
    return TOPICS.map((topic) => {
      const matching = allProblemsForTopics.filter((p) =>
        p.tags.some((tag) => tagToSlug(tag) === topic.slug)
      );
      const localSolved = matching.filter((p) => solvedSlugs.includes(p.slug)).length;
      const localAttempted = matching.filter((p) => attemptedSlugs.includes(p.slug) && !solvedSlugs.includes(p.slug)).length;
      const apiData = apiProgress[topic.slug];
      const solved = Math.max(localSolved, apiData?.solved ?? 0);
      const attempted = Math.max(localAttempted, apiData?.attempted ?? 0);

      return {
        ...topic,
        total: matching.length,
        easy: matching.filter((p) => p.difficulty === "Easy").length,
        medium: matching.filter((p) => p.difficulty === "Medium").length,
        hard: matching.filter((p) => p.difficulty === "Hard").length,
        solved,
        attempted,
      };
    }).filter((t) => t.total > 0);
  }, [solvedSlugs, attemptedSlugs, apiProgress]);

  const totalTopics = topicsWithStats.length;
  const coveredTopics = topicsWithStats.filter((t) => t.solved > 0).length;
  const totalSolved = topicsWithStats.reduce((sum, t) => sum + t.solved, 0);

  if (!mounted) {
    return <TopicsHubSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        <Link
          href="/problems"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Problems
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] flex items-center gap-2">
              <BookOpen size={28} className="text-blue-500" />
              Topics
            </h1>
            <p className="text-[var(--text-soft)] mt-1">
              Master each topic to ace your interviews
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--text-soft)]">
            <Sparkles size={16} className="text-amber-500" />
            <span>{totalSolved} problems solved across {coveredTopics} topics</span>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mt-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--text)]">
              Topic Coverage
            </span>
            <span className="text-sm text-[var(--text-soft)]">
              {coveredTopics}/{totalTopics} topics started
            </span>
          </div>
          <div className="h-2.5 bg-[var(--border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${totalTopics > 0 ? (coveredTopics / totalTopics) * 100 : 0}%` }}
            />
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" /> Easy
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Hard
            </span>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {topicsWithStats.map((topic) => (
            <TopicCard key={topic.slug} topic={topic} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Topic Card ─────────────────────────────────────────────────────────────

function TopicCard({ topic }: { topic: TopicWithStats }) {
  const progressPercent = topic.total > 0 ? (topic.solved / topic.total) * 100 : 0;

  return (
    <Link href={`/problems/topics/${topic.slug}`}>
      <div
        className="group relative bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden"
        style={{ borderLeftColor: topic.color, borderLeftWidth: "3px" }}
      >
        {/* Topic emoji + name */}
        <div className="flex items-start justify-between mb-3">
          <span className="text-2xl">{topic.emoji}</span>
          {topic.solved > 0 && topic.solved === topic.total && (
            <span className="text-xs bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded font-medium">
              Done
            </span>
          )}
        </div>

        <h3 className="font-semibold text-sm text-[var(--text)] group-hover:text-blue-500 transition-colors leading-tight">
          {topic.name}
        </h3>

        <p className="text-xs text-[var(--muted)] mt-1">
          {topic.total} problems
        </p>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-[var(--text-soft)]">
              {topic.solved}/{topic.total}
            </span>
            <span className="text-xs text-[var(--muted)]">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%`, backgroundColor: topic.color }}
            />
          </div>
        </div>

        {/* Difficulty dots */}
        <div className="flex items-center gap-3 mt-3 text-xs text-[var(--muted)]">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {topic.easy}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {topic.medium}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {topic.hard}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function TopicsHubSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--bg)] pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        <div className="h-5 w-32 bg-[var(--border)] rounded animate-pulse mb-4" />
        <div className="h-8 w-48 bg-[var(--border)] rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-[var(--border)] rounded animate-pulse mb-5" />
        <div className="h-20 bg-[var(--surface)] border border-[var(--border)] rounded-xl animate-pulse" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-40 bg-[var(--surface)] border border-[var(--border)] rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
