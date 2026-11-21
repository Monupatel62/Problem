import { proxyToBackend } from "@/lib/api-proxy";

export const runtime = "nodejs";
export const maxDuration = 65;

export async function POST(req: Request) {
  return proxyToBackend({ req, path: "/api/code/run" });
}
