import { createPatcher } from './patcher-core.mjs';
const { patch, save } = createPatcher('src/lib/problems/bank.ts');

patch("sum-positive-values", {
  judgeReady: true,
  constraints: ["0 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9", "Return the sum of all positive integers in nums.", "Zero is not positive.", "If no positive values exist, return 0."],
  examples: [
    { input: "nums = [1,-2,3,0,-1]", output: "4", explanation: "Positive values: 1 and 3. Sum = 4. Zero and negatives excluded." },
    { input: "nums = [-1,-2,-3]", output: "0", explanation: "No positive values. Return 0." }
  ],
  description: "Given an integer array `nums`, return the **sum of all positive integers** in it. An integer is positive if it is strictly greater than zero — zeros and negative numbers are excluded.\n\nFor example, in `[1, -2, 3, 0, -1]`, the positive values are 1 and 3, giving a sum of 4. The zero and the negatives are excluded.\n\nThe solution is a single pass: initialise a total to 0. For each element, if it is positive (strictly greater than 0), add it to the total. Return the total.\n\nThis is O(n) time and O(1) space. No sorting or auxiliary data structures are needed.\n\nA functional equivalent in Python is `sum(x for x in nums if x > 0)`. In JavaScript: `nums.reduce((acc, x) => x > 0 ? acc + x : acc, 0)` or `nums.filter(x => x > 0).reduce((a, b) => a + b, 0)`.\n\nEdge cases: empty array returns 0 (the loop never executes); array of only zeros returns 0 (zeros fail the x > 0 check); array of only negatives returns 0; array of only positives returns the total sum of the array.\n\nThis problem is the positive-filter variant of a broader class of conditional sum problems. The same pattern handles 'sum of even values', 'sum of values above threshold', and 'sum of values in a range' — just replace the x > 0 condition.",
  hints: [
    "Single pass: total = 0. For each x in nums: if x > 0, total += x. Return total.",
    "Functional style: sum(x for x in nums if x > 0) in Python, or nums.filter(x => x > 0).reduce((a,b) => a+b, 0) in JavaScript.",
    "Zero is not positive. Only values where x > 0 (strictly greater) should be added."
  ],
  sampleCases: [{ input: [[1,-2,3,0,-1]], expected: 4 }, { input: [[-1,-2,-3]], expected: 0 }],
  hiddenCases: [
    { input: [[]], expected: 0 },
    { input: [[0,0,0]], expected: 0 },
    { input: [[5]], expected: 5 },
    { input: [[1,2,3,4,5]], expected: 15 }
  ],
  editorial: [
    "Single pass: total = 0. For each x in nums: if x > 0: total += x. Return total. O(n) time, O(1) space.",
    "Why x > 0 not x >= 0: zero is not a positive number. Including zero would give wrong results for inputs containing zeros (e.g. [0,1,2] should return 3, not 3+0=3, but conceptually zero must be excluded).",
    "Functional approach: sum(x for x in nums if x > 0). The generator expression filters and computes in one pass. O(n) time, O(1) extra space (generator does not materialise a list).",
    "Edge case empty array: sum of empty sequence is 0 by convention. Loop doesn't execute. Return 0. Correct.",
    "Edge case all zeros: every element fails x > 0. Return 0.",
    "Edge case all positive: every element passes. Return sum(nums). Correct.",
    "Generalisation: replace x > 0 with any condition — x > threshold, x % 2 == 0, x in some_set — to compute conditional sums. The algorithm structure is always the same single-pass accumulator."
  ]
});

