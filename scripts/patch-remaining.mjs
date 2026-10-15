import { createPatcher } from './patcher-core.mjs';
const { patch, save } = createPatcher('src/lib/problems/bank.ts');

// Helper to build full editorial (10 items, ~45 words each = ~450 words)
const ed = (...items) => items;

// ===== BATCH 3: String problems =====

patch("first-repeated-character", {
  judgeReady: true,
  constraints: ["1 <= s.length <= 10^5", "s contains lowercase English letters.", "Return the first character that appears more than once.", "If no character repeats, return '' (empty string).", "First repeated means the first character whose second occurrence appears earliest in the string."],
  examples: [
    { input: 's = "abcbad"', output: '"b"', explanation: "'b' first appears at index 1 and repeats at index 3. 'a' repeats at index 4. 'b' repeats first." },
    { input: 's = "abcdef"', output: '""', explanation: "All characters are distinct. No character repeats." }
  ],
  description: "Given a string `s` containing only lowercase English letters, return the **first character that repeats** — specifically, the character whose second occurrence appears at the earliest index.\n\nFor example, in `'abcbad'`, the character `'b'` first appears at index 1 and appears again at index 3. The character `'a'` appears again at index 4. Since `'b'`'s second occurrence (index 3) comes before `'a'`'s second occurrence (index 4), `'b'` is the answer.\n\nThe solution uses a hash set to track seen characters. Scan left to right: for each character, check if it is already in the set. If yes, this is the first repeated character — return it. If no, add it to the set. If the loop completes without finding a repeat, return an empty string.\n\nThis runs in O(n) time and O(1) space since the character set is bounded by the alphabet size (26 lowercase letters). The hash set holds at most 26 elements.\n\nAn alternative approach uses a visited array of 26 booleans indexed by `ord(c) - ord('a')`. This is cache-friendly and avoids hash function overhead.\n\nEdge cases: single-character string — no repeat possible, return ''; string where all characters are identical — return that character immediately on the second encounter at index 1; string with no repeats — scan completes, return ''.",
  hints: [
    "Use a hash set. Scan left to right. For each character: if it is already in the set, return it. Otherwise add it to the set. Return '' if the loop ends without finding a repeat.",
    "For lowercase letters only: use a boolean array of 26 elements indexed by ord(c) - ord('a'). Check seen[index]; if true return c; otherwise set seen[index] = true.",
    "This finds the character whose SECOND occurrence is earliest, not the character that first appears duplicated. Scanning left-to-right and returning at the first hit gives the correct answer."
  ],
  sampleCases: [{ input: ["abcbad"], expected: "b" }, { input: ["abcdef"], expected: "" }],
  hiddenCases: [
    { input: ["aabbcc"], expected: "a" },
    { input: ["a"], expected: "" },
    { input: ["zxyabc"], expected: "" },
    { input: ["abacaba"], expected: "a" }
  ],
  editorial: ed(
    "Hash set approach: seen = set(). For each c in s: if c in seen, return c. Otherwise seen.add(c). After loop, return ''. O(n) time, O(1) space since at most 26 characters are stored.",
    "Why this finds the correct answer: scanning left-to-right and returning at the first match means we find the character whose second occurrence appears at the smallest index. Every character before the returned one appeared only once up to that point.",
    "Boolean array variant: seen = [False] * 26. For each c in s: idx = ord(c) - ord('a'). If seen[idx] return c. Else seen[idx] = True. Return ''. Same O(n) time, O(1) space with better cache performance.",
    "Edge case single character: the set is empty initially. After processing, seen = {c} and the loop ends. Return ''. Correct.",
    "Edge case all identical: s = 'aaa'. First 'a' adds to set. Second 'a' is already in set — return 'a'. Correct.",
    "Edge case no repeats: entire loop runs without a hit. Return ''. Correct.",
    "Distinction from 'first character appearing once': this problem asks for the first repeating character (second occurrence earliest), not the first character that appears exactly once. These are different problems with different solutions."
  )
});

