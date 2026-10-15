import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials.password || !process.env.DATABASE_URL) return null;
      try {
        const user = await prisma.user.findUnique({ where: { email: credentials.email.trim().toLowerCase() } });
        if (!user?.passwordHash || !(await compare(credentials.password, user.passwordHash))) return null;
        return { id: user.id, name: user.name, email: user.email, image: user.image };
      } catch {
        return null;
      }
    },
  }),
];
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }));
}
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(GitHubProvider({ clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET }));
}

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email && process.env.DATABASE_URL) {
        try {
          const dbUser = await prisma.user.upsert({
            where: { email: user.email.toLowerCase() },
            create: { email: user.email.toLowerCase(), name: user.name ?? null, image: user.image ?? null },
            update: { name: user.name ?? null, image: user.image ?? null },
            select: { id: true },
          });
          token.uid = dbUser.id;
        } catch {
          if (user.id) token.uid = user.id;
        }
      } else if (user?.id) {
        token.uid = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & { id: string }).id =
          typeof token.uid === "string" ? token.uid : (token.sub ?? "");
      }
      return session;
    },
  },
};
