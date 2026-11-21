import { problemBank, type ProblemDefinition, type ProblemDifficulty } from "@/lib/problems/bank";
import { mergeStructuredProblems } from "@/lib/problems/content-loader";
import { PROBLEM_CATALOG, type ProblemCatalogEntry } from "@/lib/problems/catalog";
import { logPrismaFallback, prisma, prismaFallbackReason, withPrismaTimeout } from "@/lib/prisma";


const localProblemBank = mergeStructuredProblems(problemBank);
const localProblemBankWithCatalog = mergeCatalogProblems(localProblemBank, PROBLEM_CATALOG);

type DbProblemRecord = {
  number: number;
  slug: string;
  title: string;
  acceptance: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  track: "ALGORITHMS" | "DATABASE" | "SHELL" | "CONCURRENCY";
  tags: string[];
  companies: string[];
  frequency: number;
  premium: boolean;
  likes: number;
  dislikes: number;
  discussionCount: number;
  description: string;
  constraints: string[];
  hints: string[];
  functionName: string;
  starterCode: unknown;
  editorial: string[];
  solutionApproaches: unknown;
  examples: Array<{ input: string; output: string; explanation: string | null }>;
  testCases: Array<{ kind: "SAMPLE" | "HIDDEN"; input: unknown; expected: unknown }>;
};

export type ProblemListQuery = {
  q?: string;
  topic?: string;
  track?: string;
  difficulty?: string;
  status?: string;
  sort?: string;
};

export type SaveProblemSubmissionInput = {
  slug: string;
  userId?: string | null;
  language: string;
  code: string;
  status: "Accepted" | "Wrong Answer" | "Runtime Error" | "Compilation Error" | "Idle";
  passed: number;
  total: number;
  runtimeMs: number;
  memoryMb: number;
  message?: string;
  testResults?: ProblemSubmissionTestResult[];
};

export type ProblemSubmissionTestResult = {
  caseNumber: number;
  status: "Accepted" | "Wrong Answer" | "Runtime Error";
  input: unknown[];
  expected: unknown;
  actual?: unknown;
  runtimeMs: number;
  memoryMb: number;
  message?: string;
};

export type ProblemSubmissionSummary = {
  id: string;
  language: string;
  status: "Accepted" | "Wrong Answer" | "Runtime Error" | "Compilation Error" | "Time Limit Exceeded" | "Internal Error";
  passed: number;
  total: number;
  runtimeMs: number;
  memoryMb: number;
  message?: string;
  createdAt: string;
};

export type ProblemSubmissionDetail = ProblemSubmissionSummary & {
  code: string;
  testResults?: ProblemSubmissionTestResult[];
  problem: {
    slug: string;
    title: string;
    difficulty: ProblemDifficulty;
    tags: string[];
  };
};

export type ProblemSubmissionAnalytics = {
  totalSubmissions: number;
  acceptedSubmissions: number;
  failedSubmissions: number;
  acceptanceRate: number;
  bestRuntimeMs: number | null;
  bestMemoryMb: number | null;
  averageRuntimeMs: number | null;
  languages: Array<{
    language: string;
    count: number;
    accepted: number;
  }>;
  lastSubmittedAt?: string;
};

export type UserProblemStatusSummary = {
  slug: string;
  solved: boolean;
  attempted: boolean;
  favorite: boolean;
};

export type ProblemAnalyticsSummary = {
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
    status: ProblemSubmissionSummary["status"];
    language: string;
    runtimeMs: number;
    createdAt: string;
  }>;
  topicStats: Array<{
    topic: string;
    solved: number;
    total: number;
  }>;
  streakDays: number;
  score: number;
  rankLabel: string;
  source: "database" | "local";
  persisted: boolean;
  reason?: string;
};

export type ProblemRecommendationSummary = {
  daily: ProblemDefinition[];
  weakTopics: Array<{
    topic: string;
    solved: number;
    total: number;
  }>;
  nextUp: ProblemDefinition[];
  source: "database" | "local";
  persisted: boolean;
  reason?: string;
};

export type DailyProblemSummary = {
  date: string;
  problem: ProblemDefinition;
  status: {
    attempted: boolean;
    solved: boolean;
    attemptedToday: boolean;
    solvedToday: boolean;
    lastSubmissionAt?: string;
  };
  source: "database" | "local";
  persisted: boolean;
};

