/**
 * Seed all problems from bank.ts directly into the database.
 * Usage: npx ts-node --skip-project scripts/problems/seed-from-bank.ts
 *        npx ts-node --skip-project scripts/problems/seed-from-bank.ts --dry-run
 */

import { Client } from "pg";
import { problemBank } from "../../src/lib/problems/bank";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

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

function diffToDb(d: string) { return d === "Easy" ? "EASY" : d === "Hard" ? "HARD" : "MEDIUM"; }
function trackToDb(t: string) { return t === "Database" ? "DATABASE" : t === "Shell" ? "SHELL" : t === "Concurrency" ? "CONCURRENCY" : "ALGORITHMS"; }
function accToNum(a: string | number) { return parseFloat(String(a).replace("%", "")) || 0; }

async function main() {
  console.log(`[seed] Loaded ${problemBank.length} problems from bank.ts`);

  if (isDryRun) {
    problemBank.forEach(p => console.log(`  ${p.id}. ${p.slug} — ${p.title} (${p.difficulty}) fn:${p.functionName} cases:${p.sampleCases.length}+${p.hiddenCases.length}`));
    process.exit(0);
  }

  const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!dbUrl) { console.error("DATABASE_URL not set"); process.exit(1); }

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("[seed] Connected to database");

  let inserted = 0, updated = 0, failed = 0;

  for (const p of problemBank) {
    try {
      const res = await client.query(`
        INSERT INTO problems (
          number, slug, title, acceptance, difficulty, track, tags, companies,
          frequency, premium, likes, dislikes, "discussionCount", description,
          constraints, hints, "functionName", "starterCode", editorial,
          "solutionApproaches", "isPublished", "judgeReady", "createdAt", "updatedAt"
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,NOW(),NOW())
        ON CONFLICT (slug) DO UPDATE SET
          title=EXCLUDED.title, acceptance=EXCLUDED.acceptance,
          difficulty=EXCLUDED.difficulty, track=EXCLUDED.track,
          tags=EXCLUDED.tags, companies=EXCLUDED.companies,
          frequency=EXCLUDED.frequency, premium=EXCLUDED.premium,
          description=EXCLUDED.description, constraints=EXCLUDED.constraints,
          hints=EXCLUDED.hints, "functionName"=EXCLUDED."functionName",
          "starterCode"=EXCLUDED."starterCode", editorial=EXCLUDED.editorial,
          "solutionApproaches"=EXCLUDED."solutionApproaches",
          "isPublished"=EXCLUDED."isPublished", "judgeReady"=EXCLUDED."judgeReady",
          "updatedAt"=NOW()
        RETURNING id, (xmax = 0) AS is_insert
      `, [
        p.id, p.slug, p.title, accToNum(p.acceptance),
        diffToDb(p.difficulty), trackToDb(p.track),
        p.tags ?? [], p.companies ?? [],
        p.frequency ?? 0, p.premium ?? false,
        p.likes ?? 0, p.dislikes ?? 0, p.discussionCount ?? 0,
        p.description ?? "", p.constraints ?? [], p.hints ?? [],
        p.functionName ?? "solution",
        JSON.stringify(p.starterCode ?? {}),
        p.editorial ?? [], JSON.stringify(p.solutionApproaches ?? []),
        true, p.judgeReady !== false,
      ]);

      const problemId = res.rows[0].id;
      const isIns = res.rows[0].is_insert === true || res.rows[0].is_insert === "t";
      if (isIns) inserted++; else updated++;

      // Replace examples
      await client.query(`DELETE FROM problem_examples WHERE "problemId"=$1`, [problemId]);
      for (let i = 0; i < (p.examples ?? []).length; i++) {
        const ex = p.examples[i];
        await client.query(
          `INSERT INTO problem_examples ("problemId", input, output, explanation, "sortOrder") VALUES ($1,$2,$3,$4,$5)`,
          [problemId, ex.input, ex.output, ex.explanation ?? null, i]
        );
      }

      // Replace test cases
      await client.query(`DELETE FROM problem_test_cases WHERE "problemId"=$1`, [problemId]);
      for (let i = 0; i < (p.sampleCases ?? []).length; i++) {
        const tc = p.sampleCases[i];
        await client.query(
          `INSERT INTO problem_test_cases ("problemId", kind, input, expected, "sortOrder") VALUES ($1,'SAMPLE',$2,$3,$4)`,
          [problemId, JSON.stringify(tc.input), JSON.stringify(tc.expected), i]
        );
      }
      for (let i = 0; i < (p.hiddenCases ?? []).length; i++) {
        const tc = p.hiddenCases[i];
        await client.query(
          `INSERT INTO problem_test_cases ("problemId", kind, input, expected, "sortOrder") VALUES ($1,'HIDDEN',$2,$3,$4)`,
          [problemId, JSON.stringify(tc.input), JSON.stringify(tc.expected), i]
        );
      }

      process.stdout.write(`\r[seed] ${inserted + updated + failed}/${problemBank.length} — ${p.slug}            `);
    } catch (e: any) {
      console.error(`\n[seed] FAILED ${p.slug}: ${e.message}`);
      failed++;
    }
  }

  await client.end();
  console.log(`\n\n[seed] ✅ Done! inserted=${inserted} updated=${updated} failed=${failed}`);
}

main().catch(e => { console.error(e); process.exit(1); });
