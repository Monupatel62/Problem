import { NextResponse } from "next/server";
import { getProblem } from "@/lib/problems/service";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getProblem(slug);

  if (!result.problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