const trackFromDb = {
  ALGORITHMS: "Algorithms",
  DATABASE: "Database",
  SHELL: "Shell",
  CONCURRENCY: "Concurrency",
} as const;

function difficultyFromDb(value: DbProblemRecord["difficulty"]): ProblemDifficulty {
  if (value === "EASY") return "Easy";
  if (value === "HARD") return "Hard";
  return "Medium";
}

function normalizeDbProblem(problem: DbProblemRecord): ProblemDefinition {
  const sampleCases = problem.testCases
    .filter((testCase) => testCase.kind === "SAMPLE")
    .map((testCase) => ({ input: Array.isArray(testCase.input) ? testCase.input : [], expected: testCase.expected }));
  const hiddenCases = problem.testCases
    .filter((testCase) => testCase.kind === "HIDDEN")
    .map((testCase) => ({ input: Array.isArray(testCase.input) ? testCase.input : [], expected: testCase.expected }));

  return {
    id: problem.number,
    slug: problem.slug,
    title: problem.title,
    acceptance: `${problem.acceptance.toFixed(1)}%`,
    difficulty: difficultyFromDb(problem.difficulty),
    track: trackFromDb[problem.track],
    tags: problem.tags,
    companies: problem.companies,
    frequency: problem.frequency,
    premium: problem.premium,
    likes: problem.likes,
    dislikes: problem.dislikes,
    discussionCount: problem.discussionCount,
    description: problem.description,
    constraints: problem.constraints,
    hints: problem.hints,
    examples: problem.examples.map((example) => ({
      input: example.input,
      output: example.output,
      explanation: example.explanation ?? undefined,
    })),
    sampleCases,
    hiddenCases,
    functionName: problem.functionName,
    starterCode: problem.starterCode as Record<string, string>,
    editorial: problem.editorial,
    solutionApproaches: Array.isArray(problem.solutionApproaches) ? problem.solutionApproaches as ProblemDefinition["solutionApproaches"] : [],
  };
}

// ─── Catalog Merge ──────────────────────────────────────────────────────────
// Merges catalog entries (lightweight metadata) into the full problem bank.
// Problems already in the bank get their companies/tags enriched from the catalog.
// Problems only in the catalog get a placeholder ProblemDefinition (no test cases).

function mergeCatalogProblems(
  bank: ProblemDefinition[],
  catalog: ProblemCatalogEntry[]
): ProblemDefinition[] {
  const FREQUENCY_MAP: Record<string, number> = {
    "very-high": 95,
    "high": 75,
    "medium": 50,
    "low": 25,
  };

  const bankBySlug = new Map(bank.map((p) => [p.slug, p]));
  const merged: ProblemDefinition[] = [...bank];

  // Enrich existing bank problems with catalog data (companies, tags)
  for (const entry of catalog) {
    const existing = bankBySlug.get(entry.slug);
    if (existing) {
      // Merge companies from catalog into existing problem
      const allCompanies = new Set([...(existing.companies ?? []), ...entry.companies]);
      existing.companies = [...allCompanies].sort();
      continue;
    }

    // Create a placeholder ProblemDefinition for catalog-only entries
    merged.push({
      id: entry.id,
      slug: entry.slug,
      title: entry.title,
      difficulty: entry.difficulty as ProblemDifficulty,
      track: entry.track,
      acceptance: entry.acceptance,
      tags: entry.tags,
      companies: entry.companies,
      frequency: FREQUENCY_MAP[entry.frequency] ?? 50,
      premium: entry.premium ?? false,
      description: `Practice this popular interview problem asked at ${entry.companies.join(", ")}.`,
      constraints: [],
      hints: [],
      examples: [],
      sampleCases: [],
      hiddenCases: [],
      functionName: "solution",
      starterCode: {},
      judgeReady: false,
    });
  }

  return merged.sort((a, b) => a.id - b.id);
}

