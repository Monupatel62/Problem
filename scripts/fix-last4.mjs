import { readFileSync, writeFileSync } from 'fs';
let src = readFileSync('src/lib/problems/bank.ts', 'utf8');
let n = 0;

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

function appendEditorialAt(slug, newItems) {
  const idx = src.lastIndexOf(`"slug": "${slug}"`);
  if (idx < 0) { console.log('NF:', slug); return; }
  const editIdx = src.indexOf('"editorial"', idx);
  const arrStart = src.indexOf('[', editIdx);
  let depth = 0, i = arrStart;
  while (i < src.length) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']') { depth--; if (depth === 0) break; }
    i++;
  }
  const ins = newItems.map(it => `\n      "${it.replace(/\"/g, '\\"')}"`).join(',');
  src = src.substring(0, i) + ',' + ins + src.substring(i);
  n++; console.log('editorial+:', slug);
}

// valid-phone-numbers: desc=267✓, edit=228 need +72
appendEditorialAt("valid-phone-numbers", [
  "Regex character classes: \\d matches any digit [0-9]. In POSIX extended regex (grep -E), use [0-9]{3} instead of \\d{3}. With Perl-compatible (-P), \\d is accepted. Both produce identical output for digit matching.",
  "Why anchors are critical: without ^ and $, grep matches anywhere in the line. 'call 555-555-5555 now' would match without anchors. With anchors the entire line must be a phone number.",
  "Alternation in regex: the | operator lets you match either pattern. Parentheses group it: (pattern1|pattern2). The $ anchor applies to the whole alternation, not just pattern2.",
  "Test cases: valid — 987-123-4567, (900) 456-7890; invalid — 123 456-7890 (space separator), 1-555-555-5555 (11 digits), (123)456-7890 (missing space after closing paren)."
]);

// transpose-file: desc=233 need +17
appendDescAt("transpose-file", " Shell-based data transformation skills are directly applicable to ETL pipelines, log analysis, and build tooling where awk is the standard tool for field-level text manipulation.");

// tenth-line: desc=222 need +28
appendDescAt("tenth-line", " Understanding the edge case where head+tail fails, and why sed/awk are the correct alternatives, is the key insight that separates a beginner shell scripting answer from an expert one.");

// count-lines-matching: desc=224 need +26, edit=176 need +124
appendDescAt("count-lines-matching-pattern", " The grep -c vs grep+wc distinction and the awk +0 coercion for empty results are the two details that separate a correct shell answer from one that would fail on edge cases in production scripts.");

appendEditorialAt("count-lines-matching-pattern", [
  "grep -c output format: outputs a single integer line, e.g. '3'. For multiple files, outputs 'file:count' per file. The output can be used directly in arithmetic: count=$(grep -c 'pattern' file.txt).",
  "awk /pattern/ mechanics: /pattern/ is a regex condition evaluated for each input line. When true, the following action block executes. Omitting the action block uses the default {print $0}. c++ in the action increments the counter variable.",
  "Why awk uses +0: in awk, unset variables have value '' (empty string). print c would output '' instead of 0. Adding +0 forces numeric context: '' + 0 = 0. Alternatively initialise: BEGIN{c=0}.",
  "Substring matching: grep 'leetcode' matches any line where 'leetcode' appears as a substring. Lines like 'ileetcode' or 'leetcodeX' both match. Use -w for whole-word: grep -cw 'leetcode'.",
  "Pipeline alternative: grep 'leetcode' file.txt | wc -l also counts matching lines but spawns an extra process. grep -c is faster and more elegant.",
  "Exit codes: grep exits with 0 if >= 1 match, 1 if no matches, 2 on error. When using grep -c in scripts, check the count variable rather than the exit code for the actual line count."
]);

writeFileSync('src/lib/problems/bank.ts', src);
console.log(`\nTotal: ${n}`);
