// Expand batch 2 entries to meet word thresholds
import { createPatcher } from './patcher-core.mjs';
const { patch, save } = createPatcher('src/lib/problems/bank.ts');

// For each, we add extra editorial items and expand description
// using existing fields as base + new editorial array replacement

patch("count-balanced-prefixes", {
  description: "Given an array `nums` containing only `1` and `-1`, count the number of prefixes whose running sum equals exactly zero. A prefix of length `k` is the subarray `nums[0..k-1]`. A prefix is balanced if it contains an equal number of `1`s and `-1`s, making its cumulative sum zero.\n\nFor example, in `[1, -1, 1, -1, -1]`, the prefix `[1, -1]` (length 2) has sum 0, and `[1, -1, 1, -1]` (length 4) has sum 0. The full array has sum -1, so it is not balanced. The answer is 2.\n\nThe algorithm maintains a running prefix sum as it scans left to right. Whenever the running sum reaches 0, the subarray from index 0 to the current position is balanced, so increment a counter. Return the counter after the full scan. This is O(n) time and O(1) space — no auxiliary data structures are needed.\n\nThis is a simpler version of the general subarray-sum-equals-target problem. In the general case you would need a hash map mapping each prefix sum to how many times it has been seen. Here, since the start is always index 0 and the target is 0, you only need to check if the running sum equals 0 — no pairs to look up.\n\nEdge cases: if the first element is -1, no prefix of length 1 is balanced; an all-1s array never returns to 0; an alternating `[1,-1,1,-1,...]` array produces a balanced prefix at every even length.",
  editorial: [
    "Algorithm: prefixSum = 0, count = 0. For each value in nums: prefixSum += value. If prefixSum == 0, increment count. Return count. O(n) time, O(1) space.",
    "Why only check for zero: the running sum after processing index i is exactly the prefix sum of nums[0..i]. We want that sum to be 0. The start index is always 0, so no hash map or pair-matching is needed.",
    "Contrast with subarray-sum-k (general case): for arbitrary subarrays you store prefix sums in a hash map and count pairs (i,j) where prefix[j] - prefix[i] = k. Here k=0 and i is always 0, so a single comparison suffices.",
    "Alternating array example: nums = [1,-1,1,-1]. Prefix sums are 1, 0, 1, 0. The running sum hits 0 at indices 1 and 3. Count = 2. The sum alternates between 1 and 0 because each pair cancels.",
    "All-1s edge case: prefix sums are 1, 2, 3, ... and never return to 0. Count stays 0. Return 0.",
    "Relation to balanced brackets: treating 1 as an open bracket and -1 as a close bracket, a balanced prefix corresponds to a complete matched bracket sequence at that point. This analogy helps reason about when the sum can return to zero.",
    "Time and space summary: O(n) for a single scan through nums. O(1) extra space — only prefixSum and count are maintained, regardless of input length. No arrays, sets, or maps are allocated."
  ]
});