function filterProblems(problems: ProblemDefinition[], query: ProblemListQuery) {
  const q = query.q?.trim().toLowerCase() ?? "";
  const topic = query.topic && query.topic !== "All" ? query.topic : "";
  const track = query.track && query.track !== "All Topics" ? query.track : "";
  const difficulty = query.difficulty && query.difficulty !== "All" ? query.difficulty : "";
  const sort = query.sort ?? "Default";

  return problems
    .filter((problem) => {
      const matchesSearch =
        !q ||
        problem.title.toLowerCase().includes(q) ||
        problem.slug.includes(q) ||
        problem.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        problem.companies?.some((company) => company.toLowerCase().includes(q));
      const matchesTopic = !topic || problem.tags.includes(topic);
      const matchesTrack = !track || problem.track === track;
      const matchesDifficulty = !difficulty || problem.difficulty === difficulty;
      const matchesStatus = query.status !== "Premium" || problem.premium;
      return matchesSearch && matchesTopic && matchesTrack && matchesDifficulty && matchesStatus;
    })
    .sort((first, second) => {
      if (sort === "Acceptance") return Number.parseFloat(second.acceptance) - Number.parseFloat(first.acceptance);
      if (sort === "Frequency") return (second.frequency ?? 0) - (first.frequency ?? 0);
      if (sort === "Difficulty") {
        const rank = { Easy: 1, Medium: 2, Hard: 3 };
        return rank[first.difficulty] - rank[second.difficulty];
      }
      return first.id - second.id;
    });
}

export async function getProblems(query: ProblemListQuery = {}) {
  try {
    const records = await withPrismaTimeout((prisma as any).problem.findMany({
      where: { isPublished: true },
      orderBy: { number: "asc" },
      include: {
        examples: { orderBy: { sortOrder: "asc" } },
        testCases: { orderBy: { sortOrder: "asc" } },
      },
    }));
    const dbProblems = (records as DbProblemRecord[]).map(normalizeDbProblem);
    if (dbProblems.length > 0) {
      return { problems: filterProblems(dbProblems, query), source: "database" as const };
    }
  } catch (error) {
    logPrismaFallback("[problems]", error);
  }

  return { problems: filterProblems(localProblemBankWithCatalog, query), source: "fallback" as const };
}

export async function getProblem(slug: string, options: { includeHiddenCases?: boolean } = {}) {
  try {
    const record = await withPrismaTimeout((prisma as any).problem.findUnique({
      where: { slug },
      include: {
        examples: { orderBy: { sortOrder: "asc" } },
        testCases: { orderBy: { sortOrder: "asc" } },
      },
    }));
    if (record) {
      const problem = normalizeDbProblem(record as DbProblemRecord);
      return {
        problem: options.includeHiddenCases ? problem : { ...problem, hiddenCases: [] },
        source: "database" as const,
      };
    }
  } catch (error) {
    logPrismaFallback("[problems]", error);
  }

  const problem = localProblemBankWithCatalog.find((item) => item.slug === slug) ?? null;
  return {
    problem: problem && !options.includeHiddenCases ? { ...problem, hiddenCases: [] } : problem,
    source: "fallback" as const,
  };
}

function submissionStatusToDb(status: SaveProblemSubmissionInput["status"]) {
  if (status === "Accepted") return "ACCEPTED";
  if (status === "Wrong Answer") return "WRONG_ANSWER";
  if (status === "Runtime Error") return "RUNTIME_ERROR";
  if (status === "Compilation Error") return "COMPILATION_ERROR";
  return "INTERNAL_ERROR";
}

function submissionStatusFromDb(status: string): ProblemSubmissionSummary["status"] {
  if (status === "ACCEPTED") return "Accepted";
  if (status === "WRONG_ANSWER") return "Wrong Answer";
  if (status === "RUNTIME_ERROR") return "Runtime Error";
  if (status === "COMPILATION_ERROR") return "Compilation Error";
  if (status === "TIME_LIMIT_EXCEEDED") return "Time Limit Exceeded";
  return "Internal Error";
}

function emptySubmissionAnalytics(): ProblemSubmissionAnalytics {
  return {
    totalSubmissions: 0,
    acceptedSubmissions: 0,
    failedSubmissions: 0,
    acceptanceRate: 0,
    bestRuntimeMs: null,
    bestMemoryMb: null,
    averageRuntimeMs: null,
    languages: [],
  };
}