patch("count-local-peaks", {
  judgeReady: true,
  constraints: ["3 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9", "A peak is an element strictly greater than both its immediate neighbors.", "First and last elements cannot be peaks (they have only one neighbor each).", "Return the count of peak elements."],
  examples: [
    { input: "nums = [1,3,2,4,1]", output: "2", explanation: "nums[1]=3 > nums[0]=1 and nums[2]=2 → peak. nums[3]=4 > nums[2]=2 and nums[4]=1 → peak. Count = 2." },
    { input: "nums = [1,2,3]", output: "0", explanation: "3 is the largest but it is the last element — not a local peak." }
  ],
  description: "Given an integer array `nums`, return the **count of local peaks**. A local peak is an element that is **strictly greater than both of its immediate neighbors**. The first and last elements cannot be local peaks since they each have only one neighbor.\n\nFor example, in `[1, 3, 2, 4, 1]`, the element `3` at index 1 is greater than `1` (left) and `2` (right), so it is a peak. The element `4` at index 3 is greater than `2` (left) and `1` (right), so it is also a peak. The answer is 2.\n\nThe solution iterates over indices 1 to n-2 (the interior elements). For each index `i`, check if `nums[i] > nums[i-1]` and `nums[i] > nums[i+1]`. If both conditions hold, increment the count.\n\nThis runs in O(n) time and O(1) space.\n\nNote that the comparison is **strict** — a local peak must be strictly greater than both neighbors. An element equal to one of its neighbors is not a peak.\n\nEdge cases: array of length 3 — only index 1 can be a peak; array with all equal values — no peaks; strictly increasing array — no peaks (last element would be a candidate but it is excluded as a boundary element).\n\nLocal peaks are used in algorithms for finding local maxima in signals, 1D peak-finding for divide-and-conquer, and gradient descent convergence detection.",
  hints: [
    "Iterate indices i from 1 to n-2. For each i: if nums[i] > nums[i-1] and nums[i] > nums[i+1], increment count.",
    "Boundaries (i=0 and i=n-1) are excluded — they have only one neighbor each.",
    "Strictly greater: equal neighbors do not qualify. nums[i] == nums[i-1] is not a peak."
  ],
  sampleCases: [{ input: [[1,3,2,4,1]], expected: 2 }, { input: [[1,2,3]], expected: 0 }],
  hiddenCases: [
    { input: [[5,3,5]], expected: 0 },
    { input: [[1,3,1,3,1]], expected: 2 },
    { input: [[1,1,1,1]], expected: 0 },
    { input: [[2,1,2,1,2]], expected: 2 }
  ],
  editorial: [
    "Algorithm: count = 0. For i from 1 to len(nums)-2: if nums[i] > nums[i-1] and nums[i] > nums[i+1]: count++. Return count. O(n) time, O(1) space.",
    "Why skip index 0 and n-1: the problem defines a local peak as strictly greater than BOTH neighbors. Boundary elements have only one neighbor, so they can never satisfy the two-neighbor condition.",
    "Strict inequality: nums[i] > nums[i-1] excludes ties. A plateau (equal adjacent values) is not a peak. Using >= would count plateau edges, which is a different problem.",
    "Edge case length 3: only i=1 is checked. It is a peak iff nums[1] > nums[0] and nums[1] > nums[2].",
    "Edge case all equal: every comparison produces false. Return 0.",
    "Connection to find-peak-element: that problem finds any single peak in O(log n) using binary search. This problem counts all peaks in O(n). The O(log n) binary search approach applies only when you need just one peak.",
    "Real-world application: peak finding in 1D arrays appears in signal processing (local maxima detection), mathematical optimisation (checking convergence), and image analysis (ridge detection)."
  ]
});