patch("rotate-right-once", {
  description: "Given an integer array `nums`, rotate it to the **right by exactly one position** and return the modified array. A right rotation by one step moves the last element to the front: `[1, 2, 3, 4]` becomes `[4, 1, 2, 3]`. All elements shift one index to the right, and the last element wraps around to index 0.\n\nFor a two-element array `[a, b]`, the result is `[b, a]`. For a single-element or empty array, the result is unchanged since there is no element to wrap.\n\nThis is a special case of the general rotate-array problem with `k = 1`. The cleanest in-place approach: save `last = nums[n-1]`, then shift elements one position to the right by iterating from `n-2` down to `0` and setting `nums[i+1] = nums[i]`. Finally, set `nums[0] = last`. This is O(n) time and O(1) extra space.\n\nShifting must go from right to left: iterating left to right would overwrite each element before the next position uses it, causing data loss. Right-to-left iteration copies each element into its destination before that position is overwritten.\n\nAn alternative creates a new array: `[nums[n-1]].concat(nums.slice(0, n-1))`. Simpler to write but O(n) space.\n\nEdge cases: empty array — return immediately; single element — no rotation needed; two elements — equivalent to swapping them.",
  editorial: [
    "In-place shift: save last = nums[n-1]. For i from n-1 down to 1: nums[i] = nums[i-1]. Set nums[0] = last. O(n) time, O(1) space.",
    "Why right-to-left shift: if you iterate left-to-right with nums[i+1] = nums[i], each step overwrites the value that the next step will need to copy. Right-to-left copies each element into its new position before that position receives anything from the left.",
    "Slice approach: [nums[n-1]].concat(nums.slice(0, n-1)) creates a new array without mutating the original. This is O(n) space but the code is much shorter and easier to read.",
    "Empty array edge case: n = 0. The loop runs 0 times. Nothing changes. The original (empty) array is returned unchanged.",
    "Single element edge case: n = 1. last = nums[0]. Inner loop runs from 0 down to 1, which is zero iterations. nums[0] = last (unchanged). The single element is returned as-is.",
    "Relation to rotate-array: this problem is rotate-array with k=1. The three-reversal approach (reverse all, reverse first k, reverse last n-k) also works and is O(n) time O(1) space. For k=1 specifically, it simplifies to: reverse full array, reverse nums[1..n-1].",
    "Connection to circular buffers: right-rotation-by-one is equivalent to dequeue from the back and enqueue at the front. This is a fundamental circular buffer and round-robin scheduler operation, and understanding it builds intuition for more complex cyclic data structure manipulations."
  ]
});

patch("missing-zero-to-n", {
  description: "Given an integer array `nums` of length `n` containing `n` distinct integers from the range `[0, n]`, find and return the **one missing value**. The range `[0, n]` has `n+1` possible values (zero through n), and the array holds only `n` of them, so exactly one integer is always absent.\n\nFor example, `[3, 0, 1]` has length 3. The range is 0 to 3. The values 0, 1, and 3 are present; the missing value is 2.\n\nThe optimal O(n) time O(1) space solution uses the **Gauss sum formula**: the expected sum of all integers from 0 to n is `n * (n+1) / 2`. The actual sum of the array elements equals that expected sum minus the missing value. Therefore, `missing = expectedSum - actualSum`.\n\nAn alternative O(n) time O(1) space solution uses **XOR**: XOR all values from 0 to n, then XOR with every element in the array. Since `a XOR a = 0` for any value, every value that appears in both the range and the array cancels out, leaving only the missing value unpaired.\n\nA third approach uses a boolean visited array of size n+1, marks each value as seen, then finds the unmarked index. This uses O(n) extra space.\n\nOverflow note: when n = 10^5, the Gauss sum reaches approximately 5 × 10^9, which overflows a 32-bit signed integer. Use 64-bit arithmetic in Java or C++. Python and JavaScript handle arbitrarily large integers natively.",
  editorial: [
    "Gauss sum: expected = n*(n+1)/2 where n = nums.length. actual = sum of all nums[i]. Return expected - actual. O(n) time, O(1) space.",
    "Why it works: by the arithmetic series formula, the integers 0..n sum to n*(n+1)/2. The actual sum equals that minus the missing value. Subtracting gives the missing value directly without any hash map or sorting.",
    "XOR approach: result = n. For each i from 0 to n-1: result ^= i ^ nums[i]. Since XOR is commutative and associative, and a^a=0, every value appearing in both 0..n and nums cancels. Only the missing (unpaired) value remains.",
    "Visited array approach: bool visited[n+1] initialised to false. For each x in nums: visited[x] = true. Scan for index i where visited[i] is false. Return i. O(n) time, O(n) space. Simpler but uses extra memory.",
    "Overflow note: n*(n+1)/2 for n=10^5 is about 5*10^9, exceeding the 32-bit signed int max of ~2.1*10^9. Use long in Java, int64_t in C++, or rely on Python/JavaScript large integers.",
    "Edge case missing 0: actual = 1+2+...+n = n*(n+1)/2. expected = n*(n+1)/2. Difference = 0. Return 0. Correct.",
    "Edge case missing n: actual = 0+1+...+(n-1) = n*(n-1)/2. expected = n*(n+1)/2. Difference = n*(n+1)/2 - n*(n-1)/2 = n. Return n. Correct."
  ]
});

