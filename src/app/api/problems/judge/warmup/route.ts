import { proxyToBackend } from "@/lib/api-proxy";

export const maxDuration = 65;

export async function POST(req: Request) {
  return proxyToBackend({ req, path: "/api/problems/judge/warmup" });
}
