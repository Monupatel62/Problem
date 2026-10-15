// Second expansion pass for batch 2 - replace entire editorial arrays
import { createPatcher } from './patcher-core.mjs';
const { patch, save } = createPatcher('src/lib/problems/bank.ts');

const long = (items) => items; // just for readability

patch("count-balanced-prefixes", {
  editorial: long([
    "Algorithm: initialise prefixSum = 0 and count = 0. Iterate through nums — for each value, add it to prefixSum. If prefixSum equals 0 at this point, the prefix from index 0 to the current index is balanced, so increment count. After the loop, return count. Time complexity O(n), space complexity O(1) since only two integer variables are maintained.",
    "Why checking for zero is sufficient: the running sum after processing index i represents the sum of nums[0..i]. When this equals 0, the count of 1s equals the count of -1s in that prefix. We do not need a hash map because the starting index is always 0 — we are not looking for arbitrary subarray sums.",
    "Contrast with subarray-sum-k (general case): to count all subarrays with sum equal to any target k, you would use a hash map mapping each prefix sum to the number of times it has been seen. Here k=0 and the start is always index 0, reducing the problem to a simple running-sum check.",
    "Alternating array walkthrough: nums = [1,-1,1,-1]. Running sums: 1, 0, 1, 0. The sum hits 0 twice (after index 1 and after index 3). Count = 2. Each 1 and -1 cancel in pairs, so every second element completes a balanced prefix.",
    "All-1s edge case: running sums are 1, 2, 3, 4, ... strictly increasing and never returning to 0. Count stays 0. Return 0 correctly without special casing.",
    "Relation to balanced brackets: if you treat 1 as an open bracket and -1 as a close bracket, a balanced prefix corresponds to a complete and fully-matched bracket sequence at that position in the string. This analogy clarifies intuitively when the sum can return to zero.",
    "Performance note: this is among the most space-efficient solutions possible for this problem — O(1) extra space with a single linear scan. The general subarray-sum approach requires O(n) space for the hash map, making this problem a worthwhile special case to recognise and solve separately."
  ])
});

patch("rotate-right-once", {
  editorial: long([
    "In-place shift algorithm: save last = nums[n-1]. Then for i from n-1 down to 1: set nums[i] = nums[i-1]. Finally set nums[0] = last. This moves every element one position to the right and places the former last element at the front. Time O(n), space O(1).",
    "Why the shift must go right-to-left: if you iterate i from 0 to n-2 and set nums[i+1] = nums[i], each assignment overwrites the value at nums[i+1] before the next iteration needs to read it from nums[i+1]. Right-to-left iteration copies each element into its destination before that destination is overwritten.",
    "Slice approach: [nums[n-1]].concat(nums.slice(0, n-1)) or equivalently [...nums.slice(-1), ...nums.slice(0,-1)]. Creates a new array in O(n) space. Easier to read and less error-prone than the in-place shift, but uses extra memory.",
    "Empty array edge case: n = 0. The inner loop iterates from -1 down to 1, which is zero iterations. Nothing changes. The empty array is returned correctly.",
    "Single-element edge case: n = 1. last = nums[0]. Inner loop iterates from 0 down to 1, zero iterations. nums[0] = last, unchanged. The single element is returned as-is.",
    "Two-element edge case: n = 2. last = nums[1]. Inner loop runs once: nums[1] = nums[0]. Then nums[0] = last. This swaps the two elements. nums = [a,b] becomes [b,a]. Correct.",
    "Connection to the three-reversal trick: rotate-right-once is rotate-array with k=1. The general three-reversal approach (reverse all, reverse first k, reverse rest) with k=1 simplifies to: reverse the entire array, then reverse elements at indices 1 to n-1. Both methods produce the same result."
  ])
});

patch("missing-zero-to-n", {
  editorial: long([
    "Gauss sum approach: expected = n*(n+1)/2 where n = nums.length. Compute actual = sum of all nums[i]. Return expected - actual. O(n) time, O(1) space. The simplest and most reliable approach for this problem.",
    "Why it works: the integers 0 through n sum to n*(n+1)/2 by the standard arithmetic series formula for consecutive integers starting at 0. The actual sum differs from this by exactly the missing value, since all other values are present exactly once.",
    "XOR approach: initialise result = n. For each index i from 0 to n-1: result ^= i ^ nums[i]. Since XOR is commutative and associative, and a^a=0 for any a, every value that appears in both the range 0..n-1 and nums cancels out. The unpaired missing value is the only one left.",
    "Visited array approach: create a boolean array of size n+1 initialised to false. For each value x in nums, set visited[x] = true. Scan from 0 to n and return the first index i where visited[i] is false. O(n) time and O(n) space. More memory but the logic is straightforward.",
    "Overflow handling: for n = 10^5, the Gauss sum n*(n+1)/2 is approximately 5 times 10^9. This exceeds the maximum value of a 32-bit signed integer, which is approximately 2.1 times 10^9. Use 64-bit integers in Java (long) and C++ (int64_t). Python handles large integers natively. JavaScript also handles this safely with standard number arithmetic up to 2^53.",
    "Edge case missing 0: actual = sum(1..n) = n*(n+1)/2. expected = n*(n+1)/2. expected - actual = 0. Return 0. Correct.",
    "Edge case single-element array: nums = [0], n = 1. expected = 1. actual = 0. Return 1. Or nums = [1], expected = 1, actual = 1, return 0. Both handled without special casing."
  ])
});

