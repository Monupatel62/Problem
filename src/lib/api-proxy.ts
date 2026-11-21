/**
 * Proxy utility — frontend Next.js API routes se backend pe forward karta hai.
 */

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

type ProxyOptions = {
  req: Request;
  path: string;
  method?: string;
  body?: unknown;
  userId?: string | null;
};

export async function proxyToBackend({ req, path, method, body, userId }: ProxyOptions): Promise<Response> {
  const url = new URL(req.url);
  const targetUrl = `${BACKEND_URL}${path}${url.search}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (userId) headers["x-user-id"] = userId;

  const authHeader = req.headers.get("authorization");
  if (authHeader) headers["authorization"] = authHeader;

  const fetchMethod = method ?? req.method;
  const fetchBody = body !== undefined
    ? JSON.stringify(body)
    : fetchMethod !== "GET" && fetchMethod !== "HEAD"
      ? await req.text().catch(() => undefined)
      : undefined;

  try {
    const backendRes = await fetch(targetUrl, {
      method: fetchMethod,
      headers,
      body: fetchBody,
      signal: AbortSignal.timeout(70_000),
    });

    const data = await backendRes.text();

    // Backend 5xx errors ko frontend pe 200 ke saath pass karo
    // taaki Next.js 500 na de — error handling frontend mein hoga
    const status = backendRes.status >= 500 ? 200 : backendRes.status;

    return new Response(data, {
      status,
      headers: {
        "Content-Type": backendRes.headers.get("Content-Type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error(`[proxy] ${fetchMethod} ${path} →`, err instanceof Error ? err.message : err);
    // Network error — return empty fallback based on path
    const fallback = getFallback(path);
    return new Response(JSON.stringify(fallback), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
}

// Fallback data jab backend bilkul unreachable ho
function getFallback(path: string): unknown {
  if (path.includes("/analytics")) return {
    totalProblems: 0, solvedProblems: 0, attemptedProblems: 0,
    easySolved: 0, mediumSolved: 0, hardSolved: 0,
    recentSubmissions: [], topicStats: [],
    streakDays: 0, score: 0, rankLabel: "Beginner",
    source: "local", persisted: false, reason: "Backend unavailable",
  };
  if (path.includes("/recommendations")) return {
    daily: [], weakTopics: [], nextUp: [],
    source: "local", persisted: false, reason: "Backend unavailable",
  };
  if (path.includes("/daily")) return { problem: null, source: "local" };
  if (path.includes("/statuses")) return { statuses: [], persisted: false };
  if (path.includes("/judge/status")) return { available: false };
  if (path.includes("/judge/warmup")) return { warmed: false };
  if (path.includes("/submissions")) return { submissions: [], source: "local", persisted: false };
  if (path.includes("/problems") && !path.includes("/judge")) return { problems: [], source: "local" };
  return { error: "Backend unavailable", source: "local" };
}
