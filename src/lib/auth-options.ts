import type { NextAuthOptions } from "next-auth";

/**
 * The extracted app intentionally ships without WoHoTech's account providers.
 * Supply OAuth providers and NEXTAUTH_SECRET before enabling authenticated
 * submissions or user-specific progress in a deployment.
 */
export const authOptions: NextAuthOptions = {
  providers: [],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
};
