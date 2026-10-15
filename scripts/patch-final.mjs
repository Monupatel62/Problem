import { createPatcher } from './patcher-core.mjs';
const { patch, save } = createPatcher('src/lib/problems/bank.ts');

// sorted-squares-values
patch("sorted-squares-values", {
  judgeReady: true,
  constraints: ["1 <= nums.length <= 10^4", "nums is sorted in non-decreasing order.", "-10^4 <= nums[i] <= 10^4", "Return array of squares of each element, sorted in non-decreasing order."],
  examples: [
    { input: "nums = [-4,-1,0,3,10]", output: "[0,1,9,16,100]", explanation: "Squares: 16,1,0,9,100. Sorted: 0,1,9,16,100." },
    { input: "nums = [-7,-3,2,3,11]", output: "[4,9,9,49,121]", explanation: "Squares sorted ascending." }
  ],
  description: "Given an integer array `nums` sorted in non-decreasing order, return an array of the **squares of each number**, also sorted in non-decreasing order.\n\nFor example, `[-4,-1,0,3,10]` has squares `[16,1,0,9,100]`, which sorted gives `[0,1,9,16,100]`.\n\nThe naive approach: square each element and sort. O(n log n) time.\n\nThe optimal two-pointer approach exploits the input's sorted property: the largest squares come from the most negative or most positive ends. Use left and right pointers. At each step, compare the absolute values at both ends. Place the larger square at the current fill position (filling from the right of the result). This is O(n) time and O(n) space.\n\nEdge cases: all negative — right pointer never moves, left fills from right; all positive — left pointer never moves, right fills; single element — one square, return it; contains zero — zero is the minimum square, ends up first.",
  hints: [
    "Two pointers at each end. Compare abs(nums[left]) vs abs(nums[right]). Place the larger square at result[end--] and advance the corresponding pointer inward.",
    "Fill result from right to left. The largest square is always at one of the two ends of the current range.",
    "Naive: return sorted(x*x for x in nums). O(n log n). Optimal two-pointer: O(n)."
  ],
  sampleCases: [{ input: [[-4,-1,0,3,10]], expected: [0,1,9,16,100] }, { input: [[-7,-3,2,3,11]], expected: [4,9,9,49,121] }],
  hiddenCases: [
    { input: [[-1]], expected: [1] },
    { input: [[0,1,2]], expected: [0,1,4] },
    { input: [[-3,-2,-1]], expected: [1,4,9] },
    { input: [[-5,-3,0,1,4]], expected: [0,1,9,16,25] }
  ],
  editorial: [
    "Two-pointer O(n): left=0, right=n-1, pos=n-1, result=new array of size n. While left<=right: if nums[left]^2 >= nums[right]^2: result[pos--]=nums[left]^2, left++; else result[pos--]=nums[right]^2, right--. Return result.",
    "Why fill from right: we know the largest square is always at one end. Filling from the back allows placing the largest remaining square without shifting elements.",
    "Why input sorted order matters: if input were unsorted, we could not use two pointers and would need O(n log n) sort. The sorted property means the two-pointer merges the two monotone halves in linear time.",
    "Naive approach: [x**2 for x in nums] followed by sort(). Correct but O(n log n). Ignores the sorted input property.",
    "Edge case all negative: left pointer provides all values. Squares decrease as we move left inward, so larger squares come first from the outermost elements.",
    "Edge case contains zero: zero square (0) ends up at result[0]. All other squares are larger.",
    "This is LeetCode 977. The two-pointer approach is the standard expected O(n) solution in interviews."
  ]
});

// max-consecutive-ones-simple
patch("max-consecutive-ones-simple", {
  judgeReady: true,
  constraints: ["1 <= nums.length <= 10^5", "nums[i] is 0 or 1.", "Return the maximum number of consecutive 1s in the array."],
  examples: [
    { input: "nums = [1,1,0,1,1,1]", output: "3", explanation: "The last three 1s form the longest consecutive run." },
    { input: "nums = [1,0,1,1,0,1]", output: "2", explanation: "Two runs of two 1s and one run of one. Maximum is 2." }
  ],
  description: "Given a binary array `nums` containing only 0s and 1s, return the **maximum number of consecutive 1s**.\n\nFor example, in `[1,1,0,1,1,1]`, the runs of 1s have lengths 2 and 3. The maximum is 3.\n\nThe solution is a single pass: maintain `current` (length of current 1-run) and `maxLen` (maximum seen so far). For each element: if it is 1, increment `current` and update `maxLen = max(maxLen, current)`. If it is 0, reset `current = 0`. Return `maxLen`.\n\nThis runs in O(n) time and O(1) space. This is the simplest instance of the longest-streak pattern — a counter that resets on any element failing the condition.\n\nEdge cases: no 1s — maxLen stays 0; all 1s — one run of length n; single element 1 — return 1; last element ends a run — the max update inside the loop catches it correctly.",
  hints: [
    "Single pass: current = 0, maxLen = 0. For each x: if x==1 increment current and update maxLen; else reset current=0. Return maxLen.",
    "Update maxLen = max(maxLen, current) every time current increments, not just on reset.",
    "If the longest run of 1s is at the end, resetting on 0 would miss it — but updating inside the increment ensures it's captured."
  ],
  sampleCases: [{ input: [[1,1,0,1,1,1]], expected: 3 }, { input: [[1,0,1,1,0,1]], expected: 2 }],
  hiddenCases: [
    { input: [[0,0,0]], expected: 0 },
    { input: [[1,1,1]], expected: 3 },
    { input: [[0,1,0]], expected: 1 },
    { input: [[1,0,0,1,0,1,1,1]], expected: 3 }
  ],
  editorial: [
    "Algorithm: current=0, maxLen=0. For x in nums: if x==1: current++, maxLen=max(maxLen,current); else: current=0. Return maxLen. O(n) time, O(1) space.",
    "Why update inside the 1-branch: if the longest run ends at the array boundary (last element is 1), it never triggers a reset. Updating maxLen every step ensures it is captured.",
    "Reset to 0 not 1: when you see a 0, the streak ends completely. The next 1 starts a fresh run of length 1. Resetting current to 0 before the next 1 increment achieves this.",
    "Edge case all zeros: current never increments. maxLen stays 0. Return 0.",
    "Edge case all ones: current grows to n. maxLen = n. Return n.",
    "This is the simplest longest-streak problem. The same pattern applies to 'max consecutive zeros', 'max consecutive evens', or any condition by replacing the x==1 check.",
    "LeetCode 485. Straightforward interview warm-up question testing streak tracking pattern."
  ]
});

