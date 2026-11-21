import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isIndexableProblem } from "@/lib/problems/seo";
import { ProblemPracticeWorkspace } from "./problem-practice-workspace";
import { ProblemComingSoon } from "./problem-coming-soon";
import { problemBank } from "@/lib/problems/bank";
import type { ProblemDefinition } from "@/lib/problems/bank";

export const dynamic = "force-dynamic";

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

// Sorted slugs for prev/next navigation
const sortedSlugs = problemBank
  .filter(p => p.judgeReady !== false)
  .sort((a, b) => a.id - b.id)
  .map(p => p.slug);

async function fetchProblem(slug: string): Promise<ProblemDefinition | null> {
  // Try backend first
  try {
    const res = await fetch(`${BACKEND_URL}/api/problems/${slug}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.problem) {
        const p = normalizeProblem(data.problem);
        return withNavigation(p, slug);
      }
    }
  } catch { /* fall through to bank */ }

  // Fallback to local bank
  const p = problemBank.find(p => p.slug === slug) ?? null;
  if (!p) return null;
  return withNavigation(p, slug);
}

function withNavigation(p: ProblemDefinition, slug: string): ProblemDefinition {
  const idx = sortedSlugs.indexOf(slug);
  return {
    ...p,
    prevSlug: idx > 0 ? sortedSlugs[idx - 1] : undefined,
    nextSlug: idx < sortedSlugs.length - 1 ? sortedSlugs[idx + 1] : undefined,
  };
}

function normalizeProblem(p: any): ProblemDefinition {
  const diffMap: Record<string, string> = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };
  const trackMap: Record<string, string> = { ALGORITHMS: "Algorithms", DATABASE: "Database", SHELL: "Shell", CONCURRENCY: "Concurrency" };

  const sampleCases = (p.testCases ?? [])
    .filter((tc: any) => tc.kind === "SAMPLE")
    .map((tc: any) => ({ input: tc.input, expected: tc.expected }));
  const hiddenCases = (p.testCases ?? [])
    .filter((tc: any) => tc.kind === "HIDDEN")
    .map((tc: any) => ({ input: tc.input, expected: tc.expected }));

  return {
    id: p.number ?? p.id,
    slug: p.slug,
    title: p.title,
    acceptance: typeof p.acceptance === "number" ? `${p.acceptance.toFixed(1)}%` : p.acceptance,
    difficulty: (diffMap[p.difficulty] ?? p.difficulty) as any,
    track: (trackMap[p.track] ?? p.track) as any,
    judgeReady: p.judgeReady !== false,
    tags: p.tags ?? [],
    companies: p.companies ?? [],
    frequency: p.frequency ?? 0,
    premium: p.premium ?? false,
    likes: p.likes ?? 0,
    dislikes: p.dislikes ?? 0,
    discussionCount: p.discussionCount ?? 0,
    description: p.description ?? "",
    constraints: p.constraints ?? [],
    hints: p.hints ?? [],
    examples: (p.examples ?? []).map((ex: any) => ({
      input: ex.input,
      output: ex.output,
      explanation: ex.explanation ?? undefined,
    })),
    sampleCases,
    hiddenCases,
    functionName: p.functionName ?? "solution",
    starterCode: typeof p.starterCode === "string" ? JSON.parse(p.starterCode) : (p.starterCode ?? {}),
    editorial: p.editorial ?? [],
    solutionApproaches: typeof p.solutionApproaches === "string"
      ? JSON.parse(p.solutionApproaches)
      : (p.solutionApproaches ?? []),
    solutions: typeof p.solutions === "string"
      ? JSON.parse(p.solutions)
      : (p.solutions ?? {}),
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const problem = await fetchProblem(slug);

  if (!problem) return { title: "Problem Not Found | WohoCode", robots: { index: false, follow: false } };

  return {
    title: `${problem.id}. ${problem.title} | WohoCode`,
    description: problem.description?.slice(0, 160),
    robots: isIndexableProblem(problem) ? { index: true, follow: true } : { index: false, follow: true },
  };
}

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const problem = await fetchProblem(slug);

  if (!problem) notFound();

  if (problem.judgeReady !== true) {
    return <ProblemComingSoon problem={problem} />;
  }

  return <ProblemPracticeWorkspace problem={problem} />;
}
