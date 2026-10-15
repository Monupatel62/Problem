import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { getProblemSubmissionDetail } from "@/lib/problems/service";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const session = await getServerSession(authOptions).catch(() => null);
  const result = await getProblemSubmissionDetail(slug, id, session?.user?.id ?? null);

  if (!result.submission) {
    return NextResponse.json(result, { status: result.persisted ? 404 : 200 });
  }

  return NextResponse.json(result);
}
