"use client";

import { SessionProvider } from "next-auth/react";

type Props = {
  children: React.ReactNode;
};

export function SessionProviderWrapper({ children }: Props) {
  return (
    <SessionProvider basePath="/api/auth" refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  );
}

