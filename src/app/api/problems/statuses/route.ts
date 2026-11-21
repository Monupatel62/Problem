import { proxyToBackend } from "@/lib/api-proxy";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions).catch(() => null);
  return proxyToBackend({ req, path: "/api/problems/user/statuses", userId: session?.user?.id });
}
