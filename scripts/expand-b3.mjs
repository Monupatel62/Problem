// Expand batch 3 entries using direct string manipulation (no JSON.stringify)
import { readFileSync, writeFileSync } from 'fs';
let src = readFileSync('src/lib/problems/bank.ts', 'utf8');
let n = 0;

// Replace a string in src
function rep(from, to) {
  if (!src.includes(from)) { console.log('NOT FOUND:', from.substring(0, 60)); return; }
  src = src.replace(from, to);
  n++;
}

// first-repeated-character - extend last editorial item + add new ones
rep(
  `"Distinction from 'first character appearing once': this problem asks for the first repeating character (second occurrence earliest), not the first character that appears exactly once. These are different problems with different solutions."
    ]`,
  `"Distinction from 'first character appearing once': this problem asks for the first repeating character (second occurrence earliest), not the first character that appears exactly once. Confusing them is a common interview mistake.",
      "Time and space: O(n) time for a single pass. O(1) space since the set or boolean array holds at most 26 elements for lowercase English letters, independent of string length.",
      "Common mistake — wrong definition: some candidates return the character that appears more than once overall, but scan position matters. s='abba' — 'b' is found at index 2 as a repeat. 'a' is repeated overall but its second occurrence is at index 3. Return 'b', not 'a'.",
      "Extension to Unicode strings: for arbitrary character sets, use a hash set instead of a fixed-size array. The space is O(min(n, alphabet_size)), which is O(n) worst case for very large alphabets."
    ]`
);

// Extend first-repeated-character description
rep(
  `"Edge cases: single-character string — no repeat possible, return ''; string where all characters are identical — return that character immediately on the second encounter at index 1; string with no repeats — scan completes, return ''."`
  ,
  `"Edge cases: single-character string — no repeat possible, return ''; string where all characters are identical like 'aaaa' — return that character on the second encounter at index 1; string with no repeats — the full scan completes without a hit, return ''.",
    "This problem appears frequently in interviews as a warm-up string question. Knowing both the hash set approach and the fixed boolean array optimisation for lowercase-only inputs demonstrates awareness of constant-factor improvements."`
);

// compress-runs - extend description and editorial
rep(
  `"Edge cases: empty string returns empty string; single-character string returns that character followed by '1'; string with all same characters is one run."`
  ,
  `"Edge cases: empty string returns empty string; single-character string returns that character followed by '1'; string with all same characters is one run whose count equals the string length.",
    "Run-length encoding is one of the oldest lossless compression techniques, used in TIFF images, BMP files, and fax transmission protocols. While it offers poor compression for random data, it is excellent for highly repetitive sequences such as monochrome images or simple graphics with large uniform regions."`
);

rep(
  `"RLE compression efficiency: only beneficial when runs are long. For random strings with few runs, RLE can expand the string (each single character becomes 2 characters). This problem always encodes regardless of run length."
    ]`,
  `"RLE compression efficiency: only beneficial when runs are long. For random strings with few runs, RLE can double the output size (each single character becomes 2 characters like 'a1'). This problem always encodes regardless of run length.",
      "Decoding RLE: to reverse the encoding, scan pairs of (character, count). For each pair, repeat the character count times and append. This decoding is O(output_length) time.",
      "Variant — skip count-1 runs: a common RLE variant omits the count for runs of length 1, so 'a' stays 'a' but 'aaa' becomes 'a3'. This produces shorter output for strings with many unique characters but requires a different decoder.",
      "Correctness check: the total number of characters in all decoded runs must equal the original string length. If sum(counts) != len(original), the encoding is incorrect."
    ]`
);

// longest-same-letter-run - extend description and editorial
rep(
  `"Edge cases: empty string — return 0; single character — return 1; all same characters — return n; all different characters — return 1."`
  ,
  `"Edge cases: empty string — return 0 (handle before initialising variables to avoid accessing s[0]); single character — return 1; all same characters — return n; all different characters — return 1, since every character forms a run of length 1.",
    "This problem is equivalent to finding the maximum run in the run-length encoding of the string. If you already computed the RLE, you can find the maximum count in O(d) time where d is the number of distinct runs."`
);

rep(
  `"Relation to longest-even-streak: both problems use the same increment-and-track pattern. The difference is the condition: here 'same character', there 'even number'. The algorithm structure is identical."
    ]`,
  `"Relation to longest-even-streak: both use the same increment-on-match, reset-on-mismatch, track-maximum pattern. The only difference is the condition check (same character vs even number). Recognising this pattern across problem variants is a key skill.",
      "Two-pointer variant: alternatively, for each position i find the furthest j where s[i..j] are all equal using a second pointer. The run length is j - i. Then jump to i = j to start the next run. O(n) time with no backtracking.",
      "Performance note: this single-pass algorithm processes each character exactly once. No sorting, no hashing, no binary search. O(n) time and O(1) space makes it optimal for this problem.",
      "Common error: forgetting to update maxLen on every step and only updating on character change. If the longest run is at the end of the string, it never triggers a change, so maxLen would not be updated correctly."
    ]`
);