function buildSubmissionAnalytics(
  records: Array<{ language: string; status: string; runtimeMs: number; memoryMb: number; createdAt: Date }>,
): ProblemSubmissionAnalytics {
  if (!records.length) return emptySubmissionAnalytics();

  const accepted = records.filter((record) => record.status === "ACCEPTED");
  const languageMap = new Map<string, { language: string; count: number; accepted: number }>();

  for (const record of records) {
    const current = languageMap.get(record.language) ?? { language: record.language, count: 0, accepted: 0 };
    current.count += 1;
    if (record.status === "ACCEPTED") current.accepted += 1;
    languageMap.set(record.language, current);
  }

  return {
    totalSubmissions: records.length,
    acceptedSubmissions: accepted.length,
    failedSubmissions: records.length - accepted.length,
    acceptanceRate: Math.round((accepted.length / records.length) * 100),
    bestRuntimeMs: accepted.length ? Math.min(...accepted.map((record) => record.runtimeMs)) : null,
    bestMemoryMb: accepted.length ? Math.min(...accepted.map((record) => record.memoryMb)) : null,
    averageRuntimeMs: accepted.length
      ? Math.round(accepted.reduce((total, record) => total + record.runtimeMs, 0) / accepted.length)
      : null,
    languages: Array.from(languageMap.values()).sort((first, second) => second.count - first.count),
    lastSubmittedAt: records[0]?.createdAt.toISOString(),
  };
}

function normalizeTestResults(value: unknown): ProblemSubmissionTestResult[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const results: ProblemSubmissionTestResult[] = [];
  for (const [index, item] of value.entries()) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const status =
      record.status === "Accepted" || record.status === "Wrong Answer" || record.status === "Runtime Error"
        ? record.status
        : "Runtime Error";
    results.push({
      caseNumber: Number(record.caseNumber ?? index + 1),
      status,
      input: Array.isArray(record.input) ? record.input : [],
      expected: record.expected,
      actual: record.actual,
      runtimeMs: Number(record.runtimeMs ?? 0),
      memoryMb: Number(record.memoryMb ?? 0),
      message: typeof record.message === "string" ? record.message : undefined,
    });
  }

  return results;
}

export async function getProblemSubmissions(slug: string, userId?: string | null) {
  if (!userId) {
    return {
      submissions: [] as ProblemSubmissionSummary[],
      analytics: emptySubmissionAnalytics(),
      source: "local" as const,
      persisted: false,
      reason: "Sign in to sync submission history.",
    };
  }

  try {
    const problem = await withPrismaTimeout((prisma as any).problem.findUnique({
      where: { slug },
      select: { id: true },
    })) as { id: string } | null;

    if (!problem?.id) {
      return {
        submissions: [] as ProblemSubmissionSummary[],
        analytics: emptySubmissionAnalytics(),
        source: "local" as const,
        persisted: false,
        reason: "Problem is not in the database yet.",
      };
    }

    const [records, analyticsRecords] = await Promise.all([
      withPrismaTimeout((prisma as any).problemSubmission.findMany({
      where: {
        problemId: problem.id,
        userId,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        language: true,
        status: true,
        passed: true,
        total: true,
        runtimeMs: true,
        memoryMb: true,
        message: true,
        createdAt: true,
      },
    })) as Promise<Array<{
      id: string;
      language: string;
      status: string;
      passed: number;
      total: number;
      runtimeMs: number;
      memoryMb: number;
      message: string | null;
      createdAt: Date;
    }>>,
      withPrismaTimeout((prisma as any).problemSubmission.findMany({
        where: { problemId: problem.id, userId },
        orderBy: { createdAt: "desc" },
        take: 200,
        select: {
          language: true,
          status: true,
          runtimeMs: true,
          memoryMb: true,
          createdAt: true,
        },
      })) as Promise<Array<{
        language: string;
        status: string;
        runtimeMs: number;
        memoryMb: number;
        createdAt: Date;
      }>>,
    ]);

    return {
      submissions: records.map((record) => ({
        id: record.id,
        language: record.language,
        status: submissionStatusFromDb(record.status),
        passed: record.passed,
        total: record.total,
        runtimeMs: record.runtimeMs,
        memoryMb: record.memoryMb,
        message: record.message ?? undefined,
        createdAt: record.createdAt.toISOString(),
      })),
      analytics: buildSubmissionAnalytics(analyticsRecords),
      source: "database" as const,
      persisted: true,
    };
  } catch (error) {
    logPrismaFallback("[problems] submission history", error);
    return {
      submissions: [] as ProblemSubmissionSummary[],
      analytics: emptySubmissionAnalytics(),
      source: "local" as const,
      persisted: false,
      reason: prismaFallbackReason(error),
    };
  }
}

