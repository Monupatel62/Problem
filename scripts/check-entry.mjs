import { readFileSync } from 'fs';
const src = readFileSync('src/lib/problems/bank.ts', 'utf8');

const slugs = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['department-highest-salary', 'rank-scores'];

// Strip // comments that are outside of JSON strings
// Walk char by char, track string context
function stripLineComments(text) {
  let result = '';
  let inString = false;
  let i = 0;
  while (i < text.length) {
    if (inString) {
      if (text[i] === '\\') {
        result += text[i] + (text[i+1] || '');
        i += 2;
      } else if (text[i] === '"') {
        result += text[i++];
        inString = false;
      } else {
        result += text[i++];
      }
    } else {
      if (text[i] === '"') {
        inString = true;
        result += text[i++];
      } else if (text[i] === '/' && text[i+1] === '/') {
        // Skip to end of line
        while (i < text.length && text[i] !== '\n') i++;
      } else {
        result += text[i++];
      }
    }
  }
  return result;
}

let allOk = true;
for (const slug of slugs) {
  const slugMarker = `"slug": "${slug}"`;
  const idx = src.indexOf(slugMarker);
  if (idx < 0) { console.log(`${slug}: NOT FOUND`); allOk = false; continue; }

  const start = src.lastIndexOf('\n  {', idx);
  const nextEntry = src.indexOf('\n  },\n  {', idx);
  const objEnd = nextEntry >= 0 ? nextEntry + 4 : src.lastIndexOf('\n  }') + 4;
  const entryRaw = src.substring(start + 1, objEnd);

  const noComments = stripLineComments(entryRaw);
  const cleaned = noComments.replace(/,(\s*[}\]])/g, '$1');

  try {
    const obj = JSON.parse(cleaned);
    console.log(`${slug}: id=${obj.id} examples=${obj.examples?.length} sampleCases=${obj.sampleCases?.length} hiddenCases=${obj.hiddenCases?.length} hints=${obj.hints?.length} editorial=${obj.editorial?.length} constraints=${obj.constraints?.length} OK`);
  } catch(e) {
    console.log(`${slug}: JSON ERROR: ${e.message}`);
    const posMatch = e.message.match(/position (\d+)/);
    if (posMatch) {
      const pos = parseInt(posMatch[1]);
      console.log('  Context:', JSON.stringify(cleaned.slice(Math.max(0,pos-60), pos+60)));
    }
    allOk = false;
  }
}
process.exit(allOk ? 0 : 1);
