import { prisma, isPrismaUnavailableError, logPrismaFallback, withPrismaTimeout } from "@/lib/prisma";
import { normalizePlatformRole, type PlatformRole } from "@/lib/platform-role";

type AuthUserRecord = {
  id: string;
  name: string | null;
  email: string;
  role: PlatformRole;
  isActive: boolean;
  onboardingCompleted: boolean;
  avatarUrl?: string | null;
  emailVerifiedAt?: Date | string | null;
  password?: string | null;
};

const AUTH_CACHE_TTL = 5_000;
const cache = new Map<string, { expiresAt: number; value: AuthUserRecord | null }>();

function getCached(email: string) {
  const entry = cache.get(email);
  if (!entry || entry.expiresAt < Date.now()) {
    cache.delete(email);
    return undefined;
  }
  return entry.value;
}

function setCache(email: string, value: AuthUserRecord | null) {
  cache.set(email, { value, expiresAt: Date.now() + AUTH_CACHE_TTL });
}

export function clearAuthUserCacheByEmail(email: string) {
  cache.delete(email.toLowerCase().trim());
}

function normalize(user: any): AuthUserRecord | null {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: normalizePlatformRole(user.role),
    isActive: user.isActive,
    password: user.password ?? null,
    onboardingCompleted: user.onboardingCompleted ?? false,
    avatarUrl: user.avatarUrl ?? null,
    emailVerifiedAt: user.emailVerifiedAt ?? null,
  };
}

export async function findAuthUserByEmail(email: string): Promise<AuthUserRecord | null> {
  const normalized = email.toLowerCase().trim();
  const cached = getCached(normalized);
  if (cached !== undefined) return cached;

  let result: AuthUserRecord | null = null;
  try {
    const user = await withPrismaTimeout(
      prisma.user.findUnique({
        where: { email: normalized },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          password: true,
          isActive: true,
          onboardingCompleted: true,
          emailVerifiedAt: true,
          avatarUrl: true,
        },
      }),
    );
    result = normalize(user);
  } catch (error) {
    if (!isPrismaUnavailableError(error)) throw error;
    logPrismaFallback("[auth-user/find]", error);
    result = null;
  }

  setCache(normalized, result);
  return result;
}

export async function upsertOAuthUser(email: string, name?: string | null) {
  const normalized = email.toLowerCase().trim();
  try {
    await withPrismaTimeout(
      prisma.user.upsert({
        where: { email: normalized },
        create: {
          email: normalized,
          name: name ?? null,
          role: "USER",
          isActive: true,
          onboardingCompleted: false,
          emailVerifiedAt: new Date(),
        },
        update: { name: name ?? undefined },
      }),
    );
  } catch (error) {
    if (!isPrismaUnavailableError(error)) throw error;
    logPrismaFallback("[auth-user/oauth-upsert]", error);
  }
  clearAuthUserCacheByEmail(normalized);
}

export async function createVerifiedAuthUser(name: string, email: string, hashedPw: string) {
  const normalized = email.toLowerCase().trim();
  const user = await withPrismaTimeout(
    prisma.user.create({
      data: {
        name,
        email: normalized,
        password: hashedPw,
        emailVerifiedAt: new Date(),
        role: "USER",
        isActive: true,
        onboardingCompleted: false,
      },
    }),
  );
  clearAuthUserCacheByEmail(normalized);
  return user;
}

export async function completeOnboarding(userId: string) {
  try {
    await withPrismaTimeout(
      prisma.user.update({
        where: { id: userId },
        data: { onboardingCompleted: true },
      }),
    );
  } catch (error) {
    if (!isPrismaUnavailableError(error)) throw error;
    logPrismaFallback("[auth-user/complete-onboarding]", error);
  }
}

export const completeUserOnboarding = completeOnboarding;
