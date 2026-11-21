-- Migration: Add wallet columns to users + create wallet_transactions table
-- Run this in Neon SQL Editor: https://console.neon.tech → SQL Editor

-- Step 1: Add wallet columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "walletBalance" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "credits" INTEGER DEFAULT 50;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "walletQueries" INTEGER DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "walletImages" INTEGER DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "walletSearches" INTEGER DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "walletExpiresAt" TIMESTAMP(3);

-- Step 2: Create wallet_transactions table
CREATE TABLE IF NOT EXISTS "wallet_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reference" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS "wallet_transactions_userId_createdAt_idx" 
    ON "wallet_transactions"("userId", "createdAt" DESC);

-- Step 4: Add foreign key
ALTER TABLE "wallet_transactions" 
    ADD CONSTRAINT "wallet_transactions_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Done! After running this, run locally:
-- Copy-Item .env.local .env -Force; npx prisma generate