patch("reverse-clean-string", {
  description: "Given a string `s`, return a new string formed by **removing all non-alphabetic characters** and then **reversing** the remaining letters. Preserve the original case of every letter — uppercase stays uppercase and lowercase stays lowercase.\n\nFor example, `'a b c'` removes three spaces to get `'abc'`, then reverses to produce `'cba'`. For `'h3llo!'`, remove the digit `'3'` and the punctuation `'!'` to get `'hllo'`, then reverse to produce `'ollh'`.\n\nAlphabetic characters are letters `a-z` and `A-Z`. Digits, spaces, and punctuation are all non-alphabetic and must be removed before reversing.\n\nThe two-step approach: filter the string by keeping only characters where `c.isalpha()` returns true, collecting them into a list. Then reverse the list and join into a new string. In Python: `''.join(reversed([c for c in s if c.isalpha()]))`. In JavaScript: `s.replace(/[^a-zA-Z]/g, '').split('').reverse().join('')`.\n\nAn in-place variant: collect letters into an array, then apply two-pointer reversal — swap `arr[left]` and `arr[right]` while `left < right`, advancing both pointers. This produces the same O(n) time result.\n\nCase is preserved because `isalpha()` only tests membership — it does not modify the character. Reversing changes the order of characters in the array, not their individual values.\n\nEdge cases: empty string returns empty string; string with no letters (like `'123'`) returns empty string; string with only letters behaves as a standard reversal; mixed case like `'aBc'` reversed becomes `'cBa'`.",
  editorial: [
    "Two-step: letters = [c for c in s if c.isalpha()]. Return ''.join(reversed(letters)). O(n) time, O(n) space for the letters array.",
    "Why filter first: mixing the filter and reversal logic in a single pass is more complex. Filtering first clearly separates two concerns: identify relevant characters, then reverse them.",
    "Two-pointer in-place: collect letters into array arr. left=0, right=len(arr)-1. While left < right: swap arr[left] and arr[right], then left++, right--. Join and return. O(n) time, O(n) space for the array.",
    "Case preservation: isalpha() is a membership test only — it does not modify case. Reversing changes the position of characters in the array but leaves each character value (and case) unchanged.",
    "Edge case empty string: filter produces an empty list. Reversed empty list is empty. Joined is ''. Return ''. Correct without special handling.",
    "Edge case no letters: filter produces empty list. Same result as empty string. Return ''.",
    "Distinction from standard string reversal: plain reversal moves all characters including spaces and punctuation. This problem removes them first. The most common mistake is forgetting to filter before reversing, which keeps non-alphabetic characters in the output."
  ]
});

