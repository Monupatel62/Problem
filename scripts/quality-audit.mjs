// Audit problems against isIndexableProblem thresholds
// Uses per-slug regex extraction (same as check-entry.mjs) so it avoids full-parse issues

import { readFileSync } from 'fs';

const src = readFileSync('src/lib/problems/bank.ts', 'utf8');

// Find all slug positions
const slugMatches = [...src.matchAll(/"slug":\s*"([^"]+)"/g)];

function getField(chunk, field) {
  const re = new RegExp(`"${field}":\\s*([\\s\\S]*?)(?=\\n\\s*"[a-zA-Z])`);
  const m = chunk.match(re);
  return m ? m[1].trim() : '';
}

function countArrayItems(chunk, field) {
  // Find the array for this field
  const fieldIdx = chunk.indexOf(`"${field}"`);
  if (fieldIdx < 0) return 0;
  const arrStart = chunk.indexOf('[', fieldIdx);
  if (arrStart < 0) return 0;
  // Count depth to find end
  let depth = 0, i = arrStart;
  while (i < chunk.length) {
    if (chunk[i] === '[' || chunk[i] === '{') depth++;
    else if (chunk[i] === ']' || chunk[i] === '}') {
      depth--;
      if (depth === 0) break;
    }
    i++;
  }
  const arrContent = chunk.substring(arrStart + 1, i);
  // Count top-level { for objects, or " for string arrays
  if (arrContent.trim().startsWith('"')) {
    // string array - count quoted items
    return (arrContent.match(/"(?:[^"\\]|\\.)*"/g) || []).length;
  } else {
    // object array - count opening {
    let count = 0, d = 0;
    for (let j = 0; j < arrContent.length; j++) {
      if (arrContent[j] === '{') { if (d === 0) count++; d++; }
      else if (arrContent[j] === '}') d--;
    }
    return count;
  }
}

function countDescWords(chunk) {
  const m = chunk.match(/"description":\s*"((?:[^"\\]|\\.)*)"/);
  if (!m) return 0;
  const desc = m[1].replace(/\\n/g, ' ').replace(/\\./g, ' ');
  return desc.trim().split(/\s+/).filter(Boolean).length;
}

function countEditWords(chunk) {
  const fieldIdx = chunk.indexOf('"editorial"');
  if (fieldIdx < 0) return 0;
  const arrStart = chunk.indexOf('[', fieldIdx);
  if (arrStart < 0) return 0;
  let depth = 0, i = arrStart;
  while (i < chunk.length) {
    if (chunk[i] === '[') depth++;
    else if (chunk[i] === ']') { depth--; if (depth === 0) break; }
    i++;
  }
  const arrContent = chunk.substring(arrStart + 1, i);
  const items = arrContent.match(/"((?:[^"\\]|\\.)*)"/g) || [];
  const text = items.join(' ').replace(/\\n/g, ' ').replace(/\\./g, ' ');
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countStarterLangs(chunk) {
  const fieldIdx = chunk.indexOf('"starterCode"');
  if (fieldIdx < 0) return 0;
  const objStart = chunk.indexOf('{', fieldIdx);
  if (objStart < 0) return 0;
  let depth = 0, i = objStart;
  while (i < chunk.length) {
    if (chunk[i] === '{') depth++;
    else if (chunk[i] === '}') { depth--; if (depth === 0) break; }
    i++;
  }
  const objContent = chunk.substring(objStart + 1, i);
  // Count top-level keys
  const keyMatches = [...objContent.matchAll(/"(JavaScript|Python|Java|C\+\+|SQL|TypeScript|C#|Go|Rust|Bash|Shell|awk|sed)"\s*:/g)];
  return keyMatches.length;
}

function isSql(chunk) {
  return /"isSql":\s*true/.test(chunk);
}

function isShell(chunk) {
  return /"isShell":\s*true/.test(chunk) || /"track":\s*"Shell"/.test(chunk);
}

function isConcurrency(chunk) {
  return /"isConcurrency":\s*true/.test(chunk) || /"track":\s*"Concurrency"/.test(chunk);
}

function isJudgeReady(chunk) {
  return /"judgeReady":\s*true/.test(chunk);
}

const results = [];

for (let i = 0; i < slugMatches.length; i++) {
  const slug = slugMatches[i][1];
  const start = slugMatches[i].index;
  const end = i + 1 < slugMatches.length ? slugMatches[i + 1].index : src.length;
  const chunk = src.substring(start, end);

  const judgeReady = isJudgeReady(chunk);
  const sql = isSql(chunk);
  const shell = isShell(chunk);
  const concurrency = isConcurrency(chunk);
  const descWords = countDescWords(chunk);
  const editWords = countEditWords(chunk);
  const examples = countArrayItems(chunk, 'examples');
  const constraints = countArrayItems(chunk, 'constraints');
  const hints = countArrayItems(chunk, 'hints');
  const sampleCases = countArrayItems(chunk, 'sampleCases');
  const hiddenCases = countArrayItems(chunk, 'hiddenCases');
  const starterLangs = countStarterLangs(chunk);
  const approaches = countArrayItems(chunk, 'solutionApproaches');
  const requiredLangs = sql ? 1 : (shell ? 2 : 4);

  const checks = {
    judgeReady,
    descWords: descWords >= 250,
    editWords: editWords >= 300,
    examples: examples >= 2,
    constraints: constraints >= 3,
    hints: hints >= 2,
    sampleCases: sampleCases >= 2,
    hiddenCases: hiddenCases >= 3,
    starterLangs: starterLangs >= requiredLangs,
    solutionApproaches: approaches >= 1,
  };
  const failed = Object.entries(checks).filter(([,v]) => !v).map(([k]) => k);
  const pass = failed.length === 0;

  results.push({ slug, pass, failed, descWords, editWords, examples, constraints,
    hints, sampleCases, hiddenCases, starterLangs, approaches, sql, judgeReady });
}

const passing = results.filter(r => r.pass);
const failing = results.filter(r => !r.pass);

console.log(`\n=== PASSING (${passing.length}) ===`);
passing.forEach(r => console.log(' ✓', r.slug));

console.log(`\n=== FAILING — sorted by gap count (showing top 40) ===`);
const sorted = failing.sort((a,b) => a.failed.length - b.failed.length);
sorted.slice(0,40).forEach(e => {
  console.log(`  ${e.slug.padEnd(45)} MISSING(${e.failed.length}): ${e.failed.join(', ')}`);
  console.log(`    desc=${e.descWords}w edit=${e.editWords}w hidden=${e.hiddenCases} sample=${e.sampleCases} approaches=${e.approaches} langs=${e.starterLangs}/${e.sql?1:4}`);
});

console.log(`\nTotal: ${results.length} | Passing: ${passing.length} | Failing: ${failing.length}`);
