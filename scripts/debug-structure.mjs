import { readFileSync } from 'fs';
const src = readFileSync('src/lib/problems/bank.ts', 'utf8');
const slug = process.argv[2] || 'running-total';
const idx = src.indexOf(`"slug": "${slug}"`);
if (idx < 0) { console.log('NOT FOUND'); process.exit(1); }

const start = src.lastIndexOf('\n  {', idx);
const nextEntry = src.indexOf('\n  },\n  {', idx);
const objEnd = nextEntry >= 0 ? nextEntry + 4 : src.lastIndexOf('\n  }') + 4;

console.log('Entry start offset:', start);
console.log('Next entry at:', nextEntry);
console.log('ObjEnd:', objEnd);
console.log('First 100 chars of entry:', JSON.stringify(src.substring(start+1, start+100)));
console.log('Last 100 chars of entry:', JSON.stringify(src.substring(objEnd-100, objEnd)));