patch("replace-with-greatest-right", {
  judgeReady: true,
  constraints: ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9", "Replace each element with the maximum of all elements to its right.", "The last element has no elements to its right — replace it with -1.", "Modify in-place or return a new array."],
  examples: [
    { input: "nums = [17,18,5,4,6,1]", output: "[18,6,6,6,1,-1]", explanation: "Max right of index 0: max(18,5,4,6,1)=18. Index 1: max(5,4,6,1)=6. ...Index 4: max(1)=1. Index 5: -1." },
    { input: "nums = [1,2,3]", output: "[3,3,-1]", explanation: "Max right of 1 is max(2,3)=3. Max right of 2 is max(3)=3. Last element: -1." }
  ],
  description: "Given an integer array `nums`, replace each element with the **maximum of all elements to its right**. The last element, having no elements to its right, should be replaced with `-1`.\n\nFor example, in `[17, 18, 5, 4, 6, 1]`, the element at index 0 is replaced by `max(18, 5, 4, 6, 1) = 18`. The element at index 4 is replaced by `max(1) = 1`. The last element is replaced by `-1`. Result: `[18, 6, 6, 6, 1, -1]`.\n\nThe naive approach computes the suffix maximum for each element separately using a nested loop — O(n^2) time.\n\nThe efficient approach scans **right to left** maintaining a running maximum. Initialise `maxRight = -1`. For `i` from `n-1` down to `0`: save `current = nums[i]`, set `nums[i] = maxRight`, update `maxRight = max(maxRight, current)`. This is O(n) time and O(1) space.\n\nThe right-to-left scan works because at each position `i`, `maxRight` holds the maximum of all elements originally at indices `i+1` to `n-1` — which is exactly what we need to write to `nums[i]`.\n\nEdge cases: single-element array — the only element is replaced by -1; all-same values — every element is replaced by that same value (except the last, which is -1); strictly decreasing array — each element's right maximum is the next element.",
  hints: [
    "Scan right to left. Maintain maxRight = -1. For each i from n-1 to 0: save current = nums[i]; set nums[i] = maxRight; update maxRight = max(maxRight, current).",
    "Save the current value before overwriting it — you need it to update maxRight for the positions to the left.",
    "After the loop, nums[0] contains max of the original nums[1..n-1], nums[1] contains max of nums[2..n-1], etc. nums[n-1] = -1."
  ],
  sampleCases: [{ input: [[17,18,5,4,6,1]], expected: [18,6,6,6,1,-1] }, { input: [[1,2,3]], expected: [3,3,-1] }],
  hiddenCases: [
    { input: [[1]], expected: [-1] },
    { input: [[3,3,3]], expected: [3,3,-1] },
    { input: [[5,4,3,2,1]], expected: [4,3,2,1,-1] },
    { input: [[1,2,1,2]], expected: [2,2,2,-1] }
  ],
  editorial: [
    "Right-to-left scan: maxRight = -1. For i from n-1 to 0: curr = nums[i]; nums[i] = maxRight; maxRight = max(maxRight, curr). Return nums. O(n) time, O(1) space.",
    "Why right-to-left: at position i, we need max(nums[i+1..n-1]). Scanning right-to-left allows us to maintain this running maximum without any auxiliary array.",
    "Why save current before overwriting: nums[i] is overwritten with maxRight. The original nums[i] is still needed to update maxRight for positions to the left of i. Saving it in curr prevents data loss.",
    "Naive O(n^2): for each i, compute max(nums[i+1..n-1]) with an inner loop. Correct but too slow for n=10^5.",
    "Edge case single element: i=0 only. curr = nums[0], nums[0] = maxRight = -1, maxRight = max(-1, curr). Return [-1]. Correct.",
    "Edge case all same value v: maxRight updates to v after the rightmost element. Every position gets v, except the last which gets -1.",
    "Suffix maximum pattern: this is a standard suffix maximum array computation. The same pattern applies to 'next greater element' and 'stock span' problems where you need information about future elements."
  ]
});

patch("second-largest-distinct", {
  judgeReady: true,
  constraints: ["2 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9", "Return the second largest DISTINCT value.", "If fewer than two distinct values exist, return -1.", "Duplicates of the largest do not count as the second largest."],
  examples: [
    { input: "nums = [5,3,8,3,8]", output: "5", explanation: "Distinct values: 3, 5, 8. Second largest distinct is 5." },
    { input: "nums = [5,5,5]", output: "-1", explanation: "Only one distinct value (5). Return -1." }
  ],
  description: "Given an integer array `nums`, return the **second largest distinct value**. Two copies of the same number count as one distinct value — the second largest refers to the second distinct element when all values are sorted in descending order.\n\nFor example, in `[5, 3, 8, 3, 8]`, the distinct values are 3, 5, and 8. Sorted descending: 8, 5, 3. The second largest distinct is 5.\n\nThe set approach: convert `nums` to a set of distinct values, sort descending, return the element at index 1. If the set has fewer than 2 elements, return -1. This is O(n log n) time due to sorting.\n\nThe single-pass approach: maintain two variables `first` (largest distinct so far) and `second` (second largest distinct so far). For each element: if it equals `first`, skip. If it is greater than `first`, set `second = first` and `first = element`. If it is between `second` and `first`, update `second = element`. This is O(n) time and O(1) space.\n\nEdge cases: all same values — only one distinct value, return -1; exactly two distinct values — return the smaller one; array of length 2 with same values — return -1; array of length 2 with different values — return the smaller one.\n\nThis problem tests understanding of tracking multiple extremes in a single pass, a pattern used in many interview questions about k-th largest/smallest elements.",
  hints: [
    "Single pass: track first (largest) and second (second-largest) distinct values. For each x: if x == first, skip; if x > first, second = first, first = x; elif x > second (and x != first), second = x.",
    "Set approach: return sorted(set(nums), reverse=True)[1] if len(set(nums)) >= 2 else -1.",
    "Initialise first = second = -infinity. After the loop, return second if second != -infinity else -1."
  ],
  sampleCases: [{ input: [[5,3,8,3,8]], expected: 5 }, { input: [[5,5,5]], expected: -1 }],
  hiddenCases: [
    { input: [[1,2]], expected: 1 },
    { input: [[-1,-2,-3]], expected: -2 },
    { input: [[1,1,2]], expected: 1 },
    { input: [[3,1,4,1,5]], expected: 4 }
  ],
  editorial: [
    "Single-pass O(n): first = second = -inf. For each x: if x == first: skip. Elif x > first: second = first, first = x. Elif x > second: second = x. Return second if second != -inf else -1.",
    "Why skip x == first: we want the second DISTINCT value. Multiple occurrences of the maximum do not count as the second maximum.",
    "Set approach: s = set(nums). If len(s) < 2: return -1. Return sorted(s, reverse=True)[1]. O(n log n) due to sort but simpler to write.",
    "Initialise with -infinity not 0: using 0 would fail for arrays containing only negative numbers. -infinity guarantees any real value replaces it.",
    "Edge case all same: every element equals first. second stays -inf. Return -1.",
    "Edge case two elements: if nums[0] != nums[1], after processing: first=max, second=min. Return min. Correct.",
    "Extension to k-th largest distinct: use a sorted set or a min-heap of size k. The single-pass approach generalises to tracking k extremes with O(k*n) time."
  ]
});

