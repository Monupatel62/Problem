// Remove duplicate slug entries from the problemBank array
// Keep the FIRST occurrence (the well-updated one), remove all subsequent duplicates
import { readFileSync, writeFileSync } from 'fs';
let src = readFileSync('src/lib/problems/bank.ts', 'utf8');

const slugsWithDupes = [
  "transpose-file",
  "tenth-line",
  "count-lines-matching-pattern",
  "the-dining-philosophers"
];

let removed = 0;

for (const slug of slugsWithDupes) {
  const marker = `"slug": "${slug}"`;
  const first = src.indexOf(marker);
  if (first < 0) { console.log('not found:', slug); continue; }
  
  let searchFrom = first + marker.length;
  const second = src.indexOf(marker, searchFrom);
  if (second < 0) { console.log('no duplicate:', slug); continue; }
  
  // Find the start of this duplicate entry (the { before the slug)
  const entryStart = src.lastIndexOf('\n  {', second);
  
  // Find the end of this duplicate entry
  // Look for the next "  }," or "  }" pattern (end of array element)
  let i = second;
  let depth = 0;
  // Find the { that opened this entry
  const openBrace = src.lastIndexOf('{', second);
  i = openBrace;
  depth = 0;
  while (i < src.length) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) break;
    }
    i++;
  }
  // i is now at the closing } of the duplicate entry
  // Include the trailing comma if present
  let entryEnd = i + 1;
  if (src[entryEnd] === ',') entryEnd++;
  
  // Remove from entryStart to entryEnd
  src = src.substring(0, entryStart) + src.substring(entryEnd);
  removed++;
  console.log(`Removed duplicate: ${slug} (was at line ~${second})`);
}

writeFileSync('src/lib/problems/bank.ts', src);
console.log(`\nRemoved ${removed} duplicates`);
