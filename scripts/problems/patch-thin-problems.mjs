// Bulk patch all thin problems (7-gap) with full quality content
// Run: node scripts/patch-thin-problems.mjs

import { readFileSync, writeFileSync } from 'fs';

// Map of slug -> full replacement content for the quality fields
// Each entry provides the 7 missing fields
const patches = {
  "running-total": {
    judgeReady: true,
    constraints: [
      "1 <= nums.length <= 10^4",
      "-10^5 <= nums[i] <= 10^5",
      "Return a new array of the same length as nums.",
      "result[i] = nums[0] + nums[1] + ... + nums[i].",
      "Do not modify the input array."
    ],
    examples: [
      { input: "nums = [3,-1,4]", output: "[3,2,6]", explanation: "result[0]=3, result[1]=3+(-1)=2, result[2]=2+4=6." },
      { input: "nums = [1,2,3,4]", output: "[1,3,6,10]", explanation: "Each element accumulates all previous sums." }
    ],
    description: "Given an integer array `nums`, return a new array `result` where `result[i]` equals the sum of all elements from `nums[0]` to `nums[i]` inclusive. This is also called the prefix sum or cumulative sum array.\n\nFor example, given `nums = [3, -1, 4]`, the result is `[3, 2, 6]` because: `result[0] = 3`, `result[1] = 3 + (-1) = 2`, `result[2] = 2 + 4 = 6`.\n\nThe straightforward approach maintains a running sum variable initialised to 0. For each element in `nums`, add that element to the running sum and append the current running sum to the result array. This runs in O(n) time and O(n) space for the output.\n\nPrefix sums are a foundational technique in competitive programming and interview problems. Once built, a prefix sum array enables O(1) range sum queries: the sum of elements from index `l` to `r` is `result[r] - (l > 0 ? result[l-1] : 0)`.\n\nThis problem is the building block for range-sum-query-immutable, subarray-sum-equals-target, and many sliding window problems. Mastering the construction and usage of prefix sums is essential for array-based problems.\n\nEdge cases: a single-element array returns a single-element array equal to itself; an array of all zeros returns all zeros; negative numbers are handled naturally since the running sum can decrease.",
    hints: [
      "Maintain a running sum variable. For each nums[i], add nums[i] to sum and append sum to the result array.",
      "In-place variant: modify nums[i] = nums[i] + nums[i-1] for i >= 1. This saves space but mutates the input — only do this if the problem allows mutation.",
      "The result array has the same length as nums. result[0] always equals nums[0] since there are no previous elements to add."
    ],
    sampleCases: [
      { input: [[3, -1, 4]], expected: [3, 2, 6] },
      { input: [[1, 2, 3, 4]], expected: [1, 3, 6, 10] }
    ],
    hiddenCases: [
      { input: [[-2, 5, -1]], expected: [-2, 3, 2] },
      { input: [[0, 0, 0]], expected: [0, 0, 0] },
      { input: [[7]], expected: [7] },
      { input: [[-1, -2, -3]], expected: [-1, -3, -6] }
    ],
    editorial: [
      "Algorithm: initialise sum = 0 and result = []. For each value in nums, compute sum += value and append sum to result. Return result. Single pass, O(n) time.",
      "In-place approach (mutates input): for i from 1 to n-1, set nums[i] += nums[i-1]. After the loop, nums itself is the prefix sum array. Saves the output allocation but modifies the input.",
      "Range sum using prefix array: once built, sum(l, r) = result[r] - (l > 0 ? result[l-1] : 0). This is O(1) per query after O(n) build.",
      "Edge case — single element: result = [nums[0]]. The loop runs once, sum = nums[0], result = [nums[0]]. Correct.",
      "Edge case — all zeros: each prefix sum is 0. Running sum starts at 0 and stays 0 after adding 0 repeatedly. Result is an array of zeros.",
      "Edge case — negative values: running sum can be negative or decrease. No special handling needed — the same addition logic applies regardless of sign.",
      "Connection to other problems: this exact function is the preprocessing step for range-sum-query-immutable, and a prerequisite for subarray-sum-equals-target, where you check for prefix[j] - prefix[i] == target using a hash map."
    ]
  },

  "count-strictly-greater": {
    judgeReady: true,
    constraints: [
      "0 <= nums.length <= 10^5",
      "-10^9 <= nums[i], threshold <= 10^9",
      "Return the count of elements strictly greater than threshold.",
      "An empty array returns 0."
    ],
    examples: [
      { input: "nums = [4,2,7,1,9], threshold = 5", output: "2", explanation: "7 and 9 are strictly greater than 5." },
      { input: "nums = [1,2,3], threshold = 3", output: "0", explanation: "No element is strictly greater than 3." }
    ],
    description: "Given an integer array `nums` and an integer `threshold`, return the **count** of elements in `nums` that are **strictly greater than** `threshold`.\n\nFor example, given `nums = [4, 2, 7, 1, 9]` and `threshold = 5`, the elements strictly greater than 5 are 7 and 9, so the answer is 2. An element equal to `threshold` is not counted — strictly greater means only values where `nums[i] > threshold`.\n\nThe solution is a single pass through the array: initialise a counter at 0, and for each element that satisfies `nums[i] > threshold`, increment the counter. Return the counter.\n\nThis is O(n) time and O(1) space. No sorting or auxiliary data structure is needed.\n\nA functional equivalent is `nums.filter(x => x > threshold).length` in JavaScript, or `sum(1 for x in nums if x > threshold)` in Python. Both are O(n).\n\nIf the array were sorted, you could use binary search to find the first index where `nums[i] > threshold` (upper_bound), then the count would be `n - upper_bound_index`. This is O(log n) but requires the array to be sorted first.\n\nEdge cases: empty array returns 0; all elements equal threshold return 0; all elements greater than threshold return `n`; single-element array returns 1 if that element exceeds threshold, else 0.",
    hints: [
      "Single pass: initialise count = 0. For each element in nums, if element > threshold, increment count. Return count.",
      "Functional style: return nums.filter(x => x > threshold).length in JavaScript, or sum(1 for x in nums if x > threshold) in Python.",
      "If the array were sorted, binary search (upper_bound) finds the first element > threshold in O(log n). Count = n - that index. But sorting costs O(n log n) so this is only beneficial if queries are repeated on a pre-sorted array."
    ],
    sampleCases: [
      { input: [[4, 2, 7, 1, 9], 5], expected: 2 },
      { input: [[1, 2, 3], 3], expected: 0 }
    ],
    hiddenCases: [
      { input: [[], 0], expected: 0 },
      { input: [[5, 5, 5], 5], expected: 0 },
      { input: [[10], 9], expected: 1 },
      { input: [[-3, -1, 0, 2], -1], expected: 2 }
    ],
    editorial: [
      "Single-pass count: initialise count = 0. Iterate over nums; if nums[i] > threshold, increment count. Return count. O(n) time, O(1) space.",
      "Strict inequality: 'strictly greater' means > not >=. Elements equal to threshold must not be counted. Always double-check the comparison operator.",
      "Edge case — empty array: the loop never executes, count remains 0. Return 0. Correct.",
      "Edge case — all elements equal threshold: no element satisfies the strict inequality. Return 0.",
      "Edge case — negative threshold: works identically. If threshold = -1 and nums = [-3, -1, 0, 2], elements > -1 are 0 and 2, count = 2.",
      "Binary search approach (sorted array only): use upper_bound to find the first index where nums[i] > threshold. Count = n - that index. O(log n) per query. Requires sorted input.",
      "Relation to sorted-array problems: this count is equivalent to the size of the suffix starting at the upper bound position in a sorted array. Understanding this connection helps with more complex threshold-based queries."
    ]
  },

  "first-unique-number": {
    judgeReady: true,
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^9 <= nums[i] <= 10^9",
      "Return the first element that appears exactly once (from left to right).",
      "If no unique element exists, return -1."
    ],
    examples: [
      { input: "nums = [2,3,2,1,3]", output: "1", explanation: "2 and 3 both appear twice. 1 appears once and is the first such element." },
      { input: "nums = [1,1,2,2]", output: "-1", explanation: "Both 1 and 2 appear twice. No unique element exists." }
    ],
    description: "Given an integer array `nums`, return the **first element that appears exactly once** when scanning left to right. If every element appears more than once, return `-1`.\n\nFor example, in `[2, 3, 2, 1, 3]`, the element `1` at index 3 is the first value that appears exactly once. Values 2 and 3 each appear twice and are not unique. The answer is `1`.\n\nThe standard approach uses two passes and a hash map (or frequency counter). In the first pass, build a map of each value to its occurrence count. In the second pass, scan `nums` from left to right and return the first value whose count is 1. If no such value is found, return -1.\n\nThis is O(n) time and O(n) space for the frequency map. The two-pass approach is necessary to ensure we pick the leftmost unique element — a single pass cannot determine uniqueness without knowing future occurrences.\n\nAn alternative uses an ordered map (LinkedHashMap in Java, OrderedDict in Python) to maintain insertion order: on first encounter, add the key; on second encounter, mark as non-unique. At the end, return the first key still marked as unique.\n\nEdge cases: single-element array always returns that element; all-same array returns -1; the unique element is the last element; all elements are unique (return the first).",
    hints: [
      "First pass: build a frequency map counting occurrences of each value. Second pass: scan nums left to right and return the first value with count == 1.",
      "OrderedDict / LinkedHashMap approach: maintain a map from value to a 'unique' boolean in insertion order. On first visit mark true; on revisit mark false. At the end, return the first key still marked true.",
      "If no unique element exists after the second pass, return -1."
    ],
    sampleCases: [
      { input: [[2, 3, 2, 1, 3]], expected: 1 },
      { input: [[1, 1, 2, 2]], expected: -1 }
    ],
    hiddenCases: [
      { input: [[1]], expected: 1 },
      { input: [[5, 5, 5]], expected: -1 },
      { input: [[1, 2, 3]], expected: 1 },
      { input: [[3, 1, 3, 2]], expected: 1 }
    ],
    editorial: [
      "Two-pass approach: pass 1 — build freq map: for each x in nums, freq[x]++. Pass 2 — scan left to right: return the first x where freq[x] == 1. If none found, return -1.",
      "Why two passes: a single left-to-right pass cannot know if a future occurrence of the current element exists. The frequency map built in pass 1 encodes the complete picture.",
      "OrderedDict approach (single effective pass): use an insertion-ordered map. On first visit, set map[x] = true. On revisit, set map[x] = false. Scan the map in insertion order and return the first key with value true. O(n) time and space.",
      "Edge case — single element: freq[nums[0]] = 1. Second pass immediately returns nums[0]. Correct.",
      "Edge case — all duplicates: freq shows every value >= 2. Second pass finds no element with count 1. Return -1.",
      "Edge case — all unique: every value has count 1. Second pass returns nums[0], the leftmost element. Correct.",
      "Relation to first-non-repeating-character: this is the integer analogue of that classic string problem. The same two-pass or ordered-map approach applies to both."
    ]
  },

  "move-negatives-left": {
    judgeReady: true,
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^9 <= nums[i] <= 10^9",
      "Move all negative integers to the front and all non-negatives to the back.",
      "Relative order within negatives and within non-negatives does not need to be preserved.",
      "Modify the array in-place and return it."
    ],
    examples: [
      { input: "nums = [-1,2,-3,4]", output: "[-1,-3,2,4] or [-3,-1,2,4]", explanation: "Negatives at front, non-negatives at back. Any valid arrangement is accepted." },
      { input: "nums = [1,-2,3,-4,5]", output: "[-2,-4,1,3,5] or any arrangement with negatives first" }
    ],
    description: "Given an integer array `nums`, rearrange it **in-place** so that all **negative integers** appear at the front (left side) and all **non-negative integers** appear at the back (right side). The relative order of elements within each group does not need to be preserved. Return the modified array.\n\nFor example, given `[-1, 2, -3, 4]`, one valid result is `[-1, -3, 2, 4]`. Another is `[-3, -1, 4, 2]`. Any arrangement where all negatives precede all non-negatives is correct.\n\nThe standard two-pointer approach: initialise `left = 0` (the next position for a negative) and `right = n-1` (the next position for a non-negative). While `left < right`: if `nums[left] < 0`, the negative is already in position — advance `left`. If `nums[right] >= 0`, the non-negative is already in position — decrement `right`. Otherwise, `nums[left] >= 0` and `nums[right] < 0` — swap them and advance both pointers. This runs in O(n) time and O(1) extra space.\n\nThis is a partition problem analogous to the partition step in quicksort, where the pivot value is 0. All values less than 0 go to the left partition, all values >= 0 go to the right.\n\nA simpler but less space-efficient approach: create two separate arrays `negatives` and `non_negatives`, then concatenate them. This is O(n) time and O(n) space.\n\nIf order must be preserved, use a stable partition algorithm (O(n log n) or O(n) with O(n) space). For this problem, order preservation is not required.",
    hints: [
      "Two-pointer approach: left pointer starts at 0, right pointer starts at n-1. If nums[left] < 0, advance left. If nums[right] >= 0, decrement right. If both are misplaced (nums[left] >= 0 and nums[right] < 0), swap them.",
      "This is the partition step of quicksort with pivot 0 — all elements < 0 go left, all >= 0 go right.",
      "If relative order must be preserved, use a stable partition: iterate and collect negatives then non-negatives into a new array, then copy back. O(n) space."
    ],
    sampleCases: [
      { input: [[-1, 2, -3, 4]], expected: [-1, -3, 2, 4] },
      { input: [[1, -2, 3, -4, 5]], expected: [-2, -4, 1, 3, 5] }
    ],
    hiddenCases: [
      { input: [[-1, -2, -3]], expected: [-1, -2, -3] },
      { input: [[1, 2, 3]], expected: [1, 2, 3] },
      { input: [[0, -1, 2]], expected: [-1, 0, 2] },
      { input: [[-5]], expected: [-5] }
    ],
    editorial: [
      "Two-pointer partition: left = 0, right = n-1. While left < right: if nums[left] < 0, left++; else if nums[right] >= 0, right--; else swap(nums[left], nums[right]), left++, right--.",
      "Invariant: all elements before left are negative; all elements after right are non-negative. When left >= right, partition is complete.",
      "Zero is non-negative (0 >= 0), so zeros go to the right partition. This is consistent with the problem statement.",
      "Simple O(n) space approach: negatives = [x for x in nums if x < 0], non_neg = [x for x in nums if x >= 0], return negatives + non_neg. Correct but uses O(n) extra space.",
      "Edge case — all negative: left never advances because every element is negative. Wait — if all are negative, nums[right] will also be negative, so right will decrement until left >= right. No swaps. Array unchanged. Correct.",
      "Edge case — all non-negative: similar reasoning. nums[left] >= 0 every time so right decrements each step. No swaps. Correct.",
      "Relation to quicksort partition: this is exactly a partition step with pivot = 0 and strict negative as the left condition. Understanding this connection deepens intuition for partition-based algorithms."
    ]
  },

  "longest-even-streak": {
    judgeReady: true,
    constraints: [
      "0 <= nums.length <= 10^5",
      "-10^9 <= nums[i] <= 10^9",
      "A streak is a contiguous subsequence of even integers.",
      "Return the length of the longest such streak. If no even number exists, return 0."
    ],
    examples: [
      { input: "nums = [2,4,1,6,8,10]", output: "3", explanation: "6, 8, 10 are three consecutive even numbers. 2,4 is length 2. Maximum is 3." },
      { input: "nums = [1,3,5]", output: "0", explanation: "No even numbers at all." }
    ],
    description: "Given an integer array `nums`, return the length of the **longest contiguous subsequence of even integers**. A contiguous subsequence means elements at consecutive indices with no gaps. An even integer is any integer divisible by 2 (including negative even numbers and zero).\n\nFor example, in `[2, 4, 1, 6, 8, 10]`, the streaks of even numbers are `[2, 4]` (length 2) and `[6, 8, 10]` (length 3). The longest is 3.\n\nThe solution uses a single pass with a current streak counter and a maximum tracker. Initialise `current = 0` and `maxStreak = 0`. For each element: if it is even (divisible by 2), increment `current` and update `maxStreak = max(maxStreak, current)`. If it is odd, reset `current = 0`. Return `maxStreak`.\n\nThis is O(n) time and O(1) space.\n\nNegative even numbers like -2, -4 are even (divisible by 2 with zero remainder). Zero is also even. The modulo check `x % 2 == 0` handles all these cases correctly in most languages.\n\nEdge cases: empty array returns 0; array with no even numbers returns 0; entire array is even — the streak never resets and equals n.",
    hints: [
      "Use a running counter: reset it to 0 on any odd number, increment it on any even number. Track the maximum.",
      "Check evenness with x % 2 == 0. This works for negative numbers too (-4 % 2 == 0 in most languages, though Python guarantees this; check your language's behaviour).",
      "Update maxStreak = max(maxStreak, current) every time you increment current, not just at the end."
    ],
    sampleCases: [
      { input: [[2, 4, 1, 6, 8, 10]], expected: 3 },
      { input: [[1, 3, 5]], expected: 0 }
    ],
    hiddenCases: [
      { input: [[], []], expected: 0 },
      { input: [[2, 2, 2, 2]], expected: 4 },
      { input: [[0, -2, 1, 4]], expected: 2 },
      { input: [[1, 2, 4, 6, 3, 2, 2]], expected: 3 }
    ],
    editorial: [
      "Single pass: initialise current = 0, maxStreak = 0. For each x in nums: if x % 2 == 0, increment current and update maxStreak = max(maxStreak, current); else reset current = 0. Return maxStreak.",
      "Why reset to 0 on odd: the problem requires contiguous even numbers. Any odd number breaks the streak, so the current count must restart from 0.",
      "Update maxStreak inside the loop (not just at the end): if the longest streak ends in the middle of the array, a post-loop update would miss it — but actually updating max(maxStreak, current) every even step is sufficient since maxStreak only increases.",
      "Zero and negative evens: 0 % 2 == 0, (-4) % 2 == 0. Both extend the streak. The modulo check handles them uniformly.",
      "Edge case — empty array: loop never executes, maxStreak = 0. Return 0. Correct.",
      "Edge case — all even: current increments on every element, maxStreak grows to n. Return n. Correct.",
      "Generalisation: this same pattern solves 'longest streak of positive', 'longest streak of values > threshold', 'longest streak satisfying predicate P' — just replace the even check with the predicate."
    ]
  },

  "maximum-neighbor-gap": {
    judgeReady: true,
    constraints: [
      "2 <= nums.length <= 10^5",
      "-10^9 <= nums[i] <= 10^9",
      "Return the maximum absolute difference between any two adjacent elements.",
      "Adjacent means consecutive indices (i and i+1)."
    ],
    examples: [
      { input: "nums = [3,1,7,2]", output: "6", explanation: "|3-1|=2, |1-7|=6, |7-2|=5. Maximum is 6." },
      { input: "nums = [5,5,5]", output: "0", explanation: "All differences are 0." }
    ],
    description: "Given an integer array `nums` of length at least 2, return the **maximum absolute difference** between any pair of **adjacent elements** (elements at consecutive indices).\n\nFor example, in `[3, 1, 7, 2]`, the adjacent differences are `|3-1| = 2`, `|1-7| = 6`, and `|7-2| = 5`. The maximum is `6`.\n\nThe solution iterates through adjacent pairs from index 0 to n-2, computing `abs(nums[i+1] - nums[i])` for each pair and tracking the maximum. This is O(n) time and O(1) space.\n\nThis problem is a direct application of scanning adjacent pairs — a foundational pattern that also appears in problems like best-time-buy-sell (where differences between consecutive prices are computed), daily-temperature-wait (consecutive day comparisons), and longest even streak (streak through consecutive elements).\n\nNote that this asks for the maximum among differences of **adjacent** pairs, not the maximum minus minimum over the whole array. Those are different problems: maximum overall range is `max(nums) - min(nums)`, while this problem is specifically about consecutive indices.\n\nEdge cases: two-element array — the answer is the difference between the only pair; all same elements — answer is 0; negative numbers — absolute value handles direction correctly.",
    hints: [
      "Iterate from i=0 to n-2. For each i, compute abs(nums[i+1] - nums[i]). Track the maximum across all pairs.",
      "Use abs() for the absolute value — the gap is the same whether the next element is larger or smaller.",
      "With only 2 elements the answer is simply abs(nums[1] - nums[0]). Your loop handles this as a single-iteration case."
    ],
    sampleCases: [
      { input: [[3, 1, 7, 2]], expected: 6 },
      { input: [[5, 5, 5]], expected: 0 }
    ],
    hiddenCases: [
      { input: [[1, 2]], expected: 1 },
      { input: [[-5, 5]], expected: 10 },
      { input: [[1, 1, 1, 10]], expected: 9 },
      { input: [[100, -100, 100]], expected: 200 }
    ],
    editorial: [
      "Single pass: initialise maxGap = 0. For i from 0 to n-2, compute diff = abs(nums[i+1] - nums[i]) and update maxGap = max(maxGap, diff). Return maxGap.",
      "abs() is essential: without it, a pair (7, 1) gives 7-1=6 but (1, 7) gives 1-7=-6, missing the correct magnitude. abs() normalises direction.",
      "Initialising maxGap to 0: since the minimum possible gap is 0 (equal adjacent elements), starting at 0 is safe — the true maximum will either be 0 (all same) or larger.",
      "Two-element edge case: the loop runs exactly once (i=0), computing abs(nums[1]-nums[0]). Correct.",
      "All-same edge case: every diff is 0. maxGap stays at 0. Return 0. Correct.",
      "Large difference edge case: with values at the integer extremes (-10^9 and 10^9), the difference is 2*10^9 which overflows a 32-bit signed integer. Use 64-bit integers (long in Java, int64 in C++) or languages like Python/JavaScript where integers are arbitrarily large.",
      "Connection to other problems: the maximum adjacent gap is used in the Pigeonhole Principle argument for the 'Maximum Gap' problem on sorted arrays — knowing adjacent gaps in sorted order characterises where the maximum gap is concentrated."
    ]
  }
};

