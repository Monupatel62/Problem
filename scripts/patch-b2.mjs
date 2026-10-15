import { createPatcher } from './patcher-core.mjs';
const { patch, save } = createPatcher('src/lib/problems/bank.ts');

patch("count-balanced-prefixes", {
  judgeReady: true,
  constraints: [
    "1 <= nums.length <= 10^5",
    "Each element of nums is exactly 1 or -1.",
    "A balanced prefix has a cumulative sum of zero.",
    "Return the count of balanced prefixes.",
    "An empty prefix (length 0) is not counted."
  ],
  examples: [
    { input: "nums = [1,-1,1,-1,-1]", output: "2",
      explanation: "Prefix [1,-1] sums to 0 (length 2). Prefix [1,-1,1,-1] sums to 0 (length 4). Two balanced prefixes." },
    { input: "nums = [1,1,-1,-1]", output: "1",
      explanation: "Only the full prefix [1,1,-1,-1] has sum 0. Prefix [1,1] sums to 2. Count = 1." }
  ],
  description: "Given an array `nums` containing only `1` and `-1`, count the number of prefixes whose running sum equals exactly zero. A prefix of length `k` is the subarray `nums[0..k-1]`. A prefix is balanced if it contains an equal number of `1`s and `-1`s, making its cumulative sum zero.\n\nFor example, in `[1, -1, 1, -1, -1]`, the prefix `[1, -1]` (length 2) has sum 0, and `[1, -1, 1, -1]` (length 4) has sum 0. The full array has sum -1. Answer is 2.\n\nThe solution maintains a running prefix sum as it scans left to right. Whenever the running sum equals 0, increment a counter. Return the counter after the full scan. O(n) time, O(1) space.\n\nThis is simpler than the general subarray-sum-equals-target because we only care about prefixes starting at index 0, not arbitrary subarrays. For arbitrary subarrays you would need a hash map of prefix sums.\n\nEdge cases: if the first element is -1, no prefix of length 1 is balanced since sum = -1; an all-1s array never produces sum 0; an alternating [1,-1,1,-1,...] array produces a balanced prefix at every even length.\n\nRelation to the classic balanced parentheses problem: treating 1 as an open bracket and -1 as a close bracket, a balanced prefix corresponds to a complete matched bracket sequence at that position.",
  hints: [
    "Maintain a running prefix sum. For each index i, add nums[i] to the sum. If the sum equals 0, increment the balanced count.",
    "You do not need a hash map here — just check if the running sum equals 0 after each element.",
    "The prefix sum equals 0 exactly when the count of 1s equals the count of -1s seen so far."
  ],
  sampleCases: [
    { input: [[1,-1,1,-1,-1]], expected: 2 },
    { input: [[1,1,-1,-1]], expected: 1 }
  ],
  hiddenCases: [
    { input: [[1,-1]], expected: 1 },
    { input: [[1,1,1]], expected: 0 },
    { input: [[1,-1,1,-1,1,-1]], expected: 3 },
    { input: [[-1,1,-1,1]], expected: 2 }
  ],
  editorial: [
    "Algorithm: prefixSum = 0, count = 0. For each value in nums: prefixSum += value. If prefixSum == 0, count++. Return count. O(n) time, O(1) space.",
    "Why only check for zero: the running sum after processing index i is exactly prefix[0..i]. We want that to be 0. No hash map needed because the start index is always 0.",
    "Contrast with subarray-sum-k: for arbitrary subarrays, you would store prefix sums in a hash map and count pairs (i,j) where prefix[j] - prefix[i] = k. Here k=0 and i is always 0, so just count how many times the prefix sum hits 0.",
    "Edge case empty-like: if nums contains no balanced prefix (e.g. all 1s), the running sum never returns to 0. Count stays 0. Return 0.",
    "Alternating array: [1,-1,1,-1] produces prefix sums 1, 0, 1, 0. Two zeros — count = 2. The sum oscillates between 0 and 1.",
    "Relation to balanced brackets: 1 = open bracket, -1 = close bracket. A balanced prefix is one where the bracket sequence is fully matched at that point. This analogy helps reason about when the sum can return to zero.",
    "Time and space: O(n) time for a single pass. O(1) extra space since only two integer variables are maintained regardless of input size."
  ]
});