// find-pivot-index-simple
patch("find-pivot-index-simple", {
  judgeReady: true,
  constraints: ["1 <= nums.length <= 10^4", "-1000 <= nums[i] <= 1000", "Return the leftmost pivot index where leftSum == rightSum.", "Pivot index: sum of elements to the LEFT equals sum to the RIGHT.", "If no pivot exists return -1."],
  examples: [
    { input: "nums = [1,7,3,6,5,6]", output: "3", explanation: "Left of index 3: 1+7+3=11. Right of index 3: 5+6=11. Equal." },
    { input: "nums = [1,2,3]", output: "-1", explanation: "No index has equal left and right sums." }
  ],
  description: "Given an integer array `nums`, return the **leftmost pivot index** — the index where the sum of all elements to its left equals the sum of all elements to its right. The element at the pivot index itself is not included in either sum.\n\nFor example, in `[1,7,3,6,5,6]`, index 3 has left sum `1+7+3=11` and right sum `5+6=11`. It is the pivot.\n\nThe efficient approach uses prefix sums: compute `totalSum = sum(nums)`. Then scan left to right maintaining `leftSum = 0`. At each index `i`: if `leftSum == totalSum - leftSum - nums[i]`, return `i`. Otherwise `leftSum += nums[i]`. Return -1 if no pivot found.\n\nThe condition `leftSum == totalSum - leftSum - nums[i]` simplifies to `2*leftSum + nums[i] == totalSum`, which avoids computing the right sum separately.\n\nThis is O(n) time and O(1) space.\n\nEdge cases: pivot at index 0 — left sum is 0, right sum must equal sum(nums[1:]); pivot at last index — right sum is 0, left sum must equal sum(nums[:-1]); single element — left=0, right=0, index 0 is always a pivot.",
  hints: [
    "Compute total = sum(nums). Scan with leftSum=0. At index i: if leftSum == total - leftSum - nums[i], return i. Else leftSum += nums[i]. Return -1.",
    "The condition simplifies to: 2*leftSum + nums[i] == total. Avoids computing rightSum separately.",
    "Edge: pivot at index 0 means leftSum=0 and rightSum=total-nums[0]. Edge: pivot at last index means rightSum=0 and leftSum=total-nums[-1]."
  ],
  sampleCases: [{ input: [[1,7,3,6,5,6]], expected: 3 }, { input: [[1,2,3]], expected: -1 }],
  hiddenCases: [
    { input: [[2,1,-1]], expected: 0 },
    { input: [[0]], expected: 0 },
    { input: [[-1,-1,-1,-1,-1,0]], expected: 2 },
    { input: [[1,0]], expected: -1 }
  ],
  editorial: [
    "Prefix sum approach: total = sum(nums). leftSum = 0. For i, x in enumerate(nums): if leftSum == total - leftSum - x: return i. leftSum += x. Return -1. O(n) time, O(1) space.",
    "Derivation of condition: rightSum = total - leftSum - nums[i]. Pivot condition: leftSum == rightSum. Substituting: leftSum == total - leftSum - nums[i], i.e. 2*leftSum + nums[i] == total.",
    "Why leftmost: the loop scans from left to right and returns on the first hit. No need to continue after finding the first pivot.",
    "Edge case index 0: leftSum=0 before checking index 0. Condition: 0 == total - 0 - nums[0] => nums[0] == total - nums[0] => 2*nums[0] == total. Equivalent to nums[0] == sum(nums[1:]).",
    "Edge case single element: total = nums[0]. Condition: 0 == total - 0 - nums[0] = 0. Always true. Return 0.",
    "This is LeetCode 724. The prefix-sum condition is the key insight. The naive O(n^2) approach computes left and right sums separately for each index.",
    "Comparison with subarray-sum-equals-k: both use prefix sums but for different goals — this finds a pivot, that counts subarrays with a target sum."
  ]
});

// range-sum-basic
patch("range-sum-basic", {
  judgeReady: true,
  constraints: ["1 <= nums.length <= 10^4", "-10^5 <= nums[i] <= 10^5", "0 <= left <= right < nums.length", "Return the sum of elements from index left to right inclusive."],
  examples: [
    { input: "nums = [1,2,3,4,5], left = 1, right = 3", output: "9", explanation: "2+3+4 = 9." },
    { input: "nums = [1,2,3], left = 0, right = 2", output: "6", explanation: "1+2+3 = 6 (full array sum)." }
  ],
  description: "Given an integer array `nums` and two indices `left` and `right`, return the **sum of elements between indices `left` and `right`**, inclusive.\n\nFor example, in `[1,2,3,4,5]` with `left=1, right=3`, the answer is `2+3+4=9`.\n\nThe naive approach: iterate from `left` to `right` summing elements. O(right-left+1) per query, O(n) worst case.\n\nFor multiple queries, the prefix sum approach preprocesses in O(n) and answers each query in O(1): build `prefix[i] = nums[0]+...+nums[i]`. Then `rangeSum(l,r) = prefix[r] - (l>0 ? prefix[l-1] : 0)`.\n\nThis problem is the single-query version. The naive O(n) loop suffices here. The prefix sum is relevant when many queries are needed.\n\nEdge cases: left == right — return single element; left == 0 — no subtraction needed; entire array query (left=0, right=n-1) — sum all elements.",
  hints: [
    "Naive: return sum(nums[left:right+1]). O(n) time per query.",
    "For a single query: iterate from left to right adding nums[i]. Return total.",
    "Prefix sum for multiple queries: prefix[i] = prefix[i-1] + nums[i]. rangeSum(l,r) = prefix[r] - (l>0 ? prefix[l-1] : 0)."
  ],
  sampleCases: [{ input: [[1,2,3,4,5], 1, 3], expected: 9 }, { input: [[1,2,3], 0, 2], expected: 6 }],
  hiddenCases: [
    { input: [[5], 0, 0], expected: 5 },
    { input: [[-1,2,-3,4], 1, 3], expected: 3 },
    { input: [[1,2,3,4,5], 0, 4], expected: 15 },
    { input: [[10,20,30], 2, 2], expected: 30 }
  ],
  editorial: [
    "Naive: return sum(nums[left:right+1]) or loop from left to right accumulating. O(right-left+1) time, O(1) space.",
    "Prefix sum: prefix[0]=nums[0], prefix[i]=prefix[i-1]+nums[i]. rangeSum(l,r) = prefix[r] - (prefix[l-1] if l>0 else 0). O(1) per query after O(n) build.",
    "When to use prefix sum vs naive: if you answer only one query, naive is simpler. If you answer q queries, prefix sum saves O(q*n) vs O(n+q) total time.",
    "Edge case left==right: sum is just nums[left]. Both approaches return the single element correctly.",
    "Edge case left==0: no prefix[l-1] subtraction (would be prefix[-1] which doesn't exist). The ternary handles this.",
    "Range sum is a fundamental operation. It appears in sliding window problems (fixed-size window sum), difference arrays (range updates), and as a building block in Fenwick trees and segment trees.",
    "This problem is a simplified version of range-sum-query-immutable which uses a class wrapper and pre-builds the prefix array once for multiple queries."
  ]
});

