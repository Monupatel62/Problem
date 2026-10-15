import { readFileSync } from 'fs';
const src = readFileSync('src/lib/problems/bank.ts', 'utf8');

function stripLineComments(text) {
  let r='',inStr=false,i=0;
  while(i<text.length){
    if(inStr){if(text[i]==='\\'){r+=text[i]+(text[i+1]||'');i+=2;}else if(text[i]==='"'){r+=text[i++];inStr=false;}else{r+=text[i++];}}
    else{if(text[i]==='"'){inStr=true;r+=text[i++];}else if(text[i]==='/'&&text[i+1]==='/'){while(i<text.length&&text[i]!=='\n')i++;}else{r+=text[i++];}}
  }
  return r;
}

const slug = process.argv[2] || 'running-total';
const idx = src.indexOf(`"slug": "${slug}"`);
const start = src.lastIndexOf('\n  {', idx);
const nextEntry = src.indexOf('\n  },\n  {', idx);
const objEnd = nextEntry >= 0 ? nextEntry + 4 : src.lastIndexOf('\n  }') + 4;
const entryRaw = src.substring(start + 1, objEnd);

const noComments = stripLineComments(entryRaw);
const cleaned = noComments.replace(/,(\s*[}\]])/g, '$1');

try {
  const obj = JSON.parse(cleaned);
  console.log('PARSED OK, id=', obj.id);
} catch(e) {
  console.log('PARSE ERROR:', e.message);
  const posMatch = e.message.match(/position (\d+)/);
  if (posMatch) {
    const pos = parseInt(posMatch[1]);
    console.log('Context:', JSON.stringify(cleaned.slice(Math.max(0,pos-80), pos+80)));
  }
}
