import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { isValidEmail, normalizeEmail } from "@/lib/auth-email";
import { findAuthUserByEmail, upsertOAuthUser, clearAuthUserCacheByEmail } from "@/lib/auth-user";
import { normalizePlatformRole, type PlatformRole } from "@/lib/platform-role";

// ── WohoAuth OIDC config ──────────────────────────────────────────────────────
const WOHO_AUTH_DOMAIN = process.env.WOHO_AUTH_DOMAIN ?? "https://auth.wohotech.in";
const WOHO_CLIENT_ID   = process.env.WOHO_CLIENT_ID ?? "";
const WOHO_CLIENT_SECRET = process.env.WOHO_CLIENT_SECRET ?? "";

function hasProviderCredentials(clientId?: string, clientSecret?: string) {
  return Boolean(clientId?.trim() && clientSecret?.trim());
}

// ── Fetch user info from WohoAuth ─────────────────────────────────────────────
async function getWohoUserInfo(accessToken: string) {
  try {
    const res = await fetch(`${WOHO_AUTH_DOMAIN}/protocol/openid-connect/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ── Exchange code for tokens ──────────────────────────────────────────────────
async function exchangeCodeForTokens(code: string, redirectUri: string) {
  try {
    const res = await fetch(`${WOHO_AUTH_DOMAIN}/protocol/openid-connect/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: WOHO_CLIENT_ID,
        client_secret: WOHO_CLIENT_SECRET,
        redirect_uri: redirectUri,
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const authProviders: NextAuthOptions["providers"] = [
  // ── WohoAuth OIDC Provider ──────────────────────────────────────────────────
  ...(hasProviderCredentials(WOHO_CLIENT_ID, WOHO_CLIENT_SECRET)
    ? [
        {
          id: "woho-auth",
          name: "WohoAuth",
          type: "oauth" as const,
          authorization: {
            url: `${WOHO_AUTH_DOMAIN}/protocol/openid-connect/auth`,
            params: {
              scope: "openid profile email",
              response_type: "code",
            },
          },
          token: `${WOHO_AUTH_DOMAIN}/protocol/openid-connect/token`,
          userinfo: `${WOHO_AUTH_DOMAIN}/protocol/openid-connect/userinfo`,
          clientId: WOHO_CLIENT_ID,
          clientSecret: WOHO_CLIENT_SECRET,
          profile(profile: any) {
            return {
              id: profile.sub,
              name: profile.name,
              email: profile.email,
              image: profile.picture ?? null,
            };
          },
        },
      ]
    : []),

  // ── Credentials fallback (direct DB login) ──────────────────────────────────
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      try {
        const email = normalizeEmail(String(credentials?.email ?? ""));
        const userPw = String(credentials?.password ?? "");

        if (!email || !userPw || !isValidEmail(email)) return null;

        clearAuthUserCacheByEmail(email);
        const user = await findAuthUserByEmail(email);

        if (!user || !user.isActive || !user.emailVerifiedAt || !user.password) return null;

        const valid = await compare(userPw, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
        };
      } catch (error) {
        console.error("[auth] credentials authorize error:", error instanceof Error ? error.message : error);
        return null;
      }
    },
  }),
];

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/auth/login", error: "/auth/login" },
  providers: authProviders,

  callbacks: {
    async redirect({ url, baseUrl }) {
      // Only allow same-origin redirects
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const target = new URL(url);
        if (target.origin === new URL(baseUrl).origin) return url;
      } catch {}
      return baseUrl;
    },

    async signIn({ user, account }) {
      if (account?.provider === "woho-auth") {
        const email = user.email;
        if (!email || !isValidEmail(normalizeEmail(email))) return false;
        try {
          await upsertOAuthUser(normalizeEmail(email), user.name);
        } catch (err) {
          console.error("[auth] WohoAuth upsert error:", err instanceof Error ? err.message : err);
          const errMsg = err instanceof Error ? err.message : String(err);
          if (errMsg.includes("Unique constraint") || errMsg.includes("Invalid")) return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        if (user.id) token.sub = user.id;
        if (user.name) token.name = user.name;
        if (user.email) token.email = user.email;
      }

      const lookupEmail = (user?.email ?? token.email ?? "").toString().toLowerCase().trim();
      if (lookupEmail) {
        try {
          const dbUser = await findAuthUserByEmail(lookupEmail);
          if (dbUser) {
            token.sub = dbUser.id;
            token.role = normalizePlatformRole(dbUser.role);
            token.name = dbUser.name ?? token.name;
            token.provider = account?.provider ?? token.provider ?? "credentials";
            token.isActive = dbUser.isActive;
            token.onboardingCompleted = dbUser.onboardingCompleted;
            token.avatarUrl = dbUser.avatarUrl || "";
          } else if (account?.provider === "woho-auth") {
            token.role = normalizePlatformRole(undefined);
            token.provider = "woho-auth";
            token.onboardingCompleted = false;
            token.isActive = true;
          }
        } catch (error) {
          console.error("[auth] jwt lookup error:", error);
          if (!token.role) token.role = normalizePlatformRole(undefined);
        }
      }

      if (trigger === "update" && session?.role) token.role = normalizePlatformRole(session.role);
      if (trigger === "update" && typeof session?.onboardingCompleted === "boolean") {
        token.onboardingCompleted = session.onboardingCompleted;
      }
      if (trigger === "update" && session?.avatarUrl) token.avatarUrl = session.avatarUrl;

      return token;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? token.email ?? "";
        session.user.role = normalizePlatformRole(token.role as string | undefined);
        session.user.name = token.name;
        session.user.onboardingCompleted = Boolean(token.onboardingCompleted);
        (session.user as any).image = token.avatarUrl || (session.user as any).image || "";
      }
      return session;
    },
  },

  debug: process.env.NEXTAUTH_DEBUG === "true",
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}
