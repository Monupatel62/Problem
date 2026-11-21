-- Add personalization fields to users table
ALTER TABLE "users" ADD COLUMN "interests" TEXT[] DEFAULT '{}';
ALTER TABLE "users" ADD COLUMN "preferences" JSONB;

-- Create watch_history table
CREATE TABLE "watch_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "duration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "watchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "watch_history_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint (one entry per user+video)
CREATE UNIQUE INDEX "watch_history_userId_videoId_key" ON "watch_history"("userId", "videoId");

-- Create index for efficient querying by user + recency
CREATE INDEX "watch_history_userId_watchedAt_idx" ON "watch_history"("userId", "watchedAt" DESC);

-- Add foreign key constraints
ALTER TABLE "watch_history" ADD CONSTRAINT "watch_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "watch_history" ADD CONSTRAINT "watch_history_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