export async function getProblemSubmissionDetail(slug: string, submissionId: string, userId?: string | null) {
  if (!userId) {
    return {
      submission: null as ProblemSubmissionDetail | null,
      source: "local" as const,
      persisted: false,
      reason: "Sign in to view synced submission details.",
    };
  }

  try {
    const record = await withPrismaTimeout((prisma as any).problemSubmission.findFirst({
      where: {
        id: submissionId,
        userId,
        problem: { slug },
      },
      select: {
        id: true,
        language: true,
        code: true,
        status: true,
        passed: true,
        total: true,
        runtimeMs: true,
        memoryMb: true,
        message: true,
        testResults: true,
        createdAt: true,
        problem: {
          select: {
            slug: true,
            title: true,
            difficulty: true,
            tags: true,
          },
        },
      },
    })) as {
      id: string;
      language: string;
      code: string;
      status: string;
      passed: number;
      total: number;
      runtimeMs: number;
      memoryMb: number;
      message: string | null;
      testResults: unknown;
      createdAt: Date;
      problem: { slug: string; title: string; difficulty: "EASY" | "MEDIUM" | "HARD"; tags: string[] };
    } | null;

    if (!record) {
      return {
        submission: null as ProblemSubmissionDetail | null,
        source: "database" as const,
        persisted: true,
        reason: "Submission not found.",
      };
    }

    return {
      submission: {
        id: record.id,
        language: record.language,
        code: record.code,
        status: submissionStatusFromDb(record.status),
        passed: record.passed,
        total: record.total,
        runtimeMs: record.runtimeMs,
        memoryMb: record.memoryMb,
        message: record.message ?? undefined,
        testResults: normalizeTestResults(record.testResults),
        createdAt: record.createdAt.toISOString(),
        problem: {
          slug: record.problem.slug,
          title: record.problem.title,
          difficulty: difficultyFromDb(record.problem.difficulty),
          tags: record.problem.tags,
        },
      },
      source: "database" as const,
      persisted: true,
    };
  } catch (error) {
    logPrismaFallback("[problems] submission detail", error);
    return {
      submission: null as ProblemSubmissionDetail | null,
      source: "local" as const,
      persisted: false,
      reason: prismaFallbackReason(error),
    };
  }
}

export async function getUserProblemStatuses(userId?: string | null) {
  if (!userId) {
    return {
      statuses: [] as UserProblemStatusSummary[],
      source: "local" as const,
      persisted: false,
      reason: "Sign in to sync progress.",
    };
  }

  try {
    const records = await withPrismaTimeout((prisma as any).userProblemStatus.findMany({
      where: { userId },
      select: {
        solved: true,
        attempted: true,
        favorite: true,
        problem: {
          select: { slug: true },
        },
      },
    })) as Array<{
      solved: boolean;
      attempted: boolean;
      favorite: boolean;
      problem: { slug: string };
    }>;

    return {
      statuses: records.map((record) => ({
        slug: record.problem.slug,
        solved: record.solved,
        attempted: record.attempted,
        favorite: record.favorite,
      })),
      source: "database" as const,
      persisted: true,
    };
  } catch (error) {
    logPrismaFallback("[problems] user progress", error);
    return {
      statuses: [] as UserProblemStatusSummary[],
      source: "local" as const,
      persisted: false,
      reason: prismaFallbackReason(error),
    };
  }
}

export async function setProblemFavorite(slug: string, userId: string | null | undefined, favorite: boolean) {
  if (!userId) {
    return {
      persisted: false,
      favorite,
      source: "local" as const,
      reason: "Sign in to sync favorites.",
    };
  }

  try {
    const problem = await withPrismaTimeout((prisma as any).problem.findUnique({
      where: { slug },
      select: { id: true },
    })) as { id: string } | null;

    if (!problem?.id) {
      return {
        persisted: false,
        favorite,
        source: "local" as const,
        reason: "Problem is not in the database yet.",
      };
    }

    await withPrismaTimeout((prisma as any).userProblemStatus.upsert({
      where: {
        userId_problemId: {
          userId,
          problemId: problem.id,
        },
      },
      update: { favorite },
      create: {
        userId,
        problemId: problem.id,
        favorite,
        attempted: false,
        solved: false,
      },
    }));

    return {
      persisted: true,
      favorite,
      source: "database" as const,
    };
  } catch (error) {
    console.warn("[problems] favorite saved locally only:", error instanceof Error ? error.message : error);
    return {
      persisted: false,
      favorite,
      source: "local" as const,
      reason: prismaFallbackReason(error),
    };
  }
}

