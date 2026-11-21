import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { loadStructuredProblems } from "./load-structured-problems.mjs";

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

loadLocalEnvIfNeeded();

const expectedProblems = loadStructuredProblems();

if (process.argv.includes("--dry-run")) {
  console.log(`[verify-problems] expected ${expectedProblems.length} structured problems`);
  process.exit(0);
}

const prisma = new PrismaClient();

try {
  const [problemCount, exampleCount, testCaseCount] = await Promise.all([
    prisma.problem.count(),
    prisma.problemExample.count(),
    prisma.problemTestCase.count(),
  ]);

  const missingSlugs = [];
  for (const problem of expectedProblems) {
    const saved = await prisma.problem.findUnique({
      where: { slug: problem.slug },
      select: { id: true },
    });
    if (!saved) missingSlugs.push(problem.slug);
  }

  if (missingSlugs.length > 0) {
    throw new Error(`Missing seeded problems: ${missingSlugs.join(", ")}`);
  }

  if (problemCount < expectedProblems.length) {
    throw new Error(`Expected at least ${expectedProblems.length} problems, found ${problemCount}`);
  }

  console.log(
    `[verify-problems] ok: ${problemCount} problems, ${exampleCount} examples, ${testCaseCount} test cases`,
  );
} finally {
  await prisma.$disconnect();
}
