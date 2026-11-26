import type { Metadata } from "next";
import { ProblemsWorkspace } from "@/app/problems/problems-workspace";
import { problemBank } from "@/lib/problems/bank";
import type { ProblemDefinition } from "@/lib/problems/bank";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Problems — WohoCode",
  description: "Practice 94+ coding problems with an online judge. DSA, algorithms, competitive programming.",
};

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

async function fetchProblems(): Promise<{ problems: ProblemDefinition[]; source: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/problems`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.problems) && data.problems.length > 0) {
        return { problems: data.problems, source: data.source };
      }
    }
  } catch { /* fall through */ }
  return { problems: problemBank, source: "fallback" };
}

export default async function ProblemsPage() {
  const { problems, source } = await fetchProblems();
  return <ProblemsWorkspace initialProblems={problems} dataSource={source as any} />;
}
