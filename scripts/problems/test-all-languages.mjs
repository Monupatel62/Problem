/**
 * Test all problems in all 4 languages using their starter code.
 * Run: node scripts/problems/test-all-languages.mjs
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Read bank.ts and eval it
const bankContent = readFileSync(path.join(__dirname, "../../src/lib/problems/bank.ts"), "utf8");
// Extract the JSON array from bank.ts
const match = bankContent.match(/export const problemBank[^=]*=\s*(\[)/);
if (!match) { console.error("Could not find problemBank"); process.exit(1); }

// Use ts-node to get the data
const { execSync } = await import("node:child_process");

// Write a simple extractor
import { writeFileSync } from "node:fs";
writeFileSync("/tmp/extract.mjs", `
import { problemBank } from "${path.join(__dirname, "../../src/lib/problems/bank.ts").replace(/\\/g, "/")}";
process.stdout.write(JSON.stringify(problemBank.map(p => ({
  id: p.id, slug: p.slug, title: p.title, functionName: p.functionName,
  difficulty: p.difficulty, track: p.track, judgeReady: p.judgeReady,
  starterCode: p.starterCode,
  sampleCases: p.sampleCases.slice(0, 2)
}))));
`);