patch("compress-runs", {
  judgeReady: true,
  constraints: ["0 <= s.length <= 10^5", "s contains printable ASCII characters.", "A run is a maximal sequence of the same consecutive character.", "Return the run-length encoded string: each run becomes its character followed by its count.", "If a run has length 1, still include the count (e.g. 'a' -> 'a1')."],
  examples: [
    { input: 's = "aabbbcc"', output: '"a2b3c2"', explanation: "'aa' is run of 2, 'bbb' is run of 3, 'cc' is run of 2." },
    { input: 's = "abcd"', output: '"a1b1c1d1"', explanation: "Each character is a run of length 1." }
  ],
  description: "Given a string `s`, return its **run-length encoding**. A run is a maximal sequence of the same consecutive character. Encode each run as the character followed by its count. For example, `'aabbbcc'` has runs `'aa'` (length 2), `'bbb'` (length 3), and `'cc'` (length 2), producing `'a2b3c2'`.\n\nEvery run must be encoded even if its length is 1. For example, `'abcd'` produces `'a1b1c1d1'`.\n\nThe solution scans the string from left to right, tracking the current character and a run count. When the current character changes, append the previous character and its count to the result, then start a new run. After the loop, append the last run.\n\nThis runs in O(n) time and O(n) space for the output string.\n\nRun-length encoding (RLE) is used in data compression for sequences with long runs of repeated values, such as bitmap images and simple file formats.\n\nEdge cases: empty string returns empty string; single-character string returns that character followed by '1'; string with all same characters is one run.",
  hints: [
    "Scan left to right tracking current character and its run count. When the character changes, append char + count to result and reset the counter.",
    "Handle the last run after the loop ends — don't forget to append it.",
    "Use string concatenation or a list and join at the end. Appending to a list and joining is O(n), while repeated string concatenation in a loop is O(n^2) in some languages."
  ],
  sampleCases: [{ input: ["aabbbcc"], expected: "a2b3c2" }, { input: ["abcd"], expected: "a1b1c1d1" }],
  hiddenCases: [
    { input: [""], expected: "" },
    { input: ["a"], expected: "a1" },
    { input: ["aaaa"], expected: "a4" },
    { input: ["aaabbc"], expected: "a3b2c1" }
  ],
  editorial: ed(
    "Algorithm: if s is empty, return ''. Set current = s[0], count = 1, result = []. For i from 1 to n-1: if s[i] == current, count++; else result.append(current + str(count)), current = s[i], count = 1. After loop: result.append(current + str(count)). Return ''.join(result).",
    "Why flush after the loop: the loop only flushes when the character changes. The final run never triggers a change, so it must be flushed explicitly after the loop ends. Forgetting this is the most common off-by-one error.",
    "List vs string concatenation: building a list and joining at the end is O(n) total. Repeated string concatenation with += creates a new string object each time, making it O(n^2) in Python and JavaScript. Use a list or array builder.",
    "Edge case empty string: return '' immediately without entering the main logic.",
    "Edge case single character: current = s[0], count = 1. Loop does not execute. result.append(s[0] + '1'). Return 'x1'. Correct.",
    "Edge case all same: one run. Loop increments count n-1 times. After loop, one flush. Returns the character + n as a string.",
    "RLE compression efficiency: only beneficial when runs are long. For random strings with few runs, RLE can expand the string (each single character becomes 2 characters). This problem always encodes regardless of run length."
  )
});

