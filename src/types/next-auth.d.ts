import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    role?: string;
    onboardingCompleted?: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      onboardingCompleted?: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    provider?: string;
    email?: string;
    isActive?: boolean;
    onboardingCompleted?: boolean;
    avatarUrl?: string;
  }
}