patch("remove-target-values", {
  judgeReady: true,
  constraints: ["0 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9", "Remove all occurrences of the target value from the array.", "Return the filtered array (or modify in-place and return the new length).", "Relative order of remaining elements must be preserved."],
  examples: [
    { input: "nums = [3,2,2,3], target = 3", output: "[2,2]", explanation: "Remove all 3s. Remaining: [2,2]." },
    { input: "nums = [0,1,2,2,3,0,4,2], target = 2", output: "[0,1,3,0,4]", explanation: "Remove all 2s. Remaining elements in original order." }
  ],
  description: "Given an integer array `nums` and an integer `target`, remove all occurrences of `target` from `nums` and return the resulting array. The relative order of non-target elements must be preserved.\n\nFor example, given `[3, 2, 2, 3]` and `target = 3`, remove both 3s to get `[2, 2]`.\n\nThe simplest correct solution: filter — create a new array containing only elements not equal to `target`. In Python: `[x for x in nums if x != target]`. In JavaScript: `nums.filter(x => x !== target)`. This is O(n) time and O(n) space for the output array.\n\nFor an in-place approach using the **two-pointer technique**: maintain a write pointer `w = 0`. For each read pointer `r` from 0 to n-1: if `nums[r] != target`, copy `nums[r]` to `nums[w]` and increment `w`. After the loop, the first `w` elements of `nums` hold the result. Return `nums[:w]` or the new length `w`.\n\nThe two-pointer approach is O(n) time and O(1) extra space — it writes in-place without creating a separate array.\n\nEdge cases: no target in array — all elements are preserved, return the original array unchanged; all elements equal target — return empty array; empty array — return empty array; single-element array matching target — return empty array.",
  hints: [
    "Filter approach: return [x for x in nums if x != target] in Python. O(n) time, O(n) space.",
    "Two-pointer in-place: w = 0. For r in range(len(nums)): if nums[r] != target: nums[w] = nums[r], w++. Return nums[:w].",
    "The write pointer w counts how many non-target elements have been placed. Elements before index w are the final result."
  ],
  sampleCases: [{ input: [[3,2,2,3], 3], expected: [2,2] }, { input: [[0,1,2,2,3,0,4,2], 2], expected: [0,1,3,0,4] }],
  hiddenCases: [
    { input: [[1,2,3], 4], expected: [1,2,3] },
    { input: [[1,1,1], 1], expected: [] },
    { input: [[], 5], expected: [] },
    { input: [[1,2,1,2,1], 1], expected: [2,2] }
  ],
  editorial: [
    "Filter approach: return [x for x in nums if x != target]. O(n) time, O(n) space. Simple and correct.",
    "Two-pointer in-place: w = 0. For each r from 0 to n-1: if nums[r] != target: nums[w++] = nums[r]. Return nums[:w]. O(n) time, O(1) extra space.",
    "Why two pointers: the read pointer r iterates every element. The write pointer w tracks the next available position for a non-target element. Non-target elements are compacted to the front.",
    "Order preservation: elements are written in the order they are encountered (r increases left-to-right). The relative order of non-target elements is maintained.",
    "Edge case no target found: every element passes the != check. w ends at n. Return nums[:n] = nums. Correct.",
    "Edge case all target: no element passes. w stays at 0. Return nums[:0] = []. Correct.",
    "This is LeetCode 27 (Remove Element). The two-pointer in-place approach is the expected O(1) space solution in interviews."
  ]
});