patch("longest-same-letter-run", {
  judgeReady: true,
  constraints: ["0 <= s.length <= 10^5", "s contains lowercase English letters.", "A run is a maximal sequence of the same consecutive character.", "Return the length of the longest run.", "If s is empty, return 0."],
  examples: [
    { input: 's = "aabbbcc"', output: "3", explanation: "'bbb' is the longest run with length 3." },
    { input: 's = "abc"', output: "1", explanation: "All runs have length 1." }
  ],
  description: "Given a string `s` of lowercase English letters, return the **length of the longest run** of the same consecutive character. A run is a maximal sequence of identical adjacent characters.\n\nFor example, in `'aabbbcc'`, the runs are `'aa'` (length 2), `'bbb'` (length 3), and `'cc'` (length 2). The longest run has length 3.\n\nThe solution scans the string while tracking the current character, the current run length, and the maximum run length seen so far. When the character changes, compare the current run with the maximum and reset the counter.\n\nThis runs in O(n) time and O(1) space — only a few integer and character variables are maintained.\n\nThis is a simpler version of the general longest-streak problem. The key insight is: maintain a current counter that increments when the same character continues and resets to 1 when a new character starts.\n\nEdge cases: empty string — return 0; single character — return 1; all same characters — return n; all different characters — return 1.",
  hints: [
    "Maintain current = s[0], count = 1, maxLen = 1. For i from 1 to n-1: if s[i] == current, count++; else current = s[i], count = 1. Update maxLen = max(maxLen, count) at each step.",
    "Update maxLen inside the loop (not just on character change) to correctly handle the case where the longest run is at the end of the string.",
    "Edge case empty string: check s is empty before the loop and return 0."
  ],
  sampleCases: [{ input: ["aabbbcc"], expected: 3 }, { input: ["abc"], expected: 1 }],
  hiddenCases: [
    { input: [""], expected: 0 },
    { input: ["aaaa"], expected: 4 },
    { input: ["a"], expected: 1 },
    { input: ["aabbaabb"], expected: 2 }
  ],
  editorial: ed(
    "Algorithm: if s is empty, return 0. current = s[0], count = 1, maxLen = 1. For i from 1 to n-1: if s[i] == current, count++; else current = s[i], count = 1. maxLen = max(maxLen, count). Return maxLen.",
    "Why update maxLen on every step not just on change: if the longest run is at the end of the string, it never triggers a character change. Only updating on change would miss this final run. Updating every iteration guarantees correctness.",
    "Alternative reset-based approach: some implementations only update maxLen when count resets. This works if you also do a final update after the loop. Both approaches are correct.",
    "Edge case empty string: return 0 immediately. The variable initialisation would fail on s[0] for an empty string.",
    "Edge case single character: the loop runs 0 iterations. Return maxLen = 1. Correct.",
    "Edge case all same: count reaches n. maxLen = n. Return n. Correct.",
    "Relation to longest-even-streak: both problems use the same increment-and-track pattern. The difference is the condition: here 'same character', there 'even number'. The algorithm structure is identical."
  )
});

patch("count-words-simple", {
  judgeReady: true,
  constraints: ["0 <= s.length <= 10^5", "s contains ASCII characters including spaces.", "Words are separated by one or more spaces.", "Return the number of words.", "An empty string or string of only spaces returns 0."],
  examples: [
    { input: 's = "hello world"', output: "2", explanation: "Two words separated by one space." },
    { input: 's = "  one  two   three  "', output: "3", explanation: "Leading/trailing spaces and multiple spaces between words are ignored." }
  ],
  description: "Given a string `s`, return the **number of words** in it. Words are sequences of non-space characters separated by one or more space characters. Leading and trailing spaces do not count as words.\n\nFor example, `'hello world'` has 2 words. `'  one  two   three  '` also has 3 words — the extra spaces are ignored.\n\nThe simplest approach in Python is `len(s.split())`. The `split()` method with no arguments splits on any whitespace and automatically ignores leading, trailing, and multiple consecutive spaces.\n\nFor a manual implementation: scan left to right tracking whether you are currently inside a word or in whitespace. When you transition from whitespace to a non-space character, increment the word count. Return the count after the loop.\n\nThis runs in O(n) time and O(1) space for the manual approach (O(n) for split which creates a list).\n\nEdge cases: empty string returns 0; string of only spaces returns 0; single word with no spaces returns 1.",
  hints: [
    "In Python: return len(s.split()). split() with no arguments handles all whitespace cases correctly.",
    "Manual approach: track a boolean 'inWord'. For each character: if non-space and not inWord, count++, inWord = true. If space, inWord = false. Return count.",
    "The transition from whitespace to non-space marks the start of a new word. You only need to count these transitions, not the words themselves."
  ],
  sampleCases: [{ input: ["hello world"], expected: 2 }, { input: ["  one  two   three  "], expected: 3 }],
  hiddenCases: [
    { input: [""], expected: 0 },
    { input: ["   "], expected: 0 },
    { input: ["word"], expected: 1 },
    { input: ["a b c d e"], expected: 5 }
  ],
  editorial: ed(
    "Python one-liner: return len(s.split()). s.split() with no argument splits on any whitespace run and filters empty strings from leading/trailing/multiple spaces. O(n) time, O(n) space for the word list.",
    "Manual transition counting: inWord = False, count = 0. For each c in s: if not c.isspace() and not inWord: count++, inWord = True. Elif c.isspace(): inWord = False. Return count. O(n) time, O(1) space.",
    "Why count transitions not characters: a word can be many characters long. Counting characters and dividing is not correct because word lengths vary. Counting the 'whitespace to non-space' transition gives exactly one count per word.",
    "Edge case empty string: s.split() returns []. len([]) = 0. Manual: loop never executes, count = 0. Both return 0.",
    "Edge case only spaces: s.split() returns []. Manual: every character is a space, inWord stays False, count stays 0. Return 0.",
    "Edge case single word no spaces: s.split() returns [word]. Manual: first character triggers count++, loop ends with count = 1. Return 1.",
    "Relation to tokenisation: this is the simplest form of text tokenisation. More advanced tokenisers handle punctuation, quotes, and different whitespace characters, but the core whitespace-transition logic is the same."
  )
});

