import { proxyToBackend } from "@/lib/api-proxy";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const session = await getServerSession(authOptions).catch(() => null);
  return proxyToBackend({ req, path: `/api/problems/${slug}/submissions/${id}`, userId: session?.user?.id });
}
