// Final expansion for batch 5 - descriptions + editorial last items
import { readFileSync, writeFileSync } from 'fs';
let src = readFileSync('src/lib/problems/bank.ts', 'utf8');
let n = 0;

function rep(from, to) {
  if (!src.includes(from)) { console.log('NOT FOUND:', from.substring(0,70)); return; }
  src = src.replace(from, to);
  n++;
}

// === sum-positive-values ===
// expand description ending
rep(
  `"Edge cases: empty array returns 0 (the loop never executes); array of only zeros returns 0 (zeros fail the x > 0 check); array of only negatives returns 0; array of only positives returns the total sum of the array.`,
  `"Edge cases: empty array returns 0 (the loop never executes); array of only zeros returns 0 (zeros fail the x > 0 check); array of only negatives returns 0; array of only positives returns the total sum of the array. These edge cases require no special handling — the conditional accumulator handles all of them naturally in the same single loop.`
);
// expand editorial last item
rep(
  `"Connection to NumPy: in numerical computing, numpy.sum(nums[nums > 0]) uses vectorised operations to compute this in near-constant time on modern hardware. The algorithmic complexity is still O(n) but with much smaller constants due to SIMD instructions."
    ]`,
  `"Connection to NumPy: in numerical computing, numpy.sum(nums[nums > 0]) uses vectorised operations to compute this in near-constant time on modern hardware. The algorithmic complexity is still O(n) but with much smaller constants due to SIMD instructions.",
      "Interview framing: when asked to sum values satisfying a condition, always start with the single-pass conditional accumulator. Mention the O(n) time and O(1) space complexity explicitly. If asked for a functional style, offer the generator expression as a clean alternative.",
      "Error-prone case: if you use >= 0 instead of > 0, zeros are incorrectly included. Always re-read the problem statement for 'positive' (> 0) vs 'non-negative' (>= 0) vs 'absolute value'. These are three distinct conditions."
    ]`
);

// === count-local-peaks ===
rep(
  `"Edge cases: array of length 3 — only index 1 can be a peak; array with all equal values — no peaks; strictly increasing array — no peaks (last element would be a candidate but it is excluded as a boundary element).`,
  `"Edge cases: array of length 3 — only index 1 can be a peak; array with all equal values — no peaks (equal does not satisfy strictly greater); strictly increasing array — no peaks because the last element is excluded as a boundary element even though it is the largest.`
);
rep(
  `"Complexity: O(n) time — a single pass from index 1 to n-2 with two comparisons per element. O(1) space — only a counter variable maintained."
    ]`,
  `"Complexity: O(n) time — a single pass from index 1 to n-2 with two comparisons per element. O(1) space — only a counter variable maintained.",
      "Two-comparison shortcut: you can exit the inner check early if nums[i] <= nums[i-1] (first condition already fails). This avoids the second comparison in half the cases on average, improving constants without changing asymptotic complexity.",
      "Relation to valley counting: valleys are elements strictly less than both neighbors. The same loop structure applies with < instead of >. Peaks and valleys together characterise the shape of the array for signal analysis."
    ]`
);

// === replace-with-greatest-right ===
rep(
  `"A common mistake is computing suffix maximums as a separate pass first, then overwriting the array. This wastes space. The right-to-left in-place approach avoids the extra array by computing and writing in the same sweep."`,
  `"A common mistake is computing suffix maximums as a separate pass first, then overwriting the array. This wastes space. The right-to-left in-place approach avoids the extra auxiliary array by computing and writing in the same sweep, achieving O(1) extra space."`
);
rep(
  `"Variation — replace with sum of right: a related problem replaces each element with the sum of all elements to its right. Same right-to-left scan, but track a running sum instead of a running maximum."
    ]`,
  `"Variation — replace with sum of right: a related problem replaces each element with the sum of all elements to its right. Same right-to-left scan, but track a running sum instead of a running maximum.",
      "Why the last element becomes -1: no element exists to the right of the last position, so by convention the answer is -1. This sentinel value indicates 'no right maximum'. Some problem variants use 0 or -infinity instead — read the problem statement carefully.",
      "Interview tip: when you see 'replace each element with something about elements to its right', immediately think right-to-left scan with a running state variable. This transforms O(n^2) naive to O(n) optimal."
    ]`
);