patch("remove-adjacent-duplicates-once", {
  judgeReady: true,
  constraints: ["0 <= s.length <= 10^5", "s contains lowercase English letters.", "Remove all adjacent duplicate pairs in a single pass.", "Only one round of removal — do not repeat until stable.", "Return the result string."],
  examples: [
    { input: 's = "abbaca"', output: '"aaca"', explanation: "'bb' is an adjacent pair. Removing it gives 'aaca'. 'aa' would be another pair but only one pass is done." },
    { input: 's = "azxxzy"', output: '"ay"', explanation: "'xx' is removed to get 'azzy'. Then 'zz' is removed to get 'ay'. Stack removes cascading pairs naturally." }
  ],
  description: "Given a string `s` of lowercase letters, remove all **adjacent duplicate pairs** and return the result. An adjacent duplicate pair is two consecutive identical characters. Remove them in a single pass and return the resulting string.\n\nFor example, in `'abbaca'`, the pair `'bb'` is adjacent. Removing it gives `'aaca'`. Note: this is a single-pass removal — we do not repeatedly remove pairs until no pairs remain.\n\nHowever, a stack-based approach naturally handles cascading removals: as characters are popped and pushed, newly adjacent characters that form pairs are automatically removed. For example, `'azxxzy'`: push 'a', push 'z', 'x' != 'z' push 'x', 'x' == 'x' pop 'x' (pair removed), 'z' == 'z' pop 'z' (new pair formed), push 'y' (since 'a' != 'y'). Result: 'ay'.\n\nThe stack approach: maintain a stack (or array). For each character: if the stack is non-empty and the top equals the current character, pop the top (remove the pair). Otherwise push the current character. Join the stack at the end.\n\nThis runs in O(n) time and O(n) space for the stack.\n\nEdge cases: empty string returns empty string; string with no adjacent duplicates — nothing is removed; entire string is one pair — result is empty string.",
  hints: [
    "Use a stack. For each character c: if the stack is non-empty and stack.top() == c, pop (remove the pair). Otherwise push c. Join stack at end.",
    "The stack naturally handles cascading pairs: when a pair is removed, the characters underneath become adjacent and may form a new pair, which is handled by the next iteration.",
    "For a single-pass-only implementation (no cascading): scan and keep only characters that are not equal to their immediate neighbor."
  ],
  sampleCases: [{ input: ["abbaca"], expected: "aaca" }, { input: ["azxxzy"], expected: "ay" }],
  hiddenCases: [
    { input: [""], expected: "" },
    { input: ["aa"], expected: "" },
    { input: ["abcd"], expected: "abcd" },
    { input: ["aabbcc"], expected: "" }
  ],
  editorial: ed(
    "Stack algorithm: stack = []. For each c in s: if stack and stack[-1] == c: stack.pop() (pair removed). Else stack.append(c). Return ''.join(stack). O(n) time, O(n) space.",
    "Why stack handles cascading: when 'xx' is removed from 'azxxzy', the 'z' and 'z' are now adjacent. The stack processes characters one at a time, so when 'z' is encountered and the top of stack is also 'z', they form a pair and are removed. No second pass needed.",
    "Pure single-pass without cascading: for s = 'abbaca', scan and skip character i if s[i] == s[i-1] (or compare to next). This is simpler but does not handle cascading. The stack approach is more general.",
    "Edge case empty string: loop never executes. Return ''.join([]) = ''. Correct.",
    "Edge case no duplicates: every character passes the stack check (top != current). Stack becomes the full string. Return original string.",
    "Edge case all pairs: 'aabb' -> stack: push 'a', 'a'='a' pop, push 'b', 'b'='b' pop. Stack empty. Return ''.",
    "Real-world analogy: this algorithm is used in code editor bracket matching — opening and closing brackets cancel when they meet, and the stack tracks the currently unmatched sequence."
  )
});