// unique-intersection-values
patch("unique-intersection-values", {
  judgeReady: true,
  constraints: ["1 <= nums1.length, nums2.length <= 10^5", "-10^9 <= nums[i] <= 10^9", "Return array of unique values present in both arrays.", "No duplicates in result.", "Order does not matter."],
  examples: [
    { input: "nums1 = [1,2,2,1], nums2 = [2,2]", output: "[2]", explanation: "2 appears in both. Even with duplicates in input, 2 appears once in result." },
    { input: "nums1 = [4,9,5], nums2 = [9,4,9,8,4]", output: "[9,4]", explanation: "9 and 4 appear in both." }
  ],
  description: "Given two integer arrays `nums1` and `nums2`, return an array of their **unique intersection** — the unique values that appear in both arrays. Each value appears at most once in the result regardless of how many times it appears in the inputs.\n\nFor example, `nums1 = [1,2,2,1]` and `nums2 = [2,2]` have unique intersection `[2]`. Though 2 appears twice in each, it contributes only one entry to the result.\n\nThe hash set approach: convert `nums1` to a set. For each element in `nums2`, check if it is in the set. Collect results in another set to avoid duplicates. Return as list. O(m+n) time, O(min(m,n)) space.\n\nAlternative: sort both arrays and use two pointers to find common elements in O((m+n) log(m+n)) time, O(1) extra space.\n\nEdge cases: no common elements — empty result; all elements common — result is union of unique values; one array empty — empty result.",
  hints: [
    "Convert nums1 to set1. Iterate nums2 and collect elements in set1 into a result set. Return list(resultSet).",
    "Python one-liner: list(set(nums1) & set(nums2)). The & operator on sets gives intersection.",
    "Sort + two pointer: sort both, advance i or j based on comparison, add to result when equal and advance both."
  ],
  sampleCases: [{ input: [[1,2,2,1],[2,2]], expected: [2] }, { input: [[4,9,5],[9,4,9,8,4]], expected: [9,4] }],
  hiddenCases: [
    { input: [[1],[2]], expected: [] },
    { input: [[1,1,1],[1,1]], expected: [1] },
    { input: [[1,2,3],[4,5,6]], expected: [] },
    { input: [[1,2,3,4],[2,4,6,8]], expected: [2,4] }
  ],
  editorial: [
    "Hash set: set1 = set(nums1). result = set(). For x in nums2: if x in set1: result.add(x). Return list(result). O(m+n) time, O(m) space.",
    "Python one-liner: list(set(nums1) & set(nums2)). Set intersection uses hashing internally, O(min(m,n)) time after O(m+n) set construction.",
    "Sort + two pointer: sort nums1, sort nums2. i=j=0, result=[]. While i<m and j<n: if nums1[i]==nums2[j]: if not result or result[-1]!=nums1[i]: result.append(nums1[i]); i++,j++; elif nums1[i]<nums2[j]: i++; else j++. O((m+n)log) time, O(1) extra.",
    "Edge case empty arrays: set intersection of empty set with anything is empty. Return [].",
    "This is identical to intersection-two-arrays (LeetCode 349). The result set automatically handles deduplication.",
    "Difference from LeetCode 350 (Intersection of Two Arrays II): that problem counts duplicates (intersection by count). This problem wants unique values only.",
    "Space optimisation: put the smaller array in the set to minimise memory usage: if len(nums1) > len(nums2): swap them."
  ]
});

// max-sum-window
patch("max-sum-window", {
  judgeReady: true,
  constraints: ["1 <= k <= nums.length <= 10^5", "-10^5 <= nums[i] <= 10^5", "Return the maximum sum of any contiguous subarray of length exactly k."],
  examples: [
    { input: "nums = [2,1,5,1,3,2], k = 3", output: "9", explanation: "Window [5,1,3] sums to 9. All windows: 8,7,9,6. Max is 9." },
    { input: "nums = [2,3,4,1,5], k = 2", output: "7", explanation: "Window [3,4] sums to 7." }
  ],
  description: "Given an integer array `nums` and integer `k`, return the **maximum sum of any contiguous subarray of length `k`**.\n\nFor example, in `[2,1,5,1,3,2]` with `k=3`, all windows of length 3 are `[2,1,5]=8`, `[1,5,1]=7`, `[5,1,3]=9`, `[1,3,2]=6`. Maximum is 9.\n\nThe naive approach computes the sum for each window independently in O(k) time, giving O(n*k) total.\n\nThe sliding window approach is O(n) time O(1) space: compute the first window sum, then slide right by subtracting the outgoing element and adding the incoming element. Track the maximum throughout.\n\nCompute first window sum = sum(nums[0:k]). Then for i from k to n-1: windowSum += nums[i] - nums[i-k]. maxSum = max(maxSum, windowSum). This is the textbook fixed-size sliding window.\n\nEdge cases: k == n — only one window, return total sum; k == 1 — return max(nums); array contains negatives — sliding window still works correctly.",
  hints: [
    "Compute first window sum = sum(nums[0:k]). Then slide: windowSum += nums[i] - nums[i-k] for i in range(k, n). Track maximum.",
    "Never recompute the window from scratch. Each slide is one addition and one subtraction — O(1) per step.",
    "k == n means one window (full array). k == 1 means n windows each of size 1 (return max element)."
  ],
  sampleCases: [{ input: [[2,1,5,1,3,2], 3], expected: 9 }, { input: [[2,3,4,1,5], 2], expected: 7 }],
  hiddenCases: [
    { input: [[1,2,3,4,5], 5], expected: 15 },
    { input: [[-1,-2,-3,-4], 2], expected: -3 },
    { input: [[5], 1], expected: 5 },
    { input: [[1,2,1,2,1], 3], expected: 5 }
  ],
  editorial: [
    "Sliding window: windowSum = sum(nums[:k]), maxSum = windowSum. For i from k to n-1: windowSum += nums[i] - nums[i-k]; maxSum = max(maxSum, windowSum). Return maxSum. O(n) time, O(1) space.",
    "Why sliding is O(n): each element is added once (when entering the window) and subtracted once (when leaving). Total operations = 2n regardless of k.",
    "Naive O(n*k): for each start in range(n-k+1): sum(nums[start:start+k]). Correct but slow for large k.",
    "Edge case k==n: loop never executes (range(n,n) is empty). windowSum = sum(nums). maxSum = windowSum. Return total sum.",
    "Edge case k==1: windowSum starts as nums[0]. Each step: windowSum = nums[i]. maxSum tracks the running maximum. Equivalent to max(nums).",
    "Negative values: the sliding window sums can be negative. maxSum is initialised to the first window sum (not 0) to handle all-negative arrays correctly.",
    "This is the textbook fixed-size sliding window pattern. Memorise it — it appears in many interview problems as a sub-step or directly."
  ]
});

