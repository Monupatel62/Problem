"use client";

import { ChevronRight, Lightbulb, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { ProblemDefinition } from "@/lib/problems/bank";

function difficultyColor(difficulty: string) {
  if (difficulty === "Easy") return "text-emerald-600";
  if (difficulty === "Hard") return "text-red-600";
  return "text-amber-600";
}

export type RecommendationData = {
  daily: ProblemDefinition[];
  weakTopics: Array<{ topic: string; solved: number; total: number }>;
  nextUp: ProblemDefinition[];
  persisted: boolean;
};

export function RecommendationsSection({
  data,
  topicProgress,
  recentSubmissions,
  onTopicClick,
}: {
  data: RecommendationData;
  topicProgress: Array<{ topic: string; solved: number; total: number }>;
  recentSubmissions: Array<{
    id: string;
    slug: string;
    title: string;
    status: string;
    language: string;
    runtimeMs: number;
  }>;
  onTopicClick: (topic: string) => void;
}) {
  const weakTopics = data.weakTopics.length
    ? data.weakTopics
    : topicProgress.filter((t) => t.solved < t.total).slice(0, 5);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Daily Queue */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-blue-500/10">
              <Sparkles className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">Daily Queue</p>
              <p className="text-[11px] text-[var(--muted)]">
                {data.persisted ? "Personalized" : "Starter plan"}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-600">
            {data.daily.length}
          </span>
        </div>
        <div className="mt-4 space-y-2">
          {data.daily.map((problem) => (
            <Link
              key={problem.slug}
              href={`/problems/${problem.slug}`}
              className="group block rounded-lg bg-[var(--bg)] px-3 py-2.5 transition hover:bg-[var(--surface)] hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold text-[var(--text)] group-hover:text-pink-600 transition">
                  {problem.title}
                </span>
                <span className={`shrink-0 text-xs font-bold ${difficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
              </div>
              <p className="mt-1 truncate text-[11px] text-[var(--muted)]">
                {problem.tags.slice(0, 3).join(" · ")}
              </p>
            </Link>
          ))}
        </div>
        <Link
          href="/problems/study-plan"
          className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-[var(--text)] px-3 py-2 text-xs font-bold text-[var(--surface)] transition hover:opacity-90"
        >
          Open Study Plan
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Weak Topics & Topic Progress */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500/10">
            <Lightbulb className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-sm font-semibold text-[var(--text)]">Focus Areas</p>
        </div>

        {/* Weak topics chips */}
        {weakTopics.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Needs Practice
            </p>
            <div className="flex flex-wrap gap-1.5">
              {weakTopics.slice(0, 5).map((topic) => (
                <button
                  key={topic.topic}
                  type="button"
                  onClick={() => onTopicClick(topic.topic)}
                  className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-700 transition hover:bg-amber-500/20"
                >
                  {topic.topic} {topic.solved}/{topic.total}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Topic progress bars */}
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
          Topic Progress
        </p>
        <div className="space-y-3">
          {topicProgress.slice(0, 5).map((topic) => (
            <div key={topic.topic}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-[var(--text-soft)]">{topic.topic}</span>
                <span className="text-[var(--muted)]">{topic.solved}/{topic.total}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg)]">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.round((topic.solved / Math.max(1, topic.total)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-violet-500/10">
            <TrendingUp className="h-4 w-4 text-violet-500" />
          </div>
          <p className="text-sm font-semibold text-[var(--text)]">Recent Activity</p>
        </div>

        {recentSubmissions.length > 0 ? (
          <div className="space-y-2">
            {recentSubmissions.slice(0, 5).map((submission) => (
              <Link
                key={submission.id}
                href={`/problems/${submission.slug}`}
                className="group block rounded-lg bg-[var(--bg)] px-3 py-2.5 transition hover:bg-[var(--surface)] hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-semibold text-[var(--text)] group-hover:text-pink-600 transition">
                    {submission.title}
                  </span>
                  <span
                    className={`shrink-0 text-[11px] font-bold ${
                      submission.status === "Accepted" ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {submission.status === "Accepted" ? "✅" : "❌"}
                  </span>
                </div>
                <div className="mt-1 flex justify-between text-[11px] text-[var(--muted)]">
                  <span>{submission.language}</span>
                  <span>{submission.runtimeMs}ms</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg bg-[var(--bg)] py-8">
            <span className="text-2xl">📝</span>
            <p className="mt-2 text-xs font-semibold text-[var(--muted)]">
              Submit a solution to build history
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
