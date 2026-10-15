// Appends extra editorial items DIRECTLY to bank.ts without re-serialization.
// This avoids JSON.stringify compressing the existing content.
import { readFileSync, writeFileSync } from 'fs';

let src = readFileSync('src/lib/problems/bank.ts', 'utf8');
let count = 0;

// Finds the last editorial item's closing quote+bracket and inserts new items before ]
function appendEditorialItems(slug, newItems) {
  const slugIdx = src.indexOf(`"slug": "${slug}"`);
  if (slugIdx < 0) { console.log(`NOT FOUND: ${slug}`); return; }

  // Find editorial array for this slug
  const editIdx = src.indexOf('"editorial"', slugIdx);
  if (editIdx < 0) { console.log(`NO EDITORIAL: ${slug}`); return; }

  // Find the closing ] of the editorial array
  const arrStart = src.indexOf('[', editIdx);
  let depth = 0, i = arrStart;
  while (i < src.length) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']') { depth--; if (depth === 0) break; }
    i++;
  }
  // i is now at the closing ]
  // Find the last non-whitespace before ] — it should be a "
  let insertBefore = i;
  // Get the indent of existing items
  const lineStart = src.lastIndexOf('\n', insertBefore - 1);
  const existingIndent = src.substring(lineStart + 1, src.indexOf('"', lineStart + 1));

  // Build new items string
  const indent = existingIndent || '    ';
  const newItemsStr = newItems.map(item =>
    `,\n${indent}"${item.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
  ).join('');

  src = src.substring(0, insertBefore) + newItemsStr + src.substring(insertBefore);
  count++;
  console.log(`Appended ${newItems.length} items to: ${slug}`);
}

// Also expand description by appending to it
function expandDescription(slug, extraSentences) {
  const slugIdx = src.indexOf(`"slug": "${slug}"`);
  if (slugIdx < 0) return;
  const descIdx = src.indexOf('"description"', slugIdx);
  if (descIdx < 0) return;
  const qStart = src.indexOf('"', descIdx + 13) + 1;
  // Find end of the description string (unescaped closing quote)
  let i = qStart;
  while (i < src.length) {
    if (src[i] === '\\') { i += 2; continue; }
    if (src[i] === '"') break;
    i++;
  }
  // i is at closing quote - insert extra text before it
  const extra = '\\n\\n' + extraSentences.replace(/"/g, '\\"');
  src = src.substring(0, i) + extra + src.substring(i);
  console.log(`  Expanded description of: ${slug}`);
}

// rotate-right-once: desc=226 need 24 more, edit=214 need 86 more
expandDescription("rotate-right-once",
  "One practical application of single-step rotation is in data stream processing: keeping a sliding window of the most recent n values where a new value replaces the oldest. The rotation moves all existing values one step forward and places the newest value at the start. Understanding this operation builds intuition for circular buffer and deque implementations used throughout systems programming.");
appendEditorialItems("rotate-right-once", [
  "Why this problem matters: single-step right rotation is a fundamental building block for circular buffer management, round-robin scheduling, and sliding window algorithms. Recognising it as a special case of rotate-array with k=1 saves time in interviews.",
  "Two-pointer shortcut: for k=1 specifically, you can also use the swap-based approach: save last = nums[n-1], shift all elements right by one, place last at front. Identical result to the general three-reversal method but simpler to implement and explain for this specific case.",
  "Time and space complexity final note: all correct approaches for k=1 run in O(n) time. The in-place shift uses O(1) extra space. The slice approach uses O(n) extra space. Choose based on whether input mutation is acceptable and whether memory is constrained."
]);

// missing-zero-to-n: desc=255 passes, edit=290 need 10 more
appendEditorialItems("missing-zero-to-n", [
  "Why the Gauss sum approach is preferred over the visited array: O(1) space vs O(n) space makes a significant difference when n is large. Both are O(n) time, but the Gauss sum avoids allocating n+1 booleans. For most interview settings the Gauss sum or XOR approach is the expected answer."
]);

// reverse-clean-string: desc=235 need 15 more, edit=202 need 98 more
expandDescription("reverse-clean-string",
  "This operation appears in text processing and natural language tasks where formatting characters must be stripped before analysis. For example, reversing a name stored with title-case and punctuation for database matching purposes, or reversing words in a sentence after stripping HTML tags.");
appendEditorialItems("reverse-clean-string", [
  "JavaScript one-liner: s.replace(/[^a-zA-Z]/g, '').split('').reverse().join(''). This chains four built-in string and array methods: replace to strip non-letters, split to convert to character array, reverse for in-place reversal, join to convert back to string. Each step is O(n).",
  "Python equivalent: ''.join(reversed(c for c in s if c.isalpha())). The generator expression filters lazily, reversed() creates a reverse iterator, and join materialises the result. Memory-efficient because no intermediate list is created until join is called.",
  "Edge case mixed punctuation: 'Hello, World!' removes comma, space, and exclamation mark to get 'HelloWorld', reversed to 'dlroWolleH'. The reversal treats the cleaned string as a flat sequence of characters regardless of where word boundaries originally were."
]);

// count-vowels: desc=240 need 10 more, edit=195 need 105 more
expandDescription("count-vowels",
  "Vowel counting appears as a sub-step in many text analysis tasks: checking if a word is pronounceable, computing vowel density for readability scores, or filtering words by phonetic properties. Mastering the single-pass character classification pattern is therefore broadly useful.");
appendEditorialItems("count-vowels", [
  "Alternative using string.count(): count = s.lower().count('a') + s.lower().count('e') + s.lower().count('i') + s.lower().count('o') + s.lower().count('u'). Correct but O(5n) with five passes and creates an O(n) lowercase copy. Less efficient than the single-pass set approach.",
  "ASCII optimisation: for ASCII-only input, you can test vowel membership using a 128-element boolean lookup table indexed by character code. vowelTable[ord(c)] takes O(1) with excellent cache performance. Useful when the bottleneck is character classification speed.",
  "Counting both vowels and consonants: if you also need the consonant count, a single pass can compute both simultaneously. count_vowels = 0, count_consonants = 0. For each c: if c.isalpha(): if c.lower() in 'aeiou': count_vowels++ else: count_consonants++. O(n) time, O(1) space for both counts."
]);

// is-soft-palindrome: desc=220 need 30 more, edit=188 need 112 more
expandDescription("is-soft-palindrome",
  "This problem is a classic entry point for learning two-pointer technique on strings, because the skip logic for non-alphanumeric characters cleanly demonstrates how to advance pointers selectively. It also introduces the concept of a normalisation step before a structural check, a pattern that recurs in many string and array problems.");
appendEditorialItems("is-soft-palindrome", [
  "Why two pointers are preferred over filter-and-compare in space-constrained settings: the filter approach creates a cleaned array of up to n characters, requiring O(n) extra space. Two pointers operate directly on the original string with only two integer variables, achieving O(1) extra space while maintaining O(n) time.",
  "Implementing the skip loop correctly: the inner skip while-loops must check left < right before advancing, not just while not-alnum. Without this guard, one pointer could advance past the other in a string like '!@#' (all non-alnum), causing incorrect behaviour when both pointers meet after the skipping.",
  "String normalisation before palindrome check: lowercasing after filtering (or during comparison) ensures 'A' and 'a' are treated as equal. In the two-pointer approach, compare s[left].lower() with s[right].lower() rather than the raw characters. This avoids a separate lowercase conversion pass."
]);

writeFileSync('src/lib/problems/bank.ts', src);
console.log(`\nDone. Modified ${count} entries.`);