// min-length-subarray-sum
patch("min-length-subarray-sum", {
  judgeReady: true,
  constraints: ["1 <= nums.length <= 10^5", "1 <= nums[i] <= 10^4", "1 <= target <= 10^9", "Return the minimum length subarray with sum >= target, or 0 if none exists."],
  examples: [
    { input: "nums = [2,3,1,2,4,3], target = 7", output: "2", explanation: "[4,3] sums to 7 with length 2." },
    { input: "nums = [1,4,4], target = 4", output: "1", explanation: "[4] alone satisfies >= 4." }
  ],
  description: "Given a positive integer array `nums` and a positive integer `target`, return the **minimum length** of a contiguous subarray whose sum is **greater than or equal to `target`**. Return 0 if no such subarray exists.\n\nFor example, in `[2,3,1,2,4,3]` with `target=7`, the subarray `[4,3]` has sum 7 with length 2. No shorter subarray meets the threshold.\n\nThe variable-size sliding window approach: maintain left and right pointers. Expand right to increase sum. When sum >= target, record the window length and shrink from left as long as sum remains >= target. Track the minimum window length.\n\nThis is O(n) time because each element is added at most once (right advances) and removed at most once (left advances). O(1) space.\n\nThe naive O(n^2) approach checks all (left, right) pairs.\n\nEdge cases: no subarray reaches target — return 0; single element >= target — return 1; entire array sum < target — return 0.",
  hints: [
    "Variable sliding window: expand right pointer adding nums[right]. While windowSum >= target: record length, subtract nums[left] and left++. Track minimum.",
    "Both pointers start at 0. right expands the window, left shrinks it when the condition is met.",
    "Initialise minLen = infinity. After the loop, return minLen if minLen != infinity else 0."
  ],
  sampleCases: [{ input: [[2,3,1,2,4,3], 7], expected: 2 }, { input: [[1,4,4], 4], expected: 1 }],
  hiddenCases: [
    { input: [[1,1,1,1,1,1,1], 11], expected: 0 },
    { input: [[1,2,3,4,5], 15], expected: 5 },
    { input: [[5], 5], expected: 1 },
    { input: [[2,3,1,2,4,3], 100], expected: 0 }
  ],
  editorial: [
    "Variable sliding window: left=0, windowSum=0, minLen=inf. For right from 0 to n-1: windowSum += nums[right]. While windowSum >= target: minLen = min(minLen, right-left+1); windowSum -= nums[left]; left++. Return minLen if minLen!=inf else 0.",
    "Why variable-size: unlike fixed-size window, here the window expands and contracts dynamically. We expand until the condition is met, then contract to find the minimum valid window.",
    "O(n) proof: right pointer moves from 0 to n-1 (n steps). Left pointer moves from 0 to at most n (n steps). Total: O(2n) = O(n).",
    "Initialise minLen = infinity: if no window ever meets the condition, minLen stays at infinity. The final check returns 0 in that case.",
    "Edge case single element >= target: right=0, windowSum=nums[0]>=target. minLen=1. left advances past 0. Return 1.",
    "Edge case total sum < target: the while loop inside never triggers. minLen stays infinity. Return 0.",
    "Binary search alternative: compute prefix sums. For each left, binary search for smallest right where prefix[right]-prefix[left] >= target. O(n log n) time, O(n) space."
  ]
});

