import { PrismaClient } from "@prisma/client";

const DEFAULT_PRISMA_TIMEOUT_MS = Number(process.env.PRISMA_TIMEOUT_MS || 8_000);
// Cooldown only applies after catastrophic failures (server down), not simple timeouts.
// Keep it short so a transient timeout doesn't lock out auth for 30 seconds.
const PRISMA_COOLDOWN_MS = Number(process.env.PRISMA_COOLDOWN_MS || 15_000);

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaCooldownUntil?: number;
};

function createClient(): PrismaClient {
  // Prisma reads DATABASE_URL (pooled) and DATABASE_URL_UNPOOLED (direct) from
  // the environment via schema.prisma datasource config. No override needed here.
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  if (process.env.PRISMA_NEON_ADAPTER === "true") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Pool, neonConfig } = require("@neondatabase/serverless");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaNeon } = require("@prisma/adapter-neon");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const ws = require("ws");

      neonConfig.webSocketConstructor = ws;
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const adapter = new PrismaNeon(pool);

      return new PrismaClient({
        adapter: adapter as never,
        log: process.env.PRISMA_LOG_QUERIES === "true" ? ["query"] : [],
      });
    } catch (adapterError: unknown) {
      console.warn("[Prisma] Neon adapter unavailable, using direct connection:", prismaFallbackReason(adapterError));
    }
  }

  return new PrismaClient({
    log: process.env.PRISMA_LOG_QUERIES === "true" ? ["query"] : [],
  });
}

function getClient() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const client = createClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient() as unknown as Record<PropertyKey, unknown>;
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});

export default prisma;

export async function withPrismaTimeout<T>(task: Promise<T>, timeoutMs = DEFAULT_PRISMA_TIMEOUT_MS): Promise<T> {
  const now = Date.now();
  const cooldownUntil = globalForPrisma.prismaCooldownUntil ?? 0;
  if (cooldownUntil > now) {
    throw new Error(`Prisma temporarily unavailable until ${new Date(cooldownUntil).toISOString()}`);
  }

  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => {
      // Do NOT engage the global cooldown for a simple query timeout — that
      // would block all subsequent Prisma calls for 5 s across every concurrent
      // request on this Node process.  The cooldown is reserved for hard
      // server-down errors (caught in the catch block below).
      reject(new Error(`Prisma operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([
      task.then((value) => {
        globalForPrisma.prismaCooldownUntil = 0;
        return value;
      }),
      timeout,
    ]);
    return result;
  } catch (error) {
    // Only engage cooldown for hard server-down errors, not simple query timeouts.
    // A query timeout should not lock out ALL subsequent Prisma calls for 5+ seconds.
    if (
      error instanceof Error &&
      (error.message.includes("Can't reach database server") ||
        error.message.includes("Server has closed the connection") ||
        error.message.includes("Prisma temporarily unavailable"))
    ) {
      globalForPrisma.prismaCooldownUntil = Date.now() + PRISMA_COOLDOWN_MS;
    }
    throw error;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function isPrismaUnavailableError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("timed out") ||
    message.includes("temporarily unavailable") ||
    message.includes("can't reach database server") ||
    message.includes("server has closed the connection") ||
    message.includes("connection terminated") ||
    message.includes("connect etimedout") ||
    message.includes("getaddrinfo") ||
    message.includes("enotfound")
  );
}

export function prismaFallbackReason(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes("Prisma temporarily unavailable")) return "Prisma is in cooldown; using local fallback.";
    if (error.message.includes("Can't reach database server")) return "Neon database is unreachable; using local fallback.";
    if (error.message.includes("timed out")) return "Database query timed out; using local fallback.";
    return error.message.split("\n")[0] || "Database unavailable; using local fallback.";
  }
  return "Database unavailable; using local fallback.";
}

export function logPrismaFallback(scope: string, error: unknown) {
  const reason = prismaFallbackReason(error);
  if (isPrismaUnavailableError(error)) {
    if (process.env.SUPPRESS_PRISMA_BUILD_FALLBACK_LOGS === "true") return;
    console.warn(`${scope} ${reason}`);
    return;
  }
  console.error(`${scope} unexpected database fallback:`, error);
}