export async function getProblemAnalytics(userId?: string | null): Promise<ProblemAnalyticsSummary> {
  const fallback = (reason?: string): ProblemAnalyticsSummary => ({
    totalProblems: localProblemBankWithCatalog.length,
    solvedProblems: 0,
    attemptedProblems: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    recentSubmissions: [],
    topicStats: getFallbackTopicStats([]),
    streakDays: 0,
    score: 0,
    rankLabel: "Beginner",
    source: "local",
    persisted: false,
    reason,
  });

  if (!userId) {
    return fallback("Sign in to sync analytics.");
  }

  try {
    const [problems, totalProblems, statuses, submissions] = await Promise.all([
      withPrismaTimeout((prisma as any).problem.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          tags: true,
        },
      })) as Promise<Array<{ id: string; tags: string[] }>>,
      withPrismaTimeout((prisma as any).problem.count({ where: { isPublished: true } })) as Promise<number>,
      withPrismaTimeout((prisma as any).userProblemStatus.findMany({
        where: { userId },
        select: {
          solved: true,
          attempted: true,
          problem: {
            select: {
              id: true,
              difficulty: true,
            },
          },
        },
      })) as Promise<Array<{ solved: boolean; attempted: boolean; problem: { id: string; difficulty: string } }>>,
      withPrismaTimeout((prisma as any).problemSubmission.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          status: true,
          language: true,
          runtimeMs: true,
          createdAt: true,
          problem: {
            select: {
              slug: true,
              title: true,
            },
          },
        },
      })) as Promise<
        Array<{
          id: string;
          status: string;
          language: string;
          runtimeMs: number;
          createdAt: Date;
          problem: { slug: string; title: string };
        }>
      >,
    ]);

    const solvedStatuses = statuses.filter((status) => status.solved);
    const solvedProblemIds = new Set(solvedStatuses.map((status) => status.problem.id));
    const topicStats = getDbTopicStats(problems, solvedProblemIds);
    const streakDays = getStreakDays(submissions.map((submission) => submission.createdAt));
    const score = solvedStatuses.length * 10 + statuses.filter((status) => status.attempted).length * 2 + streakDays * 5;

    return {
      totalProblems,
      solvedProblems: solvedStatuses.length,
      attemptedProblems: statuses.filter((status) => status.attempted).length,
      easySolved: solvedStatuses.filter((status) => status.problem.difficulty === "EASY").length,
      mediumSolved: solvedStatuses.filter((status) => status.problem.difficulty === "MEDIUM").length,
      hardSolved: solvedStatuses.filter((status) => status.problem.difficulty === "HARD").length,
      recentSubmissions: submissions.map((submission) => ({
        id: submission.id,
        slug: submission.problem.slug,
        title: submission.problem.title,
        status: submissionStatusFromDb(submission.status),
        language: submission.language,
        runtimeMs: submission.runtimeMs,
        createdAt: submission.createdAt.toISOString(),
      })),
      topicStats,
      streakDays,
      score,
      rankLabel: getRankLabel(score),
      source: "database",
      persisted: true,
    };
  } catch (error) {
    logPrismaFallback("[problems] analytics", error);
    return fallback(prismaFallbackReason(error));
  }
}

