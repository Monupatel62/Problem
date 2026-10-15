import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { setProblemFavorite } from "@/lib/problems/service";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await request.json().catch(() => null);
  const favorite = Boolean((body as { favorite?: unknown } | null)?.favorite);
  const session = await getServerSession(authOptions).catch(() => null);
  const result = await setProblemFavorite(slug, session?.user?.id ?? null, favorite);

  return NextResponse.json(result);
}
