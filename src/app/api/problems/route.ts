import { NextResponse } from "next/server";
import { getProblems } from "@/lib/problems/service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = await getProblems({
    q: searchParams.get("q") ?? undefined,
    topic: searchParams.get("topic") ?? undefined,
    track: searchParams.get("track") ?? undefined,
    difficulty: searchParams.get("difficulty") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
  });

  return NextResponse.json(result);
}