patch("rotate-right-once", {
  judgeReady: true,
  constraints: [
    "0 <= nums.length <= 10^5",
    "Rotate the array to the right by exactly one position.",
    "The last element wraps around to become the first element.",
    "-10^9 <= nums[i] <= 10^9",
    "Modify the array in-place and return it."
  ],
  examples: [
    { input: "nums = [1,2,3,4]", output: "[4,1,2,3]",
      explanation: "Last element 4 moves to index 0. All others shift right by one." },
    { input: "nums = [7]", output: "[7]",
      explanation: "Single-element array is unchanged after any rotation." }
  ],
  description: "Given an integer array `nums`, rotate it to the **right by exactly one position** and return the modified array. A right rotation by one step means the last element moves to the front: `[1, 2, 3, 4]` becomes `[4, 1, 2, 3]`.\n\nFor a two-element array `[a, b]`, the result is `[b, a]`. For a single-element or empty array, the result is unchanged.\n\nThis is a special case of the general rotate-array problem with `k = 1`. The most readable approach: save `last = nums[n-1]`, shift elements one position right (move `nums[i]` to `nums[i+1]` for `i` from `n-2` down to `0`), then write `last` to `nums[0]`. O(n) time, O(1) space.\n\nAn alternative uses array slicing: return `[nums[n-1], ...nums.slice(0, n-1)]`. This is O(n) time and O(n) space — simpler to write but uses extra memory.\n\nThe three-reversal trick also works: reverse all, then reverse `nums[0..0]` (no-op), then reverse `nums[1..n-1]`. For k=1 specifically, this reduces to saving the last element, reversing the remaining, and placing the saved element at front.\n\nShifting must go right-to-left: `nums[i] = nums[i-1]` for `i` from `n-1` down to `1`. If done left-to-right, each assignment overwrites the value that the next step needs.\n\nEdge cases: empty array — return immediately; single element — no shift needed; two elements — swap them.",
  hints: [
    "Save last = nums[n-1]. Shift right-to-left: nums[i] = nums[i-1] for i from n-1 down to 1. Set nums[0] = last.",
    "Alternative: return [nums[n-1]].concat(nums.slice(0, n-1)). O(n) space but one line.",
    "Handle empty or length-1 arrays first — return nums directly without any operations."
  ],
  sampleCases: [
    { input: [[1,2,3,4]], expected: [4,1,2,3] },
    { input: [[7]], expected: [7] }
  ],
  hiddenCases: [
    { input: [[1,2]], expected: [2,1] },
    { input: [[1,2,3]], expected: [3,1,2] },
    { input: [[5,4,3,2,1]], expected: [1,5,4,3,2] },
    { input: [[]], expected: [] }
  ],
  editorial: [
    "In-place shift: save last = nums[n-1]. For i from n-1 down to 1: nums[i] = nums[i-1]. Set nums[0] = last. O(n) time, O(1) space.",
    "Why right-to-left shift: shifting left-to-right overwrites nums[i+1] before it is saved, losing data. Right-to-left copies each element into its destination before that position is overwritten.",
    "Slice approach: [nums[n-1]].concat(nums.slice(0, n-1)) creates a new array. Simple and correct but O(n) extra space.",
    "Empty array edge case: n = 0, the loop runs 0 times. Nothing changes. Return empty array. Correct.",
    "Single element edge case: n = 1, last = nums[0], inner loop runs 0 times, nums[0] = last (unchanged). Correct.",
    "Relation to rotate-array: this is rotate-array with k=1. The three-reversal approach (reverse all, reverse first k, reverse last n-k) also produces the correct result. For k=1 it simplifies to saving last, shifting right, placing at front.",
    "Connection to circular buffers: right-rotation-by-one is equivalent to dequeue from the back and enqueue at the front, a common operation in circular buffer and round-robin scheduler implementations."
  ]
});