// longest-balanced-zero-one
patch("longest-balanced-zero-one", {
  judgeReady: true,
  constraints: ["1 <= nums.length <= 10^5", "nums[i] is 0 or 1.", "Return the length of the longest subarray with equal counts of 0s and 1s."],
  examples: [
    { input: "nums = [0,1,0,0,1,1,0]", output: "6", explanation: "Subarray [1,0,0,1,1,0] has 3 zeros and 3 ones, length 6." },
    { input: "nums = [0,1]", output: "2", explanation: "The full array has 1 zero and 1 one." }
  ],
  description: "Given a binary array `nums`, return the **length of the longest contiguous subarray** with an equal number of 0s and 1s.\n\nFor example, in `[0,1,0,0,1,1,0]`, the subarray `[1,0,0,1,1,0]` (indices 1-6) has 3 zeros and 3 ones, length 6.\n\nThe key insight: replace each 0 with -1. Now the problem becomes finding the longest subarray with sum 0 — a classic prefix sum plus hash map problem.\n\nCompute a running prefix sum. When the prefix sum repeats a value seen at an earlier index, the subarray between those indices sums to 0 (equal 0s and 1s in original terms). Track the first occurrence of each prefix sum in a hash map. The maximum difference between current index and first-seen index for the same prefix sum is the answer.\n\nThis is O(n) time and O(n) space.\n\nEdge cases: no balanced subarray — return 0; entire array balanced — return n; single element — return 0.",
  hints: [
    "Replace 0s with -1. Now find the longest subarray with sum 0.",
    "Hash map: store first occurrence of each prefix sum. If prefix sum repeats, the subarray between first occurrence and current index has sum 0.",
    "Initialise map with {0: -1} to handle subarrays starting at index 0."
  ],
  sampleCases: [{ input: [[0,1,0,0,1,1,0]], expected: 6 }, { input: [[0,1]], expected: 2 }],
  hiddenCases: [
    { input: [[0,0,0]], expected: 0 },
    { input: [[0,1,0,1]], expected: 4 },
    { input: [[1]], expected: 0 },
    { input: [[0,1,1,0,1,1,1,0]], expected: 4 }
  ],
  editorial: [
    "Transform and prefix sum: replace 0→-1. prefix=0, firstSeen={0:-1}, maxLen=0. For i, x in enumerate(nums): prefix += (1 if x==1 else -1). If prefix in firstSeen: maxLen=max(maxLen, i-firstSeen[prefix]). Else firstSeen[prefix]=i. Return maxLen.",
    "Why 0→-1 transformation: each 1 contributes +1 and each 0 (now -1) contributes -1. A balanced subarray has equal 1s and -1s, summing to 0. This maps the problem to 'longest subarray with sum 0'.",
    "Why initialise firstSeen={0:-1}: if the prefix sum reaches 0 at index i, the entire subarray from index 0 to i is balanced. Using -1 as the initial index gives length i-(-1) = i+1.",
    "Only store first occurrence: we want the longest subarray, so the leftmost index for each prefix sum gives the maximum length when the sum repeats.",
    "Edge case no balanced subarray: prefix sum never repeats. maxLen stays 0. Return 0.",
    "Edge case full array balanced: prefix sum returns to 0 at index n-1. firstSeen[0]=-1. maxLen = n-1-(-1) = n.",
    "This is LeetCode 525. The 0→-1 transformation combined with prefix-sum hash map is a powerful technique for binary array problems."
  ]
});

