/**
 * Seed problems directly from bank.ts into the database.
 * Usage: node scripts/problems/seed-from-bank.mjs
 *        node scripts/problems/seed-from-bank.mjs --dry-run
 */

import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

// Load .env
function loadEnv() {
  for (const f of [".env.local", ".env"]) {
    const p = path.join(process.cwd(), f);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}
loadEnv();

const isDryRun = process.argv.includes("--dry-run");

// Import bank using dynamic require
const require = createRequire(import.meta.url);

// Read bank.ts and extract the array via regex (simple approach)
const bankContent = readFileSync(path.join(process.cwd(), "src/lib/problems/bank.ts"), "utf8");
const match = bankContent.match(/export const problemBank[^=]*=\s*(\[[\s\S]*\]);?\s*$/m);
if (!match) {
  // Try to load compiled version
  console.error("Could not parse bank.ts directly. Run: npx ts-node --skip-project -e 'import { problemBank } from \"./src/lib/problems/bank\"; console.log(JSON.stringify(problemBank))' > /tmp/bank.json");
  process.exit(1);
}

let problems;
try {
  problems = JSON.parse(match[1]);
} catch (e) {
  console.error("Failed to parse bank.ts:", e.message);
  process.exit(1);
}

console.log(`[seed] Loaded ${problems.length} problems from bank.ts`);

if (isDryRun) {
  problems.forEach(p => console.log(`  ${p.id}. ${p.title} (${p.difficulty})`));
  process.exit(0);
}

// Connect to DB using pg
const { Client } = await import("pg").then(m => m.default || m);
const client = new Client({ connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL });
await client.connect();
console.log("[seed] Connected to database");

function diffToDb(d) { return d === "Easy" ? "EASY" : d === "Hard" ? "HARD" : "MEDIUM"; }
function trackToDb(t) { return t === "Database" ? "DATABASE" : t === "Shell" ? "SHELL" : t === "Concurrency" ? "CONCURRENCY" : "ALGORITHMS"; }
function accToNum(a) { return parseFloat(String(a).replace("%", "")) || 0; }

let inserted = 0, updated = 0, failed = 0;

for (const p of problems) {
  try {
    // Upsert problem
    const res = await client.query(`
      INSERT INTO problems (number, slug, title, acceptance, difficulty, track, tags, companies, frequency, premium, likes, dislikes, "discussionCount", description, constraints, hints, "functionName", "starterCode", editorial, "solutionApproaches", "isPublished", "createdAt", "updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,NOW(),NOW())
      ON CONFLICT (slug) DO UPDATE SET
        title=EXCLUDED.title, acceptance=EXCLUDED.acceptance, difficulty=EXCLUDED.difficulty,
        track=EXCLUDED.track, tags=EXCLUDED.tags, companies=EXCLUDED.companies,
        frequency=EXCLUDED.frequency, premium=EXCLUDED.premium, description=EXCLUDED.description,
        constraints=EXCLUDED.constraints, hints=EXCLUDED.hints, "functionName"=EXCLUDED."functionName",
        "starterCode"=EXCLUDED."starterCode", editorial=EXCLUDED.editorial,
        "solutionApproaches"=EXCLUDED."solutionApproaches", "updatedAt"=NOW()
      RETURNING id, (xmax = 0) AS is_insert
    `, [
      p.id, p.slug, p.title, accToNum(p.acceptance),
      diffToDb(p.difficulty), trackToDb(p.track),
      p.tags || [], p.companies || [],
      p.frequency || 0, p.premium || false,
      p.likes || 0, p.dislikes || 0, p.discussionCount || 0,
      p.description || "", p.constraints || [], p.hints || [],
      p.functionName || "solution",
      JSON.stringify(p.starterCode || {}),
      p.editorial || [], JSON.stringify(p.solutionApproaches || []),
      true,
    ]);

    const problemId = res.rows[0].id;
    const isInsert = res.rows[0].is_insert;
    if (isInsert) inserted++; else updated++;

    // Delete old examples and test cases
    await client.query(`DELETE FROM problem_examples WHERE "problemId"=$1`, [problemId]);
    await client.query(`DELETE FROM problem_test_cases WHERE "problemId"=$1`, [problemId]);

    // Insert examples
    for (let i = 0; i < (p.examples || []).length; i++) {
      const ex = p.examples[i];
      await client.query(`
        INSERT INTO problem_examples ("problemId", input, output, explanation, "sortOrder")
        VALUES ($1,$2,$3,$4,$5)
      `, [problemId, ex.input, ex.output, ex.explanation || null, i]);
    }

    // Insert sample test cases
    for (let i = 0; i < (p.sampleCases || []).length; i++) {
      const tc = p.sampleCases[i];
      await client.query(`
        INSERT INTO problem_test_cases ("problemId", kind, input, expected, "sortOrder")
        VALUES ($1,'SAMPLE',$2,$3,$4)
      `, [problemId, JSON.stringify(tc.input), JSON.stringify(tc.expected), i]);
    }

    // Insert hidden test cases
    for (let i = 0; i < (p.hiddenCases || []).length; i++) {
      const tc = p.hiddenCases[i];
      await client.query(`
        INSERT INTO problem_test_cases ("problemId", kind, input, expected, "sortOrder")
        VALUES ($1,'HIDDEN',$2,$3,$4)
      `, [problemId, JSON.stringify(tc.input), JSON.stringify(tc.expected), i]);
    }

    process.stdout.write(`\r[seed] ${inserted + updated + failed}/${problems.length} done...`);
  } catch (e) {
    console.error(`\n[seed] FAILED: ${p.slug} — ${e.message}`);
    failed++;
  }
}

await client.end();
console.log(`\n[seed] Done! inserted=${inserted} updated=${updated} failed=${failed}`);
