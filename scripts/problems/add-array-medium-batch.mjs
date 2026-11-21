import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "src", "content", "problems", "array");

const problems = [
  {
    id: 10201,
    slug: "max-sum-window",
    title: "Max Sum Window",
    difficulty: "Medium",
    tags: ["Array", "Sliding Window"],
    functionName: "maxSumWindow",
    description: "Given an integer array `nums` and an integer `k`, return the maximum sum of any contiguous subarray of length `k`.",
    constraints: ["1 <= k <= nums.length <= 10^5", "-10^5 <= nums[i] <= 10^5"],
    examples: [{ input: "nums = [2,1,5,1,3,2], k = 3", output: "9" }],
    hints: ["Compute the first window.", "Slide by removing the left value and adding the right value."],
    cases: [
      { input: [[2, 1, 5, 1, 3, 2], 3], expected: 9 },
      { input: [[-2, -1, -3], 2], expected: -3 },
      { input: [[5], 1], expected: 5 },
    ],
    js: "function maxSumWindow(nums, k) {\n  let current = 0;\n  for (let i = 0; i < k; i++) current += nums[i];\n  let best = current;\n  for (let i = k; i < nums.length; i++) {\n    current += nums[i] - nums[i - k];\n    best = Math.max(best, current);\n  }\n  return best;\n}",
    py: "class Solution:\n    def maxSumWindow(self, nums, k):\n        current = sum(nums[:k])\n        best = current\n        for i in range(k, len(nums)):\n            current += nums[i] - nums[i - k]\n            best = max(best, current)\n        return best",
    cpp: "class Solution {\npublic:\n    int maxSumWindow(vector<int>& nums, int k) {\n        int current = 0;\n        for (int i = 0; i < k; i++) current += nums[i];\n        int best = current;\n        for (int i = k; i < (int)nums.size(); i++) { current += nums[i] - nums[i - k]; best = max(best, current); }\n        return best;\n    }\n};",
    java: "class Solution {\n    public int maxSumWindow(int[] nums, int k) {\n        int current = 0;\n        for (int i = 0; i < k; i++) current += nums[i];\n        int best = current;\n        for (int i = k; i < nums.length; i++) { current += nums[i] - nums[i - k]; best = Math.max(best, current); }\n        return best;\n    }\n}",
  },
  {
    id: 10202,
    slug: "min-length-subarray-sum",
    title: "Min Length Subarray Sum",
    difficulty: "Medium",
    tags: ["Array", "Sliding Window", "Two Pointers"],
    functionName: "minLengthSubarraySum",
    description: "Given positive integers in `nums` and an integer `target`, return the minimum length of a contiguous subarray whose sum is at least `target`. If none exists, return `0`.",
    constraints: ["1 <= nums.length <= 10^5", "1 <= nums[i], target <= 10^9"],
    examples: [{ input: "target = 7, nums = [2,3,1,2,4,3]", output: "2" }],
    hints: ["Expand the right side until the sum is enough.", "Shrink from the left while the window stays valid."],
    cases: [
      { input: [[2, 3, 1, 2, 4, 3], 7], expected: 2 },
      { input: [[1, 1, 1], 5], expected: 0 },
      { input: [[5, 1, 2], 5], expected: 1 },
    ],
    js: "function minLengthSubarraySum(nums, target) {\n  let left = 0, sum = 0, best = Infinity;\n  for (let right = 0; right < nums.length; right++) {\n    sum += nums[right];\n    while (sum >= target) {\n      best = Math.min(best, right - left + 1);\n      sum -= nums[left++];\n    }\n  }\n  return best === Infinity ? 0 : best;\n}",
    py: "class Solution:\n    def minLengthSubarraySum(self, nums, target):\n        left = total = 0\n        best = 10**18\n        for right, value in enumerate(nums):\n            total += value\n            while total >= target:\n                best = min(best, right - left + 1)\n                total -= nums[left]\n                left += 1\n        return 0 if best == 10**18 else best",
    cpp: "class Solution {\npublic:\n    int minLengthSubarraySum(vector<int>& nums, int target) {\n        int left = 0, best = INT_MAX;\n        long long sum = 0;\n        for (int right = 0; right < (int)nums.size(); right++) {\n            sum += nums[right];\n            while (sum >= target) { best = min(best, right - left + 1); sum -= nums[left++]; }\n        }\n        return best == INT_MAX ? 0 : best;\n    }\n};",
    java: "class Solution {\n    public int minLengthSubarraySum(int[] nums, int target) {\n        int left = 0, best = Integer.MAX_VALUE;\n        long sum = 0;\n        for (int right = 0; right < nums.length; right++) {\n            sum += nums[right];\n            while (sum >= target) { best = Math.min(best, right - left + 1); sum -= nums[left++]; }\n        }\n        return best == Integer.MAX_VALUE ? 0 : best;\n    }\n}",
  },
  {
    id: 10203,
    slug: "subarray-sum-equals-target",
    title: "Subarray Sum Equals Target",
    difficulty: "Medium",
    tags: ["Array", "Hash Table", "Prefix Sum"],
    functionName: "subarraySumEqualsTarget",
    description: "Return the number of contiguous subarrays whose sum equals `target`.",
    constraints: ["1 <= nums.length <= 10^5", "-10^5 <= nums[i], target <= 10^5"],
    examples: [{ input: "nums = [1,1,1], target = 2", output: "2" }],
    hints: ["Track prefix sums.", "A previous prefix of current - target forms a valid subarray."],
    cases: [
      { input: [[1, 1, 1], 2], expected: 2 },
      { input: [[1, 2, 3], 3], expected: 2 },
      { input: [[-1, -1, 1], 0], expected: 1 },
    ],
    js: "function subarraySumEqualsTarget(nums, target) {\n  const counts = new Map([[0, 1]]);\n  let prefix = 0, answer = 0;\n  for (const value of nums) {\n    prefix += value;\n    answer += counts.get(prefix - target) || 0;\n    counts.set(prefix, (counts.get(prefix) || 0) + 1);\n  }\n  return answer;\n}",
    py: "class Solution:\n    def subarraySumEqualsTarget(self, nums, target):\n        counts = {0: 1}\n        prefix = answer = 0\n        for value in nums:\n            prefix += value\n            answer += counts.get(prefix - target, 0)\n            counts[prefix] = counts.get(prefix, 0) + 1\n        return answer",
    cpp: "class Solution {\npublic:\n    int subarraySumEqualsTarget(vector<int>& nums, int target) {\n        unordered_map<int, int> counts;\n        counts[0] = 1;\n        int prefix = 0, answer = 0;\n        for (int value : nums) { prefix += value; answer += counts[prefix - target]; counts[prefix]++; }\n        return answer;\n    }\n};",
    java: "class Solution {\n    public int subarraySumEqualsTarget(int[] nums, int target) {\n        Map<Integer, Integer> counts = new HashMap<>();\n        counts.put(0, 1);\n        int prefix = 0, answer = 0;\n        for (int value : nums) {\n            prefix += value;\n            answer += counts.getOrDefault(prefix - target, 0);\n            counts.put(prefix, counts.getOrDefault(prefix, 0) + 1);\n        }\n        return answer;\n    }\n}",
  },
  {
    id: 10204,
    slug: "longest-balanced-zero-one",
    title: "Longest Balanced Zero One",
    difficulty: "Medium",
    tags: ["Array", "Hash Table", "Prefix Sum"],
    functionName: "longestBalancedZeroOne",
    description: "Given a binary array, return the length of the longest contiguous subarray with the same number of `0`s and `1`s.",
    constraints: ["1 <= nums.length <= 10^5", "nums[i] is 0 or 1"],
    examples: [{ input: "nums = [0,1,0,1,1]", output: "4" }],
    hints: ["Treat 0 as -1 and 1 as +1.", "Equal prefix sum means the segment between them is balanced."],
    cases: [
      { input: [[0, 1, 0, 1, 1]], expected: 4 },
      { input: [[0, 0, 1, 0]], expected: 2 },
      { input: [[1, 1, 1]], expected: 0 },
    ],
    js: "function longestBalancedZeroOne(nums) {\n  const first = new Map([[0, -1]]);\n  let prefix = 0, best = 0;\n  for (let i = 0; i < nums.length; i++) {\n    prefix += nums[i] === 1 ? 1 : -1;\n    if (first.has(prefix)) best = Math.max(best, i - first.get(prefix));\n    else first.set(prefix, i);\n  }\n  return best;\n}",
    py: "class Solution:\n    def longestBalancedZeroOne(self, nums):\n        first = {0: -1}\n        prefix = best = 0\n        for i, value in enumerate(nums):\n            prefix += 1 if value == 1 else -1\n            if prefix in first:\n                best = max(best, i - first[prefix])\n            else:\n                first[prefix] = i\n        return best",
    cpp: "class Solution {\npublic:\n    int longestBalancedZeroOne(vector<int>& nums) {\n        unordered_map<int, int> first;\n        first[0] = -1;\n        int prefix = 0, best = 0;\n        for (int i = 0; i < (int)nums.size(); i++) {\n            prefix += nums[i] == 1 ? 1 : -1;\n            if (first.count(prefix)) best = max(best, i - first[prefix]); else first[prefix] = i;\n        }\n        return best;\n    }\n};",
    java: "class Solution {\n    public int longestBalancedZeroOne(int[] nums) {\n        Map<Integer, Integer> first = new HashMap<>();\n        first.put(0, -1);\n        int prefix = 0, best = 0;\n        for (int i = 0; i < nums.length; i++) {\n            prefix += nums[i] == 1 ? 1 : -1;\n            if (first.containsKey(prefix)) best = Math.max(best, i - first.get(prefix)); else first.put(prefix, i);\n        }\n        return best;\n    }\n}",
  },
  {
    id: 10205,
    slug: "three-number-zero",
    title: "Three Number Zero",
    difficulty: "Medium",
    tags: ["Array", "Two Pointers", "Sorting"],
    functionName: "threeNumberZero",
    description: "Return how many unique triplets in `nums` sum to zero. Triplets are unique by values, not indices.",
    constraints: ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
    examples: [{ input: "nums = [-1,0,1,2,-1,-4]", output: "2" }],
    hints: ["Sort first.", "Fix one value and use two pointers for the remaining two."],
    cases: [
      { input: [[-1, 0, 1, 2, -1, -4]], expected: 2 },
      { input: [[0, 0, 0, 0]], expected: 1 },
      { input: [[1, 2, -2, -1]], expected: 0 },
    ],
    js: "function threeNumberZero(nums) {\n  nums = [...nums].sort((a, b) => a - b);\n  let count = 0;\n  for (let i = 0; i < nums.length - 2; i++) {\n    if (i > 0 && nums[i] === nums[i - 1]) continue;\n    let left = i + 1, right = nums.length - 1;\n    while (left < right) {\n      const sum = nums[i] + nums[left] + nums[right];\n      if (sum === 0) { count++; left++; right--; while (left < right && nums[left] === nums[left - 1]) left++; while (left < right && nums[right] === nums[right + 1]) right--; }\n      else if (sum < 0) left++; else right--;\n    }\n  }\n  return count;\n}",
    py: "class Solution:\n    def threeNumberZero(self, nums):\n        nums = sorted(nums)\n        count = 0\n        for i in range(len(nums) - 2):\n            if i > 0 and nums[i] == nums[i - 1]:\n                continue\n            left, right = i + 1, len(nums) - 1\n            while left < right:\n                total = nums[i] + nums[left] + nums[right]\n                if total == 0:\n                    count += 1; left += 1; right -= 1\n                    while left < right and nums[left] == nums[left - 1]: left += 1\n                    while left < right and nums[right] == nums[right + 1]: right -= 1\n                elif total < 0:\n                    left += 1\n                else:\n                    right -= 1\n        return count",
    cpp: "class Solution {\npublic:\n    int threeNumberZero(vector<int>& nums) {\n        sort(nums.begin(), nums.end());\n        int count = 0;\n        for (int i = 0; i + 2 < (int)nums.size(); i++) {\n            if (i > 0 && nums[i] == nums[i - 1]) continue;\n            int left = i + 1, right = nums.size() - 1;\n            while (left < right) {\n                int sum = nums[i] + nums[left] + nums[right];\n                if (sum == 0) { count++; left++; right--; while (left < right && nums[left] == nums[left - 1]) left++; while (left < right && nums[right] == nums[right + 1]) right--; }\n                else if (sum < 0) left++; else right--;\n            }\n        }\n        return count;\n    }\n};",
    java: "class Solution {\n    public int threeNumberZero(int[] nums) {\n        Arrays.sort(nums);\n        int count = 0;\n        for (int i = 0; i + 2 < nums.length; i++) {\n            if (i > 0 && nums[i] == nums[i - 1]) continue;\n            int left = i + 1, right = nums.length - 1;\n            while (left < right) {\n                int sum = nums[i] + nums[left] + nums[right];\n                if (sum == 0) { count++; left++; right--; while (left < right && nums[left] == nums[left - 1]) left++; while (left < right && nums[right] == nums[right + 1]) right--; }\n                else if (sum < 0) left++; else right--;\n            }\n        }\n        return count;\n    }\n}",
  },
  {
    id: 10206,
    slug: "product-except-self-basic",
    title: "Product Except Self Basic",
    difficulty: "Medium",
    tags: ["Array", "Prefix Product"],
    functionName: "productExceptSelfBasic",
    description: "Return an array where each index contains the product of all values in `nums` except the value at that index. Do not use division.",
    constraints: ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30"],
    examples: [{ input: "nums = [1,2,3,4]", output: "[24,12,8,6]" }],
    hints: ["Use prefix products from the left.", "Multiply by suffix products from the right."],
    cases: [
      { input: [[1, 2, 3, 4]], expected: [24, 12, 8, 6] },
      { input: [[-1, 1, 0, -3, 3]], expected: [0, 0, 9, 0, 0] },
      { input: [[2, 3]], expected: [3, 2] },
    ],
    js: "function productExceptSelfBasic(nums) {\n  const ans = Array(nums.length).fill(1);\n  let prefix = 1;\n  for (let i = 0; i < nums.length; i++) { ans[i] = prefix; prefix *= nums[i]; }\n  let suffix = 1;\n  for (let i = nums.length - 1; i >= 0; i--) { ans[i] *= suffix; suffix *= nums[i]; }\n  return ans;\n}",
    py: "class Solution:\n    def productExceptSelfBasic(self, nums):\n        ans = [1] * len(nums)\n        prefix = 1\n        for i, value in enumerate(nums):\n            ans[i] = prefix\n            prefix *= value\n        suffix = 1\n        for i in range(len(nums) - 1, -1, -1):\n            ans[i] *= suffix\n            suffix *= nums[i]\n        return ans",
    cpp: "class Solution {\npublic:\n    vector<int> productExceptSelfBasic(vector<int>& nums) {\n        vector<int> ans(nums.size(), 1);\n        int prefix = 1;\n        for (int i = 0; i < (int)nums.size(); i++) { ans[i] = prefix; prefix *= nums[i]; }\n        int suffix = 1;\n        for (int i = nums.size() - 1; i >= 0; i--) { ans[i] *= suffix; suffix *= nums[i]; }\n        return ans;\n    }\n};",
    java: "class Solution {\n    public int[] productExceptSelfBasic(int[] nums) {\n        int[] ans = new int[nums.length];\n        Arrays.fill(ans, 1);\n        int prefix = 1;\n        for (int i = 0; i < nums.length; i++) { ans[i] = prefix; prefix *= nums[i]; }\n        int suffix = 1;\n        for (int i = nums.length - 1; i >= 0; i--) { ans[i] *= suffix; suffix *= nums[i]; }\n        return ans;\n    }\n}",
  },
  {
    id: 10207,
    slug: "merge-overlapping-ranges",
    title: "Merge Overlapping Ranges",
    difficulty: "Medium",
    tags: ["Array", "Sorting", "Intervals"],
    functionName: "mergeOverlappingRanges",
    description: "Given intervals `[start, end]`, merge every overlapping interval and return the merged intervals sorted by start.",
    constraints: ["1 <= intervals.length <= 10^4", "0 <= start <= end <= 10^9"],
    examples: [{ input: "intervals = [[1,3],[2,6],[8,10]]", output: "[[1,6],[8,10]]" }],
    hints: ["Sort intervals by start.", "Extend the last merged interval when ranges overlap."],
    cases: [
      { input: [[[1, 3], [2, 6], [8, 10]]], expected: [[1, 6], [8, 10]] },
      { input: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
      { input: [[[5, 7], [1, 2]]], expected: [[1, 2], [5, 7]] },
    ],
    js: "function mergeOverlappingRanges(intervals) {\n  intervals = intervals.map((row) => [...row]).sort((a, b) => a[0] - b[0]);\n  const ans = [];\n  for (const current of intervals) {\n    if (ans.length === 0 || ans[ans.length - 1][1] < current[0]) ans.push(current);\n    else ans[ans.length - 1][1] = Math.max(ans[ans.length - 1][1], current[1]);\n  }\n  return ans;\n}",
    py: "class Solution:\n    def mergeOverlappingRanges(self, intervals):\n        intervals = sorted([row[:] for row in intervals])\n        ans = []\n        for start, end in intervals:\n            if not ans or ans[-1][1] < start:\n                ans.append([start, end])\n            else:\n                ans[-1][1] = max(ans[-1][1], end)\n        return ans",
    cpp: "class Solution {\npublic:\n    vector<vector<int>> mergeOverlappingRanges(vector<vector<int>>& intervals) {\n        sort(intervals.begin(), intervals.end());\n        vector<vector<int>> ans;\n        for (auto current : intervals) {\n            if (ans.empty() || ans.back()[1] < current[0]) ans.push_back(current);\n            else ans.back()[1] = max(ans.back()[1], current[1]);\n        }\n        return ans;\n    }\n};",
    java: "class Solution {\n    public int[][] mergeOverlappingRanges(int[][] intervals) {\n        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));\n        ArrayList<int[]> merged = new ArrayList<>();\n        for (int[] current : intervals) {\n            if (merged.isEmpty() || merged.get(merged.size() - 1)[1] < current[0]) merged.add(current.clone());\n            else merged.get(merged.size() - 1)[1] = Math.max(merged.get(merged.size() - 1)[1], current[1]);\n        }\n        int[][] ans = new int[merged.size()][2];\n        for (int i = 0; i < merged.size(); i++) ans[i] = merged.get(i);\n        return ans;\n    }\n}",
  },
  {
    id: 10208,
    slug: "container-water-basic",
    title: "Container Water Basic",
    difficulty: "Medium",
    tags: ["Array", "Two Pointers"],
    functionName: "containerWaterBasic",
    description: "Given heights, choose two lines that form a container with the maximum water area. Return that maximum area.",
    constraints: ["2 <= height.length <= 10^5", "0 <= height[i] <= 10^4"],
    examples: [{ input: "height = [1,8,6,2,5,4,8,3,7]", output: "49" }],
    hints: ["Start with both ends.", "Move the pointer at the shorter line."],
    cases: [
      { input: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 },
      { input: [[1, 1]], expected: 1 },
      { input: [[4, 3, 2, 1, 4]], expected: 16 },
    ],
    js: "function containerWaterBasic(height) {\n  let left = 0, right = height.length - 1, best = 0;\n  while (left < right) {\n    best = Math.max(best, Math.min(height[left], height[right]) * (right - left));\n    if (height[left] < height[right]) left++; else right--;\n  }\n  return best;\n}",
    py: "class Solution:\n    def containerWaterBasic(self, height):\n        left, right, best = 0, len(height) - 1, 0\n        while left < right:\n            best = max(best, min(height[left], height[right]) * (right - left))\n            if height[left] < height[right]: left += 1\n            else: right -= 1\n        return best",
    cpp: "class Solution {\npublic:\n    int containerWaterBasic(vector<int>& height) {\n        int left = 0, right = height.size() - 1, best = 0;\n        while (left < right) { best = max(best, min(height[left], height[right]) * (right - left)); if (height[left] < height[right]) left++; else right--; }\n        return best;\n    }\n};",
    java: "class Solution {\n    public int containerWaterBasic(int[] height) {\n        int left = 0, right = height.length - 1, best = 0;\n        while (left < right) { best = Math.max(best, Math.min(height[left], height[right]) * (right - left)); if (height[left] < height[right]) left++; else right--; }\n        return best;\n    }\n}",
  },
  {
    id: 10209,
    slug: "next-greater-right",
    title: "Next Greater Right",
    difficulty: "Medium",
    tags: ["Array", "Stack", "Monotonic Stack"],
    functionName: "nextGreaterRight",
    description: "For every index, return the next value to its right that is strictly greater. If none exists, use `-1`.",
    constraints: ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
    examples: [{ input: "nums = [2,1,2,4,3]", output: "[4,2,4,-1,-1]" }],
    hints: ["Scan from right to left.", "Keep a decreasing stack of useful future values."],
    cases: [
      { input: [[2, 1, 2, 4, 3]], expected: [4, 2, 4, -1, -1] },
      { input: [[5, 4, 3]], expected: [-1, -1, -1] },
      { input: [[1, 3, 2]], expected: [3, -1, -1] },
    ],
    js: "function nextGreaterRight(nums) {\n  const ans = Array(nums.length).fill(-1);\n  const stack = [];\n  for (let i = nums.length - 1; i >= 0; i--) {\n    while (stack.length && stack[stack.length - 1] <= nums[i]) stack.pop();\n    if (stack.length) ans[i] = stack[stack.length - 1];\n    stack.push(nums[i]);\n  }\n  return ans;\n}",
    py: "class Solution:\n    def nextGreaterRight(self, nums):\n        ans = [-1] * len(nums)\n        stack = []\n        for i in range(len(nums) - 1, -1, -1):\n            while stack and stack[-1] <= nums[i]: stack.pop()\n            if stack: ans[i] = stack[-1]\n            stack.append(nums[i])\n        return ans",
    cpp: "class Solution {\npublic:\n    vector<int> nextGreaterRight(vector<int>& nums) {\n        vector<int> ans(nums.size(), -1), stack;\n        for (int i = nums.size() - 1; i >= 0; i--) { while (!stack.empty() && stack.back() <= nums[i]) stack.pop_back(); if (!stack.empty()) ans[i] = stack.back(); stack.push_back(nums[i]); }\n        return ans;\n    }\n};",
    java: "class Solution {\n    public int[] nextGreaterRight(int[] nums) {\n        int[] ans = new int[nums.length];\n        Arrays.fill(ans, -1);\n        ArrayDeque<Integer> stack = new ArrayDeque<>();\n        for (int i = nums.length - 1; i >= 0; i--) { while (!stack.isEmpty() && stack.peek() <= nums[i]) stack.pop(); if (!stack.isEmpty()) ans[i] = stack.peek(); stack.push(nums[i]); }\n        return ans;\n    }\n}",
  },
  {
    id: 10210,
    slug: "daily-temperature-wait",
    title: "Daily Temperature Wait",
    difficulty: "Medium",
    tags: ["Array", "Stack", "Monotonic Stack"],
    functionName: "dailyTemperatureWait",
    description: "Given daily temperatures, return how many days each day must wait until a warmer temperature. Use `0` if no warmer day exists.",
    constraints: ["1 <= temperatures.length <= 10^5", "0 <= temperatures[i] <= 100"],
    examples: [{ input: "temperatures = [73,74,75,71,69,72,76,73]", output: "[1,1,4,2,1,1,0,0]" }],
    hints: ["Use a stack of unresolved day indices.", "When a warmer day appears, resolve colder days."],
    cases: [
      { input: [[73, 74, 75, 71, 69, 72, 76, 73]], expected: [1, 1, 4, 2, 1, 1, 0, 0] },
      { input: [[30, 40, 50, 60]], expected: [1, 1, 1, 0] },
      { input: [[30, 30, 30]], expected: [0, 0, 0] },
    ],
    js: "function dailyTemperatureWait(temperatures) {\n  const ans = Array(temperatures.length).fill(0);\n  const stack = [];\n  for (let i = 0; i < temperatures.length; i++) {\n    while (stack.length && temperatures[i] > temperatures[stack[stack.length - 1]]) {\n      const day = stack.pop();\n      ans[day] = i - day;\n    }\n    stack.push(i);\n  }\n  return ans;\n}",
    py: "class Solution:\n    def dailyTemperatureWait(self, temperatures):\n        ans = [0] * len(temperatures)\n        stack = []\n        for i, value in enumerate(temperatures):\n            while stack and value > temperatures[stack[-1]]:\n                day = stack.pop()\n                ans[day] = i - day\n            stack.append(i)\n        return ans",
    cpp: "class Solution {\npublic:\n    vector<int> dailyTemperatureWait(vector<int>& temperatures) {\n        vector<int> ans(temperatures.size(), 0), stack;\n        for (int i = 0; i < (int)temperatures.size(); i++) { while (!stack.empty() && temperatures[i] > temperatures[stack.back()]) { int day = stack.back(); stack.pop_back(); ans[day] = i - day; } stack.push_back(i); }\n        return ans;\n    }\n};",
    java: "class Solution {\n    public int[] dailyTemperatureWait(int[] temperatures) {\n        int[] ans = new int[temperatures.length];\n        ArrayDeque<Integer> stack = new ArrayDeque<>();\n        for (int i = 0; i < temperatures.length; i++) { while (!stack.isEmpty() && temperatures[i] > temperatures[stack.peek()]) { int day = stack.pop(); ans[day] = i - day; } stack.push(i); }\n        return ans;\n    }\n}",
  },
];

function metadata(problem) {
  return {
    id: problem.id,
    slug: problem.slug,
    title: problem.title,
    acceptance: "0.0%",
    difficulty: problem.difficulty,
    track: "Algorithms",
    tags: problem.tags,
    companies: [],
    frequency: 0,
    likes: 0,
    dislikes: 0,
    discussionCount: 0,
    constraints: problem.constraints,
    examples: problem.examples,
    functionName: problem.functionName,
    solutionApproaches: [
      {
        title: "Pattern Based",
        complexity: "Time O(n) to O(n log n), Space O(n)",
        explanation: "Use the core pattern from the tags: sliding window, prefix sums, two pointers, sorting, or a monotonic stack.",
      },
    ],
  };
}

function writeProblem(problem) {
  const dir = path.join(root, problem.slug);
  const starterDir = path.join(dir, "starter-code");
  mkdirSync(starterDir, { recursive: true });
  writeFileSync(path.join(dir, "metadata.json"), `${JSON.stringify(metadata(problem), null, 2)}\n`);
  writeFileSync(path.join(dir, "problem.mdx"), `${problem.description}\n`);
  writeFileSync(path.join(dir, "hints.json"), `${JSON.stringify(problem.hints, null, 2)}\n`);
  writeFileSync(path.join(dir, "editorial.mdx"), `Identify the array pattern first, then keep one clear invariant while scanning or sorting. The starter solution is intentionally direct and interview-friendly.\n`);
  writeFileSync(path.join(dir, "testcases.json"), `${JSON.stringify({ sampleCases: problem.cases.slice(0, 1), hiddenCases: problem.cases.slice(1) }, null, 2)}\n`);
  writeFileSync(path.join(starterDir, "javascript.js"), `${problem.js}\n`);
  writeFileSync(path.join(starterDir, "python.py"), `${problem.py}\n`);
  writeFileSync(path.join(starterDir, "cpp.cpp"), `${problem.cpp}\n`);
  writeFileSync(path.join(starterDir, "java.java"), `${problem.java}\n`);
}

for (const problem of problems) writeProblem(problem);

console.log(`[add-array-medium-batch] wrote ${problems.length} original array medium problems`);