// next-greater-right
patch("next-greater-right", {
  judgeReady: true,
  constraints: ["1 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "For each element, find the next greater element to its right.", "Return -1 if no greater element exists to the right."],
  examples: [
    { input: "nums = [4,1,2,3]", output: "[–1,2,3,–1]", explanation: "4 has no greater to right: -1. 1's next greater is 2. 2's is 3. 3 has none: -1." },
    { input: "nums = [1,3,2,4]", output: "[3,4,4,–1]", explanation: "1's NGE is 3. 3's NGE is 4. 2's NGE is 4. 4 has none." }
  ],
  description: "Given an array `nums`, for each element find the **next greater element** to its right — the first element to the right that is strictly greater. Return the result in a new array. If no greater element exists, use -1.\n\nFor example, in `[4,1,2,3]`, the next greater right of 4 is -1 (nothing larger to its right), of 1 is 2, of 2 is 3, of 3 is -1.\n\nThe naive approach: for each index, scan right until finding a greater element. O(n^2) time.\n\nThe efficient approach uses a **monotonic decreasing stack**: scan left to right. For each element, while the stack is non-empty and the current element is greater than the top, the current element is the next-greater for the top. Pop and record the result. Push the current index. After the loop, any remaining stack indices have -1 as their answer.\n\nThis is O(n) time because each element is pushed and popped at most once. O(n) space for the stack.\n\nEdge cases: strictly increasing array — every element except the last has the next element as its next-greater; strictly decreasing — all elements return -1; single element — return [-1].",
  hints: [
    "Monotonic stack: maintain a decreasing stack of indices. For each i, while stack non-empty and nums[i] > nums[stack.top()]: result[stack.pop()] = nums[i]. Push i. Fill remaining stack entries with -1.",
    "The stack stores indices of elements waiting for their next-greater. When a larger element arrives, it resolves all smaller waiting elements.",
    "Naive: for each i, scan right until nums[j] > nums[i]. O(n^2). Stack approach: O(n)."
  ],
  sampleCases: [{ input: [[4,1,2,3]], expected: [-1,2,3,-1] }, { input: [[1,3,2,4]], expected: [3,4,4,-1] }],
  hiddenCases: [
    { input: [[1]], expected: [-1] },
    { input: [[1,2,3,4]], expected: [2,3,4,-1] },
    { input: [[4,3,2,1]], expected: [-1,-1,-1,-1] },
    { input: [[2,1,2,4,3]], expected: [4,2,4,-1,-1] }
  ],
  editorial: [
    "Monotonic stack O(n): result = [-1]*n, stack = []. For i from 0 to n-1: while stack and nums[i] > nums[stack[-1]]: result[stack.pop()] = nums[i]. stack.append(i). Return result.",
    "Stack invariant: elements in the stack are in decreasing order of their values. When a new element arrives that is larger than the stack top, it is the next-greater for that top.",
    "Why O(n): each index is pushed once and popped at most once. Total push+pop operations <= 2n.",
    "Filling remaining stack entries: after the loop, any indices left in the stack have no greater element to their right — their result stays -1.",
    "Edge case strictly increasing: 1,2,3,4. Each new element resolves the entire stack. Only the last element stays in stack with -1.",
    "Edge case strictly decreasing: 4,3,2,1. Nothing ever resolves the stack. All results are -1.",
    "This is LeetCode 496. The monotonic stack pattern appears in daily-temperature-wait, largest-rectangle-in-histogram, and stock-span problems."
  ]
});

// daily-temperature-wait
patch("daily-temperature-wait", {
  judgeReady: true,
  constraints: ["1 <= temperatures.length <= 10^5", "30 <= temperatures[i] <= 100", "Return array where result[i] is the number of days to wait for a warmer temperature.", "Return 0 if no future warmer day exists."],
  examples: [
    { input: "temperatures = [73,74,75,71,69,72,76,73]", output: "[1,1,4,2,1,1,0,0]", explanation: "73→74 in 1 day. 75→76 in 4 days. 76 has no warmer day: 0." },
    { input: "temperatures = [30,40,50,60]", output: "[1,1,1,0]", explanation: "Strictly increasing — each day next day is warmer." }
  ],
  description: "Given an array of daily temperatures, return an array where each element represents the **number of days to wait** until a warmer temperature. If no warmer day exists, use 0.\n\nFor example, for `[73,74,75,71,69,72,76,73]`, the temperature of 75 on day 2 is next exceeded on day 6 (76), so `result[2] = 4`.\n\nThe naive approach: for each day, scan forward until a warmer temperature is found. O(n^2) time.\n\nThe efficient approach uses a **monotonic decreasing stack of indices**: scan left to right. For each day, while the stack is non-empty and today is warmer than the day at the stack top: pop the top and record `result[top] = i - top`. Push current index. Remaining stack elements have no warmer day — result stays 0.\n\nThis is O(n) time and O(n) space.\n\nEdge cases: strictly increasing temperatures — each day waits 1; strictly decreasing — all wait 0; single day — return [0].",
  hints: [
    "Monotonic stack: maintain stack of indices with decreasing temperatures. For each i: while stack and temps[i] > temps[stack.top()]: result[stack.pop()] = i - top. Push i.",
    "result[popped_index] = current_index - popped_index gives the number of days waited.",
    "This is the same pattern as next-greater-right but records distance instead of value."
  ],
  sampleCases: [{ input: [[73,74,75,71,69,72,76,73]], expected: [1,1,4,2,1,1,0,0] }, { input: [[30,40,50,60]], expected: [1,1,1,0] }],
  hiddenCases: [
    { input: [[30]], expected: [0] },
    { input: [[70,60,50,40]], expected: [0,0,0,0] },
    { input: [[30,60,90]], expected: [1,1,0] },
    { input: [[60,60,60]], expected: [0,0,0] }
  ],
  editorial: [
    "Monotonic stack: result=[0]*n, stack=[]. For i in range(n): while stack and temps[i] > temps[stack[-1]]: j=stack.pop(); result[j]=i-j. stack.append(i). Return result.",
    "Stack stores indices of days still waiting for a warmer day. When a warmer day arrives, it resolves all cooler waiting days.",
    "result[j] = i - j: j is the waiting day's index, i is the current (warmer) day. Their difference is the number of days waited.",
    "Equal temperatures: do NOT pop for equal temperatures (temps[i] > temps[stack[-1]] not >=). Equal temp days continue waiting.",
    "Edge case strictly decreasing: no element pops another. result stays all zeros.",
    "Edge case strictly increasing: each new element pops the entire stack (all previous). result[i] = 1 for all but last.",
    "This is LeetCode 739. One of the most common monotonic stack interview problems. Understand it alongside next-greater-right to see the pattern."
  ]
});

// valid-phone-numbers (Shell)
patch("valid-phone-numbers", {
  judgeReady: true,
  constraints: ["Input file contains one phone number per line.", "Valid format: (xxx) xxx-xxxx or xxx-xxx-xxxx where x is a digit.", "Print only lines with valid phone numbers.", "Do not modify the input."],
  examples: [
    { input: 'file contains: "987-123-4567\\n123 456-7890\\n(900) 456-7890"', output: '"987-123-4567\\n(900) 456-7890"', explanation: "Second line is invalid format." },
    { input: 'file contains: "555-555-5555"', output: '"555-555-5555"', explanation: "Matches ddd-ddd-dddd format." }
  ],
  description: "Given a text file `file.txt` containing phone numbers, one per line, print only lines that contain a **valid phone number**. A valid phone number matches one of two formats: `(xxx) xxx-xxxx` (with area code in parentheses and a space before the prefix) or `xxx-xxx-xxxx` (three groups separated by hyphens). In both formats, `x` represents a single decimal digit.\n\nThis is a Shell/Bash scripting problem. The standard solution uses `grep` with a regular expression. The pattern `^([0-9]{3}-[0-9]{3}-[0-9]{4}|\\([0-9]{3}\\) [0-9]{3}-[0-9]{4})$` matches both valid formats. The `^` and `$` anchors ensure the entire line matches.\n\nAlternatively, `awk` can be used: `awk '/^([0-9]{3}-[0-9]{3}-[0-9]{4}|\\([0-9]{3}\\) [0-9]{3}-[0-9]{4})$/'`.\n\nEdge cases: lines with extra spaces — invalid; mixed format on one line — invalid; empty lines — invalid; lines with letters — invalid.",
  hints: [
    "grep -P '^(\\d{3}-\\d{3}-\\d{4}|\\(\\d{3}\\) \\d{3}-\\d{4})$' file.txt",
    "Two patterns: xxx-xxx-xxxx and (xxx) xxx-xxxx. Both require exact 10 digits with the correct separators.",
    "Use anchors ^ and $ to match the entire line. Without them, a line with extra characters would pass."
  ],
  sampleCases: [{ input: ["987-123-4567\n123 456-7890\n(900) 456-7890"], expected: "987-123-4567\n(900) 456-7890" }],
  hiddenCases: [
    { input: ["555-555-5555"], expected: "555-555-5555" },
    { input: ["(123) 456-7890"], expected: "(123) 456-7890" },
    { input: ["123 456 7890"], expected: "" },
    { input: ["1-555-555-5555"], expected: "" }
  ],
  editorial: [
    "grep solution: grep -P '^(\\d{3}-\\d{3}-\\d{4}|\\(\\d{3}\\) \\d{3}-\\d{4})$' file.txt",
    "Pattern breakdown: \\d{3} matches exactly 3 digits. \\( and \\) match literal parentheses. The space in (xxx) xxx-xxxx is a literal space and is required.",
    "Alternation: the | in the regex separates two complete patterns. Parentheses group them so anchors apply to the whole alternation.",
    "awk alternative: awk '/^([0-9]{3}-[0-9]{3}-[0-9]{4}|\\([0-9]{3}\\) [0-9]{3}-[0-9]{4})$/' file.txt",
    "Why anchors matter: without ^ and $, a line like 'call 555-555-5555 now' would match. Anchors enforce full-line matching.",
    "Shell regex flavours: grep -P uses Perl-compatible regex (PCRE) with \\d. grep -E uses extended regex requiring [0-9]. Both work for this problem.",
    "This is LeetCode 193. Shell problems test regex proficiency and command-line tool knowledge."
  ]
});

// transpose-file (Shell)
patch("transpose-file", {
  judgeReady: true,
  constraints: ["Input file has rows of whitespace-delimited values.", "All rows have the same number of columns.", "Transpose rows and columns.", "Output each row of the transpose separated by spaces."],
  examples: [
    { input: '"name age\\njohn 25\\njane 30"', output: '"name john jane\\nage 25 30"', explanation: "Rows become columns." },
    { input: '"a b c"', output: '"a\\nb\\nc"', explanation: "Single row becomes a column." }
  ],
  description: "Given a text file `file.txt` where each row contains whitespace-delimited values, print the **transpose** of the table — rows become columns and columns become rows.\n\nFor example, if the file contains `name age / john 25 / jane 30`, the transpose is `name john jane / age 25 30`.\n\nThe standard `awk` solution reads all values into a 2D array indexed by row and column, then outputs column by column. `awk '{ for (i=1; i<=NF; i++) { arr[i][NR]=$i } } END { for (i=1; i<=NF; i++) { for (j=1; j<=NR; j++) printf \"%s%s\", arr[i][j], (j<NR ? \" \" : \"\\n\") } }'`.\n\nThis stores every cell in memory, so space is O(rows × cols). Time is O(rows × cols) since every cell is read once and written once.\n\nEdge cases: single row — becomes a column (each element on its own line); single column — becomes a single row; square matrix — main diagonal is preserved.",
  hints: [
    "awk approach: store arr[col][row] = field during reading. In END block, print each column as a row.",
    "NF gives number of fields in current row. NR gives current row number. Use these to track dimensions.",
    "Output separator: use space between values in each output row and newline at end of each row."
  ],
  sampleCases: [{ input: ["name age\njohn 25\njane 30"], expected: "name john jane\nage 25 30" }],
  hiddenCases: [
    { input: ["a b c"], expected: "a\nb\nc" },
    { input: ["1 2\n3 4"], expected: "1 3\n2 4" },
    { input: ["x"], expected: "x" },
    { input: ["1 2 3\n4 5 6\n7 8 9"], expected: "1 4 7\n2 5 8\n3 6 9" }
  ],
  editorial: [
    "awk solution: awk '{ for(i=1;i<=NF;i++) a[i][NR]=$i; cols=NF } END { for(i=1;i<=cols;i++) { for(j=1;j<=NR;j++) printf \"%s%s\",a[i][j],(j<NR?\" \":\"\\n\") } }' file.txt",
    "Storage: a[i][j] stores the value at column i, row j (transposed indexing). Columns of the input become rows of the output.",
    "NF (number of fields) gives the column count. NR (number of records) gives the row count after processing all input.",
    "Output formatting: within each output row (which is a column of the input), values are space-separated. Each output row ends with a newline.",
    "Single row edge case: NR=1 after processing. The END block prints NF values each on its own line (since j<NR is always false, the separator is \\n).",
    "Memory consideration: the entire file is stored in the awk array. For very large files, this may be a concern. For typical interview files it is fine.",
    "This is LeetCode 194. Shell/awk problems test knowledge of text processing tools standard in Unix environments."
  ]
});

// tenth-line (Shell)
patch("tenth-line", {
  judgeReady: true,
  constraints: ["Print only the 10th line of file.txt.", "If file has fewer than 10 lines, print nothing.", "Exactly one line of output (the 10th line) or empty output."],
  examples: [
    { input: "file with 12 lines", output: "line 10 content", explanation: "Print only the 10th line." },
    { input: "file with 8 lines", output: "", explanation: "Fewer than 10 lines — print nothing." }
  ],
  description: "Given a text file `file.txt`, print the **10th line** of the file. If the file has fewer than 10 lines, print nothing (empty output).\n\nSeveral one-liner solutions exist in bash.\n\n`sed -n '10p' file.txt` — sed's `-n` suppresses default output and `10p` prints only line 10. If there is no 10th line, nothing is printed.\n\n`awk 'NR==10' file.txt` — awk's `NR` is the line number. This prints the entire line when NR equals 10.\n\n`head -n 10 file.txt | tail -n 1` — take first 10 lines, then take the last of those.\n\nAll three are O(n) in time (must read up to line 10) and O(1) in space (no storage needed).\n\nEdge cases: file with exactly 10 lines — print the 10th; file with 9 lines — print nothing; empty file — print nothing; file with 100 lines — print only the 10th.",
  hints: [
    "sed -n '10p' file.txt — print only line 10.",
    "awk 'NR==10' file.txt — NR is the current line number; print when it equals 10.",
    "head -n 10 file.txt | tail -n 1 — take first 10 lines then last one."
  ],
  sampleCases: [{ input: ["line1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9\nline10\nline11"], expected: "line10" }],
  hiddenCases: [
    { input: ["only9lines\n2\n3\n4\n5\n6\n7\n8\n9"], expected: "" },
    { input: ["1\n2\n3\n4\n5\n6\n7\n8\n9\n10"], expected: "10" },
    { input: ["a\nb\nc\nd\ne\nf\ng\nh\ni\nj\nk\nl"], expected: "j" }
  ],
  editorial: [
    "sed solution: sed -n '10p' file.txt. The -n flag suppresses automatic printing. 10p prints line 10. If line 10 does not exist, nothing is printed.",
    "awk solution: awk 'NR==10' file.txt. NR is the built-in line counter. When NR equals 10, awk prints the line (default action for a true condition is to print $0).",
    "head+tail pipeline: head -n 10 file.txt | tail -n 1. head -n 10 outputs at most 10 lines. tail -n 1 prints the last of those. If file has <10 lines, head outputs all and tail prints the last — but we want nothing in that case. For files with exactly <10 lines, this would print the last line, which is wrong. Use sed or awk to be safe.",
    "Why sed/awk are preferred: they correctly handle the 'fewer than 10 lines' edge case by printing nothing.",
    "Performance: all solutions stop after reading 10 lines, making them O(10) = O(1) effectively regardless of file size.",
    "This is LeetCode 192. One of the simplest shell problems but tests knowledge of sed/awk/head/tail.",
    "Exit status: these commands exit with status 0 even when no output is produced (file too short). This is expected shell behaviour."
  ]
});

// count-lines-matching-pattern (Shell)
patch("count-lines-matching-pattern", {
  judgeReady: true,
  constraints: ["Count lines in file.txt where the word 'leetcode' appears at least once.", "Case-sensitive match.", "Return just the count as an integer."],
  examples: [
    { input: '"auto-reboot leetcode\\nhello world\\nmaxleetcode"', output: "2", explanation: "Lines 1 and 3 contain 'leetcode'." },
    { input: '"hello\\nworld"', output: "0", explanation: "Neither line contains 'leetcode'." }
  ],
  description: "Given a text file `file.txt`, count the number of lines that contain the word `leetcode` (case-sensitive). Print just the count.\n\nThe standard solution: `grep -c 'leetcode' file.txt`. The `-c` flag counts matching lines instead of printing them.\n\nAlternative using awk: `awk '/leetcode/{count++} END{print count+0}' file.txt`. The `+0` ensures 0 is printed if no matches are found (otherwise an unset variable would print empty).\n\nNote: `grep -c` counts lines containing the pattern, not occurrences. A line with `leetcode` twice is still counted once.\n\nEdge cases: no matches — print 0; all lines match — print line count; pattern in substring like `maxleetcode` — still counts because grep matches substrings by default.\n\nIf you need whole-word matching only, use `grep -cw 'leetcode'` which matches only when `leetcode` is a standalone word.",
  hints: [
    "grep -c 'leetcode' file.txt — count matching lines directly.",
    "awk '/leetcode/{c++} END{print c+0}' file.txt — count with awk.",
    "-c in grep counts lines (not occurrences). A line with two matches counts as 1."
  ],
  sampleCases: [{ input: ["auto-reboot leetcode\nhello world\nmaxleetcode"], expected: "2" }],
  hiddenCases: [
    { input: ["hello\nworld"], expected: "0" },
    { input: ["leetcode\nleetcode\nleetcode"], expected: "3" },
    { input: ["LEETCODE\nLeetCode\nleetcode"], expected: "1" },
    { input: [""], expected: "0" }
  ],
  editorial: [
    "grep -c: grep -c 'leetcode' file.txt. The -c flag prints the count of matching lines. O(n) time scanning the file.",
    "awk: awk '/leetcode/{c++} END{print c+0}' file.txt. /leetcode/ is a regex condition; c++ increments for each matching line; END block prints the final count.",
    "Why c+0 in awk: if no line matches, c is never set. Printing an unset awk variable gives empty string. +0 forces numeric context, producing 0.",
    "Substring match: grep matches leetcode anywhere in the line by default. 'maxleetcode' matches. Use -w for whole-word only.",
    "Case sensitivity: grep is case-sensitive by default. -i flag makes it case-insensitive. The problem specifies case-sensitive, so no -i.",
    "This is LeetCode 195. Tests knowledge of grep -c and basic awk pattern-action syntax.",
    "Performance: grep stops reading each line as soon as a match is found, making it faster than awk for simple pattern matching on large files."
  ]
});

// the-dining-philosophers
patch("the-dining-philosophers", {
  judgeReady: true,
  constraints: ["5 philosophers sit around a table with 5 forks.", "Each philosopher needs both adjacent forks to eat.", "Solution must be deadlock-free.", "Must not starve — every philosopher must eventually eat."],
  examples: [
    { input: "n = 1 (each eats once)", output: "All philosophers eat without deadlock", explanation: "Correct synchronisation allows all to eat without circular wait." }
  ],
  description: "The Dining Philosophers Problem is a classic concurrency challenge: five philosophers sit around a circular table with one fork between each adjacent pair. To eat, a philosopher must acquire both their left and right forks. Design a solution where all philosophers can eat without deadlock or starvation.\n\nThe naive approach (each picks up left fork then right) creates a **deadlock**: if all five philosophers simultaneously pick up their left fork, each waits for their right fork which another philosopher holds — a circular wait.\n\nSolution 1 — **Asymmetric lock ordering**: philosophers 0-3 pick up left fork first then right; philosopher 4 picks up right fork first then left. This breaks the circular dependency: philosopher 4 competes for fork 4 first (same as philosopher 3's right), preventing the circular wait.\n\nSolution 2 — **Global mutex**: only allow at most 4 philosophers to try eating simultaneously. One philosopher must always be prevented from picking up any fork, guaranteeing at least one can complete.\n\nSolution 3 — **Waiter/semaphore**: use a semaphore initialised to 4. Before picking up any fork, a philosopher must acquire this semaphore, limiting concurrent fork-grabbers.\n\nAll solutions achieve O(1) per philosopher operation and deadlock freedom.",
  hints: [
    "Asymmetric ordering: all philosophers pick left-then-right EXCEPT one who picks right-then-left. This breaks the circular wait.",
    "Limit concurrency: use a semaphore initialised to n-1 (here 4). Only 4 philosophers can try to eat simultaneously, guaranteeing at least one succeeds.",
    "Never hold one fork while waiting for the other if you cannot get both — try to acquire both atomically using a mutex."
  ],
  sampleCases: [{ input: [1], expected: "All philosophers eat" }],
  hiddenCases: [
    { input: [2], expected: "All philosophers eat" },
    { input: [5], expected: "All philosophers eat" },
    { input: [100], expected: "All philosophers eat" }
  ],
  editorial: [
    "Deadlock conditions: deadlock requires all four of: mutual exclusion, hold-and-wait, no preemption, circular wait. Breaking any one prevents deadlock.",
    "Asymmetric approach: philosophers 0-3 acquire forks in order (left=id, right=(id+1)%5). Philosopher 4 acquires in reverse (right=0, left=4). Philosopher 4 competes for fork 0 first, competing with philosopher 0 who wants fork 0 as their right — breaking the circular dependency.",
    "Semaphore limiter: capacity_sem = Semaphore(4). Each philosopher: acquire(capacity_sem); pickUp(leftFork); pickUp(rightFork); eat(); putDown(rightFork); putDown(leftFork); release(capacity_sem). At most 4 at the table, so at least one pair of adjacent forks is available.",
    "Mutex per fork: each fork has a mutex. Philosophers try to lock both. If the second lock fails, release the first and retry. This avoids hold-and-wait but requires retry logic.",
    "Starvation prevention: ensure no philosopher waits forever. The semaphore approach provides fairness if the OS semaphore is fair (FIFO). Asymmetric ordering alone doesn't guarantee fairness but prevents deadlock.",
    "This is LeetCode 1226. Tests deep understanding of deadlock, mutex, and semaphore semantics.",
    "Real-world relevance: this pattern appears in database transaction locking (acquiring multiple row locks), distributed systems resource allocation, and OS scheduling."
  ]
});

save();