patch("count-vowels", {
  description: "Given a string `s`, return the **count of vowel characters** it contains. The vowels are the letters `a`, `e`, `i`, `o`, and `u`, in both their lowercase and uppercase forms. The ten vowel characters are: a, e, i, o, u, A, E, I, O, U.\n\nFor example, `'hello'` contains `'e'` and `'o'` as vowels, giving a count of 2. The string `'AEiou'` has one of each vowel — `'A'`, `'E'`, `'i'`, `'o'`, `'u'` — giving a count of 5.\n\nThe implementation is a single pass through the string: maintain a counter initialised to 0. For each character, test whether it belongs to the set of ten vowel characters. If it does, increment the counter. Return the counter after processing all characters.\n\nMembership testing in a fixed-size set is O(1): the vowel set always has exactly 10 elements regardless of the input string. In Python, `c.lower() in 'aeiou'` normalises to lowercase before testing and only checks against 5 characters. In JavaScript, `'aeiouAEIOU'.includes(c)` or a `Set` lookup are equally efficient.\n\nAlternatively, you can convert the entire string to lowercase first and then count occurrences of each of the 5 vowel characters. This is O(n) time but O(n) space for the lowercase copy.\n\nEdge cases: empty string returns 0; string with no vowels (all consonants, digits, spaces) returns 0; string consisting entirely of vowels returns the full string length.",
  editorial: [
    "Single pass: vowels = set('aeiouAEIOU'), count = 0. For each c in s: if c in vowels, count++. Return count. O(n) time, O(1) space (set has exactly 10 elements).",
    "Set membership is O(1): the vowel set is fixed-size regardless of input length. Each lookup takes constant time whether implemented as a hash set, a string contains check, or a fixed boolean array indexed by ASCII code.",
    "Case normalisation: c.lower() in 'aeiou' converts each character to lowercase first, reducing the check to 5 entries instead of 10. Both approaches produce identical results.",
    "Edge case empty string: the loop never executes. count stays 0. Return 0. Correct without special handling.",
    "Edge case all consonants or digits: no character matches the vowel condition. count stays 0. Return 0.",
    "Edge case all vowels: every character increments count. Return len(s). Correct.",
    "Generalisation: replacing the vowel set with any fixed character set allows counting occurrences of specific characters in O(n) time and O(1) space. This pattern applies to counting digits, counting a specific letter, or counting characters from any predefined class."
  ]
});

patch("is-soft-palindrome", {
  description: "Given a string `s`, determine whether it is a **palindrome** after ignoring all non-alphanumeric characters and treating uppercase and lowercase letters as equal. A string is a palindrome if it reads the same forwards and backwards after applying these normalisation rules.\n\nFor example, `'A man a plan a canal Panama'` becomes `'amanaplanacanalpanama'` after removing spaces and converting to lowercase — this 21-character string reads identically in both directions, so it is a palindrome. The string `'race a car'` becomes `'raceacar'`, which is not a palindrome.\n\nThis variant is commonly called a **soft palindrome** or **relaxed palindrome** because it tolerates punctuation, whitespace, and mixed capitalisation.\n\nApproach 1 — filter and compare (O(n) space): collect only alphanumeric characters, lowercase them, form a cleaned string, and check whether it equals its reverse.\n\nApproach 2 — two pointers (O(1) space): use `left = 0` and `right = n-1`. Skip non-alphanumeric characters at each pointer by advancing. Compare the characters at both pointers case-insensitively. If they ever differ, return false. If the pointers meet or cross without a mismatch, return true.\n\nEdge cases: empty string after filtering is vacuously a palindrome; single character is always a palindrome; `'0P'` is not a palindrome because `'0' != 'p'` in alphanumeric comparison.",
  editorial: [
    "Filter approach: cleaned = [c.lower() for c in s if c.isalnum()]. Return cleaned == cleaned[::-1]. O(n) time, O(n) space for the cleaned list.",
    "Why filter first: spaces, punctuation, and capitalisation are all irrelevant to this definition of palindrome. Filtering separates character classification from palindrome checking, making each step simple.",
    "Two-pointer O(1) space: left=0, right=len(s)-1. While left < right: advance left past non-alnum characters; advance right past non-alnum characters; if both alnum: if s[left].lower() != s[right].lower() return false; else left++, right--. After loop, return true.",
    "Edge case empty after filter: cleaned = []. An empty list reversed is itself. Return true. The two-pointer never makes a comparison and returns true. Both correct.",
    "Edge case single character: cleaned = [c]. A single-element list is its own reverse. Return true.",
    "Edge case all non-alphanumeric: cleaned = []. Return true (vacuous palindrome). Two-pointer advances both pointers past everything until they cross, never making a comparison.",
    "This is LeetCode 125 (Valid Palindrome), one of the most commonly asked entry-level string interview problems. It tests string cleaning, two-pointer technique, and palindrome definition in one question."
  ]
});

save();
