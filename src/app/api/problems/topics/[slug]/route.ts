import { proxyToBackend } from "@/lib/api-proxy";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return proxyToBackend({ req, path: `/api/problems/topics/${slug}` });
}