// count-words-simple - extend description and editorial
rep(
  `"Edge cases: empty string returns 0; string of only spaces returns 0; single word with no spaces returns 1."`
  ,
  `"Edge cases: empty string returns 0; string of only spaces returns 0; single word with no spaces returns 1; consecutive spaces between words count as a single separator and do not create empty words.",
    "This operation is fundamental to text processing. Knowing both the one-liner (split()) and the manual transition-based approach is valuable: the one-liner is idiomatic Python but the manual approach works in all languages and with O(1) space."`
);

rep(
  `"Relation to tokenisation: this is the simplest form of text tokenisation. More advanced tokenisers handle punctuation, quotes, and different whitespace characters, but the core whitespace-transition logic is the same."
    ]`,
  `"Relation to tokenisation: this is the simplest form of text tokenisation. More advanced tokenisers handle punctuation, quotes, and different whitespace characters, but the core whitespace-transition logic is the same.",
      "Time and space: the split() approach is O(n) time and O(n) space for the word list. The manual transition approach is O(n) time and O(1) space — only a boolean flag and a counter are maintained.",
      "Edge case leading/trailing spaces: s = '  hello  world  '. Manual approach: first non-space 'h' triggers count++ (count=1), then non-spaces continue inWord=true, then spaces set inWord=false, then 'w' triggers count++ (count=2). Return 2. Correct.",
      "Extension to multiple separator types: if words can also be separated by tabs or commas, replace the isspace() check with a broader separator check. The transition logic remains identical."
    ]`
);

// remove-adjacent-duplicates-once - extend description and editorial
rep(
  `"Edge cases: empty string returns empty string; string with no adjacent duplicates — nothing is removed; entire string is one pair — result is empty string."`
  ,
  `"Edge cases: empty string returns empty string; string with no adjacent duplicates — nothing is removed, original string returned; entire string is one pair like 'aa' — result is empty string; cascading pairs like 'aabb' produce empty string as each pair removes leaving new adjacent duplicates.",
    "This problem is a classic stack-based string processing question. The stack naturally handles the cascading property without explicit re-scanning: each character is processed exactly once, and the stack state always reflects the currently unmatched prefix."`
);

rep(
  `"Real-world analogy: this algorithm is used in code editor bracket matching — opening and closing brackets cancel when they meet, and the stack tracks the currently unmatched sequence."
    ]`,
  `"Real-world analogy: this algorithm is used in code editor bracket matching and text editors' undo operations. Opening and closing brackets cancel when they meet, and the stack tracks the currently unmatched sequence.",
      "Time and space: O(n) time — each character is pushed and popped at most once. O(n) space for the stack — in the worst case (no pairs) the entire string is on the stack.",
      "Variant — remove k duplicates: a harder variant removes k consecutive identical characters instead of 2. The stack stores (character, count) pairs and pops when count reaches k. Same O(n) time O(n) space approach.",
      "Correctness insight: the stack approach produces the same result as repeatedly scanning and removing pairs until no pairs remain (but in a single O(n) pass). This equivalence is not obvious but follows from the fact that adjacent pair removal is confluent."
    ]`
);

// digital-sum - extend description and editorial
rep(
  `"Applications: digit sum is used in divisibility rules (a number is divisible by 9 if its digit sum is divisible by 9), Luhn algorithm for credit card validation, and certain hash functions."`
  ,
  `"Applications: digit sum is used in divisibility rules (a number is divisible by 9 if and only if its digit sum is divisible by 9), the Luhn algorithm for credit card validation, checksum computation, and ISBN verification. These applications make digital sum a practically important operation beyond pure competitive programming."`
);

rep(
  `"Recursive variant: digitalSum(n) = n % 10 + digitalSum(n // 10) with base case digitalSum(0) = 0. Equivalent to the iterative approach but uses O(d) call stack space."
    ]`,
  `"Recursive variant: digitalSum(n) = n % 10 + digitalSum(n // 10) with base case digitalSum(0) = 0. Equivalent to the iterative approach but uses O(d) call stack space. For d up to 19 (max digits of a 64-bit integer), this is fine in practice.",
      "Iterated digital sum: repeatedly apply digital sum until a single digit remains. For example, 493 -> 16 -> 7. The final single-digit result is called the digital root and can be computed directly as 1 + (n - 1) % 9 for n > 0 (return 9 if n % 9 == 0).",
      "Digit extraction order: n % 10 extracts the least significant digit first. This order does not matter for summing (addition is commutative), but matters for other digit-manipulation problems like reversing digits.",
      "Large number handling: for n up to 10^18 (largest 64-bit unsigned integer), the maximum digit sum is 9 * 19 = 171. This fits in a small integer with no overflow risk for the accumulated sum."
    ]`
);

writeFileSync('src/lib/problems/bank.ts', src);
console.log(`Replacements made: ${n}`);
