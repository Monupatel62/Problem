import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import pg from "pg";

const { Client } = pg;

const rootDir = process.cwd();
const migrationsDir = path.join(rootDir, "prisma", "migrations");
const problemCatalogMigrationName = "20260513090000_add_problem_catalog";

function loadLocalEnvIfNeeded() {
  // On Vercel (and other CI/CD environments), environment variables are already
  // injected into process.env before build commands run. Loading .env/.env.local
  // from disk here could shadow Vercel's correctly-set production values if the
  // committed files contain stale or misconfigured URLs. Skip loading entirely
  // when running in a Vercel build environment.
  if (process.env.VERCEL || process.env.CI) {
    return;
  }

  for (const fileName of [".env.local", ".env"]) {
    const filePath = path.join(rootDir, fileName);
    if (!existsSync(filePath)) continue;

    const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key]) continue;
      process.env[key] = rawValue.trim().replace(/^"|"$/g, "");
    }
  }
}

loadLocalEnvIfNeeded();

const databaseUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

// ── Safe deployment diagnostics (no secrets printed) ─────────────────────────
function logSafeDiagnostics() {
  const rawUrl = databaseUrl || "";
  let host = "(not set)", dbName = "(not set)", user = "(not set)", passwordLen = 0, isPooler = false;

  try {
    if (rawUrl) {
      const u = new URL(rawUrl);
      host = u.hostname;
      dbName = u.pathname.replace(/^\//, "") || "(empty)";
      user = u.username || "(empty)";
      passwordLen = u.password ? u.password.length : 0;
      isPooler = u.hostname.includes("-pooler");
    }
  } catch {
    host = "(parse error)";
  }

  console.log("[prisma-deploy] === Connection Diagnostics ===");
  console.log(`[prisma-deploy] DATABASE_URL exists       : ${Boolean(process.env.DATABASE_URL)}`);
  console.log(`[prisma-deploy] DATABASE_URL_UNPOOLED exists: ${Boolean(process.env.DATABASE_URL_UNPOOLED)}`);
  console.log(`[prisma-deploy] Using variable            : ${process.env.DATABASE_URL_UNPOOLED ? "DATABASE_URL_UNPOOLED" : "DATABASE_URL"}`);
  console.log(`[prisma-deploy] Host                      : ${host}`);
  console.log(`[prisma-deploy] Database                  : ${dbName}`);
  console.log(`[prisma-deploy] User                      : ${user}`);
  console.log(`[prisma-deploy] Is pooler endpoint        : ${isPooler}`);
  console.log(`[prisma-deploy] Password length           : ${passwordLen}`);
  console.log(`[prisma-deploy] URL length                : ${rawUrl.length}`);
  console.log(`[prisma-deploy] VERCEL env                : ${Boolean(process.env.VERCEL)}`);
  console.log(`[prisma-deploy] CI env                    : ${Boolean(process.env.CI)}`);
  console.log("[prisma-deploy] ================================");
}

logSafeDiagnostics();

function log(message) {
  console.log(`[prisma-deploy] ${message}`);
}

async function getMigrationNames() {
  const entries = await readdir(migrationsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

async function getChecksum(migrationName) {
  const sqlPath = path.join(migrationsDir, migrationName, "migration.sql");
  const sql = await readFile(sqlPath);
  return createHash("sha256").update(sql).digest("hex");
}

async function ensureBaselineIfNeeded() {
  if (!databaseUrl) {
    log("DATABASE_URL is not set; skipping baseline precheck.");
    return;
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    const migrationsTableResult = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = '_prisma_migrations'
      ) AS exists
    `);

    const hasMigrationsTable = Boolean(migrationsTableResult.rows[0]?.exists);
    const problemsTableResult = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'problems'
      ) AS exists
    `);
    const hasProblemsTable = Boolean(problemsTableResult.rows[0]?.exists);

    if (hasMigrationsTable) {
      if (!hasProblemsTable) {
        await client.query(
          `DELETE FROM "_prisma_migrations" WHERE "migration_name" = $1`,
          [problemCatalogMigrationName],
        );
        log("Problem catalog table is missing; ensuring problem migration can run.");
      }
      log("Found existing _prisma_migrations table; using normal Prisma deploy.");
      return;
    }

    const publicTableCountResult = await client.query(`
      SELECT COUNT(*)::int AS count
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name <> '_prisma_migrations'
    `);

    const publicTableCount = publicTableCountResult.rows[0]?.count ?? 0;
    if (publicTableCount === 0) {
      log("Database is empty; no baseline needed.");
      return;
    }

    const migrationNames = await getMigrationNames();
    if (migrationNames.length === 0) {
      log("No local migrations found; skipping baseline.");
      return;
    }

    const baselineMigrationNames = hasProblemsTable
      ? migrationNames
      : migrationNames.filter((migrationName) => migrationName !== problemCatalogMigrationName);

    log(
      `Non-empty database without Prisma history detected; baselining ${baselineMigrationNames.length} migrations.`,
    );

    await client.query(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id" TEXT PRIMARY KEY,
        "checksum" TEXT NOT NULL,
        "finished_at" TIMESTAMPTZ,
        "migration_name" TEXT NOT NULL,
        "logs" TEXT,
        "rolled_back_at" TIMESTAMPTZ,
        "started_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0
      )
    `);

    for (const migrationName of baselineMigrationNames) {
      const checksum = await getChecksum(migrationName);
      await client.query(
        `
          INSERT INTO "_prisma_migrations" (
            "id",
            "checksum",
            "finished_at",
            "migration_name",
            "started_at",
            "applied_steps_count"
          )
          VALUES ($1, $2, NOW(), $3, NOW(), $4)
          ON CONFLICT ("id") DO NOTHING
        `,
        [randomUUID(), checksum, migrationName, 1],
      );
    }

    log("Baseline completed.");
  } finally {
    await client.end();
  }
}

async function runPrismaMigrateDeploy() {
  await new Promise((resolve, reject) => {
    const child = spawn("npx", ["prisma", "migrate", "deploy"], {
      cwd: rootDir,
      env: process.env,
      shell: true,
      stdio: "inherit",
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`prisma migrate deploy exited with code ${code ?? "unknown"}`));
    });

    child.on("error", reject);
  });
}

await ensureBaselineIfNeeded();
await runPrismaMigrateDeploy();
