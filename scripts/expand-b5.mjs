// Direct str_replace expansions for batch 5 - no JSON.stringify
import { readFileSync, writeFileSync } from 'fs';
let src = readFileSync('src/lib/problems/bank.ts', 'utf8');
let n = 0;

function rep(from, to) {
  if (!src.includes(from)) { console.log('NOT FOUND:', from.substring(0,70)); return; }
  src = src.replace(from, to);
  n++;
}

// ========== sum-positive-values ==========
rep(
  `"This problem is the positive-filter variant of a broader class of conditional sum problems. The same pattern handles 'sum of even values', 'sum of values above threshold', and 'sum of values in a range' — just replace the x > 0 condition."`,
  `"This problem is the positive-filter variant of a broader class of conditional sum problems. The same pattern handles 'sum of even values', 'sum of values above threshold', and 'sum of values in a range' — just replace the x > 0 condition.\\n\\nFor large arrays, the functional approach using Python's built-in sum with a generator expression is preferred over an explicit loop because it avoids repeated function call overhead and can be vectorised. However, the explicit loop is clearer for learners and produces identical results."`
);
rep(
  `"Generalisation: replace x > 0 with any condition — x > threshold, x % 2 == 0, x in some_set — to compute conditional sums. The algorithm structure is always the same single-pass accumulator."
    ]`,
  `"Generalisation: replace x > 0 with any condition — x > threshold, x % 2 == 0, x in some_set — to compute conditional sums. The algorithm structure is always the same single-pass accumulator.",
      "Complexity: O(n) time — every element is examined exactly once. O(1) extra space — only one integer variable (total) is maintained. This is optimal: you cannot compute the sum without reading every element.",
      "Connection to NumPy: in numerical computing, numpy.sum(nums[nums > 0]) uses vectorised operations to compute this in near-constant time on modern hardware. The algorithmic complexity is still O(n) but with much smaller constants due to SIMD instructions."
    ]`
);

// ========== count-local-peaks ==========
rep(
  `"Local peaks are used in algorithms for finding local maxima in signals, 1D peak-finding for divide-and-conquer, and gradient descent convergence detection."`,
  `"Local peaks are used in algorithms for finding local maxima in signals, 1D peak-finding for divide-and-conquer, and gradient descent convergence detection.\\n\\nIn competitive programming, the phrase 'local peak' always means strictly greater than both neighbors. Understanding this strict definition avoids confusion with plateau detection (where equal neighbors count) or saddle point detection (local peak in one direction, local valley in another)."`
);
rep(
  `"Real-world application: peak finding in 1D arrays appears in signal processing (local maxima detection), mathematical optimisation (checking convergence), and image analysis (ridge detection)."
    ]`,
  `"Real-world application: peak finding in 1D arrays appears in signal processing (local maxima detection), mathematical optimisation (checking convergence), and image analysis (ridge detection).",
      "Extension: count valley points (elements strictly less than both neighbors) uses the same structure with the comparison reversed: nums[i] < nums[i-1] and nums[i] < nums[i+1].",
      "Complexity: O(n) time — a single pass from index 1 to n-2 with two comparisons per element. O(1) space — only a counter variable maintained."
    ]`
);

// ========== replace-with-greatest-right ==========
rep(
  `"Edge cases: single-element array — the only element is replaced by -1; all-same values — every element is replaced by that same value (except the last, which is -1); strictly decreasing array — each element's right maximum is the next element."`,
  `"Edge cases: single-element array — the only element is replaced by -1; all-same values — every element is replaced by that same value (except the last, which is -1); strictly decreasing array — each element's right maximum is the next element, so result[i] = nums[i+1] for all but last.\\n\\nA common mistake is computing suffix maximums as a separate pass first, then overwriting the array. This wastes space. The right-to-left in-place approach avoids the extra array by computing and writing in the same sweep."`
);
rep(
  `"Suffix maximum pattern: this is a standard suffix maximum array computation. The same pattern applies to 'next greater element' and 'stock span' problems where you need information about future elements."
    ]`,
  `"Suffix maximum pattern: this is a standard suffix maximum array computation. The same pattern applies to 'next greater element' and 'stock span' problems where you need information about future elements.",
      "Time complexity: O(n) — a single right-to-left scan, each element processed once. Space complexity: O(1) extra — the result overwrites the input array with no auxiliary array needed.",
      "Variation — replace with sum of right: a related problem replaces each element with the sum of all elements to its right. Same right-to-left scan, but track a running sum instead of a running maximum."
    ]`
);