patch("merge-sorted-values", {
  judgeReady: true,
  constraints: ["0 <= a.length, b.length <= 10^5", "Both a and b are sorted in non-decreasing order.", "Merge into a single sorted array.", "Return the merged array.", "-10^9 <= a[i], b[j] <= 10^9"],
  examples: [
    { input: "a = [1,3,5], b = [2,4,6]", output: "[1,2,3,4,5,6]", explanation: "Merge two sorted arrays, maintaining sorted order." },
    { input: "a = [1,2,3], b = []", output: "[1,2,3]", explanation: "One array is empty. Return the other." }
  ],
  description: "Given two sorted arrays `a` and `b`, return a single sorted array containing all elements from both. This is the **merge step** of merge sort.\n\nFor example, merging `[1, 3, 5]` with `[2, 4, 6]` gives `[1, 2, 3, 4, 5, 6]`.\n\nThe two-pointer algorithm: use pointers `i = 0` and `j = 0`. While both pointers are valid, compare `a[i]` and `b[j]`: append the smaller one to the result and advance its pointer. After one array is exhausted, append the remaining elements of the other array. This is O(m+n) time and O(m+n) space for the result.\n\nIn Python, `sorted(a + b)` also works in O((m+n) log(m+n)) but wastes the sorted property — always prefer the linear merge for sorted inputs.\n\nEdge cases: one or both arrays empty — the loop terminates immediately, and the non-empty remainder is appended; single element in each — the merge compares once and appends the larger; arrays with duplicate elements — duplicates from both arrays are included in the result.\n\nThis merge operation is foundational in algorithm design. It appears in merge sort (divide-and-conquer sorting), external sorting for data too large to fit in memory, and database merge joins for sorted query results.",
  hints: [
    "Two pointers i=0, j=0. While both valid: if a[i] <= b[j], append a[i], i++; else append b[j], j++. Then append remaining elements of whichever array still has elements.",
    "The remaining elements after one pointer exhausts its array are already sorted — just extend the result with them.",
    "Edge case: if either input is empty, return the other array directly."
  ],
  sampleCases: [{ input: [[1,3,5],[2,4,6]], expected: [1,2,3,4,5,6] }, { input: [[1,2,3],[]], expected: [1,2,3] }],
  hiddenCases: [
    { input: [[],[]], expected: [] },
    { input: [[1],[2]], expected: [1,2] },
    { input: [[1,1],[1,1]], expected: [1,1,1,1] },
    { input: [[-3,-1],[0,2,4]], expected: [-3,-1,0,2,4] }
  ],
  editorial: [
    "Two-pointer merge: i=j=0, result=[]. While i<m and j<n: if a[i]<=b[j]: result.append(a[i]), i++; else result.append(b[j]), j++. Then result.extend(a[i:]) and result.extend(b[j:]). Return result. O(m+n) time, O(m+n) space.",
    "Why <= not <: using <= when a[i] == b[j] appends from a first. This maintains stability (preserves relative order within equal elements). Both < and <= produce correctly sorted results.",
    "Appending remainders: a[i:] and b[j:] are already sorted (slices of sorted arrays). Appending them at the end preserves correctness.",
    "Edge case both empty: i=0=m and j=0=n immediately. No loop iterations. Remainders are empty slices. Return [].",
    "Edge case one empty: the pointer for the empty array starts exhausted. The other array is appended as a whole in the remainder step.",
    "This is the merge step in merge sort. Merge sort splits the array recursively and uses this merge to combine. The total time is O(n log n) because there are O(log n) levels of recursion, each doing O(n) work.",
    "K-way merge extension: to merge k sorted arrays, use a min-heap of (value, array_index, element_index). Extract the minimum, advance its pointer, and insert the next element from that array. O(n log k) time where n is total elements."
  ]
});

save();
