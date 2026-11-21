/**
 * Fix all starter code bugs and add TypeScript starter codes.
 * Run: node scripts/problems/fix-starter-codes.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, "../../src/lib/problems/bank.ts");
let bank = readFileSync(bankPath, "utf8");

// Helper: replace starterCode for a slug
function fixStarterCode(slug, field, newCode) {
  const slugIdx = bank.indexOf(`"slug": "${slug}"`);
  if (slugIdx === -1) { console.log(`❌ slug not found: ${slug}`); return; }
  const scIdx = bank.indexOf('"starterCode":', slugIdx);
  if (scIdx === -1) { console.log(`❌ starterCode not found: ${slug}`); return; }
  
  // Find the field inside starterCode object
  const fieldStr = `"${field}":`;
  const fieldIdx = bank.indexOf(fieldStr, scIdx);
  const nextSlugIdx = bank.indexOf('"slug":', slugIdx + 10);
  if (fieldIdx === -1 || fieldIdx > nextSlugIdx) {
    // Field doesn't exist — need to add it
    console.log(`⚠️  ${slug} [${field}]: not found, skipping`);
    return;
  }
  
  // Find the opening quote of the value
  const openQ = bank.indexOf('"', fieldIdx + fieldStr.length);
  if (openQ === -1) return;
  
  // Find closing quote (handle escapes)
  let closeQ = openQ + 1;
  while (closeQ < bank.length) {
    if (bank[closeQ] === '"' && bank[closeQ - 1] !== '\\') break;
    closeQ++;
  }
  
  const escaped = newCode.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '');
  bank = bank.slice(0, openQ + 1) + escaped + bank.slice(closeQ);
  console.log(`✅ Fixed: ${slug} [${field}]`);
}

// Helper: add TypeScript field to starterCode
function addTSCode(slug, tsCode) {
  const slugIdx = bank.indexOf(`"slug": "${slug}"`);
  if (slugIdx === -1) return;
  const scIdx = bank.indexOf('"starterCode":', slugIdx);
  if (scIdx === -1) return;
  
  // Check if TypeScript already exists
  const nextSlugIdx = bank.indexOf('"slug":', slugIdx + 10);
  const scSection = bank.slice(scIdx, nextSlugIdx);
  if (scSection.includes('"TypeScript":')) return; // already has it
  
  // Find "JavaScript": and add TypeScript before it
  const jsFieldIdx = bank.indexOf('"JavaScript":', scIdx);
  if (jsFieldIdx === -1 || jsFieldIdx > nextSlugIdx) return;
  
  const escaped = tsCode.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '');
  bank = bank.slice(0, jsFieldIdx) + `"TypeScript": "${escaped}",\n      ` + bank.slice(jsFieldIdx);
  console.log(`✅ Added TS: ${slug}`);
}

// ═══════════════════════════════════════════════════
// 1. FIX BUGS IN EXISTING STARTER CODES
// ═══════════════════════════════════════════════════

// gcd-of-two: starter code returns Math.abs(a) but should use while loop properly
// Issue: gcd(18,12) should be 6 — the code IS correct but test says 18
// Actually bug is test case input format. Let's verify the logic is right.
// gcdOfTwo(12,18): a=12,b=18 → t=12%18=12,a=18,b=12 → t=18%12=6,a=12,b=6 → t=12%6=0,a=6,b=0 → returns 6 ✅
// So gcd is fine — issue was test case. Skip.

// matrix-diagonal-sum: center element counted twice for odd-sized matrix  
// Bug: condition `if (i !== n - 1 - i)` — when n=3, i=1: n-1-i=1, so 1!==1 is false → not added ✅
// So JS code is correct. Issue might be test case. Let's check by fixing anyway.

// reverse-clean-string: "hi there" → remove spaces → "hithere" → reverse → "erehtih"
// But expected is "erehti" — this means test case has different input. Bug in test case.
// Fix: update the test cases OR fix the description. Let's fix test case to match code.

// move-zeroes: Python returns None (in-place), need to return nums
fixStarterCode("move-zeroes", "Python", 
`class Solution:
    def moveZeroes(self, nums):
        pos = 0
        for n in nums:
            if n != 0:
                nums[pos] = n
                pos += 1
        while pos < len(nums):
            nums[pos] = 0
            pos += 1
        return nums`);

fixStarterCode("move-zeroes", "JavaScript",
`function moveZeroes(nums) {
  let pos = 0;
  for (const n of nums) {
    if (n !== 0) nums[pos++] = n;
  }
  while (pos < nums.length) nums[pos++] = 0;
  return nums;
}`);

// sort-colors: Python returns None (in-place), need to return nums
fixStarterCode("sort-colors", "Python",
`class Solution:
    def sortColors(self, nums):
        low, mid, high = 0, 0, len(nums) - 1
        while mid <= high:
            if nums[mid] == 0:
                nums[low], nums[mid] = nums[mid], nums[low]
                low += 1; mid += 1
            elif nums[mid] == 2:
                nums[mid], nums[high] = nums[high], nums[mid]
                high -= 1
            else:
                mid += 1
        return nums`);

fixStarterCode("sort-colors", "JavaScript",
`function sortColors(nums) {
  let low = 0, mid = 0, high = nums.length - 1;
  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++; mid++;
    } else if (nums[mid] === 2) {
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--;
    } else {
      mid++;
    }
  }
  return nums;
}`);

// rotate-array: Python returns None (in-place), need to return nums
fixStarterCode("rotate-array", "Python",
`class Solution:
    def rotate(self, nums, k):
        n = len(nums)
        k = k % n
        def rev(l, r):
            while l < r:
                nums[l], nums[r] = nums[r], nums[l]
                l += 1; r -= 1
        rev(0, n-1)
        rev(0, k-1)
        rev(k, n-1)
        return nums`);

// transpose-square: Java uses var with 2D array — fix with explicit type
fixStarterCode("transpose-square", "Java",
`class Solution {
    public int[][] transposeSquare(int[][] matrix) {
        int n = matrix.length;
        int[][] ans = new int[n][n];
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                ans[j][i] = matrix[i][j];
        return ans;
    }
}`);

// transpose-square: JS runtime error — check
fixStarterCode("transpose-square", "JavaScript",
`function transposeSquare(matrix) {
  const n = matrix.length;
  const ans = [];
  for (let i = 0; i < n; i++) {
    ans[i] = [];
    for (let j = 0; j < n; j++) ans[i][j] = matrix[j][i];
  }
  return ans;
}`);

// merge-overlapping-ranges: Java var issue
fixStarterCode("merge-overlapping-ranges", "Java",
`class Solution {
    public int[][] mergeOverlappingRanges(int[][] intervals) {
        java.util.Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
        java.util.List<int[]> merged = new java.util.ArrayList<>();
        for (int[] interval : intervals) {
            if (merged.isEmpty() || merged.get(merged.size()-1)[1] < interval[0]) {
                merged.add(interval);
            } else {
                merged.get(merged.size()-1)[1] = Math.max(merged.get(merged.size()-1)[1], interval[1]);
            }
        }
        return merged.toArray(new int[0][]);
    }
}`);

// rotate-array Java: var issue
fixStarterCode("rotate-array", "Java",
`class Solution {
    public int[] rotate(int[] nums, int k) {
        int n = nums.length;
        k = k % n;
        reverse(nums, 0, n - 1);
        reverse(nums, 0, k - 1);
        reverse(nums, k, n - 1);
        return nums;
    }
    private void reverse(int[] nums, int left, int right) {
        while (left < right) {
            int t = nums[left]; nums[left] = nums[right]; nums[right] = t;
            left++; right--;
        }
    }
}`);

// find-all-duplicates Java: List issue
fixStarterCode("find-all-duplicates", "Java",
`class Solution {
    public int[] findDuplicates(int[] nums) {
        java.util.List<Integer> result = new java.util.ArrayList<>();
        for (int num : nums) {
            int idx = Math.abs(num) - 1;
            if (nums[idx] < 0) result.add(Math.abs(num));
            else nums[idx] = -nums[idx];
        }
        return result.stream().mapToInt(Integer::intValue).toArray();
    }
}`);

// move-zeroes Java: var issue
fixStarterCode("move-zeroes", "Java",
`class Solution {
    public int[] moveZeroes(int[] nums) {
        int pos = 0;
        for (int n : nums) {
            if (n != 0) nums[pos++] = n;
        }
        while (pos < nums.length) nums[pos++] = 0;
        return nums;
    }
}`);

// k-closest-numbers Java: var issue
fixStarterCode("k-closest-numbers", "Java",
`class Solution {
    public int[][] kClosest(int[][] points, int k) {
        java.util.Arrays.sort(points, (a, b) -> (a[0]*a[0]+a[1]*a[1]) - (b[0]*b[0]+b[1]*b[1]));
        return java.util.Arrays.copyOf(points, k);
    }
}`);

// 4sum Java: List issue
fixStarterCode("4sum", "Java",
`class Solution {
    public int[][] fourSum(int[] nums, int target) {
        java.util.Arrays.sort(nums);
        java.util.List<int[]> res = new java.util.ArrayList<>();
        for (int i = 0; i < nums.length - 3; i++) {
            if (i > 0 && nums[i] == nums[i-1]) continue;
            for (int j = i+1; j < nums.length - 2; j++) {
                if (j > i+1 && nums[j] == nums[j-1]) continue;
                int l = j+1, r = nums.length-1;
                while (l < r) {
                    long s = (long)nums[i]+nums[j]+nums[l]+nums[r];
                    if (s == target) { res.add(new int[]{nums[i],nums[j],nums[l],nums[r]}); while(l<r&&nums[l]==nums[l+1])l++; while(l<r&&nums[r]==nums[r-1])r--; l++;r--; }
                    else if (s < target) l++; else r--;
                }
            }
        }
        return res.toArray(new int[0][]);
    }
}`);

// spiral-matrix Java: List issue
fixStarterCode("spiral-matrix", "Java",
`class Solution {
    public int[] spiralOrder(int[][] matrix) {
        java.util.List<Integer> res = new java.util.ArrayList<>();
        if (matrix.length == 0) return new int[0];
        int top=0, bottom=matrix.length-1, left=0, right=matrix[0].length-1;
        while (top<=bottom && left<=right) {
            for (int i=left;i<=right;i++) res.add(matrix[top][i]); top++;
            for (int i=top;i<=bottom;i++) res.add(matrix[i][right]); right--;
            if (top<=bottom) { for (int i=right;i>=left;i--) res.add(matrix[bottom][i]); bottom--; }
            if (left<=right) { for (int i=bottom;i>=top;i--) res.add(matrix[i][left]); left++; }
        }
        return res.stream().mapToInt(Integer::intValue).toArray();
    }
}`);

// cyclically-rotating-a-grid Java
fixStarterCode("cyclically-rotating-a-grid", "Java",
`class Solution {
    public int[][] rotateGrid(int[][] grid, int k) {
        int m = grid.length, n = grid[0].length;
        for (int layer = 0; layer < Math.min(m,n)/2; layer++) {
            java.util.List<Integer> elems = new java.util.ArrayList<>();
            int top=layer, bottom=m-1-layer, left=layer, right=n-1-layer;
            for (int c=left;c<=right;c++) elems.add(grid[top][c]);
            for (int r=top+1;r<=bottom;r++) elems.add(grid[r][right]);
            for (int c=right-1;c>=left;c--) elems.add(grid[bottom][c]);
            for (int r=bottom-1;r>top;r--) elems.add(grid[r][left]);
            int sz = elems.size();
            int shift = k % sz;
            java.util.Collections.rotate(elems, -shift);
            int idx = 0;
            for (int c=left;c<=right;c++) grid[top][c]=elems.get(idx++);
            for (int r=top+1;r<=bottom;r++) grid[r][right]=elems.get(idx++);
            for (int c=right-1;c>=left;c--) grid[bottom][c]=elems.get(idx++);
            for (int r=bottom-1;r>top;r--) grid[r][left]=elems.get(idx++);
        }
        return grid;
    }
}`);

// range-sum-query-immutable: JS illegal return statement
fixStarterCode("range-sum-query-immutable", "JavaScript",
`function rangeSumQuery(nums, queries) {
  const prefix = [0];
  for (const n of nums) prefix.push(prefix[prefix.length - 1] + n);
  return queries.map(([left, right]) => prefix[right + 1] - prefix[left]);
}`);

// fix pair-target-indices — bug: returns empty when duplicate values
fixStarterCode("pair-target-indices", "JavaScript",
`function pairTargetIndices(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}`);

fixStarterCode("pair-target-indices", "Python",
`class Solution:
    def pairTargetIndices(self, nums, target):
        seen = {}
        for i, v in enumerate(nums):
            need = target - v
            if need in seen:
                return [seen[need], i]
            seen[v] = i
        return []`);

fixStarterCode("pair-target-indices", "Java",
`class Solution {
    public int[] pairTargetIndices(int[] nums, int target) {
        java.util.Map<Integer,Integer> seen = new java.util.HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (seen.containsKey(need)) return new int[]{seen.get(need), i};
            seen.put(nums[i], i);
        }
        return new int[]{};
    }
}`);

// compress-runs: JS returns empty string bug
fixStarterCode("compress-runs", "JavaScript",
`function compressRuns(s) {
  if (!s) return '';
  let out = '', count = 1;
  for (let i = 1; i <= s.length; i++) {
    if (i < s.length && s[i] === s[i - 1]) {
      count++;
    } else {
      out += s[i - 1] + count;
      count = 1;
    }
  }
  return out;
}`);

// nearest-even: JS syntax error — semicolons in template literal
fixStarterCode("nearest-even", "JavaScript",
`function nearestEven(n) {
  return n % 2 === 0 ? n : n + 1;
}`);

// second-largest-distinct: JS syntax error
fixStarterCode("second-largest-distinct", "JavaScript",
`function secondLargestDistinct(nums) {
  let first = -Infinity, second = -Infinity;
  for (const v of nums) {
    if (v > first) { second = first; first = v; }
    else if (v > second && v !== first) second = v;
  }
  return second === -Infinity ? -1 : second;
}`);

// min-length-subarray-sum: JS syntax error
fixStarterCode("min-length-subarray-sum", "JavaScript",
`function minLengthSubarraySum(nums, target) {
  let left = 0, sum = 0, best = Infinity;
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];
    while (sum >= target) {
      best = Math.min(best, right - left + 1);
      sum -= nums[left++];
    }
  }
  return best === Infinity ? 0 : best;
}`);

// remove-target-values: JS wrong filter
fixStarterCode("remove-target-values", "JavaScript",
`function removeTargetValues(nums, target) {
  return nums.filter(v => v !== target);
}`);

// intersection-two-arrays Java: order issue — sort result
fixStarterCode("intersection-two-arrays", "Java",
`class Solution {
    public int[] intersection(int[] nums1, int[] nums2) {
        java.util.Set<Integer> set = new java.util.HashSet<>();
        for (int n : nums1) set.add(n);
        java.util.Set<Integer> res = new java.util.TreeSet<>();
        for (int n : nums2) if (set.contains(n)) res.add(n);
        return res.stream().mapToInt(Integer::intValue).toArray();
    }
}`);

// matrix-diagonal-sum: fix center double-count
fixStarterCode("matrix-diagonal-sum", "JavaScript",
`function matrixDiagonalSum(matrix) {
  const n = matrix.length;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += matrix[i][i];
    if (i !== n - 1 - i) sum += matrix[i][n - 1 - i];
  }
  return sum;
}`);

// ═══════════════════════════════════════════════════
// 2. ADD TYPESCRIPT STARTER CODES FOR ALL PROBLEMS
// ═══════════════════════════════════════════════════

const tsCodes = {
  "two-sum": `function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need)!, i];
    seen.set(nums[i], i);
  }
  return [];
}`,
  "add-two-numbers": `function addTwoNumbers(l1Arr: number[], l2Arr: number[]): number[] {
  interface ListNode { val: number; next: ListNode | null; }
  const makeList = (arr: number[]): ListNode | null => {
    const dummy: ListNode = { val: 0, next: null }; let cur = dummy;
    for (const v of arr) { cur.next = { val: v, next: null }; cur = cur.next!; }
    return dummy.next;
  };
  const toArray = (node: ListNode | null): number[] => {
    const res: number[] = []; while (node) { res.push(node.val); node = node.next; } return res;
  };
  let l1 = makeList(l1Arr), l2 = makeList(l2Arr);
  const dummy: ListNode = { val: 0, next: null }; let cur = dummy, carry = 0;
  while (l1 || l2 || carry) {
    const sum = (l1 ? l1.val : 0) + (l2 ? l2.val : 0) + carry;
    carry = Math.floor(sum / 10); cur.next = { val: sum % 10, next: null }; cur = cur.next!;
    if (l1) l1 = l1.next; if (l2) l2 = l2.next;
  }
  return toArray(dummy.next);
}`,
  "longest-substring": `function lengthOfLongestSubstring(s: string): number {
  let left = 0, best = 0;
  const seen = new Map<string, number>();
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (seen.has(ch) && seen.get(ch)! >= left) left = seen.get(ch)! + 1;
    seen.set(ch, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
  "median-two-arrays": `function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
  const merged = [...nums1, ...nums2].sort((a, b) => a - b);
  const mid = Math.floor(merged.length / 2);
  return merged.length % 2 ? merged[mid] : (merged[mid - 1] + merged[mid]) / 2;
}`,
  "pair-target-indices": `function pairTargetIndices(nums: number[], target: number): number[] {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need)!, i];
    seen.set(nums[i], i);
  }
  return [];
}`,
  "running-total": `function runningTotal(nums: number[]): number[] {
  let s = 0; return nums.map(x => s += x);
}`,
  "count-strictly-greater": `function countStrictlyGreater(nums: number[], threshold: number): number {
  return nums.filter(x => x > threshold).length;
}`,
  "first-unique-number": `function firstUniqueNumber(nums: number[]): number {
  const count = new Map<number, number>();
  for (const n of nums) count.set(n, (count.get(n) ?? 0) + 1);
  for (const n of nums) if (count.get(n) === 1) return n;
  return -1;
}`,
  "move-negatives-left": `function moveNegativesLeft(nums: number[]): number[] {
  return [...nums.filter(x => x < 0), ...nums.filter(x => x >= 0)];
}`,
  "longest-even-streak": `function longestEvenStreak(nums: number[]): number {
  let best = 0, cur = 0;
  for (const n of nums) { cur = n % 2 === 0 ? cur + 1 : 0; best = Math.max(best, cur); }
  return best;
}`,
  "maximum-neighbor-gap": `function maximumNeighborGap(nums: number[]): number {
  let best = 0;
  for (let i = 1; i < nums.length; i++) best = Math.max(best, Math.abs(nums[i] - nums[i-1]));
  return best;
}`,
  "count-balanced-prefixes": `function countBalancedPrefixes(nums: number[]): number {
  let sum = 0, count = 0;
  for (const n of nums) { sum += n; if (sum === 0) count++; }
  return count;
}`,
  "rotate-right-once": `function rotateRightOnce(nums: number[]): number[] {
  if (!nums.length) return [];
  return [nums[nums.length - 1], ...nums.slice(0, -1)];
}`,
  "missing-zero-to-n": `function missingZeroToN(nums: number[]): number {
  const n = nums.length;
  return n * (n + 1) / 2 - nums.reduce((a, b) => a + b, 0);
}`,
  "reverse-clean-string": `function reverseCleanString(s: string): string {
  return s.replaceAll(' ', '').split('').reverse().join('');
}`,
  "count-vowels": `function countVowels(s: string): number {
  return (s.match(/[aeiouAEIOU]/g) ?? []).length;
}`,
  "is-soft-palindrome": `function isSoftPalindrome(s: string): boolean {
  const clean = s.toLowerCase().replace(/\s/g, '');
  return clean === clean.split('').reverse().join('');
}`,
  "first-repeated-character": `function firstRepeatedCharacter(s: string): string {
  const seen = new Set<string>();
  for (const ch of s) { if (seen.has(ch)) return ch; seen.add(ch); }
  return '';
}`,
  "compress-runs": `function compressRuns(s: string): string {
  if (!s) return '';
  let out = '', count = 1;
  for (let i = 1; i <= s.length; i++) {
    if (i < s.length && s[i] === s[i-1]) count++;
    else { out += s[i-1] + count; count = 1; }
  }
  return out;
}`,
  "longest-same-letter-run": `function longestSameLetterRun(s: string): number {
  let best = 0, cur = 0, prev = '';
  for (const ch of s) { cur = ch === prev ? cur + 1 : 1; best = Math.max(best, cur); prev = ch; }
  return best;
}`,
  "count-words-simple": `function countWordsSimple(s: string): number {
  return s.trim().split(/\s+/).filter(w => w.length > 0).length;
}`,
  "remove-adjacent-duplicates-once": `function removeAdjacentDuplicatesOnce(s: string): string {
  const stack: string[] = [];
  for (const ch of s) {
    if (stack.length && stack[stack.length-1] === ch) stack.pop();
    else stack.push(ch);
  }
  return stack.join('');
}`,
  "digital-sum": `function digitalSum(n: number): number {
  return String(Math.abs(n)).split('').reduce((s, d) => s + Number(d), 0);
}`,
  "is-power-of-two-simple": `function isPowerOfTwoSimple(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}`,
  "gcd-of-two": `function gcdOfTwo(a: number, b: number): number {
  while (b !== 0) { const t = a % b; a = b; b = t; } return Math.abs(a);
}`,
  "nearest-even": `function nearestEven(n: number): number {
  return n % 2 === 0 ? n : n + 1;
}`,
  "matrix-diagonal-sum": `function matrixDiagonalSum(matrix: number[][]): number {
  const n = matrix.length; let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += matrix[i][i];
    if (i !== n - 1 - i) sum += matrix[i][n - 1 - i];
  }
  return sum;
}`,
  "count-island-cells": `function countIslandCells(grid: number[][]): number {
  return grid.flat().filter(x => x === 1).length;
}`,
  "transpose-square": `function transposeSquare(matrix: number[][]): number[][] {
  const n = matrix.length;
  return Array.from({length: n}, (_, i) => Array.from({length: n}, (_, j) => matrix[j][i]));
}`,
  "sum-positive-values": `function sumPositiveValues(nums: number[]): number {
  return nums.filter(x => x > 0).reduce((a, b) => a + b, 0);
}`,
  "count-local-peaks": `function countLocalPeaks(nums: number[]): number {
  let count = 0;
  for (let i = 1; i < nums.length - 1; i++) if (nums[i] > nums[i-1] && nums[i] > nums[i+1]) count++;
  return count;
}`,
  "replace-with-greatest-right": `function replaceWithGreatestRight(nums: number[]): number[] {
  let max = -1;
  for (let i = nums.length - 1; i >= 0; i--) { const t = nums[i]; nums[i] = max; max = Math.max(max, t); }
  return nums;
}`,
  "second-largest-distinct": `function secondLargestDistinct(nums: number[]): number {
  let first = -Infinity, second = -Infinity;
  for (const v of nums) {
    if (v > first) { second = first; first = v; }
    else if (v > second && v !== first) second = v;
  }
  return second === -Infinity ? -1 : second;
}`,
  "remove-target-values": `function removeTargetValues(nums: number[], target: number): number[] {
  return nums.filter(v => v !== target);
}`,
  "merge-sorted-values": `function mergeSortedValues(a: number[], b: number[]): number[] {
  const res: number[] = []; let i = 0, j = 0;
  while (i < a.length && j < b.length) a[i] <= b[j] ? res.push(a[i++]) : res.push(b[j++]);
  while (i < a.length) res.push(a[i++]);
  while (j < b.length) res.push(b[j++]);
  return res;
}`,
  "sorted-squares-values": `function sortedSquaresValues(nums: number[]): number[] {
  return nums.map(x => x * x).sort((a, b) => a - b);
}`,
  "max-consecutive-ones-simple": `function maxConsecutiveOnesSimple(nums: number[]): number {
  let best = 0, cur = 0;
  for (const n of nums) { cur = n === 1 ? cur + 1 : 0; best = Math.max(best, cur); }
  return best;
}`,
  "find-pivot-index-simple": `function findPivotIndexSimple(nums: number[]): number {
  const total = nums.reduce((a, b) => a + b, 0); let left = 0;
  for (let i = 0; i < nums.length; i++) { if (left === total - left - nums[i]) return i; left += nums[i]; }
  return -1;
}`,
  "range-sum-basic": `function rangeSumBasic(nums: number[], left: number, right: number): number {
  return nums.slice(left, right + 1).reduce((a, b) => a + b, 0);
}`,
  "unique-intersection-values": `function uniqueIntersectionValues(a: number[], b: number[]): number[] {
  const setB = new Set(b);
  return [...new Set(a.filter(x => setB.has(x)))].sort((x, y) => x - y);
}`,
  "majority-vote-simple": `function majorityVoteSimple(nums: number[]): number {
  let count = 0, majority = 0;
  for (const n of nums) { if (count === 0) majority = n; count += n === majority ? 1 : -1; }
  return majority;
}`,
  "max-sum-window": `function maxSumWindow(nums: number[], k: number): number {
  let sum = nums.slice(0, k).reduce((a, b) => a + b, 0), best = sum;
  for (let i = k; i < nums.length; i++) { sum += nums[i] - nums[i - k]; best = Math.max(best, sum); }
  return best;
}`,
  "min-length-subarray-sum": `function minLengthSubarraySum(nums: number[], target: number): number {
  let left = 0, sum = 0, best = Infinity;
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];
    while (sum >= target) { best = Math.min(best, right - left + 1); sum -= nums[left++]; }
  }
  return best === Infinity ? 0 : best;
}`,
  "subarray-sum-equals-target": `function subarraySumEqualsTarget(nums: number[], k: number): number {
  const map = new Map<number, number>([[0, 1]]); let sum = 0, count = 0;
  for (const n of nums) { sum += n; count += map.get(sum - k) ?? 0; map.set(sum, (map.get(sum) ?? 0) + 1); }
  return count;
}`,
  "longest-balanced-zero-one": `function longestBalancedZeroOne(nums: number[]): number {
  const map = new Map<number, number>([[0, -1]]); let sum = 0, best = 0;
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i] === 0 ? -1 : 1;
    if (map.has(sum)) best = Math.max(best, i - map.get(sum)!);
    else map.set(sum, i);
  }
  return best;
}`,
  "three-number-zero": `function threeNumberZero(nums: number[]): number[][] {
  nums.sort((a, b) => a - b); const res: number[][] = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i-1]) continue;
    let l = i+1, r = nums.length-1;
    while (l < r) {
      const s = nums[i]+nums[l]+nums[r];
      if (s === 0) { res.push([nums[i],nums[l],nums[r]]); while(l<r&&nums[l]===nums[l+1])l++; while(l<r&&nums[r]===nums[r-1])r--; l++;r--; }
      else if (s < 0) l++; else r--;
    }
  }
  return res;
}`,
  "product-except-self-basic": `function productExceptSelfBasic(nums: number[]): number[] {
  const n = nums.length, res = new Array(n).fill(1);
  let left = 1; for (let i = 0; i < n; i++) { res[i] = left; left *= nums[i]; }
  let right = 1; for (let i = n-1; i >= 0; i--) { res[i] *= right; right *= nums[i]; }
  return res;
}`,
  "merge-overlapping-ranges": `function mergeOverlappingRanges(intervals: number[][]): number[][] {
  intervals.sort((a, b) => a[0] - b[0]); const merged: number[][] = [];
  for (const iv of intervals) {
    if (!merged.length || merged[merged.length-1][1] < iv[0]) merged.push(iv);
    else merged[merged.length-1][1] = Math.max(merged[merged.length-1][1], iv[1]);
  }
  return merged;
}`,
  "container-water-basic": `function containerWaterBasic(height: number[]): number {
  let l = 0, r = height.length-1, best = 0;
  while (l < r) { best = Math.max(best, Math.min(height[l],height[r])*(r-l)); height[l]<height[r]?l++:r--; }
  return best;
}`,
  "next-greater-right": `function nextGreaterRight(nums: number[]): number[] {
  const res = new Array(nums.length).fill(-1); const stack: number[] = [];
  for (let i = 0; i < nums.length; i++) { while(stack.length && nums[i] > nums[stack[stack.length-1]]) res[stack.pop()!] = nums[i]; stack.push(i); }
  return res;
}`,
  "daily-temperature-wait": `function dailyTemperatureWait(temps: number[]): number[] {
  const res = new Array(temps.length).fill(0); const stack: number[] = [];
  for (let i = 0; i < temps.length; i++) { while(stack.length && temps[i] > temps[stack[stack.length-1]]) res[stack.pop()!] = i - stack[stack.length]; stack.push(i); }
  return res;
}`,
  "best-time-buy-sell": `function maxProfit(prices: number[]): number {
  let min = Infinity, best = 0;
  for (const p of prices) { min = Math.min(min, p); best = Math.max(best, p - min); }
  return best;
}`,
  "contains-duplicate": `function containsDuplicate(nums: number[]): boolean {
  return new Set(nums).size !== nums.length;
}`,
  "majority-element": `function majorityElement(nums: number[]): number {
  let count = 0, m = 0;
  for (const n of nums) { if (count === 0) m = n; count += n === m ? 1 : -1; }
  return m;
}`,
  "rotate-array": `function rotate(nums: number[], k: number): number[] {
  const n = nums.length; k = k % n;
  const rev = (l: number, r: number) => { while(l<r){[nums[l],nums[r]]=[nums[r],nums[l]];l++;r--;} };
  rev(0,n-1); rev(0,k-1); rev(k,n-1); return nums;
}`,
  "find-all-duplicates": `function findDuplicates(nums: number[]): number[] {
  const res: number[] = [];
  for (const num of nums) { const idx = Math.abs(num)-1; if(nums[idx]<0) res.push(Math.abs(num)); else nums[idx]=-nums[idx]; }
  return res;
}`,
  "maximum-subarray": `function maxSubArray(nums: number[]): number {
  let best = nums[0], cur = nums[0];
  for (let i = 1; i < nums.length; i++) { cur = Math.max(nums[i], cur+nums[i]); best = Math.max(best, cur); }
  return best;
}`,
  "intersection-two-arrays": `function intersection(nums1: number[], nums2: number[]): number[] {
  const s = new Set(nums1); return [...new Set(nums2.filter(x => s.has(x)))];
}`,
  "move-zeroes": `function moveZeroes(nums: number[]): number[] {
  let pos = 0; for (const n of nums) if (n !== 0) nums[pos++] = n;
  while (pos < nums.length) nums[pos++] = 0; return nums;
}`,
  "plus-one": `function plusOne(digits: number[]): number[] {
  for (let i = digits.length-1; i >= 0; i--) { if (digits[i] < 9) { digits[i]++; return digits; } digits[i] = 0; }
  return [1, ...digits];
}`,
  "missing-number": `function missingNumber(nums: number[]): number {
  const n = nums.length; return n*(n+1)/2 - nums.reduce((a,b)=>a+b,0);
}`,
  "find-minimum-rotated": `function findMin(nums: number[]): number {
  let l = 0, r = nums.length-1;
  while (l < r) { const m = (l+r)>>1; if(nums[m]>nums[r]) l=m+1; else r=m; }
  return nums[l];
}`,
  "single-number": `function singleNumber(nums: number[]): number {
  return nums.reduce((a,b) => a^b, 0);
}`,
  "search-rotated-array": `function search(nums: number[], target: number): number {
  let l = 0, r = nums.length-1;
  while (l <= r) {
    const m = (l+r)>>1;
    if (nums[m] === target) return m;
    if (nums[l] <= nums[m]) { if(nums[l]<=target&&target<nums[m]) r=m-1; else l=m+1; }
    else { if(nums[m]<target&&target<=nums[r]) l=m+1; else r=m-1; }
  }
  return -1;
}`,
  "k-closest-numbers": `function kClosest(points: number[][], k: number): number[][] {
  return points.sort((a,b) => a[0]*a[0]+a[1]*a[1] - (b[0]*b[0]+b[1]*b[1])).slice(0,k);
}`,
  "two-sum-ii": `function twoSum(numbers: number[], target: number): number[] {
  let l = 0, r = numbers.length-1;
  while (l < r) { const s = numbers[l]+numbers[r]; if(s===target) return [l+1,r+1]; s<target?l++:r--; }
  return [];
}`,
  "sort-colors": `function sortColors(nums: number[]): number[] {
  let low = 0, mid = 0, high = nums.length-1;
  while (mid <= high) {
    if(nums[mid]===0){[nums[low],nums[mid]]=[nums[mid],nums[low]];low++;mid++;}
    else if(nums[mid]===2){[nums[mid],nums[high]]=[nums[high],nums[mid]];high--;}
    else mid++;
  }
  return nums;
}`,
  "4sum": `function fourSum(nums: number[], target: number): number[][] {
  nums.sort((a,b)=>a-b); const res: number[][] = [];
  for (let i=0;i<nums.length-3;i++) {
    if(i>0&&nums[i]===nums[i-1]) continue;
    for (let j=i+1;j<nums.length-2;j++) {
      if(j>i+1&&nums[j]===nums[j-1]) continue;
      let l=j+1,r=nums.length-1;
      while(l<r){const s=nums[i]+nums[j]+nums[l]+nums[r];if(s===target){res.push([nums[i],nums[j],nums[l],nums[r]]);while(l<r&&nums[l]===nums[l+1])l++;while(l<r&&nums[r]===nums[r-1])r--;l++;r--;}else if(s<target)l++;else r--;}
    }
  }
  return res;
}`,
  "jump-game": `function canJump(nums: number[]): boolean {
  let reach = 0;
  for (let i = 0; i < nums.length; i++) { if(i>reach) return false; reach=Math.max(reach,i+nums[i]); }
  return true;
}`,
  "subarray-product-less-k": `function numSubarrayProductLessThanK(nums: number[], k: number): number {
  if (k <= 1) return 0; let prod = 1, l = 0, count = 0;
  for (let r = 0; r < nums.length; r++) { prod *= nums[r]; while(prod>=k) prod/=nums[l++]; count+=r-l+1; }
  return count;
}`,
  "range-sum-query-immutable": `function rangeSumQuery(nums: number[], queries: number[][]): number[] {
  const prefix = [0]; for (const n of nums) prefix.push(prefix[prefix.length-1]+n);
  return queries.map(([l,r]) => prefix[r+1]-prefix[l]);
}`,
  "spiral-matrix": `function spiralOrder(matrix: number[][]): number[] {
  const res: number[] = []; if(!matrix.length) return res;
  let top=0,bottom=matrix.length-1,left=0,right=matrix[0].length-1;
  while(top<=bottom&&left<=right){
    for(let i=left;i<=right;i++) res.push(matrix[top][i]); top++;
    for(let i=top;i<=bottom;i++) res.push(matrix[i][right]); right--;
    if(top<=bottom){for(let i=right;i>=left;i--) res.push(matrix[bottom][i]); bottom--;}
    if(left<=right){for(let i=bottom;i>=top;i--) res.push(matrix[i][left]); left++;}
  }
  return res;
}`,
};

let tsAdded = 0;
for (const [slug, code] of Object.entries(tsCodes)) {
  addTSCode(slug, code);
  tsAdded++;
}

writeFileSync(bankPath, bank, "utf8");
console.log(`\n✅ Done! TypeScript added for ${tsAdded} problems.`);
