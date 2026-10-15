import type { NextAuthOptions } from "next-auth";
// Do not inherit WoHoTech identity providers. Configure standalone providers before production use.
export const authOptions: NextAuthOptions = {
  providers: [],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
