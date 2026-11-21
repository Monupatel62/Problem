-- CreateTable: assistant_sessions (chat history storage)
CREATE TABLE IF NOT EXISTS "assistant_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "messages" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assistant_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "assistant_sessions_userId_updatedAt_idx" ON "assistant_sessions"("userId", "updatedAt" DESC);

-- AddForeignKey
ALTER TABLE "assistant_sessions" ADD CONSTRAINT "assistant_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Also create the rate_limits table used by chat route
CREATE TABLE IF NOT EXISTS "assistant_rate_limits" (
    "user_id" TEXT PRIMARY KEY,
    "window_start" TIMESTAMPTZ NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
