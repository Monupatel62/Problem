import { readFileSync } from 'fs';
const src = readFileSync('src/lib/problems/bank.ts', 'utf8');

const slugs = process.argv.slice(2);

for (const slug of slugs) {
  const slugIdx = src.indexOf(`"slug": "${slug}"`);
  const nextSlug = src.indexOf('"slug": "', slugIdx + 10);
  const chunk = src.substring(slugIdx, nextSlug > 0 ? nextSlug : src.length);

  // Find description field — JSON.stringify puts it on one line with escaped content
  const descM = chunk.match(/"description":\s*"((?:[^"\\]|\\.)*)"/s);
  if (!descM) { console.log(`${slug}: NO DESC`); continue; }
  const raw = descM[1];
  // Decode escaped sequences for counting
  const text = raw.replace(/\\n/g, ' ').replace(/\\r/g, ' ').replace(/\\t/g, ' ')
    .replace(/\\`/g, '`').replace(/\\\\/g, '\\').replace(/\\"/g, '"');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  console.log(`${slug}: desc=${words}w raw_len=${raw.length}`);
  // Show first 200 chars
  console.log('  Preview:', text.slice(0, 200));
}