patch("digital-sum", {
  judgeReady: true,
  constraints: ["0 <= n <= 10^18 (fits in 64-bit integer)", "Return the sum of the decimal digits of n.", "If n is 0, return 0.", "n is always non-negative."],
  examples: [
    { input: "n = 493", output: "16", explanation: "4 + 9 + 3 = 16." },
    { input: "n = 0", output: "0", explanation: "Single digit 0 sums to 0." }
  ],
  description: "Given a non-negative integer `n`, return the **sum of its decimal digits**. For example, `493` has digits 4, 9, and 3, which sum to 16.\n\nThe arithmetic approach: repeatedly extract the last digit using `n % 10`, add it to the sum, then remove the last digit with integer division `n = n // 10`. Continue until `n` becomes 0.\n\nThe string approach: convert `n` to a string, iterate over each character, convert each character back to an integer, and sum them all. This is `sum(int(c) for c in str(n))`.\n\nBoth approaches are O(d) time where d is the number of digits (d = floor(log10(n)) + 1). For n up to 10^18, d is at most 19, making both approaches effectively O(1) for practical purposes.\n\nEdge cases: n = 0 — the digit sum is 0; single-digit n — the sum is n itself; n = 10^18 — the digit sum is 1 + 9 * 17 = 154 for the maximum value.\n\nApplications: digit sum is used in divisibility rules (a number is divisible by 9 if its digit sum is divisible by 9), Luhn algorithm for credit card validation, and certain hash functions.",
  hints: [
    "Arithmetic approach: while n > 0: sum += n % 10, n = n // 10. Handle n=0 before the loop (digit sum of 0 is 0).",
    "String approach: return sum(int(c) for c in str(n)). Works for all non-negative integers including 0.",
    "Both approaches are O(d) where d = number of digits. For n <= 10^18, d <= 19, so both are effectively O(1)."
  ],
  sampleCases: [{ input: [493], expected: 16 }, { input: [0], expected: 0 }],
  hiddenCases: [
    { input: [1], expected: 1 },
    { input: [999], expected: 27 },
    { input: [100], expected: 1 },
    { input: [123456789], expected: 45 }
  ],
  editorial: ed(
    "Arithmetic approach: total = 0. While n > 0: total += n % 10, n //= 10. Return total. O(d) time where d is the number of digits, O(1) space.",
    "String approach: return sum(int(c) for c in str(n)). Converts n to a string once O(d), then iterates once more O(d). Total O(d) time, O(d) space for the string.",
    "Why n % 10 extracts the last digit: in base 10, n % 10 gives the remainder when divided by 10, which is exactly the units digit.",
    "Edge case n = 0: the while loop condition n > 0 is false immediately. total = 0. Return 0. Correct. The string approach: str(0) = '0', sum(int(c) for c in '0') = 0. Also correct.",
    "Edge case single digit: exactly one iteration. total = n. Return n. Correct.",
    "Divisibility rule application: if digitalSum(n) is divisible by 9, then n is divisible by 9. This is a useful property from modular arithmetic — the digit sum of n is congruent to n modulo 9.",
    "Recursive variant: digitalSum(n) = n % 10 + digitalSum(n // 10) with base case digitalSum(0) = 0. Equivalent to the iterative approach but uses O(d) call stack space."
  )
});

save();
