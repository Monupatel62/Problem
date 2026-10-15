import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { problemBank } from "@/lib/problems/bank";
import { PROBLEM_CATALOG } from "@/lib/problems/catalog";
import { mergeStructuredProblems } from "@/lib/problems/content-loader";
import { getTopicBySlug, tagToSlug } from "@/lib/problems/topics";
import { prisma, withPrismaTimeout } from "@/lib/prisma";

// Merge bank + catalog-only problems for complete topic listing
const bankProblems = mergeStructuredProblems(problemBank);
const bankSlugs = new Set(bankProblems.map((p) => p.slug));
const catalogOnlyProblems = PROBLEM_CATALOG
  .filter((entry) => !bankSlugs.has(entry.slug))
  .map((entry) => ({
    id: entry.id,
    slug: entry.slug,
    title: entry.title,
    difficulty: entry.difficulty as "Easy" | "Medium" | "Hard",
    acceptance: entry.acceptance,
    tags: entry.tags,
    companies: entry.companies ?? [],
    frequency: entry.frequency === "very-high" ? 95 : entry.frequency === "high" ? 75 : entry.frequency === "medium" ? 50 : 25,
    judgeReady: false,
    premium: false,
  }));
const allProblems = [...bankProblems, ...catalogOnlyProblems];

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params;
  const { slug } = params;
  const topic = getTopicBySlug(slug);

  if (!topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  // Get all problems for this topic
  const topicProblems = allProblems
    .filter((p) => p.tags.some((tag) => tagToSlug(tag) === slug))
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty,
      acceptance: p.acceptance,
      tags: p.tags,
      companies: p.companies ?? [],
      frequency: p.frequency ?? 0,
      premium: p.premium ?? false,
    }));

  // Try to get user statuses
  let userStatuses: Record<string, "solved" | "attempted"> = {};

  try {
    const session = await getServerSession(authOptions).catch(() => null);
    if (session?.user?.id) {
      const problemSlugs = topicProblems.map((p) => p.slug);

      const statuses = await withPrismaTimeout(
        prisma.userProblemStatus.findMany({
          where: {
            userId: session.user.id,
            problem: { slug: { in: problemSlugs } },
          },
          include: { problem: { select: { slug: true } } },
        }),
        5000
      );

      for (const status of statuses) {
        const pSlug = (status.problem as { slug: string }).slug;
        if (status.solved) {
          userStatuses[pSlug] = "solved";
        } else if (status.attempted) {
          userStatuses[pSlug] = "attempted";
        }
      }
    }
  } catch {
    // If DB unavailable, return empty statuses (client uses localStorage)
  }

  return NextResponse.json({
    topic: {
      slug: topic.slug,
      name: topic.name,
      emoji: topic.emoji,
      color: topic.color,
      description: topic.description,
    },
    problems: topicProblems,
    userStatuses,
  });
}
