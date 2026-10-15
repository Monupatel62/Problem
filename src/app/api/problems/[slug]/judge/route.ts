import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { judgeProblem, type JudgeMode } from "@/lib/problems/judge";
import type { ProblemCase } from "@/lib/problems/bank";

export const runtime = "nodejs";
export const maxDuration = 65;

const allowedModes = new Set<JudgeMode>(["run", "submit"]);
const allowedLanguages = new Set(["JavaScript", "TypeScript", "Python", "C++", "C", "Java", "Go", "Rust", "Kotlin", "Ruby", "PHP", "C#", "SQL", "Bash"]);
const maxBodyBytes = 1_000_000;
const maxCodeLength = Number(process.env.JUDGE_MAX_CODE_LENGTH || 50_000);

function json(payload: unknown, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function readCustomCases(value: unknown): ProblemCase[] | undefined {
  if (!Array.isArray(value)) return undefined;

  return value
    .filter((item): item is { input: unknown; expected: unknown } => {
      return Boolean(item && typeof item === "object" && Array.isArray((item as any).input) && Object.hasOwn(item, "expected"));
    })
    .slice(0, 5)
    .map((item) => ({
      input: item.input as unknown[],
      expected: item.expected,
    }));
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > maxBodyBytes) {
    return json({ error: "Judge payload is too large" }, 413);
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return json({ error: "Invalid judge payload" }, 400);
  }

  const mode = String((body as any).mode ?? "run") as JudgeMode;
  if (!allowedModes.has(mode)) {
    return json({ error: "Invalid judge mode" }, 400);
  }

  const language = String((body as any).language ?? "JavaScript");
  if (!allowedLanguages.has(language)) {
    return json({ error: "Unsupported judge language" }, 400);
  }

  const code = String((body as any).code ?? "");
  if (code.length > maxCodeLength) {
    return json({ error: `Code is too large. Limit is ${maxCodeLength} characters.` }, 413);
  }

  const session = await getServerSession(authOptions).catch(() => null);
  const sampleIndexes = Array.isArray((body as any).sampleIndexes)
    ? (body as any).sampleIndexes.map((index: unknown) => Number(index)).filter(Number.isInteger)
    : undefined;
  const customCases = mode === "run" ? readCustomCases((body as any).customCases) : undefined;
  const isSql = Boolean((body as any).isSql);
  const isShell = Boolean((body as any).isShell);
  const isConcurrency = Boolean((body as any).isConcurrency);
  const result = await judgeProblem({
    slug,
    userId: session?.user?.id ?? null,
    language,
    code,
    mode,
    sampleIndexes,
    customCases,
    isSql,
    isShell,
    isConcurrency,
  });

  // Send notification for submit mode if user is logged in
  if (mode === "submit" && session?.user?.id) {
    const userId = session.user.id;
    const status = result.status;
    if (status === "Accepted") {
      const { notify } = await import("@/lib/notify");
      await notify(
        userId,
        "problem",
        "✅ Problem Accepted!",
        `${slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} — All ${result.total} test cases passed in ${result.runtimeMs}ms.`,
        `/problems/${slug}`,
      );
    } else if (status === "Wrong Answer" || status === "Runtime Error" || status === "Compilation Error") {
      const { notify } = await import("@/lib/notify");
      await notify(
        userId,
        "problem",
        `❌ ${status}`,
        `${slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} — ${result.passed}/${result.total} test cases passed. Keep trying!`,
        `/problems/${slug}`,
      );
    }
  }

  return json(result);
}
