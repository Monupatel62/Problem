// Auth fallback storage — in-memory fallback when DB is unavailable

type FallbackUser = {
  id: string;
  name: string;
  email: string;
  hashedPassword: string;
  emailVerifiedAt: string | null;
  role: string;
  isActive: boolean;
  onboardingCompleted: boolean;
  avatarUrl?: string | null;
};

const store = new Map<string, FallbackUser>();

export async function findFallbackAuthUserByEmail(email: string): Promise<FallbackUser | null> {
  return store.get(email.toLowerCase()) ?? null;
}

export async function createFallbackAuthUser(params: {
  name: string;
  email: string;
  hashedPassword: string;
  emailVerifiedAt: string | null;
}): Promise<FallbackUser> {
  const user: FallbackUser = {
    id: `fallback-${Date.now()}`,
    name: params.name,
    email: params.email.toLowerCase(),
    hashedPassword: params.hashedPassword,
    emailVerifiedAt: params.emailVerifiedAt,
    role: "USER",
    isActive: true,
    onboardingCompleted: false,
  };
  store.set(user.email, user);
  return user;
}

export async function upsertFallbackOAuthUser(params: {
  email: string;
  name?: string | null;
}): Promise<void> {
  const email = params.email.toLowerCase();
  const existing = store.get(email);
  if (existing) {
    if (params.name) existing.name = params.name;
  } else {
    store.set(email, {
      id: `fallback-oauth-${Date.now()}`,
      name: params.name ?? "User",
      email,
      hashedPassword: "",
      emailVerifiedAt: new Date().toISOString(),
      role: "USER",
      isActive: true,
      onboardingCompleted: false,
    });
  }
}

export async function updateFallbackAuthUserRole(userId: string): Promise<void> {
  for (const user of store.values()) {
    if (user.id === userId) { user.role = "CREATOR"; break; }
  }
}

export async function completeFallbackAuthUserOnboarding(userId: string): Promise<void> {
  for (const user of store.values()) {
    if (user.id === userId) { user.onboardingCompleted = true; break; }
  }
}