patch("missing-zero-to-n", {
  judgeReady: true,
  constraints: [
    "1 <= nums.length <= 10^5",
    "All values in nums are distinct integers in the range [0, n] where n = nums.length.",
    "Exactly one integer from 0 to n is missing.",
    "Return that missing integer.",
    "No negative numbers appear in the input."
  ],
  examples: [
    { input: "nums = [3,0,1]", output: "2",
      explanation: "n=3. Range is [0,3]. Values 0,1,3 are present. Value 2 is missing." },
    { input: "nums = [9,6,4,2,3,5,7,0,1]", output: "8",
      explanation: "n=9. All integers 0..9 except 8 are present." }
  ],
  description: "Given an integer array `nums` of length `n` containing `n` distinct integers from the range `[0, n]`, find and return the **one missing value**. Since the range `[0, n]` has `n+1` possible values and the array holds only `n` of them, exactly one is always absent.\n\nFor example, `[3, 0, 1]` has length 3. The range is 0 to 3. The values 0, 1, and 3 are present; the missing value is 2.\n\nThe optimal O(n) time O(1) space solution uses the **Gauss sum formula**: the expected sum of 0 through n is `n * (n+1) / 2`. The actual sum of the array is that expected sum minus the missing value. So `missing = expectedSum - actualSum`.\n\nAn alternative O(n) time O(1) space solution uses **XOR**: XOR all values from 0 to n, then XOR with all array elements. Each value that appears in both cancels out (since `a XOR a = 0`), leaving only the missing value.\n\nA third approach uses a boolean visited array of size n+1: mark each `nums[i]` as seen, then find the unmarked index. This uses O(n) space.\n\nOverflow note: for n = 10^5, the sum n*(n+1)/2 is about 5*10^9, which exceeds a 32-bit signed integer. Use 64-bit arithmetic or a language with arbitrary-precision integers.\n\nEdge cases: missing 0, missing n, single-element array `[0]` has n=1 and missing = 1.",
  hints: [
    "Gauss sum: expected = n*(n+1)/2 where n = nums.length. actual = sum of all array elements. Return expected - actual.",
    "XOR: result = n. For i from 0 to n-1: result ^= i ^ nums[i]. Return result. Each paired value cancels, leaving only the missing one.",
    "Watch for overflow when n is large — use 64-bit integers or Python/JavaScript where integers handle large values natively."
  ],
  sampleCases: [
    { input: [[3,0,1]], expected: 2 },
    { input: [[9,6,4,2,3,5,7,0,1]], expected: 8 }
  ],
  hiddenCases: [
    { input: [[0]], expected: 1 },
    { input: [[1]], expected: 0 },
    { input: [[0,1,2,3]], expected: 4 },
    { input: [[1,2,3,4,5]], expected: 0 }
  ],
  editorial: [
    "Gauss sum: expected = n*(n+1)/2 where n = nums.length. actual = sum of all nums[i]. Return expected - actual. O(n) time, O(1) space.",
    "Why it works: integers 0..n sum to n*(n+1)/2 by the arithmetic series formula. The actual array sum equals that minus the one missing value. Subtracting gives the missing value directly.",
    "XOR approach: result = n. For i in 0..n-1: result ^= i ^ nums[i]. Since a^a=0 and XOR is commutative, every value appearing in both 0..n and nums cancels, leaving the unpaired missing value.",
    "Visited array: create bool visited[n+1]. For each x in nums, visited[x] = true. Scan for visited[i] == false. O(n) time, O(n) space. Simpler to reason about but uses more memory.",
    "Overflow: n=10^5 gives n*(n+1)/2 ≈ 5*10^9, exceeding 32-bit signed int max (~2.1*10^9). Use long in Java, int64 in C++, or rely on Python/JavaScript.",
    "Edge case missing 0: actual = sum(1..n) = n*(n+1)/2 - 0 = n*(n+1)/2 but wait — sum(0..n) - sum(1..n) = 0. Correct.",
    "Edge case missing n: expected = n*(n+1)/2, actual = sum(0..n-1) = n*(n-1)/2. Difference = n*(n+1)/2 - n*(n-1)/2 = n. Return n. Correct."
  ]
});

