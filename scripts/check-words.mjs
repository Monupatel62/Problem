// Check word counts for specific slugs using proper string extractor
import { readFileSync } from 'fs';
const src = readFileSync('src/lib/problems/bank.ts', 'utf8');

const slugs = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['customers-who-never-order', 'department-highest-salary', 'rank-scores',
     'rotate-array', 'find-all-duplicates', 'spiral-matrix',
     'intersection-two-arrays', 'range-sum-query-immutable'];

function extractStrings(arrContent) {
  const items = [];
  let pos = 0;
  while (pos < arrContent.length) {
    const qStart = arrContent.indexOf('"', pos);
    if (qStart < 0) break;
    let qEnd = qStart + 1;
    while (qEnd < arrContent.length) {
      if (arrContent[qEnd] === '\\') { qEnd += 2; continue; }
      if (arrContent[qEnd] === '"') break;
      qEnd++;
    }
    items.push(arrContent.substring(qStart + 1, qEnd));
    pos = qEnd + 1;
  }
  return items;
}

function getArrContent(chunk, field) {
  const fieldIdx = chunk.indexOf(`"${field}"`);
  if (fieldIdx < 0) return '';
  const arrStart = chunk.indexOf('[', fieldIdx);
  if (arrStart < 0) return '';
  let depth = 0, i = arrStart;
  while (i < chunk.length) {
    if (chunk[i] === '[') depth++;
    else if (chunk[i] === ']') { depth--; if (depth === 0) break; }
    i++;
  }
  return chunk.substring(arrStart + 1, i);
}

function wordCount(text) {
  return text.replace(/\\n/g, ' ').replace(/\\r/g, ' ').replace(/\\t/g, ' ')
    .replace(/\\/g, '').trim().split(/\s+/).filter(Boolean).length;
}

for (const slug of slugs) {
  const slugIdx = src.indexOf(`"slug": "${slug}"`);
  const nextSlug = src.indexOf('"slug": "', slugIdx + 10);
  const chunk = src.substring(slugIdx, nextSlug > 0 ? nextSlug : src.length);

  // Description
  const descM = chunk.match(/"description":\s*"((?:[^"\\]|\\.)*)"/s);
  const descWords = descM ? wordCount(descM[1]) : 0;

  // Editorial
  const editArr = getArrContent(chunk, 'editorial');
  const editItems = extractStrings(editArr);
  const editWords = wordCount(editItems.join(' '));

  // judgeReady
  const judgeReady = /"judgeReady":\s*true/.test(chunk);

  // solutionApproaches
  const hasApproaches = chunk.indexOf('"solutionApproaches"') >= 0;

  // starterLangs — shell needs 2, SQL needs 1, others need 4
  const isSql = /"isSql":\s*true/.test(chunk);
  const isShell = /"track":\s*"Shell"/.test(chunk);
  const requiredLangs = isSql ? 1 : (isShell ? 2 : 4);

  const passDesc = descWords >= 250;
  const passEdit = editWords >= 300;
  const status = judgeReady && passDesc && passEdit && hasApproaches ? '✓ PASS' : '✗ FAIL';
  console.log(`${status} ${slug}`);
  console.log(`  desc=${descWords}w${passDesc?'':' <250'} edit=${editWords}w${passEdit?'':' <300'} judgeReady=${judgeReady} approaches=${hasApproaches}`);
}
