import { readFileSync, writeFileSync } from 'fs';
let src = readFileSync('src/lib/problems/bank.ts', 'utf8');
let n = 0;

function appendEditorialAt(slugLastOccurrence, newItems) {
  // Use lastIndexOf to get the actual bank entry (not catalog)
  const idx = slugLastOccurrence
    ? src.lastIndexOf(`"slug": "${slugLastOccurrence}"`)
    : -1;
  if (idx < 0) { console.log('NF:', slugLastOccurrence); return; }
  const editIdx = src.indexOf('"editorial"', idx);
  const arrStart = src.indexOf('[', editIdx);
  let depth = 0, i = arrStart;
  while (i < src.length) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']') { depth--; if (depth === 0) break; }
    i++;
  }
  const ins = newItems.map(it => `\n      "${it.replace(/"/g,'\\\"')}"`).join(',');
  src = src.substring(0, i) + ',' + ins + src.substring(i);
  n++; console.log('editorial+:', slugLastOccurrence);
}

function appendDescAt(slug, extra) {
  const idx = src.lastIndexOf(`"slug": "${slug}"`);
  if (idx < 0) { console.log('NF:', slug); return; }
  const descIdx = src.indexOf('"description"', idx);
  let i = src.indexOf('"', descIdx + 13) + 1;
  while (i < src.length) {
    if (src[i] === '\\') { i += 2; continue; }
    if (src[i] === '"') break;
    i++;
  }
  src = src.substring(0, i) + extra + src.substring(i);
  n++; console.log('desc+:', slug);
}

function addStarterLangAt(slug, lang, code) {
  const idx = src.lastIndexOf(`"slug": "${slug}"`);
  if (idx < 0) return;
  const scIdx = src.indexOf('"starterCode"', idx);
  if (scIdx < 0) return;
  const objStart = src.indexOf('{', scIdx);
  let depth = 0, i = objStart;
  while (i < src.length) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) break; }
    i++;
  }
  const objContent = src.substring(objStart, i+1);
  if (objContent.includes(`"${lang}"`)) { console.log('exists:', slug, lang); return; }
  const insert = `,\n      "${lang}": ${JSON.stringify(code)}`;
  src = src.substring(0, i) + insert + src.substring(i);
  n++; console.log('starter+:', slug, lang);
}

// daily-temperature-wait: edit=291 need +9
appendEditorialAt("daily-temperature-wait", [
  "Summary: O(n) time and O(n) space. Each temperature processed at most twice (push + pop). The result array is filled in O(1) per resolved element."
]);

// valid-phone-numbers: edit=228 need +72
appendEditorialAt("valid-phone-numbers", [
  "Extended regex (grep -E): requires [0-9]{3} instead of \\d{3}. With -P (Perl): \\d{3} works. Both produce identical results for this problem.",
  "Full pattern: ^(\\d{3}-\\d{3}-\\d{4}|\\(\\d{3}\\) \\d{3}-\\d{4})$. The \\( and \\) match literal parentheses. The space in (xxx) xxx-xxxx is a required literal space character.",
  "This is LeetCode 193. Shell regex problems directly test skills used in log analysis, monitoring scripts, and data validation pipelines in production engineering."
]);

// transpose-file: desc=233 need +17
appendDescAt("transpose-file", " Understanding this awk technique is directly applicable to ETL pipelines and shell-based data transformations in data engineering roles.");

// tenth-line: desc=222 need +28
appendDescAt("tenth-line", " Knowing multiple correct solutions (sed vs awk) and the pitfall of the head+tail approach demonstrates thorough command-line tool knowledge expected in DevOps and SRE roles.");

// count-lines-matching: desc=224 need +26, edit=176 need +124
appendDescAt("count-lines-matching-pattern", " In production environments, grep -c is commonly used in monitoring scripts to alert when error patterns exceed thresholds in log files. Familiarity with both grep and awk for this task is expected in backend and infrastructure engineering roles.");

appendEditorialAt("count-lines-matching-pattern", [
  "grep -c output: if no lines match, grep -c outputs 0 (not empty). This is important for scripts that use the count as a number in arithmetic or comparisons.",
  "Error handling: grep returns exit code 0 if matches found, 1 if no matches, 2 on error. Use the -c output directly; don't rely on exit code for counting.",
  "Multiple files: grep -c 'pattern' *.log counts matching lines separately per file. grep -rc 'pattern' dir/ recurses into subdirectories.",
  "Performance: grep is implemented in C with highly optimised string matching. For large log files (gigabytes), grep -c is orders of magnitude faster than a Python/awk equivalent.",
  "Whole-word matching: grep -cw 'leetcode' matches 'leetcode' only when surrounded by non-word characters. Without -w, 'maxleetcode' is also counted.",
  "Case-insensitive: grep -ci 'leetcode' counts 'LEETCODE', 'LeetCode', and 'leetcode' as matches. The problem requires case-sensitive matching so -i is not used."
]);

// Add starterLangs for the second (shell) entries that still fail
addStarterLangAt("valid-phone-numbers", "Shell", "# Use grep with regex\ngrep -P '^(\\d{3}-\\d{3}-\\d{4}|\\(\\d{3}\\) \\d{3}-\\d{4})$' file.txt");
addStarterLangAt("transpose-file", "Shell", "# awk 2D array transpose\nawk '{ for(i=1;i<=NF;i++) a[i][NR]=$i; cols=NF } END { for(i=1;i<=cols;i++) { for(j=1;j<=NR;j++) printf \"%s%s\",a[i][j],(j<NR?\" \":\"\\n\") } }' file.txt");
addStarterLangAt("tenth-line", "Shell", "# Print only the 10th line\nsed -n '10p' file.txt");
addStarterLangAt("count-lines-matching-pattern", "Shell", "# Count lines containing 'leetcode'\ngrep -c 'leetcode' file.txt");

writeFileSync('src/lib/problems/bank.ts', src);
console.log(`\nTotal: ${n}`);