patch("reverse-clean-string", {
  judgeReady: true,
  constraints: [
    "0 <= s.length <= 10^5",
    "s contains printable ASCII characters.",
    "Remove all non-alphabetic characters (digits, spaces, punctuation).",
    "Reverse the remaining alphabetic characters.",
    "Preserve the original case of each letter."
  ],
  examples: [
    { input: 's = "a b c"', output: '"cba"',
      explanation: "Remove spaces, reverse letters a,b,c to get c,b,a." },
    { input: 's = "h3llo!"', output: '"ollh"',
      explanation: "Remove '3' and '!', keep 'h','l','l','o'. Reversed: 'o','l','l','h' = 'ollh'." }
  ],
  description: "Given a string `s`, return a new string formed by **removing all non-alphabetic characters** and then **reversing** the remaining letters. Preserve the original case of each letter.\n\nFor example, `'a b c'` removes the spaces to get `'abc'`, then reverses to produce `'cba'`. For `'h3llo!'`, remove `'3'` and `'!'` to get `'hllo'`, then reverse to produce `'ollh'`.\n\nTwo-step approach: filter the string to keep only characters where `isalpha()` is true, collecting them into a list. Then reverse the list and join into a string. In Python: `''.join(reversed([c for c in s if c.isalpha()]))`. In JavaScript: `s.replace(/[^a-zA-Z]/g, '').split('').reverse().join('')`.\n\nAlternatively, collect letters into an array and reverse in-place using two pointers: left and right start at each end of the filtered array; swap while left < right.\n\nCase preservation: `isalpha()` and `/[a-zA-Z]/` both accept uppercase and lowercase without changing them. Reversing only changes the order of characters, not their case.\n\nEdge cases: empty string returns empty string; string with no letters (e.g. `'123'`) returns empty string; string with only letters behaves like standard string reversal; mixed case like `'aBc'` reversed becomes `'cBa'`.",
  hints: [
    "Step 1: filter the string keeping only alphabetic characters. Step 2: reverse the filtered result.",
    "Python: ''.join(reversed([c for c in s if c.isalpha()])). JavaScript: s.replace(/[^a-zA-Z]/g, '').split('').reverse().join('').",
    "Two-pointer in-place: collect letters into array arr. left=0, right=len-1. While left < right: swap arr[left] and arr[right], left++, right--."
  ],
  sampleCases: [
    { input: ["a b c"], expected: "cba" },
    { input: ["h3llo!"], expected: "ollh" }
  ],
  hiddenCases: [
    { input: [""], expected: "" },
    { input: ["123"], expected: "" },
    { input: ["Hello World"], expected: "dlroWolleH" },
    { input: ["aBcDeF"], expected: "FeDcBa" }
  ],
  editorial: [
    "Two-step: letters = [c for c in s if c.isalpha()]. Return ''.join(reversed(letters)). O(n) time, O(n) space for the filtered list.",
    "Why filter first: separates the concern of identifying relevant characters from the concern of reversing. Cleaner and easier to reason about than a single combined pass.",
    "Two-pointer in-place: letters = [c for c in s if c.isalpha()], left=0, right=len-1. While left < right: swap letters[left] and letters[right], then left++, right--. O(n) time, O(n) space for the array.",
    "Case preservation: isalpha() does not change case, it only tests membership. The filter keeps each character exactly as it appears. Reversal changes position, not case.",
    "Edge case empty string: filter produces []. Reversed [] is []. Joined is ''. Return ''. Correct.",
    "Edge case no letters: filter produces []. Same as empty string case. Return ''.",
    "Distinction from standard reversal: a plain string reverse would move spaces and punctuation too. This problem removes them first. Confusing the two is the most common mistake."
  ]
});

patch("count-vowels", {
  judgeReady: true,
  constraints: [
    "0 <= s.length <= 10^5",
    "s contains printable ASCII characters.",
    "Count only the vowels a, e, i, o, u in both lowercase and uppercase.",
    "Return the total count of vowel characters.",
    "Digits, spaces, and consonants are not counted."
  ],
  examples: [
    { input: 's = "hello"', output: "2",
      explanation: "'e' and 'o' are vowels. 'h','l','l' are not. Count = 2." },
    { input: 's = "AEiou"', output: "5",
      explanation: "All 5 characters are vowels (case-insensitive). Count = 5." }
  ],
  description: "Given a string `s`, return the **count of vowel characters** it contains. The vowels are `a`, `e`, `i`, `o`, `u` in both lowercase and uppercase — a total of 10 distinct characters.\n\nFor example, `'hello'` contains `'e'` and `'o'` as vowels, giving a count of 2. The string `'AEiou'` has all 5 vowel letters (in uppercase and lowercase), giving 5.\n\nThe solution is a single pass through the string: initialise a counter to 0. For each character, check if it belongs to the vowel set `{'a','e','i','o','u','A','E','I','O','U'}`. If so, increment the counter. Return the counter.\n\nMembership testing in a fixed-size set is O(1). In Python `c.lower() in 'aeiou'` works cleanly by normalising to lowercase first. In JavaScript `'aeiouAEIOU'.includes(c)` or a Set lookup both work.\n\nAn alternative converts the entire string to lowercase first, then counts each of the 5 vowel characters. This is also O(n) time.\n\nEdge cases: empty string returns 0; string with no vowels (all consonants or digits) returns 0; string consisting entirely of vowels returns the string length; counting is case-insensitive so both `'A'` and `'a'` contribute.",
  hints: [
    "Use a set containing {'a','e','i','o','u','A','E','I','O','U'}. For each character in s, if it is in the set, increment count.",
    "Alternatively, convert each character to lowercase and check if it is in 'aeiou'. Avoids listing all 10 variants.",
    "Single pass with O(1) set lookup: vowels = set('aeiouAEIOU'); count = sum(1 for c in s if c in vowels)."
  ],
  sampleCases: [
    { input: ["hello"], expected: 2 },
    { input: ["AEiou"], expected: 5 }
  ],
  hiddenCases: [
    { input: [""], expected: 0 },
    { input: ["bcdfg"], expected: 0 },
    { input: ["aeiou"], expected: 5 },
    { input: ["The quick brown fox"], expected: 5 }
  ],
  editorial: [
    "Single pass: vowels = set('aeiouAEIOU'), count = 0. For each c in s: if c in vowels, count++. Return count. O(n) time, O(1) space (set is fixed size 10).",
    "Set membership is O(1): the vowel set always has exactly 10 elements. Checking membership in a hash set is constant time regardless of string length.",
    "Case normalisation: c.lower() in 'aeiou' converts each character to lowercase before checking, reducing the lookup set to 5 elements. Equivalent result, slightly simpler code.",
    "Edge case empty string: loop never executes. Return 0. Correct.",
    "Edge case all consonants or digits: no character passes the vowel test. Return 0.",
    "Edge case all vowels: every character increments count. Return len(s). Correct.",
    "Generalisation: replace the vowel set with any fixed character set to count specific characters. This O(n) time O(1) space pattern works for counting digits, spaces, specific letters, or any predefined character class."
  ]
});

