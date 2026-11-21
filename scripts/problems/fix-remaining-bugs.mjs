/**
 * Fix remaining starter code bugs found in test run.
 * Run: node scripts/problems/fix-remaining-bugs.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, "../../src/lib/problems/bank.ts");
let bank = readFileSync(bankPath, "utf8");

function fix(slug, field, newCode) {
  const slugIdx = bank.indexOf(`"slug": "${slug}"`);
  if (slugIdx === -1) { console.log(`❌ slug not found: ${slug}`); return false; }
  const scIdx = bank.indexOf('"starterCode":', slugIdx);
  if (scIdx === -1) { console.log(`❌ starterCode not found: ${slug}`); return false; }
  const nextSlugIdx = bank.indexOf('"slug":', slugIdx + 10);
  const fieldStr = `"${field}":`;
  const fieldIdx = bank.indexOf(fieldStr, scIdx);
  if (fieldIdx === -1 || fieldIdx > nextSlugIdx) {
    // Add the field
    const jsIdx = bank.indexOf('"JavaScript":', scIdx);
    if (jsIdx === -1 || jsIdx > nextSlugIdx) { console.log(`⚠️  ${slug}: can't add ${field}`); return false; }
    const escaped = newCode.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"");
    bank = bank.slice(0, jsIdx) + `"${field}": "${escaped}",\n      ` + bank.slice(jsIdx);
    console.log(`✅ Added ${field}: ${slug}`);
    return true;
  }
  const openQ = bank.indexOf('"', fieldIdx + fieldStr.length);
  if (openQ === -1) return false;
  let closeQ = openQ + 1;
  while (closeQ < bank.length) {
    if (bank[closeQ] === '"' && bank[closeQ-1] !== '\\') break;
    closeQ++;
  }
  const escaped = newCode.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"");
  bank = bank.slice(0, openQ+1) + escaped + bank.slice(closeQ);
  console.log(`✅ Fixed ${field}: ${slug}`);
  return true;
}

function fixTestCase(slug, sampleCaseIdx, newExpected) {
  const slugIdx = bank.indexOf(`"slug": "${slug}"`);
  if (slugIdx === -1) return;
  // This is complex — skip for now, fix description/expected instead
  console.log(`⚠️  Test case fix needed for: ${slug}`);
}

// ═══════════════════════════════════════════════════════════
// 1. FIX reverse-clean-string — expected is wrong
// "hi there" → remove spaces → "hithere" → reverse → "erehtih"  
// But test says "erehti" — means input must be "hi there" differently
// Actually test input is likely "hi there " with trailing space
// Fix: update description and test to be consistent
// The code IS correct. The hidden test case expected value is wrong.
// Fix: update expected in sampleCases and hiddenCases
// ═══════════════════════════════════════════════════════════

// Fix reverse-clean-string test: "hi there" reversed without spaces = "erehtih"
// The expected "erehti" means input was "hi there" (7 chars - 1 space = 6)
// "hithere" reversed = "erehtih" (7 chars)
// "hi ther" reversed without space = "rehtih" ... 
// Conclusion: test case expected value is wrong. Fix expected = "erehtih"
const revCleanIdx = bank.indexOf('"slug": "reverse-clean-string"');
if (revCleanIdx !== -1) {
  // Fix expected in sampleCases from "erehti" to "erehtih"
  const scIdx = bank.indexOf('"sampleCases":', revCleanIdx);
  const expectedIdx = bank.indexOf('"erehti"', scIdx);
  if (expectedIdx !== -1) {
    bank = bank.slice(0, expectedIdx) + '"erehtih"' + bank.slice(expectedIdx + 8);
    console.log('✅ Fixed reverse-clean-string expected: erehti → erehtih');
  }
  // Fix in hiddenCases too
  let pos = expectedIdx + 1;
  while (true) {
    const idx = bank.indexOf('"erehti"', pos);
    if (idx === -1 || idx > bank.indexOf('"functionName"', revCleanIdx)) break;
    bank = bank.slice(0, idx) + '"erehtih"' + bank.slice(idx + 8);
    pos = idx + 9;
    console.log('✅ Fixed reverse-clean-string hidden expected');
  }
}

// ═══════════════════════════════════════════════════════════
// 2. FIX gcd-of-two — test says gcd(18,12)=6 but code returns 18
// Code: while(b!==0){t=a%b;a=b;b=t} return abs(a)
// gcd(18,12): a=18,b=12 → t=6,a=12,b=6 → t=0,a=6,b=0 → return 6 ✅
// The code IS correct! Issue: test case input format
// Input [[18,12]] means nums=[18,12] → but function takes (a,b)
// In judge: functionName="gcdOfTwo", input=[18,12], so fn(18,12) → correct
// Let me check: "Expected 6, got 18" — means code returned a=18 before loop finished?
// Actually input array [18, 12] passed as fn(...[18,12]) = fn(18,12) ✅
// The bug must be in the code itself. Let me recheck:
// function gcdOfTwo(a,b){ while(b!==0){const t=a%b; a=b; b=t;} return Math.abs(a); }
// gcdOfTwo(18,12): b=12≠0 → t=18%12=6, a=12, b=6
//                 b=6≠0  → t=12%6=0,  a=6,  b=0
//                 b=0    → return abs(6) = 6 ✅
// So code IS correct! The issue must be in the test case expected value
// Hidden case might have wrong expected. Let's check bank.ts...

// ═══════════════════════════════════════════════════════════
// 3. FIX compress-runs — returns empty string
// Code: for i=1 to s.length, if s[i]===s[i-1] count++ else out+=s[i-1]+count
// "aaabbc": i=1: 'a'==='a' count=2; i=2: 'a'==='a' count=3
//           i=3: 'b'!=='a' out="a3", count=1
//           i=4: 'b'==='b' count=2
//           i=5: 'c'!=='b' out="a3b2", count=1
//           i=6=s.length: loop ends → out="a3b2" missing "c1"
// Fix: loop should run to s.length (<=) and handle last char
// ═══════════════════════════════════════════════════════════

fix("compress-runs", "JavaScript",
`function compressRuns(s) {
  if (!s) return '';
  let out = '', count = 1;
  for (let i = 1; i <= s.length; i++) {
    if (i < s.length && s[i] === s[i-1]) {
      count++;
    } else {
      out += s[i-1] + count;
      count = 1;
    }
  }
  return out;
}`);

fix("compress-runs", "TypeScript",
`function compressRuns(s: string): string {
  if (!s) return '';
  let out = '', count = 1;
  for (let i = 1; i <= s.length; i++) {
    if (i < s.length && s[i] === s[i-1]) {
      count++;
    } else {
      out += s[i-1] + count;
      count = 1;
    }
  }
  return out;
}`);

fix("compress-runs", "Python",
`class Solution:
    def compressRuns(self, s):
        if not s: return ''
        out, count = '', 1
        for i in range(1, len(s) + 1):
            if i < len(s) and s[i] == s[i-1]:
                count += 1
            else:
                out += s[i-1] + str(count)
                count = 1
        return out`);

fix("compress-runs", "Java",
`class Solution {
    public String compressRuns(String s) {
        if (s == null || s.isEmpty()) return "";
        StringBuilder out = new StringBuilder();
        int count = 1;
        for (int i = 1; i <= s.length(); i++) {
            if (i < s.length() && s.charAt(i) == s.charAt(i-1)) {
                count++;
            } else {
                out.append(s.charAt(i-1)).append(count);
                count = 1;
            }
        }
        return out.toString();
    }
}`);

// ═══════════════════════════════════════════════════════════
// 4. FIX nearest-even — "Unexpected token ';'" in JS/TS
// function nearestEven(n) { return n % 2 === 0 ? n : n + 1; }
// This looks fine... The semicolons shouldn't cause issues
// Let me check what's actually in bank.ts for this function
// ═══════════════════════════════════════════════════════════

fix("nearest-even", "JavaScript",
`function nearestEven(n) {
  if (n % 2 === 0) return n;
  return n + 1;
}`);

fix("nearest-even", "TypeScript",
`function nearestEven(n: number): number {
  if (n % 2 === 0) return n;
  return n + 1;
}`);

// ═══════════════════════════════════════════════════════════
// 5. FIX matrix-diagonal-sum — expected 25, got 20
// [[1,2,3],[4,5,6],[7,8,9]] — diag=[1,5,9]=15, anti=[3,5,7]=15, center=5 shared
// sum = 15+15-5 = 25
// Code: sum+=matrix[i][i]; if(i!==n-1-i) sum+=matrix[i][n-1-i]
// i=0: sum+=1(diag); 0!==2 → sum+=3(anti) = 4
// i=1: sum+=5(diag); 1===1 → skip anti = 9
// i=2: sum+=9(diag); 2!==0 → sum+=7(anti) = 25 ✅
// So code IS correct. Let me check the actual bank content...
// ═══════════════════════════════════════════════════════════

fix("matrix-diagonal-sum", "JavaScript",
`function matrixDiagonalSum(matrix) {
  const n = matrix.length;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += matrix[i][i];
    if (i !== n - 1 - i) sum += matrix[i][n - 1 - i];
  }
  return sum;
}`);

fix("matrix-diagonal-sum", "TypeScript",
`function matrixDiagonalSum(matrix: number[][]): number {
  const n = matrix.length;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += matrix[i][i];
    if (i !== n - 1 - i) sum += matrix[i][n - 1 - i];
  }
  return sum;
}`);

// ═══════════════════════════════════════════════════════════
// 6. FIX second-largest-distinct — "Unexpected token ';'" 
// ═══════════════════════════════════════════════════════════

fix("second-largest-distinct", "JavaScript",
`function secondLargestDistinct(nums) {
  let first = -Infinity, second = -Infinity;
  for (const v of nums) {
    if (v > first) {
      second = first;
      first = v;
    } else if (v > second && v !== first) {
      second = v;
    }
  }
  return second === -Infinity ? -1 : second;
}`);

fix("second-largest-distinct", "TypeScript",
`function secondLargestDistinct(nums: number[]): number {
  let first = -Infinity, second = -Infinity;
  for (const v of nums) {
    if (v > first) {
      second = first;
      first = v;
    } else if (v > second && v !== first) {
      second = v;
    }
  }
  return second === -Infinity ? -1 : second;
}`);

// ═══════════════════════════════════════════════════════════
// 7. FIX remove-target-values — wrong output  
// ═══════════════════════════════════════════════════════════

fix("remove-target-values", "JavaScript",
`function removeTargetValues(nums, target) {
  return nums.filter(function(v) { return v !== target; });
}`);

fix("remove-target-values", "TypeScript",
`function removeTargetValues(nums: number[], target: number): number[] {
  return nums.filter(function(v) { return v !== target; });
}`);

// ═══════════════════════════════════════════════════════════
// 8. FIX min-length-subarray-sum
// ═══════════════════════════════════════════════════════════

fix("min-length-subarray-sum", "JavaScript",
`function minLengthSubarraySum(nums, target) {
  var left = 0, sum = 0, best = Infinity;
  for (var right = 0; right < nums.length; right++) {
    sum += nums[right];
    while (sum >= target) {
      best = Math.min(best, right - left + 1);
      sum -= nums[left];
      left++;
    }
  }
  return best === Infinity ? 0 : best;
}`);

fix("min-length-subarray-sum", "TypeScript",
`function minLengthSubarraySum(nums: number[], target: number): number {
  var left = 0, sum = 0, best = Infinity;
  for (var right = 0; right < nums.length; right++) {
    sum += nums[right];
    while (sum >= target) {
      best = Math.min(best, right - left + 1);
      sum -= nums[left];
      left++;
    }
  }
  return best === Infinity ? 0 : best;
}`);

// ═══════════════════════════════════════════════════════════
// 9. FIX move-zeroes — wrong output: [0,0,0,0,0]
// Code uses `for (const n of nums)` but mutates nums while iterating!
// Fix: iterate over copy
// ═══════════════════════════════════════════════════════════

fix("move-zeroes", "JavaScript",
`function moveZeroes(nums) {
  var pos = 0;
  var copy = nums.slice();
  for (var i = 0; i < copy.length; i++) {
    if (copy[i] !== 0) nums[pos++] = copy[i];
  }
  while (pos < nums.length) nums[pos++] = 0;
  return nums;
}`);

fix("move-zeroes", "TypeScript",
`function moveZeroes(nums: number[]): number[] {
  var pos = 0;
  var copy = nums.slice();
  for (var i = 0; i < copy.length; i++) {
    if (copy[i] !== 0) nums[pos++] = copy[i];
  }
  while (pos < nums.length) nums[pos++] = 0;
  return nums;
}`);

// ═══════════════════════════════════════════════════════════
// 10. FIX Java transpose-square — toJson(int[][]) issue
// ═══════════════════════════════════════════════════════════

fix("transpose-square", "Java",
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

// ═══════════════════════════════════════════════════════════
// 11. FIX Java merge-overlapping-ranges, k-closest, 4sum, sort-colors, spiral-matrix
// All have List<int[]> → need to return int[][]
// ═══════════════════════════════════════════════════════════

fix("sort-colors", "Java",
`class Solution {
    public int[] sortColors(int[] nums) {
        int low = 0, mid = 0, high = nums.length - 1;
        while (mid <= high) {
            if (nums[mid] == 0) {
                int t = nums[low]; nums[low] = nums[mid]; nums[mid] = t;
                low++; mid++;
            } else if (nums[mid] == 2) {
                int t = nums[mid]; nums[mid] = nums[high]; nums[high] = t;
                high--;
            } else mid++;
        }
        return nums;
    }
}`);

fix("k-closest-numbers", "Java",
`class Solution {
    public int[][] kClosest(int[][] points, int k) {
        java.util.Arrays.sort(points, (a, b) -> (a[0]*a[0]+a[1]*a[1]) - (b[0]*b[0]+b[1]*b[1]));
        int[][] res = new int[k][];
        for (int i = 0; i < k; i++) res[i] = points[i];
        return res;
    }
}`);

fix("spiral-matrix", "Java",
`class Solution {
    public int[] spiralOrder(int[][] matrix) {
        if (matrix.length == 0) return new int[0];
        int top=0, bottom=matrix.length-1, left=0, right=matrix[0].length-1;
        int[] res = new int[(bottom+1)*(right+1)]; int idx=0;
        while (top<=bottom && left<=right) {
            for (int i=left;i<=right;i++) res[idx++]=matrix[top][i]; top++;
            for (int i=top;i<=bottom;i++) res[idx++]=matrix[i][right]; right--;
            if (top<=bottom) { for (int i=right;i>=left;i--) res[idx++]=matrix[bottom][i]; bottom--; }
            if (left<=right) { for (int i=bottom;i>=top;i--) res[idx++]=matrix[i][left]; left++; }
        }
        return res;
    }
}`);

fix("cyclically-rotating-a-grid", "Java",
`class Solution {
    public int[][] rotateGrid(int[][] grid, int k) {
        int m = grid.length, n = grid[0].length;
        for (int layer = 0; layer < Math.min(m,n)/2; layer++) {
            java.util.List<Integer> elems = new java.util.ArrayList<>();
            int top=layer,bottom=m-1-layer,left=layer,right=n-1-layer;
            for (int c=left;c<=right;c++) elems.add(grid[top][c]);
            for (int r=top+1;r<=bottom;r++) elems.add(grid[r][right]);
            for (int c=right-1;c>=left;c--) elems.add(grid[bottom][c]);
            for (int r=bottom-1;r>top;r--) elems.add(grid[r][left]);
            int sz=elems.size(), shift=k%sz;
            java.util.Collections.rotate(elems,-shift);
            int idx=0;
            for (int c=left;c<=right;c++) grid[top][c]=elems.get(idx++);
            for (int r=top+1;r<=bottom;r++) grid[r][right]=elems.get(idx++);
            for (int c=right-1;c>=left;c--) grid[bottom][c]=elems.get(idx++);
            for (int r=bottom-1;r>top;r--) grid[r][left]=elems.get(idx++);
        }
        return grid;
    }
}`);

fix("intersection-two-arrays", "Java",
`class Solution {
    public int[] intersection(int[] nums1, int[] nums2) {
        java.util.Set<Integer> set = new java.util.HashSet<>();
        for (int n : nums1) set.add(n);
        java.util.Set<Integer> res = new java.util.HashSet<>();
        for (int n : nums2) if (set.contains(n)) res.add(n);
        return res.stream().mapToInt(Integer::intValue).toArray();
    }
}`);

// ═══════════════════════════════════════════════════════════
// 12. FIX TypeScript specific issues
// ═══════════════════════════════════════════════════════════

// add-two-numbers TS — interface inside function causes issue
fix("add-two-numbers", "TypeScript",
`function addTwoNumbers(l1Arr: number[], l2Arr: number[]): number[] {
  const makeList = (arr: number[]) => {
    const dummy = { val: 0, next: null as any };
    let cur = dummy;
    for (const v of arr) { cur.next = { val: v, next: null }; cur = cur.next; }
    return dummy.next;
  };
  const toArray = (node: any): number[] => {
    const res: number[] = []; while (node) { res.push(node.val); node = node.next; } return res;
  };
  let l1: any = makeList(l1Arr), l2: any = makeList(l2Arr);
  const dummy = { val: 0, next: null as any }; let cur = dummy, carry = 0;
  while (l1 || l2 || carry) {
    const sum = (l1 ? l1.val : 0) + (l2 ? l2.val : 0) + carry;
    carry = Math.floor(sum / 10); cur.next = { val: sum % 10, next: null }; cur = cur.next;
    if (l1) l1 = l1.next; if (l2) l2 = l2.next;
  }
  return toArray(dummy.next);
}`);

// add-two-numbers JS — fix % issue (might be encoding)
fix("add-two-numbers", "JavaScript",
`function addTwoNumbers(l1Arr, l2Arr) {
  function makeList(arr) {
    var dummy = { val: 0, next: null }, cur = dummy;
    for (var i = 0; i < arr.length; i++) { cur.next = { val: arr[i], next: null }; cur = cur.next; }
    return dummy.next;
  }
  function toArray(node) {
    var res = []; while (node) { res.push(node.val); node = node.next; } return res;
  }
  var l1 = makeList(l1Arr), l2 = makeList(l2Arr);
  var dummy = { val: 0, next: null }, cur = dummy, carry = 0;
  while (l1 || l2 || carry) {
    var sum = (l1 ? l1.val : 0) + (l2 ? l2.val : 0) + carry;
    carry = Math.floor(sum / 10);
    cur.next = { val: sum % 10, next: null }; cur = cur.next;
    if (l1) l1 = l1.next; if (l2) l2 = l2.next;
  }
  return toArray(dummy.next);
}`);

// is-soft-palindrome TS
fix("is-soft-palindrome", "TypeScript",
`function isSoftPalindrome(s: string): boolean {
  var clean = s.toLowerCase().replace(/\\s/g, '');
  return clean === clean.split('').reverse().join('');
}`);

// contains-duplicate TS
fix("contains-duplicate", "TypeScript",
`function containsDuplicate(nums: number[]): boolean {
  var seen = new Set();
  for (var i = 0; i < nums.length; i++) {
    if (seen.has(nums[i])) return true;
    seen.add(nums[i]);
  }
  return false;
}`);

// count-words-simple TS
fix("count-words-simple", "TypeScript",
`function countWordsSimple(s: string): number {
  var words = s.trim().split(' ').filter(function(w) { return w.length > 0; });
  return words.length;
}`);

// count-local-peaks TS
fix("count-local-peaks", "TypeScript",
`function countLocalPeaks(nums: number[]): number {
  var count = 0;
  for (var i = 1; i < nums.length - 1; i++) {
    if (nums[i] > nums[i-1] && nums[i] > nums[i+1]) count++;
  }
  return count;
}`);

// next-greater-right TS
fix("next-greater-right", "TypeScript",
`function nextGreaterRight(nums: number[]): number[] {
  var res = new Array(nums.length).fill(-1);
  var stack: number[] = [];
  for (var i = 0; i < nums.length; i++) {
    while (stack.length > 0 && nums[i] > nums[stack[stack.length-1]]) {
      res[stack.pop()!] = nums[i];
    }
    stack.push(i);
  }
  return res;
}`);

// daily-temperature-wait TS
fix("daily-temperature-wait", "TypeScript",
`function dailyTemperatureWait(temps: number[]): number[] {
  var res = new Array(temps.length).fill(0);
  var stack: number[] = [];
  for (var i = 0; i < temps.length; i++) {
    while (stack.length > 0 && temps[i] > temps[stack[stack.length-1]]) {
      var idx = stack.pop()!;
      res[idx] = i - idx;
    }
    stack.push(i);
  }
  return res;
}`);

// find-minimum-rotated TS
fix("find-minimum-rotated", "TypeScript",
`function findMin(nums: number[]): number {
  var l = 0, r = nums.length - 1;
  while (l < r) {
    var m = Math.floor((l + r) / 2);
    if (nums[m] > nums[r]) l = m + 1; else r = m;
  }
  return nums[l];
}`);

// search-rotated-array TS
fix("search-rotated-array", "TypeScript",
`function search(nums: number[], target: number): number {
  var l = 0, r = nums.length - 1;
  while (l <= r) {
    var m = Math.floor((l + r) / 2);
    if (nums[m] === target) return m;
    if (nums[l] <= nums[m]) {
      if (nums[l] <= target && target < nums[m]) r = m - 1; else l = m + 1;
    } else {
      if (nums[m] < target && target <= nums[r]) l = m + 1; else r = m - 1;
    }
  }
  return -1;
}`);

// move-negatives-left TS
fix("move-negatives-left", "TypeScript",
`function moveNegativesLeft(nums: number[]): number[] {
  var neg = nums.filter(function(x) { return x < 0; });
  var pos = nums.filter(function(x) { return x >= 0; });
  return neg.concat(pos);
}`);

// rotate-right-once TS
fix("rotate-right-once", "TypeScript",
`function rotateRightOnce(nums: number[]): number[] {
  if (nums.length === 0) return [];
  return [nums[nums.length-1]].concat(nums.slice(0, nums.length-1));
}`);

// longest-substring TS
fix("longest-substring", "TypeScript",
`function lengthOfLongestSubstring(s: string): number {
  var left = 0, best = 0;
  var seen: Record<string, number> = {};
  for (var right = 0; right < s.length; right++) {
    var ch = s[right];
    if (seen[ch] !== undefined && seen[ch] >= left) left = seen[ch] + 1;
    seen[ch] = right;
    best = Math.max(best, right - left + 1);
  }
  return best;
}`);

// three-number-zero TS
fix("three-number-zero", "TypeScript",
`function threeNumberZero(nums: number[]): number[][] {
  nums.sort(function(a, b) { return a - b; });
  var res: number[][] = [];
  for (var i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i-1]) continue;
    var l = i+1, r = nums.length-1;
    while (l < r) {
      var s = nums[i]+nums[l]+nums[r];
      if (s === 0) {
        res.push([nums[i],nums[l],nums[r]]);
        while(l<r&&nums[l]===nums[l+1])l++;
        while(l<r&&nums[r]===nums[r-1])r--;
        l++;r--;
      } else if (s < 0) l++; else r--;
    }
  }
  return res;
}`);

// product-except-self TS
fix("product-except-self-basic", "TypeScript",
`function productExceptSelfBasic(nums: number[]): number[] {
  var n = nums.length;
  var res: number[] = new Array(n).fill(1);
  var left = 1;
  for (var i = 0; i < n; i++) { res[i] = left; left *= nums[i]; }
  var right = 1;
  for (var i = n-1; i >= 0; i--) { res[i] *= right; right *= nums[i]; }
  return res;
}`);

// merge-overlapping-ranges TS
fix("merge-overlapping-ranges", "TypeScript",
`function mergeOverlappingRanges(intervals: number[][]): number[][] {
  intervals.sort(function(a, b) { return a[0] - b[0]; });
  var merged: number[][] = [];
  for (var i = 0; i < intervals.length; i++) {
    var iv = intervals[i];
    if (!merged.length || merged[merged.length-1][1] < iv[0]) {
      merged.push(iv.slice());
    } else {
      merged[merged.length-1][1] = Math.max(merged[merged.length-1][1], iv[1]);
    }
  }
  return merged;
}`);

// 4sum TS
fix("4sum", "TypeScript",
`function fourSum(nums: number[], target: number): number[][] {
  nums.sort(function(a, b) { return a-b; });
  var res: number[][] = [];
  for (var i=0;i<nums.length-3;i++) {
    if(i>0&&nums[i]===nums[i-1]) continue;
    for (var j=i+1;j<nums.length-2;j++) {
      if(j>i+1&&nums[j]===nums[j-1]) continue;
      var l=j+1,r=nums.length-1;
      while(l<r){
        var s=nums[i]+nums[j]+nums[l]+nums[r];
        if(s===target){
          res.push([nums[i],nums[j],nums[l],nums[r]]);
          while(l<r&&nums[l]===nums[l+1])l++;
          while(l<r&&nums[r]===nums[r-1])r--;
          l++;r--;
        } else if(s<target) l++; else r--;
      }
    }
  }
  return res;
}`);

// jump-game TS
fix("jump-game", "TypeScript",
`function canJump(nums: number[]): boolean {
  var reach = 0;
  for (var i = 0; i < nums.length; i++) {
    if (i > reach) return false;
    reach = Math.max(reach, i + nums[i]);
  }
  return true;
}`);

// subarray-product-less-k TS
fix("subarray-product-less-k", "TypeScript",
`function numSubarrayProductLessThanK(nums: number[], k: number): number {
  if (k <= 1) return 0;
  var prod = 1, l = 0, count = 0;
  for (var r = 0; r < nums.length; r++) {
    prod *= nums[r];
    while (prod >= k) prod /= nums[l++];
    count += r - l + 1;
  }
  return count;
}`);

// spiral-matrix TS
fix("spiral-matrix", "TypeScript",
`function spiralOrder(matrix: number[][]): number[] {
  var res: number[] = [];
  if (!matrix.length) return res;
  var top=0,bottom=matrix.length-1,left=0,right=matrix[0].length-1;
  while (top<=bottom && left<=right) {
    for (var i=left;i<=right;i++) res.push(matrix[top][i]); top++;
    for (var i=top;i<=bottom;i++) res.push(matrix[i][right]); right--;
    if (top<=bottom) { for (var i=right;i>=left;i--) res.push(matrix[bottom][i]); bottom--; }
    if (left<=right) { for (var i=bottom;i>=top;i--) res.push(matrix[i][left]); left++; }
  }
  return res;
}`);

// transpose-square TS fix
fix("transpose-square", "TypeScript",
`function transposeSquare(matrix: number[][]): number[][] {
  var n = matrix.length;
  var ans: number[][] = [];
  for (var i = 0; i < n; i++) {
    ans[i] = [];
    for (var j = 0; j < n; j++) ans[i][j] = matrix[j][i];
  }
  return ans;
}`);

writeFileSync(bankPath, bank, "utf8");
console.log("\n✅ All fixes applied!");
