import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { getProblemSubmissions, saveProblemSubmission } from "@/lib/problems/service";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getServerSession(authOptions).catch(() => null);
  const result = await getProblemSubmissions(slug, session?.user?.id ?? null);

  return NextResponse.json(result);
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ persisted: false, mode: "local", error: "Invalid submission payload" }, { status: 400 });
  }

  const session = await getServerSession(authOptions).catch(() => null);
  const result = await saveProblemSubmission({
    slug,
    userId: session?.user?.id ?? null,
    language: String((body as any).language ?? "JavaScript"),
    code: String((body as any).code ?? ""),
    status: (body as any).status ?? "Idle",
    passed: Number((body as any).passed ?? 0),
    total: Number((body as any).total ?? 0),
    runtimeMs: Number((body as any).runtimeMs ?? 0),
    memoryMb: Number((body as any).memoryMb ?? 0),
    message: typeof (body as any).message === "string" ? (body as any).message : undefined,
    testResults: Array.isArray((body as any).testResults) ? (body as any).testResults : undefined,
  });

  return NextResponse.json(result);
}
