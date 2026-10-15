import { readFileSync } from 'fs';
const src = readFileSync('src/lib/problems/bank.ts', 'utf8');

// Extract slug + quality signals using simple regex
const slugRe = /"slug":\s*"([^"]+)"/g;
const editorialRe = /"editorial":\s*\[([^\]]*)\]/g;
const hiddenRe = /"hiddenCases":\s*\[([^\]]*)\]/g;

// Walk through and pair each slug with its following editorial/hidden count
const entries = [];
let lastIdx = 0;

const allSlugs = [...src.matchAll(/"slug":\s*"([^"]+)"/g)];

for (let i = 0; i < allSlugs.length; i++) {
  const slug = allSlugs[i][1];
  const slugPos = allSlugs[i].index;
  const nextSlugPos = i + 1 < allSlugs.length ? allSlugs[i + 1].index : src.length;
  const chunk = src.substring(slugPos, nextSlugPos);

  // Count editorial items
  const editMatch = chunk.match(/"editorial":\s*\[([^\]]*)\]/s);
  const editCount = editMatch ? (editMatch[1].match(/"[^"]+"/g) || []).length : 0;

  // Count hiddenCases items
  const hiddenMatch = chunk.match(/"hiddenCases":\s*\[([^\]]*)\]/s);
  let hiddenCount = 0;
  if (hiddenMatch) {
    hiddenCount = (hiddenMatch[1].match(/"input"/g) || []).length;
  }

  // Count hints
  const hintsMatch = chunk.match(/"hints":\s*\[([^\]]*)\]/s);
  const hintsCount = hintsMatch ? (hintsMatch[1].match(/"[^"]+"/g) || []).length : 0;

  entries.push({ slug, editCount, hiddenCount, hintsCount });
}

// Show thin ones
console.log('=== THIN ENTRIES (editorial<=1 OR hiddenCases<=1 OR hints<=2) ===');
const thin = entries.filter(e => e.editCount <= 1 || e.hiddenCount <= 1 || e.hintsCount <= 2);
thin.forEach(e => {
  console.log(`  ${e.slug.padEnd(45)} edit=${e.editCount} hidden=${e.hiddenCount} hints=${e.hintsCount}`);
});
console.log(`\nTotal entries: ${entries.length}, Thin: ${thin.length}`);