// Read bank.ts
let src = readFileSync('src/lib/problems/bank.ts', 'utf8');

function stripLineComments(text) {
  let result = '';
  let inString = false;
  let i = 0;
  while (i < text.length) {
    if (inString) {
      if (text[i] === '\\') { result += text[i] + (text[i+1] || ''); i += 2; }
      else if (text[i] === '"') { result += text[i++]; inString = false; }
      else { result += text[i++]; }
    } else {
      if (text[i] === '"') { inString = true; result += text[i++]; }
      else if (text[i] === '/' && text[i+1] === '/') { while (i < text.length && text[i] !== '\n') i++; }
      else { result += text[i++]; }
    }
  }
  return result;
}

let patchCount = 0;
let errors = [];

for (const [slug, patch] of Object.entries(patches)) {
  const slugMarker = `"slug": "${slug}"`;
  const idx = src.indexOf(slugMarker);
  if (idx < 0) { errors.push(`${slug}: NOT FOUND`); continue; }

  // Extract current entry
  const start = src.lastIndexOf('\n  {', idx);
  const nextEntry = src.indexOf('\n  },\n  {', idx);
  const objEnd = nextEntry >= 0 ? nextEntry + 4 : src.lastIndexOf('\n  }') + 4;
  const entryRaw = src.substring(start + 1, objEnd);

  // Parse current entry
  const noComments = stripLineComments(entryRaw);
  const cleaned = noComments.replace(/,(\s*[}\]])/g, '$1');
  let obj;
  try {
    obj = JSON.parse(cleaned);
  } catch(e) {
    errors.push(`${slug}: PARSE ERROR: ${e.message}`);
    continue;
  }

  // Apply patches
  obj.judgeReady = true;
  obj.constraints = patch.constraints;
  obj.examples = patch.examples;
  obj.description = patch.description;
  obj.hints = patch.hints;
  obj.sampleCases = patch.sampleCases;
  obj.hiddenCases = patch.hiddenCases;
  obj.editorial = patch.editorial;
  // Upgrade solutionApproaches if it's a placeholder
  if (!patch.solutionApproaches && obj.solutionApproaches?.[0]?.title === 'Direct Pattern') {
    // keep existing
  }

  // Serialize back
  const newEntry = JSON.stringify(obj, null, 4);

  // Replace in source (preserve trailing comma for non-last entries)
  const trailingComma = nextEntry >= 0 ? ',' : '';
  const replacement = `  ${newEntry.replace(/\n/g, '\n  ')}${trailingComma}`;

  src = src.substring(0, start + 1) + replacement + src.substring(objEnd);
  patchCount++;
  console.log(`✓ Patched: ${slug}`);
}

if (errors.length) {
  console.log('\nErrors:');
  errors.forEach(e => console.log(' ✗', e));
}

writeFileSync('src/lib/problems/bank.ts', src);
console.log(`\nDone: ${patchCount} patched, ${errors.length} errors.`);
