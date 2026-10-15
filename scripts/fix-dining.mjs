import { readFileSync, writeFileSync } from 'fs';
let src = readFileSync('src/lib/problems/bank.ts', 'utf8');

// Find the dining philosophers slug (id=2019)
const slug = '"slug": "the-dining-philosophers"';
const idx = src.lastIndexOf(slug); // use lastIndexOf to get the actual problem entry, not the catalog
console.log('Found at:', idx);

// Find its editorial ending
const editIdx = src.indexOf('"editorial"', idx);
const arrStart = src.indexOf('[', editIdx);
let depth = 0, i = arrStart;
while (i < src.length) {
  if (src[i] === '[') depth++;
  else if (src[i] === ']') { depth--; if (depth === 0) break; }
  i++;
}
console.log('Editorial ends at:', i);
console.log('Last 150 chars:', JSON.stringify(src.substring(i-150, i+5)));

// Insert new items before closing ]
const newItems = `,
      "Four Coffman conditions: mutual exclusion (forks not shareable), hold-and-wait (holds one while waiting for another), no preemption (cannot steal), circular wait (each waits for next philosopher's fork). Asymmetric ordering breaks the circular wait condition.",
      "Semaphore(4) correctness proof: with only 4 philosophers at the table simultaneously, by the pigeonhole principle at least one adjacent fork pair has no competing philosopher, guaranteeing that at least one philosopher can always make progress.",
      "Global lock ordering solution: always acquire forks in increasing order of fork number (fork 0 before fork 1, etc.). For philosopher 4 who would normally take fork 4 then fork 0, reverse to fork 0 then fork 4. This breaks all circular waits with a simple rule."`;

src = src.substring(0, i) + newItems + src.substring(i);
writeFileSync('src/lib/problems/bank.ts', src);
console.log('Done');
