-- CreateTable: pending_signups (email verification for new signups)
CREATE TABLE IF NOT EXISTS "pending_signups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pending_signups_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "pending_signups_email_key" ON "pending_signups"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "pending_signups_token_key" ON "pending_signups"("token");