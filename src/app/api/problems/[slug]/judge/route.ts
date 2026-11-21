import { proxyToBackend } from "@/lib/api-proxy";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { problemBank } from "@/lib/problems/bank";

export const runtime = "nodejs";
export const maxDuration = 65;

const JUDGE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
const JUDGE_SERVICE_URL = process.env.JUDGE_SERVICE_URL || "http://localhost:5000";
const JUDGE_TOKEN = process.env.JUDGE_SERVICE_TOKEN || "";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getServerSession(authOptions).catch(() => null);
  const body = await req.json().catch(() => null);

  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  // Try backend proxy first
  try {
    const backendRes = await fetch(`${JUDGE_URL}/api/problems/${slug}/judge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session?.user?.id ? { "x-user-id": session.user.id } : {}),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(70000),
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      // If we got a real result (not "No test cases found"), return it
      if (data.total > 0 || data.status === "Compilation Error") {
        return Response.json(data, { headers: { "Cache-Control": "no-store" } });
      }
    }
  } catch { /* fall through to local judge */ }

  // Fallback: judge directly using bank.ts test cases
  const problem = problemBank.find(p => p.slug === slug);
  if (!problem) return Response.json({ error: "Problem not found" }, { status: 404 });

  const { language, code, mode, sampleIndexes, customCases } = body;

  let cases = mode === "submit"
    ? [...problem.sampleCases, ...problem.hiddenCases]
    : (Array.isArray(sampleIndexes) && sampleIndexes.length
        ? sampleIndexes.map((i: number) => problem.sampleCases[i]).filter(Boolean)
        : problem.sampleCases);

  if (mode === "run" && Array.isArray(customCases)) {
    cases = [...cases, ...customCases.slice(0, 5)];
  }

  try {
    const judgeRes = await fetch(`${JUDGE_SERVICE_URL}/judge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(JUDGE_TOKEN ? { Authorization: `Bearer ${JUDGE_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        language,
        code,
        functionName: problem.functionName,
        cases,
        mode,
      }),
      signal: AbortSignal.timeout(65000),
    });

    if (!judgeRes.ok) {
      return Response.json({ status: "Runtime Error", passed: 0, total: cases.length, runtimeMs: 0, memoryMb: 0, message: `Judge error: ${judgeRes.status}`, persisted: false });
    }

    const result = await judgeRes.json();
    return Response.json({ ...result, persisted: false }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    const isTimeout = e?.name === "AbortError" || e?.name === "TimeoutError";
    return Response.json({
      status: "Runtime Error", passed: 0, total: cases.length,
      runtimeMs: 0, memoryMb: 0, persisted: false,
      message: isTimeout ? "Judge is starting up. Wait 30-60s and retry." : "Judge unavailable.",
    });
  }
}
