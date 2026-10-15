import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { getDailyProblem } from "@/lib/problems/service";

export async function GET() {
  const session = await getServerSession(authOptions).catch(() => null);
  const result = await getDailyProblem(session?.user?.id ?? null);

  return NextResponse.json(result);
}
