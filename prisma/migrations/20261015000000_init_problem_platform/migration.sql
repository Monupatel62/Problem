CREATE TYPE "ProblemDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE "ProblemTrack" AS ENUM ('ALGORITHMS', 'DATABASE', 'SHELL', 'CONCURRENCY');
CREATE TYPE "ProblemCaseKind" AS ENUM ('SAMPLE', 'HIDDEN');
CREATE TYPE "ProblemSubmissionStatus" AS ENUM ('ACCEPTED', 'WRONG_ANSWER', 'RUNTIME_ERROR', 'COMPILATION_ERROR', 'TIME_LIMIT_EXCEEDED', 'INTERNAL_ERROR');

CREATE TABLE "problems" (
  "id" TEXT NOT NULL, "number" INTEGER NOT NULL, "slug" TEXT NOT NULL, "title" TEXT NOT NULL,
  "acceptance" DOUBLE PRECISION NOT NULL DEFAULT 0, "difficulty" "ProblemDifficulty" NOT NULL,
  "track" "ProblemTrack" NOT NULL DEFAULT 'ALGORITHMS', "tags" TEXT[] NOT NULL, "companies" TEXT[] NOT NULL,
  "frequency" INTEGER NOT NULL DEFAULT 0, "premium" BOOLEAN NOT NULL DEFAULT false, "likes" INTEGER NOT NULL DEFAULT 0,
  "dislikes" INTEGER NOT NULL DEFAULT 0, "discussionCount" INTEGER NOT NULL DEFAULT 0, "description" TEXT NOT NULL,
  "constraints" TEXT[] NOT NULL, "hints" TEXT[] NOT NULL, "functionName" TEXT NOT NULL, "starterCode" JSONB NOT NULL,
  "editorial" TEXT[] NOT NULL, "solutionApproaches" JSONB, "isPublished" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "problems_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "problem_examples" (
  "id" TEXT NOT NULL, "problemId" TEXT NOT NULL, "input" TEXT NOT NULL, "output" TEXT NOT NULL,
  "explanation" TEXT, "sortOrder" INTEGER NOT NULL DEFAULT 0, CONSTRAINT "problem_examples_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "problem_test_cases" (
  "id" TEXT NOT NULL, "problemId" TEXT NOT NULL, "kind" "ProblemCaseKind" NOT NULL, "input" JSONB NOT NULL,
  "expected" JSONB NOT NULL, "sortOrder" INTEGER NOT NULL DEFAULT 0, CONSTRAINT "problem_test_cases_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "user_problem_statuses" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "problemId" TEXT NOT NULL, "solved" BOOLEAN NOT NULL DEFAULT false,
  "attempted" BOOLEAN NOT NULL DEFAULT false, "favorite" BOOLEAN NOT NULL DEFAULT false, "solvedAt" TIMESTAMP(3),
  "lastAttemptAt" TIMESTAMP(3), "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "user_problem_statuses_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "problem_submissions" (
  "id" TEXT NOT NULL, "userId" TEXT, "problemId" TEXT NOT NULL, "language" TEXT NOT NULL, "code" TEXT NOT NULL,
  "status" "ProblemSubmissionStatus" NOT NULL, "passed" INTEGER NOT NULL DEFAULT 0, "total" INTEGER NOT NULL DEFAULT 0,
  "runtimeMs" INTEGER NOT NULL DEFAULT 0, "memoryMb" DOUBLE PRECISION NOT NULL DEFAULT 0, "message" TEXT,
  "testResults" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "problem_submissions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "problems_number_key" ON "problems"("number");
CREATE UNIQUE INDEX "problems_slug_key" ON "problems"("slug");
CREATE INDEX "problems_difficulty_idx" ON "problems"("difficulty");
CREATE INDEX "problems_track_idx" ON "problems"("track");
CREATE INDEX "problems_isPublished_idx" ON "problems"("isPublished");
CREATE INDEX "problem_examples_problemId_idx" ON "problem_examples"("problemId");
CREATE INDEX "problem_test_cases_problemId_kind_idx" ON "problem_test_cases"("problemId", "kind");
CREATE UNIQUE INDEX "user_problem_statuses_userId_problemId_key" ON "user_problem_statuses"("userId", "problemId");
CREATE INDEX "user_problem_statuses_userId_solved_idx" ON "user_problem_statuses"("userId", "solved");
CREATE INDEX "problem_submissions_problemId_createdAt_idx" ON "problem_submissions"("problemId", "createdAt");
CREATE INDEX "problem_submissions_userId_createdAt_idx" ON "problem_submissions"("userId", "createdAt");
ALTER TABLE "problem_examples" ADD CONSTRAINT "problem_examples_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "problem_test_cases" ADD CONSTRAINT "problem_test_cases_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_problem_statuses" ADD CONSTRAINT "user_problem_statuses_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "problem_submissions" ADD CONSTRAINT "problem_submissions_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;


CREATE TABLE "problem_notifications" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "link" TEXT,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "problem_notifications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "problem_notifications_userId_createdAt_idx" ON "problem_notifications"("userId", "createdAt");
