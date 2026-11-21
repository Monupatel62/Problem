import { proxyToBackend } from "@/lib/api-proxy";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { problemBank } from "@/lib/problems/bank";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions).catch(() => null);

  // Try backend first
  try {
    const res = await proxyToBackend({ req, path: "/api/problems", userId: session?.user?.id });
    const data = await res.clone().json().catch(() => null);

    // If backend returned real problems, use them
    if (data?.problems && Array.isArray(data.problems) && data.problems.length > 0) {
      return res;
    }
  } catch { /* fall through */ }

  // Fallback to local bank.ts
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase();
  const difficulty = searchParams.get("difficulty");
  const sort = searchParams.get("sort");

  let problems = problemBank.map(p => ({
    number: p.id, slug: p.slug, title: p.title,
    acceptance: p.acceptance, difficulty: p.difficulty, track: p.track,
    tags: p.tags, companies: p.companies ?? [], frequency: p.frequency ?? 0,
    premium: p.premium ?? false, likes: p.likes ?? 0, dislikes: p.dislikes ?? 0,
    judgeReady: p.judgeReady !== false,
  }));

  if (q) problems = problems.filter(p => p.title.toLowerCase().includes(q) || p.slug.includes(q) || p.tags.some(t => t.toLowerCase().includes(q)));
  if (difficulty && difficulty !== "All") problems = problems.filter(p => p.difficulty === difficulty);
  if (sort === "Acceptance") problems.sort((a, b) => parseFloat(b.acceptance) - parseFloat(a.acceptance));
  else if (sort === "Frequency") problems.sort((a, b) => (b.frequency ?? 0) - (a.frequency ?? 0));

  return Response.json({ problems, source: "local" });
}