// === second-largest-distinct ===
rep(
  `"A subtle bug to avoid: when updating second = first, first = x, you must update second BEFORE overwriting first. Updating first first would lose the old first value and set second to the new element, which is wrong."`,
  `"A subtle bug to avoid: when updating second = first, first = x, you must update second BEFORE overwriting first. Updating first first would lose the old first value and incorrectly set second to the new element, not the old first."`
);
rep(
  `"Why -inf not 0: initialising first = second = 0 would fail for arrays containing only negative values (e.g. [-3,-1,-2] should return -3, but with 0 as initial second, you might incorrectly return 0)."
    ]`,
  `"Why -inf not 0: initialising first = second = 0 would fail for arrays containing only negative values (e.g. [-3,-1,-2] should return -3, but with 0 as initial second, you might incorrectly return 0).",
      "Duplicate handling in detail: for nums = [5,5,5,3], first = 5 after the first element. The remaining 5s are skipped (x == first). Then 3 < 5 but 3 > -inf so second = 3. Return 3. Correct.",
      "Space efficiency: O(1) space with just two variables first and second. The set-then-sort approach uses O(n) space for the set, which is worse despite producing the same result."
    ]`
);

// === remove-target-values ===
rep(
  `"The two-pointer in-place approach is the expected answer in interviews where O(1) space is required. The filter approach is acceptable when extra space is allowed and readability is prioritised."`,
  `"The two-pointer in-place approach is the expected answer in interviews where O(1) space is required. The filter approach using list comprehension is acceptable when extra space is allowed and code readability is prioritised over memory efficiency."`
);
rep(
  `"Stability: relative order is preserved because r and w move in the same direction (left-to-right) and r only advances forward. Elements are written to w in the same order they are read by r."
    ]`,
  `"Stability: relative order is preserved because r and w move in the same direction (left-to-right) and r only advances forward. Elements are written to w in the same order they are read by r.",
      "Multiple targets: to remove multiple distinct target values, replace the single target check with a set membership test: if nums[r] not in targets_set. Same two-pointer structure, O(1) per check with a hash set.",
      "Return value conventions: some problems return the new array, others return the new length (LeetCode convention). Clarify with the interviewer or problem statement which is expected."
    ]`
);

// === merge-sorted-values ===
rep(
  `"The key invariant during the two-pointer merge: at any point, all elements already in the result are <= all remaining elements in a and b. This invariant holds because we always pick the smaller of the two current heads."`,
  `"The key invariant during the two-pointer merge: at any point, all elements already in the result are <= all remaining elements in a and b. This invariant holds because we always pick the smaller of the two current heads, ensuring each appended element is the globally minimum remaining element."`
);
rep(
  `"Sorted concatenation shortcut: sorted(a+b) produces the same result in O((m+n) log(m+n)) but ignores the sorted property. Always use the linear merge when inputs are already sorted."
    ]`,
  `"Sorted concatenation shortcut: sorted(a+b) produces the same result in O((m+n) log(m+n)) but ignores the sorted property. Always use the linear merge when inputs are already sorted.",
      "Stability of the merge: using <= (not <) when comparing ensures elements from a are taken before equal elements from b, preserving the relative order within equal groups — this is the merge sort stability property.",
      "Application in external sorting: when sorting data larger than RAM, data is split into sorted chunks on disk. The k-way merge combines them. Understanding the two-array merge is the foundation for this industrial algorithm."
    ]`
);

writeFileSync('src/lib/problems/bank.ts', src);
console.log(`Replacements: ${n}`);
