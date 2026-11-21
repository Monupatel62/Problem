/**
 * Add optimal solutions to all problems in bank.ts
 * Run: node scripts/problems/add-solutions.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, "../../src/lib/problems/bank.ts");
let bank = readFileSync(bankPath, "utf8");

function addSolutions(slug, solutions) {
  const slugIdx = bank.indexOf(`"slug": "${slug}"`);
  if (slugIdx === -1) { console.log(`❌ Not found: ${slug}`); return; }
  
  // Find editorial field (insert solutions before it, or before closing })
  const editorialIdx = bank.indexOf('"editorial":', slugIdx);
  const nextSlug = bank.indexOf('"id":', slugIdx + 10);
  
  const insertBefore = (editorialIdx > 0 && editorialIdx < nextSlug) 
    ? editorialIdx 
    : bank.lastIndexOf('"solutionApproaches":', nextSlug > 0 ? nextSlug : bank.length);
  
  if (insertBefore === -1) { console.log(`❌ Insert point not found: ${slug}`); return; }

  // Build solutions object
  const solutionsJson = Object.entries(solutions)
    .map(([lang, code]) => {
      const esc = code.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"");
      return `      "${lang}": "${esc}"`;
    })
    .join(",\n");
  
  const solutionsBlock = `"solutions": {\n${solutionsJson}\n    },\n    `;
  
  bank = bank.slice(0, insertBefore) + solutionsBlock + bank.slice(insertBefore);
  console.log(`✅ ${slug}`);
}

// ═══════════════════════════════════════════════════════════════════
// SOLUTIONS FOR ALL 73 ALGORITHM PROBLEMS
// ═══════════════════════════════════════════════════════════════════

addSolutions("two-sum", {
  JavaScript: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}`,
  Python: `class Solution:
    def twoSum(self, nums, target):
        seen = {}
        for i, v in enumerate(nums):
            if target - v in seen:
                return [seen[target - v], i]
            seen[v] = i
        return []`,
  Java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (seen.containsKey(need)) return new int[]{seen.get(need), i};
            seen.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
  TypeScript: `function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need)!, i];
    seen.set(nums[i], i);
  }
  return [];
}`,
});

addSolutions("add-two-numbers", {
  JavaScript: `function addTwoNumbers(l1Arr, l2Arr) {
  function makeList(arr) {
    const dummy = { val: 0, next: null }; let cur = dummy;
    for (const v of arr) { cur.next = { val: v, next: null }; cur = cur.next; }
    return dummy.next;
  }
  function toArr(node) { const r = []; while (node) { r.push(node.val); node = node.next; } return r; }
  let l1 = makeList(l1Arr), l2 = makeList(l2Arr);
  const dummy = { val: 0, next: null }; let cur = dummy, carry = 0;
  while (l1 || l2 || carry) {
    const sum = (l1 ? l1.val : 0) + (l2 ? l2.val : 0) + carry;
    carry = Math.floor(sum / 10);
    cur.next = { val: sum % 10, next: null }; cur = cur.next;
    if (l1) l1 = l1.next; if (l2) l2 = l2.next;
  }
  return toArr(dummy.next);
}`,
  Python: `class Solution:
    def addTwoNumbers(self, l1_arr, l2_arr):
        dummy = type('N', (), {'val': 0, 'next': None})()
        cur, carry = dummy, 0
        i, j = 0, 0
        while i < len(l1_arr) or j < len(l2_arr) or carry:
            a = l1_arr[i] if i < len(l1_arr) else 0
            b = l2_arr[j] if j < len(l2_arr) else 0
            total = a + b + carry
            carry, rem = divmod(total, 10)
            node = type('N', (), {'val': rem, 'next': None})()
            cur.next = node; cur = node
            i += 1; j += 1
        return [n.val for n in iter(lambda: dummy.next, None) if True] if False else self._to_list(dummy.next)
    def _to_list(self, node):
        r = []
        while node: r.append(node.val); node = node.next
        return r`,
  Java: `class Solution {
    public int[] addTwoNumbers(int[] l1Arr, int[] l2Arr) {
        java.util.List<Integer> res = new java.util.ArrayList<>();
        int i = 0, j = 0, carry = 0;
        while (i < l1Arr.length || j < l2Arr.length || carry != 0) {
            int a = i < l1Arr.length ? l1Arr[i++] : 0;
            int b = j < l2Arr.length ? l2Arr[j++] : 0;
            int total = a + b + carry;
            carry = total / 10;
            res.add(total % 10);
        }
        return res.stream().mapToInt(Integer::intValue).toArray();
    }
}`,
});

addSolutions("longest-substring", {
  JavaScript: `function lengthOfLongestSubstring(s) {
  const seen = new Map();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    if (seen.has(s[right]) && seen.get(s[right]) >= left)
      left = seen.get(s[right]) + 1;
    seen.set(s[right], right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
  Python: `class Solution:
    def lengthOfLongestSubstring(self, s):
        seen, left, best = {}, 0, 0
        for right, ch in enumerate(s):
            if ch in seen and seen[ch] >= left:
                left = seen[ch] + 1
            seen[ch] = right
            best = max(best, right - left + 1)
        return best`,
  Java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> seen = new HashMap<>();
        int left = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            char ch = s.charAt(right);
            if (seen.containsKey(ch) && seen.get(ch) >= left)
                left = seen.get(ch) + 1;
            seen.put(ch, right);
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}`,
});

addSolutions("median-two-arrays", {
  JavaScript: `function findMedianSortedArrays(nums1, nums2) {
  const merged = [...nums1, ...nums2].sort((a, b) => a - b);
  const mid = Math.floor(merged.length / 2);
  return merged.length % 2 ? merged[mid] : (merged[mid-1] + merged[mid]) / 2;
}`,
  Python: `class Solution:
    def findMedianSortedArrays(self, nums1, nums2):
        merged = sorted(nums1 + nums2)
        n = len(merged)
        return merged[n//2] if n % 2 else (merged[n//2-1] + merged[n//2]) / 2`,
  Java: `class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        int[] merged = new int[nums1.length + nums2.length];
        int i = 0, j = 0, k = 0;
        while (i < nums1.length && j < nums2.length)
            merged[k++] = nums1[i] <= nums2[j] ? nums1[i++] : nums2[j++];
        while (i < nums1.length) merged[k++] = nums1[i++];
        while (j < nums2.length) merged[k++] = nums2[j++];
        int mid = merged.length / 2;
        return merged.length % 2 == 1 ? merged[mid] : (merged[mid-1] + merged[mid]) / 2.0;
    }
}`,
});

addSolutions("pair-target-indices", {
  JavaScript: `function pairTargetIndices(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}`,
  Python: `class Solution:
    def pairTargetIndices(self, nums, target):
        seen = {}
        for i, v in enumerate(nums):
            if target - v in seen: return [seen[target - v], i]
            seen[v] = i
        return []`,
  Java: `class Solution {
    public int[] pairTargetIndices(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (seen.containsKey(need)) return new int[]{seen.get(need), i};
            seen.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
});

addSolutions("running-total", {
  JavaScript: `function runningTotal(nums) {
  let sum = 0;
  return nums.map(x => sum += x);
}`,
  Python: `class Solution:
    def runningTotal(self, nums):
        s = 0
        return [s := s + x for x in nums]`,
  Java: `class Solution {
    public int[] runningTotal(int[] nums) {
        int[] res = new int[nums.length]; int sum = 0;
        for (int i = 0; i < nums.length; i++) { sum += nums[i]; res[i] = sum; }
        return res;
    }
}`,
});

addSolutions("count-strictly-greater", {
  JavaScript: `function countStrictlyGreater(nums, threshold) {
  return nums.filter(x => x > threshold).length;
}`,
  Python: `class Solution:
    def countStrictlyGreater(self, nums, threshold):
        return sum(1 for x in nums if x > threshold)`,
  Java: `class Solution {
    public int countStrictlyGreater(int[] nums, int threshold) {
        int count = 0;
        for (int n : nums) if (n > threshold) count++;
        return count;
    }
}`,
});

addSolutions("first-unique-number", {
  JavaScript: `function firstUniqueNumber(nums) {
  const count = new Map();
  for (const n of nums) count.set(n, (count.get(n) || 0) + 1);
  for (const n of nums) if (count.get(n) === 1) return n;
  return -1;
}`,
  Python: `class Solution:
    def firstUniqueNumber(self, nums):
        from collections import Counter
        count = Counter(nums)
        for n in nums:
            if count[n] == 1: return n
        return -1`,
  Java: `class Solution {
    public int firstUniqueNumber(int[] nums) {
        Map<Integer, Integer> count = new LinkedHashMap<>();
        for (int n : nums) count.merge(n, 1, Integer::sum);
        for (Map.Entry<Integer, Integer> e : count.entrySet())
            if (e.getValue() == 1) return e.getKey();
        return -1;
    }
}`,
});

addSolutions("move-negatives-left", {
  JavaScript: `function moveNegativesLeft(nums) {
  return [...nums.filter(x => x < 0), ...nums.filter(x => x >= 0)];
}`,
  Python: `class Solution:
    def moveNegativesLeft(self, nums):
        return [x for x in nums if x < 0] + [x for x in nums if x >= 0]`,
  Java: `class Solution {
    public int[] moveNegativesLeft(int[] nums) {
        int[] res = new int[nums.length]; int i = 0;
        for (int n : nums) if (n < 0) res[i++] = n;
        for (int n : nums) if (n >= 0) res[i++] = n;
        return res;
    }
}`,
});

addSolutions("longest-even-streak", {
  JavaScript: `function longestEvenStreak(nums) {
  let best = 0, cur = 0;
  for (const n of nums) { cur = n % 2 === 0 ? cur + 1 : 0; best = Math.max(best, cur); }
  return best;
}`,
  Python: `class Solution:
    def longestEvenStreak(self, nums):
        best = cur = 0
        for n in nums:
            cur = cur + 1 if n % 2 == 0 else 0
            best = max(best, cur)
        return best`,
  Java: `class Solution {
    public int longestEvenStreak(int[] nums) {
        int best = 0, cur = 0;
        for (int n : nums) { cur = n % 2 == 0 ? cur + 1 : 0; best = Math.max(best, cur); }
        return best;
    }
}`,
});

addSolutions("maximum-neighbor-gap", {
  JavaScript: `function maximumNeighborGap(nums) {
  let best = 0;
  for (let i = 1; i < nums.length; i++)
    best = Math.max(best, Math.abs(nums[i] - nums[i-1]));
  return best;
}`,
  Python: `class Solution:
    def maximumNeighborGap(self, nums):
        return max((abs(nums[i]-nums[i-1]) for i in range(1,len(nums))), default=0)`,
  Java: `class Solution {
    public int maximumNeighborGap(int[] nums) {
        int best = 0;
        for (int i = 1; i < nums.length; i++) best = Math.max(best, Math.abs(nums[i]-nums[i-1]));
        return best;
    }
}`,
});

addSolutions("count-balanced-prefixes", {
  JavaScript: `function countBalancedPrefixes(nums) {
  let sum = 0, count = 0;
  for (const n of nums) { sum += n; if (sum === 0) count++; }
  return count;
}`,
  Python: `class Solution:
    def countBalancedPrefixes(self, nums):
        s = c = 0
        for n in nums:
            s += n
            if s == 0: c += 1
        return c`,
  Java: `class Solution {
    public int countBalancedPrefixes(int[] nums) {
        int sum = 0, count = 0;
        for (int n : nums) { sum += n; if (sum == 0) count++; }
        return count;
    }
}`,
});

addSolutions("rotate-right-once", {
  JavaScript: `function rotateRightOnce(nums) {
  if (!nums.length) return [];
  return [nums[nums.length - 1], ...nums.slice(0, -1)];
}`,
  Python: `class Solution:
    def rotateRightOnce(self, nums):
        return [nums[-1]] + nums[:-1] if nums else []`,
  Java: `class Solution {
    public int[] rotateRightOnce(int[] nums) {
        if (nums.length == 0) return nums;
        int[] res = new int[nums.length];
        res[0] = nums[nums.length-1];
        System.arraycopy(nums, 0, res, 1, nums.length-1);
        return res;
    }
}`,
});

addSolutions("missing-zero-to-n", {
  JavaScript: `function missingZeroToN(nums) {
  const n = nums.length;
  return n * (n + 1) / 2 - nums.reduce((a, b) => a + b, 0);
}`,
  Python: `class Solution:
    def missingZeroToN(self, nums):
        n = len(nums)
        return n*(n+1)//2 - sum(nums)`,
  Java: `class Solution {
    public int missingZeroToN(int[] nums) {
        int n = nums.length, sum = 0;
        for (int x : nums) sum += x;
        return n*(n+1)/2 - sum;
    }
}`,
});

addSolutions("reverse-clean-string", {
  JavaScript: `function reverseCleanString(s) {
  return s.replace(/ /g, '').split('').reverse().join('');
}`,
  Python: `class Solution:
    def reverseCleanString(self, s):
        return s.replace(' ', '')[::-1]`,
  Java: `class Solution {
    public String reverseCleanString(String s) {
        String clean = s.replace(" ", "");
        return new StringBuilder(clean).reverse().toString();
    }
}`,
});

addSolutions("count-vowels", {
  JavaScript: `function countVowels(s) {
  return (s.match(/[aeiouAEIOU]/g) || []).length;
}`,
  Python: `class Solution:
    def countVowels(self, s):
        return sum(1 for c in s if c.lower() in 'aeiou')`,
  Java: `class Solution {
    public int countVowels(String s) {
        int count = 0;
        for (char c : s.toLowerCase().toCharArray())
            if ("aeiou".indexOf(c) >= 0) count++;
        return count;
    }
}`,
});

addSolutions("is-soft-palindrome", {
  JavaScript: `function isSoftPalindrome(s) {
  const clean = s.toLowerCase().replace(/\\s/g, '');
  return clean === clean.split('').reverse().join('');
}`,
  Python: `class Solution:
    def isSoftPalindrome(self, s):
        clean = s.lower().replace(' ', '')
        return clean == clean[::-1]`,
  Java: `class Solution {
    public boolean isSoftPalindrome(String s) {
        String clean = s.toLowerCase().replace(" ", "");
        return clean.equals(new StringBuilder(clean).reverse().toString());
    }
}`,
});

addSolutions("first-repeated-character", {
  JavaScript: `function firstRepeatedCharacter(s) {
  const seen = new Set();
  for (const ch of s) { if (seen.has(ch)) return ch; seen.add(ch); }
  return '';
}`,
  Python: `class Solution:
    def firstRepeatedCharacter(self, s):
        seen = set()
        for ch in s:
            if ch in seen: return ch
            seen.add(ch)
        return ''`,
  Java: `class Solution {
    public String firstRepeatedCharacter(String s) {
        Set<Character> seen = new HashSet<>();
        for (char c : s.toCharArray()) {
            if (!seen.add(c)) return String.valueOf(c);
        }
        return "";
    }
}`,
});

addSolutions("compress-runs", {
  JavaScript: `function compressRuns(s) {
  if (!s) return '';
  let out = '', i = 0;
  while (i < s.length) {
    const ch = s[i]; let count = 0;
    while (i < s.length && s[i] === ch) { count++; i++; }
    out += ch + count;
  }
  return out;
}`,
  Python: `class Solution:
    def compressRuns(self, s):
        if not s: return ''
        out, i = '', 0
        while i < len(s):
            ch, count = s[i], 0
            while i < len(s) and s[i] == ch: count += 1; i += 1
            out += ch + str(count)
        return out`,
  Java: `class Solution {
    public String compressRuns(String s) {
        if (s.isEmpty()) return "";
        StringBuilder res = new StringBuilder(); int i = 0;
        while (i < s.length()) {
            char ch = s.charAt(i); int count = 0;
            while (i < s.length() && s.charAt(i) == ch) { count++; i++; }
            res.append(ch).append(count);
        }
        return res.toString();
    }
}`,
});

addSolutions("longest-same-letter-run", {
  JavaScript: `function longestSameLetterRun(s) {
  let best = 0, cur = 0, prev = '';
  for (const ch of s) { cur = ch === prev ? cur + 1 : 1; best = Math.max(best, cur); prev = ch; }
  return best;
}`,
  Python: `class Solution:
    def longestSameLetterRun(self, s):
        best = cur = 0; prev = ''
        for ch in s:
            cur = cur + 1 if ch == prev else 1
            best = max(best, cur); prev = ch
        return best`,
  Java: `class Solution {
    public int longestSameLetterRun(String s) {
        int best = 0, cur = 0; char prev = 0;
        for (char c : s.toCharArray()) { cur = c == prev ? cur+1 : 1; best = Math.max(best,cur); prev = c; }
        return best;
    }
}`,
});

addSolutions("count-words-simple", {
  JavaScript: `function countWordsSimple(s) {
  return s.trim().split(/\\s+/).filter(w => w.length > 0).length;
}`,
  Python: `class Solution:
    def countWordsSimple(self, s):
        return len(s.split())`,
  Java: `class Solution {
    public int countWordsSimple(String s) {
        return s.trim().isEmpty() ? 0 : s.trim().split("\\\\s+").length;
    }
}`,
});

addSolutions("remove-adjacent-duplicates-once", {
  JavaScript: `function removeAdjacentDuplicatesOnce(s) {
  const stack = [];
  for (const ch of s) {
    if (stack.length && stack[stack.length-1] === ch) stack.pop();
    else stack.push(ch);
  }
  return stack.join('');
}`,
  Python: `class Solution:
    def removeAdjacentDuplicatesOnce(self, s):
        stack = []
        for ch in s:
            if stack and stack[-1] == ch: stack.pop()
            else: stack.append(ch)
        return ''.join(stack)`,
  Java: `class Solution {
    public String removeAdjacentDuplicatesOnce(String s) {
        StringBuilder stack = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (stack.length() > 0 && stack.charAt(stack.length()-1) == c) stack.deleteCharAt(stack.length()-1);
            else stack.append(c);
        }
        return stack.toString();
    }
}`,
});

addSolutions("digital-sum", {
  JavaScript: `function digitalSum(n) {
  return String(Math.abs(n)).split('').reduce((s, d) => s + +d, 0);
}`,
  Python: `class Solution:
    def digitalSum(self, n):
        return sum(int(d) for d in str(abs(n)))`,
  Java: `class Solution {
    public int digitalSum(int n) {
        int s = 0; n = Math.abs(n);
        while (n > 0) { s += n % 10; n /= 10; }
        return s;
    }
}`,
});

addSolutions("is-power-of-two-simple", {
  JavaScript: `function isPowerOfTwoSimple(n) {
  return n > 0 && (n & (n - 1)) === 0;
}`,
  Python: `class Solution:
    def isPowerOfTwoSimple(self, n):
        return n > 0 and (n & (n-1)) == 0`,
  Java: `class Solution {
    public boolean isPowerOfTwoSimple(int n) { return n > 0 && (n & (n-1)) == 0; }
}`,
});

addSolutions("gcd-of-two", {
  JavaScript: `function gcdOfTwo(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { const t = b; b = a % b; a = t; }
  return a;
}`,
  Python: `class Solution:
    def gcdOfTwo(self, a, b):
        from math import gcd
        return gcd(abs(a), abs(b))`,
  Java: `class Solution {
    public int gcdOfTwo(int a, int b) {
        a = Math.abs(a); b = Math.abs(b);
        while (b != 0) { int t = b; b = a % b; a = t; }
        return a;
    }
}`,
});

addSolutions("nearest-even", {
  JavaScript: `function nearestEven(n) { return n % 2 === 0 ? n : n + 1; }`,
  Python: `class Solution:
    def nearestEven(self, n):
        return n if n % 2 == 0 else n + 1`,
  Java: `class Solution {
    public int nearestEven(int n) { return n % 2 == 0 ? n : n + 1; }
}`,
});

addSolutions("matrix-diagonal-sum", {
  JavaScript: `function matrixDiagonalSum(matrix) {
  const n = matrix.length; let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += matrix[i][i];
    if (i !== n-1-i) sum += matrix[i][n-1-i];
  }
  return sum;
}`,
  Python: `class Solution:
    def matrixDiagonalSum(self, matrix):
        n = len(matrix)
        return sum(matrix[i][i] + (matrix[i][n-1-i] if i != n-1-i else 0) for i in range(n))`,
  Java: `class Solution {
    public int matrixDiagonalSum(int[][] matrix) {
        int n = matrix.length, sum = 0;
        for (int i = 0; i < n; i++) {
            sum += matrix[i][i];
            if (i != n-1-i) sum += matrix[i][n-1-i];
        }
        return sum;
    }
}`,
});

addSolutions("count-island-cells", {
  JavaScript: `function countIslandCells(grid) {
  return grid.flat().filter(x => x === 1).length;
}`,
  Python: `class Solution:
    def countIslandCells(self, grid):
        return sum(cell for row in grid for cell in row)`,
  Java: `class Solution {
    public int countIslandCells(int[][] grid) {
        int count = 0;
        for (int[] row : grid) for (int c : row) if (c == 1) count++;
        return count;
    }
}`,
});

addSolutions("transpose-square", {
  JavaScript: `function transposeSquare(matrix) {
  const n = matrix.length;
  return Array.from({length:n}, (_, i) => Array.from({length:n}, (_, j) => matrix[j][i]));
}`,
  Python: `class Solution:
    def transposeSquare(self, matrix):
        return [list(row) for row in zip(*matrix)]`,
  Java: `class Solution {
    public int[][] transposeSquare(int[][] matrix) {
        int n = matrix.length; int[][] ans = new int[n][n];
        for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) ans[j][i] = matrix[i][j];
        return ans;
    }
}`,
});

addSolutions("sum-positive-values", {
  JavaScript: `function sumPositiveValues(nums) {
  return nums.filter(x => x > 0).reduce((a, b) => a + b, 0);
}`,
  Python: `class Solution:
    def sumPositiveValues(self, nums):
        return sum(x for x in nums if x > 0)`,
  Java: `class Solution {
    public int sumPositiveValues(int[] nums) {
        int s = 0; for (int n : nums) if (n > 0) s += n; return s;
    }
}`,
});

addSolutions("count-local-peaks", {
  JavaScript: `function countLocalPeaks(nums) {
  let count = 0;
  for (let i = 1; i < nums.length-1; i++)
    if (nums[i] > nums[i-1] && nums[i] > nums[i+1]) count++;
  return count;
}`,
  Python: `class Solution:
    def countLocalPeaks(self, nums):
        return sum(1 for i in range(1,len(nums)-1) if nums[i]>nums[i-1] and nums[i]>nums[i+1])`,
  Java: `class Solution {
    public int countLocalPeaks(int[] nums) {
        int count = 0;
        for (int i = 1; i < nums.length-1; i++)
            if (nums[i] > nums[i-1] && nums[i] > nums[i+1]) count++;
        return count;
    }
}`,
});

addSolutions("replace-with-greatest-right", {
  JavaScript: `function replaceWithGreatestRight(nums) {
  let max = -1;
  for (let i = nums.length-1; i >= 0; i--) { const t = nums[i]; nums[i] = max; max = Math.max(max, t); }
  return nums;
}`,
  Python: `class Solution:
    def replaceWithGreatestRight(self, nums):
        max_right = -1
        for i in range(len(nums)-1, -1, -1):
            nums[i], max_right = max_right, max(max_right, nums[i])
        return nums`,
  Java: `class Solution {
    public int[] replaceWithGreatestRight(int[] nums) {
        int max = -1;
        for (int i = nums.length-1; i >= 0; i--) { int t = nums[i]; nums[i] = max; max = Math.max(max, t); }
        return nums;
    }
}`,
});

addSolutions("second-largest-distinct", {
  JavaScript: `function secondLargestDistinct(nums) {
  let first = -Infinity, second = -Infinity;
  for (const v of nums) {
    if (v > first) { second = first; first = v; }
    else if (v > second && v !== first) second = v;
  }
  return second === -Infinity ? -1 : second;
}`,
  Python: `class Solution:
    def secondLargestDistinct(self, nums):
        first = second = float('-inf')
        for v in nums:
            if v > first: second, first = first, v
            elif v > second and v != first: second = v
        return second if second != float('-inf') else -1`,
  Java: `class Solution {
    public int secondLargestDistinct(int[] nums) {
        int first = Integer.MIN_VALUE, second = Integer.MIN_VALUE;
        for (int v : nums) {
            if (v > first) { second = first; first = v; }
            else if (v > second && v != first) second = v;
        }
        return second == Integer.MIN_VALUE ? -1 : second;
    }
}`,
});

addSolutions("remove-target-values", {
  JavaScript: `function removeTargetValues(nums, target) {
  return nums.filter(v => v !== target);
}`,
  Python: `class Solution:
    def removeTargetValues(self, nums, target):
        return [v for v in nums if v != target]`,
  Java: `class Solution {
    public int[] removeTargetValues(int[] nums, int target) {
        return java.util.Arrays.stream(nums).filter(v -> v != target).toArray();
    }
}`,
});

addSolutions("merge-sorted-values", {
  JavaScript: `function mergeSortedValues(a, b) {
  const res = []; let i = 0, j = 0;
  while (i < a.length && j < b.length) a[i] <= b[j] ? res.push(a[i++]) : res.push(b[j++]);
  while (i < a.length) res.push(a[i++]);
  while (j < b.length) res.push(b[j++]);
  return res;
}`,
  Python: `class Solution:
    def mergeSortedValues(self, a, b):
        res, i, j = [], 0, 0
        while i < len(a) and j < len(b):
            if a[i] <= b[j]: res.append(a[i]); i += 1
            else: res.append(b[j]); j += 1
        return res + a[i:] + b[j:]`,
  Java: `class Solution {
    public int[] mergeSortedValues(int[] a, int[] b) {
        int[] res = new int[a.length+b.length]; int i=0,j=0,k=0;
        while(i<a.length&&j<b.length) res[k++]=a[i]<=b[j]?a[i++]:b[j++];
        while(i<a.length) res[k++]=a[i++]; while(j<b.length) res[k++]=b[j++];
        return res;
    }
}`,
});

addSolutions("sorted-squares-values", {
  JavaScript: `function sortedSquaresValues(nums) {
  return nums.map(x => x*x).sort((a,b) => a-b);
}`,
  Python: `class Solution:
    def sortedSquaresValues(self, nums):
        return sorted(x*x for x in nums)`,
  Java: `class Solution {
    public int[] sortedSquaresValues(int[] nums) {
        int[] res = new int[nums.length];
        for (int i=0;i<nums.length;i++) res[i]=nums[i]*nums[i];
        java.util.Arrays.sort(res); return res;
    }
}`,
});

addSolutions("max-consecutive-ones-simple", {
  JavaScript: `function maxConsecutiveOnesSimple(nums) {
  let best = 0, cur = 0;
  for (const n of nums) { cur = n === 1 ? cur+1 : 0; best = Math.max(best, cur); }
  return best;
}`,
  Python: `class Solution:
    def maxConsecutiveOnesSimple(self, nums):
        best = cur = 0
        for n in nums: cur = cur+1 if n==1 else 0; best = max(best,cur)
        return best`,
  Java: `class Solution {
    public int maxConsecutiveOnesSimple(int[] nums) {
        int best=0,cur=0; for(int n:nums){cur=n==1?cur+1:0;best=Math.max(best,cur);} return best;
    }
}`,
});

addSolutions("find-pivot-index-simple", {
  JavaScript: `function findPivotIndexSimple(nums) {
  const total = nums.reduce((a,b) => a+b, 0); let left = 0;
  for (let i = 0; i < nums.length; i++) {
    if (left === total - left - nums[i]) return i;
    left += nums[i];
  }
  return -1;
}`,
  Python: `class Solution:
    def findPivotIndexSimple(self, nums):
        total, left = sum(nums), 0
        for i, n in enumerate(nums):
            if left == total - left - n: return i
            left += n
        return -1`,
  Java: `class Solution {
    public int findPivotIndexSimple(int[] nums) {
        int total=0; for(int n:nums) total+=n;
        int left=0;
        for(int i=0;i<nums.length;i++){if(left==total-left-nums[i])return i;left+=nums[i];}
        return -1;
    }
}`,
});

addSolutions("range-sum-basic", {
  JavaScript: `function rangeSumBasic(nums, left, right) {
  return nums.slice(left, right+1).reduce((a,b) => a+b, 0);
}`,
  Python: `class Solution:
    def rangeSumBasic(self, nums, left, right):
        return sum(nums[left:right+1])`,
  Java: `class Solution {
    public int rangeSumBasic(int[] nums, int left, int right) {
        int s=0; for(int i=left;i<=right;i++) s+=nums[i]; return s;
    }
}`,
});

addSolutions("unique-intersection-values", {
  JavaScript: `function uniqueIntersectionValues(a, b) {
  const setB = new Set(b);
  return [...new Set(a.filter(x => setB.has(x)))].sort((x,y) => x-y);
}`,
  Python: `class Solution:
    def uniqueIntersectionValues(self, a, b):
        return sorted(set(a) & set(b))`,
  Java: `class Solution {
    public int[] uniqueIntersectionValues(int[] a, int[] b) {
        Set<Integer> setB = new HashSet<>(); for(int n:b) setB.add(n);
        Set<Integer> res = new TreeSet<>(); for(int n:a) if(setB.contains(n)) res.add(n);
        return res.stream().mapToInt(Integer::intValue).toArray();
    }
}`,
});

addSolutions("majority-vote-simple", {
  JavaScript: `function majorityVoteSimple(nums) {
  let count = 0, m = 0;
  for (const n of nums) { if (count === 0) m = n; count += n === m ? 1 : -1; }
  return m;
}`,
  Python: `class Solution:
    def majorityVoteSimple(self, nums):
        count = m = 0
        for n in nums:
            if count == 0: m = n
            count += 1 if n == m else -1
        return m`,
  Java: `class Solution {
    public int majorityVoteSimple(int[] nums) {
        int count=0,m=0;
        for(int n:nums){if(count==0)m=n;count+=n==m?1:-1;}
        return m;
    }
}`,
});

addSolutions("max-sum-window", {
  JavaScript: `function maxSumWindow(nums, k) {
  let sum = nums.slice(0,k).reduce((a,b)=>a+b,0), best = sum;
  for (let i = k; i < nums.length; i++) { sum += nums[i] - nums[i-k]; best = Math.max(best, sum); }
  return best;
}`,
  Python: `class Solution:
    def maxSumWindow(self, nums, k):
        s = sum(nums[:k]); best = s
        for i in range(k, len(nums)): s += nums[i]-nums[i-k]; best = max(best,s)
        return best`,
  Java: `class Solution {
    public int maxSumWindow(int[] nums, int k) {
        int s=0; for(int i=0;i<k;i++) s+=nums[i]; int best=s;
        for(int i=k;i<nums.length;i++){s+=nums[i]-nums[i-k];best=Math.max(best,s);}
        return best;
    }
}`,
});

addSolutions("min-length-subarray-sum", {
  JavaScript: `function minLengthSubarraySum(nums, target) {
  let left=0, sum=0, best=Infinity;
  for (let right=0; right<nums.length; right++) {
    sum += nums[right];
    while (sum >= target) { best=Math.min(best,right-left+1); sum-=nums[left++]; }
  }
  return best===Infinity ? 0 : best;
}`,
  Python: `class Solution:
    def minLengthSubarraySum(self, nums, target):
        left=s=0; best=float('inf')
        for right,n in enumerate(nums):
            s+=n
            while s>=target: best=min(best,right-left+1); s-=nums[left]; left+=1
        return best if best!=float('inf') else 0`,
  Java: `class Solution {
    public int minLengthSubarraySum(int[] nums, int target) {
        int left=0,sum=0,best=Integer.MAX_VALUE;
        for(int right=0;right<nums.length;right++){
            sum+=nums[right];
            while(sum>=target){best=Math.min(best,right-left+1);sum-=nums[left++];}
        }
        return best==Integer.MAX_VALUE?0:best;
    }
}`,
});

addSolutions("subarray-sum-equals-target", {
  JavaScript: `function subarraySumEqualsTarget(nums, k) {
  const map = new Map([[0,1]]); let sum=0, count=0;
  for (const n of nums) { sum+=n; count+=(map.get(sum-k)||0); map.set(sum,(map.get(sum)||0)+1); }
  return count;
}`,
  Python: `class Solution:
    def subarraySumEqualsTarget(self, nums, k):
        from collections import defaultdict
        d = defaultdict(int); d[0]=1; s=c=0
        for n in nums: s+=n; c+=d[s-k]; d[s]+=1
        return c`,
  Java: `class Solution {
    public int subarraySumEqualsTarget(int[] nums, int k) {
        Map<Integer,Integer> map=new HashMap<>(); map.put(0,1); int s=0,c=0;
        for(int n:nums){s+=n;c+=map.getOrDefault(s-k,0);map.merge(s,1,Integer::sum);}
        return c;
    }
}`,
});

addSolutions("longest-balanced-zero-one", {
  JavaScript: `function longestBalancedZeroOne(nums) {
  const map = new Map([[0,-1]]); let sum=0, best=0;
  for (let i=0;i<nums.length;i++) {
    sum += nums[i]===0 ? -1 : 1;
    if (map.has(sum)) best=Math.max(best,i-map.get(sum));
    else map.set(sum,i);
  }
  return best;
}`,
  Python: `class Solution:
    def longestBalancedZeroOne(self, nums):
        d={0:-1}; s=best=0
        for i,n in enumerate(nums):
            s+=(-1 if n==0 else 1)
            if s in d: best=max(best,i-d[s])
            else: d[s]=i
        return best`,
  Java: `class Solution {
    public int longestBalancedZeroOne(int[] nums) {
        Map<Integer,Integer> map=new HashMap<>(); map.put(0,-1); int s=0,best=0;
        for(int i=0;i<nums.length;i++){
            s+=nums[i]==0?-1:1;
            if(map.containsKey(s)) best=Math.max(best,i-map.get(s));
            else map.put(s,i);
        }
        return best;
    }
}`,
});

addSolutions("three-number-zero", {
  JavaScript: `function threeNumberZero(nums) {
  nums.sort((a,b)=>a-b); const res=[];
  for(let i=0;i<nums.length-2;i++){
    if(i>0&&nums[i]===nums[i-1]) continue;
    let l=i+1,r=nums.length-1;
    while(l<r){
      const s=nums[i]+nums[l]+nums[r];
      if(s===0){res.push([nums[i],nums[l],nums[r]]);while(l<r&&nums[l]===nums[l+1])l++;while(l<r&&nums[r]===nums[r-1])r--;l++;r--;}
      else if(s<0)l++;else r--;
    }
  }
  return res;
}`,
  Python: `class Solution:
    def threeNumberZero(self, nums):
        nums.sort(); res=[]
        for i in range(len(nums)-2):
            if i>0 and nums[i]==nums[i-1]: continue
            l,r=i+1,len(nums)-1
            while l<r:
                s=nums[i]+nums[l]+nums[r]
                if s==0: res.append([nums[i],nums[l],nums[r]]); l+=1; r-=1
                elif s<0: l+=1
                else: r-=1
        return res`,
  Java: `class Solution {
    public int[][] threeNumberZero(int[] nums) {
        Arrays.sort(nums); List<int[]> res=new ArrayList<>();
        for(int i=0;i<nums.length-2;i++){
            if(i>0&&nums[i]==nums[i-1]) continue;
            int l=i+1,r=nums.length-1;
            while(l<r){int s=nums[i]+nums[l]+nums[r];
                if(s==0){res.add(new int[]{nums[i],nums[l],nums[r]});l++;r--;}
                else if(s<0)l++;else r--;}
        }
        return res.toArray(new int[0][0]);
    }
}`,
});

addSolutions("product-except-self-basic", {
  JavaScript: `function productExceptSelfBasic(nums) {
  const n=nums.length, res=new Array(n).fill(1);
  let left=1; for(let i=0;i<n;i++){res[i]=left;left*=nums[i];}
  let right=1; for(let i=n-1;i>=0;i--){res[i]*=right;right*=nums[i];}
  return res;
}`,
  Python: `class Solution:
    def productExceptSelfBasic(self, nums):
        n=len(nums); res=[1]*n
        left=1
        for i in range(n): res[i]=left; left*=nums[i]
        right=1
        for i in range(n-1,-1,-1): res[i]*=right; right*=nums[i]
        return res`,
  Java: `class Solution {
    public int[] productExceptSelfBasic(int[] nums) {
        int n=nums.length; int[] res=new int[n]; Arrays.fill(res,1);
        int left=1; for(int i=0;i<n;i++){res[i]=left;left*=nums[i];}
        int right=1; for(int i=n-1;i>=0;i--){res[i]*=right;right*=nums[i];}
        return res;
    }
}`,
});

addSolutions("merge-overlapping-ranges", {
  JavaScript: `function mergeOverlappingRanges(intervals) {
  intervals.sort((a,b)=>a[0]-b[0]); const merged=[];
  for(const iv of intervals){
    if(!merged.length||merged[merged.length-1][1]<iv[0]) merged.push([...iv]);
    else merged[merged.length-1][1]=Math.max(merged[merged.length-1][1],iv[1]);
  }
  return merged;
}`,
  Python: `class Solution:
    def mergeOverlappingRanges(self, intervals):
        intervals.sort(); merged=[]
        for iv in intervals:
            if not merged or merged[-1][1]<iv[0]: merged.append(list(iv))
            else: merged[-1][1]=max(merged[-1][1],iv[1])
        return merged`,
  Java: `class Solution {
    public int[][] mergeOverlappingRanges(int[][] intervals) {
        Arrays.sort(intervals,(a,b)->a[0]-b[0]); List<int[]> res=new ArrayList<>();
        for(int[] iv:intervals){
            if(res.isEmpty()||res.get(res.size()-1)[1]<iv[0]) res.add(new int[]{iv[0],iv[1]});
            else res.get(res.size()-1)[1]=Math.max(res.get(res.size()-1)[1],iv[1]);
        }
        return res.toArray(new int[0][0]);
    }
}`,
});

addSolutions("container-water-basic", {
  JavaScript: `function containerWaterBasic(height) {
  let l=0, r=height.length-1, best=0;
  while(l<r){best=Math.max(best,Math.min(height[l],height[r])*(r-l));height[l]<height[r]?l++:r--;}
  return best;
}`,
  Python: `class Solution:
    def containerWaterBasic(self, height):
        l,r,best=0,len(height)-1,0
        while l<r:
            best=max(best,min(height[l],height[r])*(r-l))
            if height[l]<height[r]: l+=1
            else: r-=1
        return best`,
  Java: `class Solution {
    public int containerWaterBasic(int[] height) {
        int l=0,r=height.length-1,best=0;
        while(l<r){best=Math.max(best,Math.min(height[l],height[r])*(r-l));if(height[l]<height[r])l++;else r--;}
        return best;
    }
}`,
});

addSolutions("next-greater-right", {
  JavaScript: `function nextGreaterRight(nums) {
  const res=new Array(nums.length).fill(-1); const stack=[];
  for(let i=0;i<nums.length;i++){while(stack.length&&nums[i]>nums[stack[stack.length-1]])res[stack.pop()]=nums[i];stack.push(i);}
  return res;
}`,
  Python: `class Solution:
    def nextGreaterRight(self, nums):
        res=[-1]*len(nums); stack=[]
        for i,n in enumerate(nums):
            while stack and n>nums[stack[-1]]: res[stack.pop()]=n
            stack.append(i)
        return res`,
  Java: `class Solution {
    public int[] nextGreaterRight(int[] nums) {
        int[] res=new int[nums.length]; Arrays.fill(res,-1); Deque<Integer> stack=new ArrayDeque<>();
        for(int i=0;i<nums.length;i++){while(!stack.isEmpty()&&nums[i]>nums[stack.peek()])res[stack.pop()]=nums[i];stack.push(i);}
        return res;
    }
}`,
});

addSolutions("daily-temperature-wait", {
  JavaScript: `function dailyTemperatureWait(temps) {
  const res=new Array(temps.length).fill(0); const stack=[];
  for(let i=0;i<temps.length;i++){while(stack.length&&temps[i]>temps[stack[stack.length-1]]){const j=stack.pop();res[j]=i-j;}stack.push(i);}
  return res;
}`,
  Python: `class Solution:
    def dailyTemperatureWait(self, temps):
        res=[0]*len(temps); stack=[]
        for i,t in enumerate(temps):
            while stack and t>temps[stack[-1]]: j=stack.pop(); res[j]=i-j
            stack.append(i)
        return res`,
  Java: `class Solution {
    public int[] dailyTemperatureWait(int[] temps) {
        int[] res=new int[temps.length]; Deque<Integer> stack=new ArrayDeque<>();
        for(int i=0;i<temps.length;i++){while(!stack.isEmpty()&&temps[i]>temps[stack.peek()]){int j=stack.pop();res[j]=i-j;}stack.push(i);}
        return res;
    }
}`,
});

addSolutions("best-time-buy-sell", {
  JavaScript: `function maxProfit(prices) {
  let min=Infinity, best=0;
  for(const p of prices){min=Math.min(min,p);best=Math.max(best,p-min);}
  return best;
}`,
  Python: `class Solution:
    def maxProfit(self, prices):
        min_p,best=float('inf'),0
        for p in prices: min_p=min(min_p,p); best=max(best,p-min_p)
        return best`,
  Java: `class Solution {
    public int maxProfit(int[] prices) {
        int min=Integer.MAX_VALUE,best=0;
        for(int p:prices){min=Math.min(min,p);best=Math.max(best,p-min);}
        return best;
    }
}`,
});

addSolutions("contains-duplicate", {
  JavaScript: `function containsDuplicate(nums) {
  return new Set(nums).size !== nums.length;
}`,
  Python: `class Solution:
    def containsDuplicate(self, nums):
        return len(set(nums)) != len(nums)`,
  Java: `class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> s=new HashSet<>(); for(int n:nums) if(!s.add(n)) return true; return false;
    }
}`,
});

addSolutions("majority-element", {
  JavaScript: `function majorityElement(nums) {
  let count=0, m=0;
  for(const n of nums){if(count===0)m=n;count+=n===m?1:-1;}
  return m;
}`,
  Python: `class Solution:
    def majorityElement(self, nums):
        count=m=0
        for n in nums:
            if count==0: m=n
            count+=1 if n==m else -1
        return m`,
  Java: `class Solution {
    public int majorityElement(int[] nums) {
        int count=0,m=0;
        for(int n:nums){if(count==0)m=n;count+=n==m?1:-1;}
        return m;
    }
}`,
});

addSolutions("rotate-array", {
  JavaScript: `function rotate(nums, k) {
  const n=nums.length; k=k%n;
  const rev=(l,r)=>{while(l<r){[nums[l],nums[r]]=[nums[r],nums[l]];l++;r--;}};
  rev(0,n-1);rev(0,k-1);rev(k,n-1);return nums;
}`,
  Python: `class Solution:
    def rotate(self, nums, k):
        n=len(nums); k%=n
        nums.reverse(); nums[:k]=nums[:k][::-1]; nums[k:]=nums[k:][::-1]
        return nums`,
  Java: `class Solution {
    public int[] rotate(int[] nums, int k) {
        int n=nums.length; k%=n;
        reverse(nums,0,n-1); reverse(nums,0,k-1); reverse(nums,k,n-1); return nums;
    }
    void reverse(int[] a,int l,int r){while(l<r){int t=a[l];a[l]=a[r];a[r]=t;l++;r--;}}
}`,
});

addSolutions("find-all-duplicates", {
  JavaScript: `function findDuplicates(nums) {
  const res=[];
  for(const n of nums){const i=Math.abs(n)-1;if(nums[i]<0)res.push(Math.abs(n));else nums[i]=-nums[i];}
  return res;
}`,
  Python: `class Solution:
    def findDuplicates(self, nums):
        res=[]
        for n in nums:
            i=abs(n)-1
            if nums[i]<0: res.append(abs(n))
            else: nums[i]=-nums[i]
        return res`,
  Java: `class Solution {
    public int[] findDuplicates(int[] nums) {
        List<Integer> res=new ArrayList<>();
        for(int n:nums){int i=Math.abs(n)-1;if(nums[i]<0)res.add(Math.abs(n));else nums[i]=-nums[i];}
        return res.stream().mapToInt(Integer::intValue).toArray();
    }
}`,
});

addSolutions("maximum-subarray", {
  JavaScript: `function maxSubArray(nums) {
  let best=nums[0], cur=nums[0];
  for(let i=1;i<nums.length;i++){cur=Math.max(nums[i],cur+nums[i]);best=Math.max(best,cur);}
  return best;
}`,
  Python: `class Solution:
    def maxSubArray(self, nums):
        best=cur=nums[0]
        for n in nums[1:]: cur=max(n,cur+n); best=max(best,cur)
        return best`,
  Java: `class Solution {
    public int maxSubArray(int[] nums) {
        int best=nums[0],cur=nums[0];
        for(int i=1;i<nums.length;i++){cur=Math.max(nums[i],cur+nums[i]);best=Math.max(best,cur);}
        return best;
    }
}`,
});

addSolutions("intersection-two-arrays", {
  JavaScript: `function intersection(nums1, nums2) {
  const s=new Set(nums1); return [...new Set(nums2.filter(x=>s.has(x)))];
}`,
  Python: `class Solution:
    def intersection(self, nums1, nums2):
        return list(set(nums1)&set(nums2))`,
  Java: `class Solution {
    public int[] intersection(int[] nums1, int[] nums2) {
        Set<Integer> s=new HashSet<>(); for(int n:nums1) s.add(n);
        Set<Integer> res=new HashSet<>(); for(int n:nums2) if(s.contains(n)) res.add(n);
        return res.stream().mapToInt(Integer::intValue).toArray();
    }
}`,
});

addSolutions("move-zeroes", {
  JavaScript: `function moveZeroes(nums) {
  let pos=0;
  const copy=nums.slice();
  for(let i=0;i<copy.length;i++) if(copy[i]!==0) nums[pos++]=copy[i];
  while(pos<nums.length) nums[pos++]=0;
  return nums;
}`,
  Python: `class Solution:
    def moveZeroes(self, nums):
        pos=0
        for n in nums:
            if n!=0: nums[pos]=n; pos+=1
        while pos<len(nums): nums[pos]=0; pos+=1
        return nums`,
  Java: `class Solution {
    public int[] moveZeroes(int[] nums) {
        int pos=0; for(int n:nums) if(n!=0) nums[pos++]=n;
        while(pos<nums.length) nums[pos++]=0; return nums;
    }
}`,
});

addSolutions("plus-one", {
  JavaScript: `function plusOne(digits) {
  for(let i=digits.length-1;i>=0;i--){if(digits[i]<9){digits[i]++;return digits;}digits[i]=0;}
  return [1,...digits];
}`,
  Python: `class Solution:
    def plusOne(self, digits):
        for i in range(len(digits)-1,-1,-1):
            if digits[i]<9: digits[i]+=1; return digits
            digits[i]=0
        return [1]+digits`,
  Java: `class Solution {
    public int[] plusOne(int[] digits) {
        for(int i=digits.length-1;i>=0;i--){if(digits[i]<9){digits[i]++;return digits;}digits[i]=0;}
        int[] res=new int[digits.length+1]; res[0]=1; return res;
    }
}`,
});

addSolutions("missing-number", {
  JavaScript: `function missingNumber(nums) {
  const n=nums.length; return n*(n+1)/2 - nums.reduce((a,b)=>a+b,0);
}`,
  Python: `class Solution:
    def missingNumber(self, nums):
        n=len(nums); return n*(n+1)//2-sum(nums)`,
  Java: `class Solution {
    public int missingNumber(int[] nums) {
        int n=nums.length,s=0; for(int x:nums) s+=x; return n*(n+1)/2-s;
    }
}`,
});

addSolutions("find-minimum-rotated", {
  JavaScript: `function findMin(nums) {
  let l=0,r=nums.length-1;
  while(l<r){const m=l+r>>1;if(nums[m]>nums[r])l=m+1;else r=m;}
  return nums[l];
}`,
  Python: `class Solution:
    def findMin(self, nums):
        l,r=0,len(nums)-1
        while l<r:
            m=(l+r)//2
            if nums[m]>nums[r]: l=m+1
            else: r=m
        return nums[l]`,
  Java: `class Solution {
    public int findMin(int[] nums) {
        int l=0,r=nums.length-1;
        while(l<r){int m=l+r>>1;if(nums[m]>nums[r])l=m+1;else r=m;}
        return nums[l];
    }
}`,
});

addSolutions("single-number", {
  JavaScript: `function singleNumber(nums) { return nums.reduce((a,b)=>a^b,0); }`,
  Python: `class Solution:
    def singleNumber(self, nums):
        from functools import reduce; from operator import xor
        return reduce(xor, nums)`,
  Java: `class Solution {
    public int singleNumber(int[] nums) { int r=0; for(int n:nums) r^=n; return r; }
}`,
});

addSolutions("search-rotated-array", {
  JavaScript: `function search(nums, target) {
  let l=0,r=nums.length-1;
  while(l<=r){const m=l+r>>1;if(nums[m]===target)return m;
    if(nums[l]<=nums[m]){if(nums[l]<=target&&target<nums[m])r=m-1;else l=m+1;}
    else{if(nums[m]<target&&target<=nums[r])l=m+1;else r=m-1;}}
  return -1;
}`,
  Python: `class Solution:
    def search(self, nums, target):
        l,r=0,len(nums)-1
        while l<=r:
            m=(l+r)//2
            if nums[m]==target: return m
            if nums[l]<=nums[m]:
                if nums[l]<=target<nums[m]: r=m-1
                else: l=m+1
            else:
                if nums[m]<target<=nums[r]: l=m+1
                else: r=m-1
        return -1`,
  Java: `class Solution {
    public int search(int[] nums, int target) {
        int l=0,r=nums.length-1;
        while(l<=r){int m=l+r>>1;if(nums[m]==target)return m;
            if(nums[l]<=nums[m]){if(nums[l]<=target&&target<nums[m])r=m-1;else l=m+1;}
            else{if(nums[m]<target&&target<=nums[r])l=m+1;else r=m-1;}}
        return -1;
    }
}`,
});

addSolutions("k-closest-numbers", {
  JavaScript: `function kClosest(points, k) {
  return points.sort((a,b)=>a[0]*a[0]+a[1]*a[1]-(b[0]*b[0]+b[1]*b[1])).slice(0,k);
}`,
  Python: `class Solution:
    def kClosest(self, points, k):
        return sorted(points, key=lambda p: p[0]**2+p[1]**2)[:k]`,
  Java: `class Solution {
    public int[][] kClosest(int[][] points, int k) {
        Arrays.sort(points,(a,b)->(a[0]*a[0]+a[1]*a[1])-(b[0]*b[0]+b[1]*b[1]));
        return Arrays.copyOf(points,k);
    }
}`,
});

addSolutions("two-sum-ii", {
  JavaScript: `function twoSum(numbers, target) {
  let l=0,r=numbers.length-1;
  while(l<r){const s=numbers[l]+numbers[r];if(s===target)return[l+1,r+1];s<target?l++:r--;}
  return [];
}`,
  Python: `class Solution:
    def twoSum(self, numbers, target):
        l,r=0,len(numbers)-1
        while l<r:
            s=numbers[l]+numbers[r]
            if s==target: return [l+1,r+1]
            elif s<target: l+=1
            else: r-=1`,
  Java: `class Solution {
    public int[] twoSum(int[] numbers, int target) {
        int l=0,r=numbers.length-1;
        while(l<r){int s=numbers[l]+numbers[r];if(s==target)return new int[]{l+1,r+1};if(s<target)l++;else r--;}
        return new int[]{};
    }
}`,
});

addSolutions("sort-colors", {
  JavaScript: `function sortColors(nums) {
  let lo=0,mid=0,hi=nums.length-1;
  while(mid<=hi){
    if(nums[mid]===0){[nums[lo],nums[mid]]=[nums[mid],nums[lo]];lo++;mid++;}
    else if(nums[mid]===2){[nums[mid],nums[hi]]=[nums[hi],nums[mid]];hi--;}
    else mid++;
  }
  return nums;
}`,
  Python: `class Solution:
    def sortColors(self, nums):
        lo=mid=0; hi=len(nums)-1
        while mid<=hi:
            if nums[mid]==0: nums[lo],nums[mid]=nums[mid],nums[lo]; lo+=1; mid+=1
            elif nums[mid]==2: nums[mid],nums[hi]=nums[hi],nums[mid]; hi-=1
            else: mid+=1
        return nums`,
  Java: `class Solution {
    public int[] sortColors(int[] nums) {
        int lo=0,mid=0,hi=nums.length-1;
        while(mid<=hi){
            if(nums[mid]==0){int t=nums[lo];nums[lo]=nums[mid];nums[mid]=t;lo++;mid++;}
            else if(nums[mid]==2){int t=nums[mid];nums[mid]=nums[hi];nums[hi]=t;hi--;}
            else mid++;
        }
        return nums;
    }
}`,
});

addSolutions("4sum", {
  JavaScript: `function fourSum(nums, target) {
  nums.sort((a,b)=>a-b); const res=[];
  for(let i=0;i<nums.length-3;i++){
    if(i>0&&nums[i]===nums[i-1]) continue;
    for(let j=i+1;j<nums.length-2;j++){
      if(j>i+1&&nums[j]===nums[j-1]) continue;
      let l=j+1,r=nums.length-1;
      while(l<r){const s=nums[i]+nums[j]+nums[l]+nums[r];
        if(s===target){res.push([nums[i],nums[j],nums[l],nums[r]]);while(l<r&&nums[l]===nums[l+1])l++;while(l<r&&nums[r]===nums[r-1])r--;l++;r--;}
        else if(s<target)l++;else r--;
      }
    }
  }
  return res;
}`,
  Python: `class Solution:
    def fourSum(self, nums, target):
        nums.sort(); res=[]
        for i in range(len(nums)-3):
            if i>0 and nums[i]==nums[i-1]: continue
            for j in range(i+1,len(nums)-2):
                if j>i+1 and nums[j]==nums[j-1]: continue
                l,r=j+1,len(nums)-1
                while l<r:
                    s=nums[i]+nums[j]+nums[l]+nums[r]
                    if s==target: res.append([nums[i],nums[j],nums[l],nums[r]]); l+=1; r-=1
                    elif s<target: l+=1
                    else: r-=1
        return res`,
  Java: `class Solution {
    public int[][] fourSum(int[] nums, int target) {
        Arrays.sort(nums); List<int[]> res=new ArrayList<>();
        for(int i=0;i<nums.length-3;i++){
            if(i>0&&nums[i]==nums[i-1]) continue;
            for(int j=i+1;j<nums.length-2;j++){
                if(j>i+1&&nums[j]==nums[j-1]) continue;
                int l=j+1,r=nums.length-1;
                while(l<r){long s=(long)nums[i]+nums[j]+nums[l]+nums[r];
                    if(s==target){res.add(new int[]{nums[i],nums[j],nums[l],nums[r]});l++;r--;}
                    else if(s<target)l++;else r--;}
            }
        }
        return res.toArray(new int[0][0]);
    }
}`,
});

addSolutions("jump-game", {
  JavaScript: `function canJump(nums) {
  let reach=0;
  for(let i=0;i<nums.length;i++){if(i>reach)return false;reach=Math.max(reach,i+nums[i]);}
  return true;
}`,
  Python: `class Solution:
    def canJump(self, nums):
        reach=0
        for i,n in enumerate(nums):
            if i>reach: return False
            reach=max(reach,i+n)
        return True`,
  Java: `class Solution {
    public boolean canJump(int[] nums) {
        int reach=0;
        for(int i=0;i<nums.length;i++){if(i>reach)return false;reach=Math.max(reach,i+nums[i]);}
        return true;
    }
}`,
});

addSolutions("subarray-product-less-k", {
  JavaScript: `function numSubarrayProductLessThanK(nums, k) {
  if(k<=1)return 0; let prod=1,l=0,count=0;
  for(let r=0;r<nums.length;r++){prod*=nums[r];while(prod>=k)prod/=nums[l++];count+=r-l+1;}
  return count;
}`,
  Python: `class Solution:
    def numSubarrayProductLessThanK(self, nums, k):
        if k<=1: return 0
        prod=l=count=0; prod=1
        for r,n in enumerate(nums):
            prod*=n
            while prod>=k: prod//=nums[l]; l+=1
            count+=r-l+1
        return count`,
  Java: `class Solution {
    public int numSubarrayProductLessThanK(int[] nums, int k) {
        if(k<=1)return 0; int prod=1,l=0,count=0;
        for(int r=0;r<nums.length;r++){prod*=nums[r];while(prod>=k)prod/=nums[l++];count+=r-l+1;}
        return count;
    }
}`,
});

addSolutions("range-sum-query-immutable", {
  JavaScript: `function rangeSumQuery(nums, queries) {
  const prefix=[0]; for(const n of nums) prefix.push(prefix[prefix.length-1]+n);
  return queries.map(([l,r])=>prefix[r+1]-prefix[l]);
}`,
  Python: `class Solution:
    def rangeSumQuery(self, nums, queries):
        prefix=[0]
        for n in nums: prefix.append(prefix[-1]+n)
        return [prefix[r+1]-prefix[l] for l,r in queries]`,
  Java: `class Solution {
    public int[] rangeSumQuery(int[] nums, int[][] queries) {
        int[] prefix=new int[nums.length+1];
        for(int i=0;i<nums.length;i++) prefix[i+1]=prefix[i]+nums[i];
        int[] res=new int[queries.length];
        for(int i=0;i<queries.length;i++) res[i]=prefix[queries[i][1]+1]-prefix[queries[i][0]];
        return res;
    }
}`,
});

addSolutions("spiral-matrix", {
  JavaScript: `function spiralOrder(matrix) {
  const res=[]; if(!matrix.length) return res;
  let top=0,bottom=matrix.length-1,left=0,right=matrix[0].length-1;
  while(top<=bottom&&left<=right){
    for(let i=left;i<=right;i++) res.push(matrix[top][i]); top++;
    for(let i=top;i<=bottom;i++) res.push(matrix[i][right]); right--;
    if(top<=bottom){for(let i=right;i>=left;i--) res.push(matrix[bottom][i]); bottom--;}
    if(left<=right){for(let i=bottom;i>=top;i--) res.push(matrix[i][left]); left++;}
  }
  return res;
}`,
  Python: `class Solution:
    def spiralOrder(self, matrix):
        res=[]; top,bottom,left,right=0,len(matrix)-1,0,len(matrix[0])-1
        while top<=bottom and left<=right:
            for i in range(left,right+1): res.append(matrix[top][i]); top+=1
            for i in range(top,bottom+1): res.append(matrix[i][right]); right-=1
            if top<=bottom:
                for i in range(right,left-1,-1): res.append(matrix[bottom][i]); bottom-=1
            if left<=right:
                for i in range(bottom,top-1,-1): res.append(matrix[i][left]); left+=1
        return res`,
  Java: `class Solution {
    public int[] spiralOrder(int[][] matrix) {
        int[] res=new int[matrix.length*matrix[0].length]; int idx=0;
        int top=0,bottom=matrix.length-1,left=0,right=matrix[0].length-1;
        while(top<=bottom&&left<=right){
            for(int i=left;i<=right;i++) res[idx++]=matrix[top][i]; top++;
            for(int i=top;i<=bottom;i++) res[idx++]=matrix[i][right]; right--;
            if(top<=bottom){for(int i=right;i>=left;i--) res[idx++]=matrix[bottom][i]; bottom--;}
            if(left<=right){for(int i=bottom;i>=top;i--) res[idx++]=matrix[i][left]; left++;}
        }
        return res;
    }
}`,
});

writeFileSync(bankPath, bank, "utf8");
console.log("\n✅ All solutions added to bank.ts!");