export async function getProblemRecommendations(userId?: string | null): Promise<ProblemRecommendationSummary> {
  const fallback = (reason?: string): ProblemRecommendationSummary => {
    const weakTopics = getFallbackTopicStats([]);
    return {
      daily: localProblemBankWithCatalog.filter((problem) => problem.track === "Algorithms" && problem.judgeReady !== false).slice(0, 3),
      weakTopics,
      nextUp: localProblemBankWithCatalog
        .filter((problem) => ["Easy", "Medium"].includes(problem.difficulty) && problem.judgeReady !== false)
        .sort((first, second) => (second.frequency ?? 0) - (first.frequency ?? 0))
        .slice(0, 5),
      source: "local",
      persisted: false,
      reason,
    };
  };

  if (!userId) {
    return fallback("Sign in to personalize recommendations.");
  }

  try {
    const [records, statuses] = await Promise.all([
      withPrismaTimeout((prisma as any).problem.findMany({
        where: { isPublished: true },
        orderBy: [{ premium: "asc" }, { frequency: "desc" }, { number: "asc" }],
        include: {
          examples: { orderBy: { sortOrder: "asc" } },
          testCases: { orderBy: { sortOrder: "asc" } },
        },
      })) as Promise<DbProblemRecord[]>,
      withPrismaTimeout((prisma as any).userProblemStatus.findMany({
        where: { userId },
        select: {
          solved: true,
          attempted: true,
          problem: {
            select: {
              id: true,
              slug: true,
              tags: true,
            },
          },
        },
      })) as Promise<Array<{ solved: boolean; attempted: boolean; problem: { id: string; slug: string; tags: string[] } }>>,
    ]);

    const problems = records.map(normalizeDbProblem);
    const solvedSlugs = new Set(statuses.filter((status) => status.solved).map((status) => status.problem.slug));
    const attemptedSlugs = new Set(statuses.filter((status) => status.attempted).map((status) => status.problem.slug));
    const solvedIds = new Set(statuses.filter((status) => status.solved).map((status) => status.problem.id));
    const weakTopics = getDbTopicStats(
      statuses.map((status) => ({ id: status.problem.id, tags: status.problem.tags })),
      solvedIds,
    )
      .filter((topic) => topic.solved < topic.total)
      .slice(0, 4);

    const recommendedPool = problems.filter((problem) => !solvedSlugs.has(problem.slug));
    const weakTopicNames = new Set(weakTopics.map((topic) => topic.topic));
    const weakTopicProblems = recommendedPool.filter((problem) => problem.tags.some((tag) => weakTopicNames.has(tag)));
    const attemptedButUnsolved = recommendedPool.filter((problem) => attemptedSlugs.has(problem.slug));
    const highFrequency = recommendedPool.filter((problem) => !attemptedSlugs.has(problem.slug));

    return {
      daily: [...attemptedButUnsolved, ...weakTopicProblems, ...highFrequency].slice(0, 3),
      weakTopics,
      nextUp: [...weakTopicProblems, ...highFrequency].slice(0, 5),
      source: "database",
      persisted: true,
    };
  } catch (error) {
    logPrismaFallback("[problems] recommendations", error);
    return fallback(prismaFallbackReason(error));
  }
}

function getDailyIndex(total: number, date = new Date()) {
  const dateKey = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.abs(Math.floor(dateKey / 86_400_000)) % Math.max(1, total);
}

async function getDailyProblemStatus(userId: string | null | undefined, slug: string, date: Date) {
  const fallback = {
    attempted: false,
    solved: false,
    attemptedToday: false,
    solvedToday: false,
  };

  if (!userId) return fallback;

  const dayStart = new Date(date);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  try {
    const [status, todaySubmissions, lastSubmission] = await Promise.all([
      withPrismaTimeout((prisma as any).userProblemStatus.findFirst({
        where: {
          userId,
          problem: { slug },
        },
        select: {
          attempted: true,
          solved: true,
        },
      })) as Promise<{ attempted: boolean; solved: boolean } | null>,
      withPrismaTimeout((prisma as any).problemSubmission.findMany({
        where: {
          userId,
          createdAt: { gte: dayStart, lt: dayEnd },
          problem: { slug },
        },
        select: { status: true },
      })) as Promise<Array<{ status: string }>>,
      withPrismaTimeout((prisma as any).problemSubmission.findFirst({
        where: {
          userId,
          problem: { slug },
        },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      })) as Promise<{ createdAt: Date } | null>,
    ]);

    return {
      attempted: Boolean(status?.attempted),
      solved: Boolean(status?.solved),
      attemptedToday: todaySubmissions.length > 0,
      solvedToday: todaySubmissions.some((submission) => submission.status === "ACCEPTED"),
      lastSubmissionAt: lastSubmission?.createdAt.toISOString(),
    };
  } catch (error) {
    if (process.env.SUPPRESS_PRISMA_BUILD_FALLBACK_LOGS !== "true") {
      console.warn("[problems] daily status fallback:", error instanceof Error ? error.message : error);
    }
    return fallback;
  }
}

