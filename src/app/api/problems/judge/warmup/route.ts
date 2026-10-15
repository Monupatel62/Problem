import { NextResponse } from "next/server";
import { getJudgeServiceConfig } from "@/lib/problems/judge-service-config";

export const runtime = "nodejs";
export const revalidate = 0;
export const maxDuration = 65; // seconds — covers Render cold-start

/**
 * Warmup endpoint — pings the external judge service to prevent cold-start delays.
 * Called from the frontend when a user opens the code editor.
 * Render free tier spins down after 15 min — this warms it up proactively.
 */
export async function POST() {
  const config = getJudgeServiceConfig();

  if (!config.enabled || !config.url) {
    return NextResponse.json({ warmed: false, reason: "External judge not configured." });
  }

  try {
    const controller = new AbortController();
    // Long timeout — Render cold start can take 30-60 seconds
    const timeoutId = setTimeout(() => controller.abort(), 65_000);

    const response = await fetch(`${config.url}/health`, {
      method: "GET",
      headers: {
        ...(process.env.JUDGE_SERVICE_TOKEN
          ? { Authorization: `Bearer ${process.env.JUDGE_SERVICE_TOKEN}` }
          : {}),
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return NextResponse.json({
      warmed: response.ok,
      status: response.status,
      message: response.ok ? "Judge service is warm and ready." : `Judge returned HTTP ${response.status}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Warmup failed.";
    return NextResponse.json({ warmed: false, message }, { status: 503 });
  }
}

export async function GET() {
  return POST();
}
