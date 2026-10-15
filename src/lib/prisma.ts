import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
function createClient() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  return new PrismaClient();
}
function getClient() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const client = createClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient() as unknown as Record<PropertyKey, unknown>;
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(client) : value;
  },
});
export default prisma;
export async function withPrismaTimeout<T>(task: Promise<T>, timeoutMs = Number(process.env.PRISMA_TIMEOUT_MS || 8000)): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([task, new Promise<T>((_, reject) => { timer = setTimeout(() => reject(new Error("Prisma operation timed out after " + timeoutMs + "ms")), timeoutMs); })]);
  } finally { if (timer) clearTimeout(timer); }
}
export function prismaFallbackReason(error: unknown) { return error instanceof Error ? error.message.split("\n")[0] : "Database unavailable; using local fallback."; }
export function logPrismaFallback(scope: string, error: unknown) {
  if (process.env.SUPPRESS_PRISMA_BUILD_FALLBACK_LOGS !== "true") console.warn(scope, prismaFallbackReason(error));
}