patch("reverse-clean-string", {
  editorial: long([
    "Two-step filter-then-reverse: letters = [c for c in s if c.isalpha()]. Then return ''.join(reversed(letters)). Time O(n) for the scan and O(n) for the join. Space O(n) for the letters list.",
    "Why filter first rather than filter-and-reverse simultaneously: filtering first separates two distinct concerns into two clear steps. Attempting to reverse while filtering in a single pass requires careful index tracking and is significantly harder to reason about correctly.",
    "Two-pointer in-place reversal: collect letters into array arr. Set left = 0 and right = len(arr) - 1. While left < right: swap arr[left] and arr[right], then left++, right--. Join and return. This achieves O(n) time with the same O(n) space for the array.",
    "Case preservation: c.isalpha() is a boolean membership test — it returns true for letters a-z and A-Z without modifying the character. The filter step retains each letter with its original case. Reversal only changes the position of characters in the array, not the characters themselves.",
    "Edge case empty string: c for c in '' produces an empty list. reversed([]) is empty. ''.join([]) is ''. Return '' correctly.",
    "Edge case string with no letters: all characters fail c.isalpha(). The filter produces an empty list. Same result as empty string. Return ''.",
    "Difference from a simple string reversal: a plain s[::-1] or s.split('').reverse().join('') reverses all characters including spaces and punctuation. This problem removes non-letters first. Applying a plain reversal is the most common incorrect answer — always filter before reversing."
  ])
});

patch("count-vowels", {
  editorial: long([
    "Single pass algorithm: create vowels = set of the 10 vowel characters aeiouAEIOU. Initialise count = 0. For each character c in s: if c is in vowels, increment count. Return count after the loop. O(n) time, O(1) space — the set is fixed-size regardless of input.",
    "Set membership O(1): checking membership in a hash set with 10 elements takes constant time per lookup. This makes the overall algorithm O(n) time with no dependency on the number of distinct vowels.",
    "Case normalisation alternative: c.lower() in 'aeiou' converts c to lowercase before checking against only 5 characters. Equivalent result with slightly simpler code, at the cost of one case conversion per character.",
    "Edge case empty string: the loop body never executes. count stays 0. Return 0. Correct without special casing.",
    "Edge case all consonants or digits: no character matches the vowel condition. count stays 0. Return 0.",
    "Edge case all vowels: every character is in the vowel set, so count increments for each. Return len(s). Correct.",
    "Generalisation: this single-pass counter structure extends to counting any predefined character class. Replace the vowel set with digits, punctuation, a specific character, or any combination. The O(n) time O(1) space pattern remains the same. For example, counting digits uses set('0123456789') — same structure, different set."
  ])
});

patch("is-soft-palindrome", {
  editorial: long([
    "Filter approach: cleaned = [c.lower() for c in s if c.isalnum()]. Convert to string: ''.join(cleaned). Return cleaned_str == cleaned_str[::-1]. O(n) time, O(n) space for the cleaned list and its reverse.",
    "Why filter and lowercase first: spaces and punctuation are irrelevant to this palindrome definition. Converting to lowercase removes the case sensitivity. Filtering first makes the palindrome check straightforward — just compare the result with its reverse.",
    "Two-pointer O(1) space approach: left = 0, right = len(s) - 1. While left < right: while left < right and not s[left].isalnum(): left++; while left < right and not s[right].isalnum(): right--; if left < right and s[left].lower() != s[right].lower(): return false; left++, right--. Return true.",
    "Edge case empty string after filtering: cleaned = []. The empty string equals its own reverse. Return true. The two-pointer approach skips all characters and returns true trivially.",
    "Edge case single character: cleaned has one alphanumeric character. A single character is its own reverse. Return true.",
    "Edge case all non-alphanumeric: every character is skipped. cleaned = []. Return true — an empty sequence is considered a palindrome vacuously.",
    "This is LeetCode 125 (Valid Palindrome), one of the most frequently asked string questions in technical interviews. It combines string cleaning (filter by character type), normalisation (lowercasing), and palindrome verification (two-pointer or reverse comparison) into one concise problem."
  ])
});

save();