// ========== second-largest-distinct ==========
rep(
  `"This problem tests understanding of tracking multiple extremes in a single pass, a pattern used in many interview questions about k-th largest/smallest elements."`,
  `"This problem tests understanding of tracking multiple extremes in a single pass, a pattern used in many interview questions about k-th largest/smallest elements.\\n\\nA subtle bug to avoid: when updating second = first, first = x, you must update second BEFORE overwriting first. Updating first first would lose the old first value and set second to the new element, which is wrong."`
);
rep(
  `"Extension to k-th largest distinct: use a sorted set or a min-heap of size k. The single-pass approach generalises to tracking k extremes with O(k*n) time."
    ]`,
  `"Extension to k-th largest distinct: use a sorted set or a min-heap of size k. The single-pass approach generalises to tracking k extremes with O(k*n) time.",
      "Complexity: single-pass O(n) time, O(1) space. Set-then-sort approach O(n log n) time, O(n) space for the set. The single-pass approach is optimal for this specific problem.",
      "Why -inf not 0: initialising first = second = 0 would fail for arrays containing only negative values (e.g. [-3,-1,-2] should return -3, but with 0 as initial second, you might incorrectly return 0)."
    ]`
);

// ========== remove-target-values ==========
rep(
  `"Edge cases: no target in array — all elements are preserved, return the original array unchanged; all elements equal target — return empty array; empty array — return empty array; single-element array matching target — return empty array."`,
  `"Edge cases: no target in array — all elements are preserved, return the original array unchanged; all elements equal target — return empty array; empty array — return empty array; single-element array matching target — return empty array.\\n\\nThe two-pointer in-place approach is the expected answer in interviews where O(1) space is required. The filter approach is acceptable when extra space is allowed and readability is prioritised."`
);
rep(
  `"This is LeetCode 27 (Remove Element). The two-pointer in-place approach is the expected O(1) space solution in interviews."
    ]`,
  `"This is LeetCode 27 (Remove Element). The two-pointer in-place approach is the expected O(1) space solution in interviews.",
      "Time and space: O(n) time — r scans every element exactly once. O(1) extra space — w and r are the only extra variables; the result is stored in the input array itself.",
      "Stability: relative order is preserved because r and w move in the same direction (left-to-right) and r only advances forward. Elements are written to w in the same order they are read by r."
    ]`
);

// ========== merge-sorted-values ==========
rep(
  `"This merge operation is foundational in algorithm design. It appears in merge sort (divide-and-conquer sorting), external sorting for data too large to fit in memory, and database merge joins for sorted query results."`,
  `"This merge operation is foundational in algorithm design. It appears in merge sort (divide-and-conquer sorting), external sorting for data too large to fit in memory, and database merge joins for sorted query results.\\n\\nThe key invariant during the two-pointer merge: at any point, all elements already in the result are <= all remaining elements in a and b. This invariant holds because we always pick the smaller of the two current heads."`
);
rep(
  `"K-way merge extension: to merge k sorted arrays, use a min-heap of (value, array_index, element_index). Extract the minimum, advance its pointer, and insert the next element from that array. O(n log k) time where n is total elements."
    ]`,
  `"K-way merge extension: to merge k sorted arrays, use a min-heap of (value, array_index, element_index). Extract the minimum, advance its pointer, and insert the next element from that array. O(n log k) time where n is total elements.",
      "Complexity: O(m+n) time — each element from both arrays is visited exactly once. O(m+n) space for the result array. The algorithm is optimal since any correct merge must examine all input elements.",
      "Sorted concatenation shortcut: sorted(a+b) produces the same result in O((m+n) log(m+n)) but ignores the sorted property. Always use the linear merge when inputs are already sorted."
    ]`
);

writeFileSync('src/lib/problems/bank.ts', src);
console.log(`Replacements: ${n}`);