patch("is-soft-palindrome", {
  judgeReady: true,
  constraints: [
    "0 <= s.length <= 10^5",
    "s contains printable ASCII characters.",
    "Ignore non-alphanumeric characters (spaces, punctuation, digits).",
    "Treat uppercase and lowercase letters as equal.",
    "An empty string after filtering is considered a palindrome."
  ],
  examples: [
    { input: 's = "A man a plan a canal Panama"', output: "true",
      explanation: "After removing spaces and lowercasing: 'amanaplanacanalpanama'. Reads the same forwards and backwards." },
    { input: 's = "race a car"', output: "false",
      explanation: "After filtering: 'raceacar'. Reversed: 'racaecr'. Not equal." }
  ],
  description: "Given a string `s`, determine whether it is a **palindrome** after ignoring non-alphanumeric characters and treating letters as case-insensitive. A string is a palindrome if it reads the same forwards and backwards.\n\nFor example, `'A man a plan a canal Panama'` becomes `'amanaplanacanalpanama'` after removing spaces and lowercasing — this is a palindrome. The string `'race a car'` becomes `'raceacar'`, which is not a palindrome.\n\nThis variant is called a soft or relaxed palindrome check because it tolerates punctuation, spaces, and case differences.\n\nApproach 1 — filter and compare: extract only alphanumeric characters, lowercase them, form a string `cleaned`. Return `cleaned == cleaned.reversed()`.\n\nApproach 2 — two pointers O(1) space: use `left = 0` and `right = n-1`. Skip non-alphanumeric on each side. Compare characters (case-insensitive) at left and right. If they differ, return false. If pointers cross without mismatch, return true.\n\nEdge cases: empty string after filtering is vacuously a palindrome; single alphanumeric character is a palindrome; all same characters are a palindrome; `'0P'` is not a palindrome because `'0' != 'p'`.",
  hints: [
    "Filter and compare: extract only alphanumeric characters, lowercase them, check if the resulting string equals its reverse.",
    "Two-pointer O(1) space: left=0, right=n-1. Skip non-alphanumeric on both sides. Compare lowercased chars at both pointers. If mismatch, return false.",
    "Alphanumeric check: c.isalnum() in Python, /[a-zA-Z0-9]/.test(c) in JavaScript."
  ],
  sampleCases: [
    { input: ["A man a plan a canal Panama"], expected: true },
    { input: ["race a car"], expected: false }
  ],
  hiddenCases: [
    { input: [""], expected: true },
    { input: ["a"], expected: true },
    { input: ["ab"], expected: false },
    { input: ["0P"], expected: false }
  ],
  editorial: [
    "Filter approach: cleaned = [c.lower() for c in s if c.isalnum()]. Return cleaned == cleaned[::-1]. O(n) time, O(n) space.",
    "Why filter first: spaces, punctuation, and case are irrelevant to this definition. Filtering separates character classification from palindrome checking.",
    "Two-pointer O(1) space: left=0, right=len(s)-1. While left < right: skip s[left] if not alnum (left++); skip s[right] if not alnum (right--); if both alnum: if s[left].lower() != s[right].lower() return false; else left++, right--. Return true.",
    "Edge case empty after filter: cleaned = []. An empty array reversed is itself. Return true. Correct.",
    "Edge case single character: cleaned = [c]. Single element reversed is itself. Return true.",
    "Edge case all non-alphanumeric: cleaned = []. Return true (vacuous palindrome). Two-pointer skips everything and crosses without any comparison.",
    "This is LeetCode 125 (Valid Palindrome). It tests string cleaning, two-pointer technique, and palindrome definition simultaneously — one of the most commonly asked entry-level string problems."
  ]
});

save();
