import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { problemBank } from "@/lib/problems/bank";
import { PROBLEM_CATALOG, type ProblemCatalogEntry } from "@/lib/problems/catalog";
import { mergeStructuredProblems } from "@/lib/problems/content-loader";
import { TOPICS, tagToSlug } from "@/lib/problems/topics";
import { prisma, withPrismaTimeout } from "@/lib/prisma";

// Merge bank problems with catalog-only entries for complete topic counts
const bankProblems = mergeStructuredProblems(problemBank);
const bankSlugs = new Set(bankProblems.map((p) => p.slug));
const catalogOnlyProblems = PROBLEM_CATALOG
  .filter((entry) => !bankSlugs.has(entry.slug))
  .map((entry) => ({
    ...entry,
    difficulty: entry.difficulty as "Easy" | "Medium" | "Hard",
    frequency: entry.frequency === "very-high" ? 95 : entry.frequency === "high" ? 75 : entry.frequency === "medium" ? 50 : 25,
    description: "",
    constraints: [] as string[],
    hints: [] as string[],
    examples: [] as Array<{ input: string; output: string; explanation: string | null }>,
    sampleCases: [] as Array<{ input: unknown[]; expected: unknown }>,
    hiddenCases: [] as Array<{ input: unknown[]; expected: unknown }>,
    functionName: "solution",
    starterCode: {} as Record<string, string>,
    judgeReady: false,
  }));
const allProblems = [...bankProblems, ...catalogOnlyProblems];

export async function GET() {
  // Build topic stats from problem bank
  const topicData = TOPICS.map((topic) => {
    const matchingProblems = allProblems.filter((p) =>
      p.tags.some((tag) => tagToSlug(tag) === topic.slug)
    );
    return {
      slug: topic.slug,
      name: topic.name,
      emoji: topic.emoji,
      color: topic.color,
      description: topic.description,
      total: matchingProblems.length,
      easy: matchingProblems.filter((p) => p.difficulty === "Easy").length,
      medium: matchingProblems.filter((p) => p.difficulty === "Medium").length,
      hard: matchingProblems.filter((p) => p.difficulty === "Hard").length,
    };
  }).filter((t) => t.total > 0);

  // Try to get user progress from DB
  let userProgress: Record<string, { solved: number; attempted: number }> = {};

  try {
    const session = await getServerSession(authOptions).catch(() => null);
    if (session?.user?.id) {
      const statuses = await withPrismaTimeout(
        prisma.userProblemStatus.findMany({
          where: { userId: session.user.id },
          include: { problem: { select: { tags: true } } },
        }),
        5000
      );

      // Aggregate by topic
      for (const status of statuses) {
        const tags = (status.problem as { tags: string[] }).tags ?? [];
        for (const tag of tags) {
          const slug = tagToSlug(tag);
          const topicExists = TOPICS.some((t) => t.slug === slug);
          if (!topicExists) continue;

          if (!userProgress[slug]) {
            userProgress[slug] = { solved: 0, attempted: 0 };
          }
          if (status.solved) {
            userProgress[slug].solved++;
          } else if (status.attempted) {
            userProgress[slug].attempted++;
          }
        }
      }
    }
  } catch {
    // If DB is unavailable, return empty progress (client will use localStorage)
  }

  return NextResponse.json({ topics: topicData, userProgress });
}
