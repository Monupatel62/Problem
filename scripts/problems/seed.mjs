import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import pg from "pg";
import { loadStructuredProblems } from "./load-structured-problems.mjs";

const { Client } = pg;

function loadLocalEnvIfNeeded() {
  for (const fileName of [".env.local", ".env"]) {
    const filePath = path.join(process.cwd(), fileName);
    if (!existsSync(filePath)) continue;

    for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match) continue;

      const [, key, rawValue] = match;
      if (process.env[key]) continue;
      process.env[key] = rawValue.trim().replace(/^"|"$/g, "");
    }
  }
}

function difficultyToDb(difficulty) {
  if (difficulty === "Easy") return "EASY";
  if (difficulty === "Hard") return "HARD";
  return "MEDIUM";
}

function trackToDb(track) {
  if (track === "Database") return "DATABASE";
  if (track === "Shell") return "SHELL";
  if (track === "Concurrency") return "CONCURRENCY";
  return "ALGORITHMS";
}

function acceptanceToNumber(acceptance) {
  if (typeof acceptance === "number") return acceptance;
  return Number.parseFloat(String(acceptance).replace("%", "")) || 0;
}

loadLocalEnvIfNeeded();

const seedProblems = loadStructuredProblems();

if (process.argv.includes("--dry-run")) {
  console.log(`[seed-problems] loaded ${seedProblems.length} structured problems from src/content/problems`);
  process.exit(0);
}

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("[seed-problems] DATABASE_URL or DATABASE_URL_UNPOOLED is required.");
  process.exit(1);
}

const client = new Client({ connectionString });
await client.connect();

try {
  await client.query("BEGIN");

  for (const problem of seedProblems) {
    const saved = await client.query(
      `
        INSERT INTO "problems" (
          "id", "number", "slug", "title", "acceptance", "difficulty", "track", "tags", "companies",
          "frequency", "premium", "likes", "dislikes", "discussionCount", "description", "constraints",
          "hints", "functionName", "starterCode", "editorial", "solutionApproaches", "isPublished",
          "createdAt", "updatedAt"
        )
        VALUES (
          gen_random_uuid()::text, $1, $2, $3, $4, $5::"ProblemDifficulty", $6::"ProblemTrack", $7, $8,
          $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18::jsonb, $19, $20::jsonb, true,
          NOW(), NOW()
        )
        ON CONFLICT ("slug") DO UPDATE SET
          "number" = EXCLUDED."number",
          "title" = EXCLUDED."title",
          "acceptance" = EXCLUDED."acceptance",
          "difficulty" = EXCLUDED."difficulty",
          "track" = EXCLUDED."track",
          "tags" = EXCLUDED."tags",
          "companies" = EXCLUDED."companies",
          "frequency" = EXCLUDED."frequency",
          "premium" = EXCLUDED."premium",
          "likes" = EXCLUDED."likes",
          "dislikes" = EXCLUDED."dislikes",
          "discussionCount" = EXCLUDED."discussionCount",
          "description" = EXCLUDED."description",
          "constraints" = EXCLUDED."constraints",
          "hints" = EXCLUDED."hints",
          "functionName" = EXCLUDED."functionName",
          "starterCode" = EXCLUDED."starterCode",
          "editorial" = EXCLUDED."editorial",
          "solutionApproaches" = EXCLUDED."solutionApproaches",
          "isPublished" = true,
          "updatedAt" = NOW()
        RETURNING "id"
      `,
      [
        problem.id,
        problem.slug,
        problem.title,
        acceptanceToNumber(problem.acceptance),
        difficultyToDb(problem.difficulty),
        trackToDb(problem.track),
        problem.tags,
        problem.companies ?? [],
        problem.frequency ?? 0,
        problem.premium ?? false,
        problem.likes ?? 0,
        problem.dislikes ?? 0,
        problem.discussionCount ?? 0,
        problem.description,
        problem.constraints,
        problem.hints,
        problem.functionName,
        JSON.stringify(problem.starterCode),
        problem.editorial ?? [],
        JSON.stringify(problem.solutionApproaches ?? []),
      ],
    );

    const problemId = saved.rows[0].id;
    await client.query(`DELETE FROM "problem_examples" WHERE "problemId" = $1`, [problemId]);
    await client.query(`DELETE FROM "problem_test_cases" WHERE "problemId" = $1`, [problemId]);

    for (const [index, example] of problem.examples.entries()) {
      await client.query(
        `
          INSERT INTO "problem_examples" ("id", "problemId", "input", "output", "explanation", "sortOrder")
          VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5)
        `,
        [problemId, example.input, example.output, example.explanation ?? null, index],
      );
    }

    const cases = [
      ...problem.sampleCases.map((testCase, index) => ({ ...testCase, kind: "SAMPLE", sortOrder: index })),
      ...problem.hiddenCases.map((testCase, index) => ({
        ...testCase,
        kind: "HIDDEN",
        sortOrder: problem.sampleCases.length + index,
      })),
    ];

    for (const testCase of cases) {
      await client.query(
        `
          INSERT INTO "problem_test_cases" ("id", "problemId", "kind", "input", "expected", "sortOrder")
          VALUES (gen_random_uuid()::text, $1, $2::"ProblemCaseKind", $3::jsonb, $4::jsonb, $5)
        `,
        [problemId, testCase.kind, JSON.stringify(testCase.input), JSON.stringify(testCase.expected), testCase.sortOrder],
      );
    }

    console.log(`[seed-problems] upserted ${problem.id}. ${problem.title}`);
  }

  await client.query("COMMIT");
  console.log(`[seed-problems] completed ${seedProblems.length} problems`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