export async function getDailyProblem(userId?: string | null): Promise<DailyProblemSummary> {
  const date = new Date();
  const dateString = date.toISOString().slice(0, 10);

  try {
    const records = await withPrismaTimeout((prisma as any).problem.findMany({
      where: { isPublished: true },
      orderBy: { number: "asc" },
      include: {
        examples: { orderBy: { sortOrder: "asc" } },
        testCases: { orderBy: { sortOrder: "asc" } },
      },
    })) as DbProblemRecord[];

    if (records.length > 0) {
      const problem = normalizeDbProblem(records[getDailyIndex(records.length, date)]);
      return {
        date: dateString,
        problem: { ...problem, hiddenCases: [] },
        status: await getDailyProblemStatus(userId, problem.slug, date),
        source: "database",
        persisted: true,
      };
    }
  } catch (error) {
    if (process.env.SUPPRESS_PRISMA_BUILD_FALLBACK_LOGS !== "true") {
      console.warn("[problems] daily problem fallback:", error instanceof Error ? error.message : error);
    }
  }

  const problem = localProblemBank[getDailyIndex(localProblemBank.length, date)];
  return {
    date: dateString,
    problem: { ...problem, hiddenCases: [] },
    status: await getDailyProblemStatus(userId, problem.slug, date),
    source: "local",
    persisted: false,
  };
}

function getFallbackTopicStats(solvedSlugs: string[]) {
  const solvedSet = new Set(solvedSlugs);
  const topicMap = new Map<string, { topic: string; solved: number; total: number }>();

  for (const problem of localProblemBank) {
    for (const tag of problem.tags) {
      const current = topicMap.get(tag) ?? { topic: tag, solved: 0, total: 0 };
      current.total += 1;
      if (solvedSet.has(problem.slug)) current.solved += 1;
      topicMap.set(tag, current);
    }
  }

  return [...topicMap.values()].sort((first, second) => second.total - first.total).slice(0, 6);
}

function getDbTopicStats(problems: Array<{ id: string; tags: string[] }>, solvedProblemIds: Set<string>) {
  const topicMap = new Map<string, { topic: string; solved: number; total: number }>();

  for (const problem of problems) {
    for (const tag of problem.tags) {
      const current = topicMap.get(tag) ?? { topic: tag, solved: 0, total: 0 };
      current.total += 1;
      if (solvedProblemIds.has(problem.id)) current.solved += 1;
      topicMap.set(tag, current);
    }
  }

  return [...topicMap.values()].sort((first, second) => second.total - first.total).slice(0, 6);
}

function getStreakDays(dates: Date[]) {
  const days = new Set(dates.map((date) => date.toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();

  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getRankLabel(score: number) {
  if (score >= 500) return "Interview Ready";
  if (score >= 250) return "Advanced";
  if (score >= 100) return "Builder";
  if (score >= 30) return "Practicing";
  return "Beginner";
}

export async function saveProblemSubmission(input: SaveProblemSubmissionInput) {
  try {
    const problem = await withPrismaTimeout((prisma as any).problem.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    })) as { id: string } | null;

    if (!problem?.id) {
      return {
        persisted: false,
        mode: "local" as const,
        reason: "Problem is not in the database yet.",
      };
    }

    const submission = await withPrismaTimeout((prisma as any).problemSubmission.create({
      data: {
        userId: input.userId ?? null,
        problemId: problem.id,
        language: input.language,
        code: input.code,
        status: submissionStatusToDb(input.status),
        passed: input.passed,
        total: input.total,
        runtimeMs: input.runtimeMs,
        memoryMb: input.memoryMb,
        message: input.message,
        testResults: input.testResults ?? undefined,
      },
      select: { id: true, createdAt: true },
    })) as { id: string; createdAt: Date };

    if (input.userId) {
      await withPrismaTimeout((prisma as any).userProblemStatus.upsert({
        where: {
          userId_problemId: {
            userId: input.userId,
            problemId: problem.id,
          },
        },
        update: {
          attempted: true,
          solved: input.status === "Accepted" ? true : undefined,
          solvedAt: input.status === "Accepted" ? new Date() : undefined,
          lastAttemptAt: new Date(),
        },
        create: {
          userId: input.userId,
          problemId: problem.id,
          attempted: true,
          solved: input.status === "Accepted",
          solvedAt: input.status === "Accepted" ? new Date() : null,
          lastAttemptAt: new Date(),
        },
      }));
    }

    return {
      persisted: true,
      mode: "database" as const,
      submissionId: submission.id as string,
    };
  } catch (error) {
    console.warn("[problems] submission saved locally only:", error instanceof Error ? error.message : error);
    return {
      persisted: false,
      mode: "local" as const,
      reason: prismaFallbackReason(error),
    };
  }
}

