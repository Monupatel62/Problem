import { readFileSync } from 'fs';
const src = readFileSync('src/lib/problems/bank.ts', 'utf8');

const slugs = process.argv.slice(2).length ? process.argv.slice(2)
  : ['consecutive-numbers', 'delete-duplicate-emails', 'rising-temperature'];

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

for (const slug of slugs) {
  const slugIdx = src.indexOf(`"slug": "${slug}"`);
  const nextSlug = src.indexOf('"slug": "', slugIdx + 10);
  const chunk = src.substring(slugIdx, nextSlug > 0 ? nextSlug : src.length);

  const editIdx = chunk.indexOf('"editorial"');
  if (editIdx < 0) { console.log(slug + ': no editorial'); continue; }
  const arrStart = chunk.indexOf('[', editIdx);
  let depth = 0, i = arrStart;
  while (i < chunk.length) {
    if (chunk[i] === '[') depth++;
    else if (chunk[i] === ']') { depth--; if (depth === 0) break; }
    i++;
  }
  const arrContent = chunk.substring(arrStart + 1, i);
  const items = extractStrings(arrContent);
  const allText = items.join(' ').replace(/\\n/g, ' ').replace(/\\r/g, ' ').replace(/\\/g, '');
  const words = allText.trim().split(/\s+/).filter(Boolean).length;
  console.log(`${slug}: editorial items=${items.length} words=${words}`);
  items.forEach((it, idx) => {
    const w = it.replace(/\\n/g,' ').replace(/\\r/g,' ').replace(/\\/g,'').trim().split(/\s+/).filter(Boolean).length;
    console.log(`  [${idx}] ${w}w: ${it.slice(0,80)}...`);
  });
}
