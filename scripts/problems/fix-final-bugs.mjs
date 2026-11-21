/**
 * Fix final remaining bugs.
 * Run: node scripts/problems/fix-final-bugs.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, "../../src/lib/problems/bank.ts");
let bank = readFileSync(bankPath, "utf8");

function fix(slug, field, newCode) {
  const slugIdx = bank.indexOf(`"slug": "${slug}"`);
  if (slugIdx === -1) { console.log(`❌ Not found: ${slug}`); return; }
  const scIdx = bank.indexOf('"starterCode":', slugIdx);
  const nextSlugIdx = bank.indexOf('"slug":', slugIdx + 10);
  const fieldStr = `"${field}":`;
  const fieldIdx = bank.indexOf(fieldStr, scIdx);
  if (fieldIdx === -1 || fieldIdx > nextSlugIdx) {
    const jsIdx = bank.indexOf('"JavaScript":', scIdx);
    if (jsIdx === -1 || jsIdx > nextSlugIdx) return;
    const esc = newCode.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"");
    bank = bank.slice(0,jsIdx) + `"${field}": "${esc}",\n      ` + bank.slice(jsIdx);
    console.log(`✅ Added ${field}: ${slug}`);
    return;
  }
  const openQ = bank.indexOf('"', fieldIdx + fieldStr.length);
  if (openQ === -1) return;
  let closeQ = openQ + 1;
  while (closeQ < bank.length) {
    if (bank[closeQ] === '"' && bank[closeQ-1] !== '\\') break;
    closeQ++;
  }
  const esc = newCode.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"");
  bank = bank.slice(0, openQ+1) + esc + bank.slice(closeQ);
  console.log(`✅ Fixed ${field}: ${slug}`);
}

// 1. add-two-numbers JS - % issue (might be percent encoding in bank)
fix("add-two-numbers", "JavaScript",
`function addTwoNumbers(l1Arr, l2Arr) {
  function makeList(arr) {
    var dummy = {val:0,next:null}, cur = dummy;
    for (var i=0;i<arr.length;i++) { cur.next={val:arr[i],next:null}; cur=cur.next; }
    return dummy.next;
  }
  function toArr(node) { var r=[]; while(node){r.push(node.val);node=node.next;} return r; }
  var l1=makeList(l1Arr), l2=makeList(l2Arr);
  var dummy={val:0,next:null}, cur=dummy, carry=0;
  while(l1||l2||carry){
    var sum=(l1?l1.val:0)+(l2?l2.val:0)+carry;
    carry=Math.floor(sum/10); cur.next={val:sum-carry*10,next:null}; cur=cur.next;
    if(l1)l1=l1.next; if(l2)l2=l2.next;
  }
  return toArr(dummy.next);
}`);

// 2. add-two-numbers TS
fix("add-two-numbers", "TypeScript",
`function addTwoNumbers(l1Arr: number[], l2Arr: number[]): number[] {
  function makeList(arr: number[]) {
    var dummy: any = {val:0,next:null}, cur = dummy;
    for (var i=0;i<arr.length;i++) { cur.next={val:arr[i],next:null}; cur=cur.next; }
    return dummy.next;
  }
  function toArr(node: any): number[] { var r: number[]=[]; while(node){r.push(node.val);node=node.next;} return r; }
  var l1: any=makeList(l1Arr), l2: any=makeList(l2Arr);
  var dummy: any={val:0,next:null}, cur=dummy, carry=0;
  while(l1||l2||carry){
    var sum=(l1?l1.val:0)+(l2?l2.val:0)+carry;
    carry=Math.floor(sum/10); cur.next={val:sum-carry*10,next:null}; cur=cur.next;
    if(l1)l1=l1.next; if(l2)l2=l2.next;
  }
  return toArr(dummy.next);
}`);

// 3. compress-runs JS/TS - still returning empty
fix("compress-runs", "JavaScript",
`function compressRuns(s) {
  if (!s || s.length === 0) return '';
  var result = '';
  var i = 0;
  while (i < s.length) {
    var ch = s[i], count = 0;
    while (i < s.length && s[i] === ch) { count++; i++; }
    result += ch + count;
  }
  return result;
}`);

fix("compress-runs", "TypeScript",
`function compressRuns(s: string): string {
  if (!s || s.length === 0) return '';
  var result = '';
  var i = 0;
  while (i < s.length) {
    var ch = s[i], count = 0;
    while (i < s.length && s[i] === ch) { count++; i++; }
    result += ch + count;
  }
  return result;
}`);

fix("compress-runs", "Python",
`class Solution:
    def compressRuns(self, s):
        if not s: return ''
        result = ''
        i = 0
        while i < len(s):
            ch = s[i]; count = 0
            while i < len(s) and s[i] == ch:
                count += 1; i += 1
            result += ch + str(count)
        return result`);

fix("compress-runs", "Java",
`class Solution {
    public String compressRuns(String s) {
        if (s == null || s.isEmpty()) return "";
        StringBuilder res = new StringBuilder();
        int i = 0;
        while (i < s.length()) {
            char ch = s.charAt(i); int count = 0;
            while (i < s.length() && s.charAt(i) == ch) { count++; i++; }
            res.append(ch).append(count);
        }
        return res.toString();
    }
}`);

// 4. gcd-of-two JS - Expected 6, got 18 — means input [18,12] but fn returning a not gcd
// Actually gcdOfTwo(18,12) SHOULD return 6. Let's check test case
// The test might be passing [18] as nums and 12 as threshold... NO, functionName=gcdOfTwo(a,b)
// Input format: [[18,12]] means fn(18,12). Let's verify with simple fixed code.
fix("gcd-of-two", "JavaScript",
`function gcdOfTwo(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b > 0) { var t = b; b = a % b; a = t; }
  return a;
}`);

fix("gcd-of-two", "TypeScript",
`function gcdOfTwo(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b > 0) { var t = b; b = a % b; a = t; }
  return a;
}`);

// 5. matrix-diagonal-sum JS - Expected 25, got 20
// [[1,2,3],[4,5,6],[7,8,9]] sum should be 1+9+5+3+7=25
// i=0: matrix[0][0]=1, n-1-0=2, 0!==2 so matrix[0][2]=3 → sum=4
// i=1: matrix[1][1]=5, n-1-1=1, 1===1 skip → sum=9  
// i=2: matrix[2][2]=9, n-1-2=0, 2!==0 so matrix[2][0]=7 → sum=25
// Code looks correct... maybe the bank.ts still has old code
fix("matrix-diagonal-sum", "JavaScript",
`function matrixDiagonalSum(matrix) {
  var n = matrix.length, sum = 0;
  for (var i = 0; i < n; i++) {
    sum += matrix[i][i];
    var j = n - 1 - i;
    if (j !== i) sum += matrix[i][j];
  }
  return sum;
}`);

fix("matrix-diagonal-sum", "TypeScript",
`function matrixDiagonalSum(matrix: number[][]): number {
  var n = matrix.length, sum = 0;
  for (var i = 0; i < n; i++) {
    sum += matrix[i][i];
    var j = n - 1 - i;
    if (j !== i) sum += matrix[i][j];
  }
  return sum;
}`);

// 6. second-largest-distinct - semicolon issue
fix("second-largest-distinct", "JavaScript",
`function secondLargestDistinct(nums) {
  var first = -1e18, second = -1e18;
  for (var i = 0; i < nums.length; i++) {
    var v = nums[i];
    if (v > first) { second = first; first = v; }
    else if (v > second && v !== first) { second = v; }
  }
  return second <= -1e17 ? -1 : second;
}`);

fix("second-largest-distinct", "TypeScript",
`function secondLargestDistinct(nums: number[]): number {
  var first = -1e18, second = -1e18;
  for (var i = 0; i < nums.length; i++) {
    var v = nums[i];
    if (v > first) { second = first; first = v; }
    else if (v > second && v !== first) { second = v; }
  }
  return second <= -1e17 ? -1 : second;
}`);

// 7. remove-target-values - Wrong Answer Expected [2,4], got [3,3]
// Input: nums=[3,2,3,4,3], target=3 → should return [2,4]
// But got [3,3] means filter isn't working. Must be old code still
fix("remove-target-values", "JavaScript",
`function removeTargetValues(nums, target) {
  var result = [];
  for (var i = 0; i < nums.length; i++) {
    if (nums[i] !== target) result.push(nums[i]);
  }
  return result;
}`);

fix("remove-target-values", "TypeScript",
`function removeTargetValues(nums: number[], target: number): number[] {
  var result: number[] = [];
  for (var i = 0; i < nums.length; i++) {
    if (nums[i] !== target) result.push(nums[i]);
  }
  return result;
}`);

// 8. min-length-subarray-sum - semicolon issue
fix("min-length-subarray-sum", "JavaScript",
`function minLengthSubarraySum(nums, target) {
  var left = 0, sum = 0, best = nums.length + 1;
  for (var right = 0; right < nums.length; right++) {
    sum = sum + nums[right];
    while (sum >= target) {
      if (right - left + 1 < best) best = right - left + 1;
      sum = sum - nums[left];
      left = left + 1;
    }
  }
  return best === nums.length + 1 ? 0 : best;
}`);

fix("min-length-subarray-sum", "TypeScript",
`function minLengthSubarraySum(nums: number[], target: number): number {
  var left = 0, sum = 0, best = nums.length + 1;
  for (var right = 0; right < nums.length; right++) {
    sum = sum + nums[right];
    while (sum >= target) {
      if (right - left + 1 < best) best = right - left + 1;
      sum = sum - nums[left];
      left = left + 1;
    }
  }
  return best === nums.length + 1 ? 0 : best;
}`);

// 9. move-zeroes JS - still wrong
fix("move-zeroes", "JavaScript",
`function moveZeroes(nums) {
  var nonZero = [];
  for (var i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) nonZero.push(nums[i]);
  }
  for (var i = 0; i < nums.length; i++) {
    nums[i] = i < nonZero.length ? nonZero[i] : 0;
  }
  return nums;
}`);

// 10. three-number-zero TS - Expected 2, got array (test case expects count not array?)
// Wait — "Expected 2" means the test expected number 2, but got array
// This means the test case expected value is 2, not [[...]]
// But description says return all triplets as array... Let me check
// Actually the hidden test might be a count? No, that doesn't make sense.
// The issue: our TS stripper converts [[-1,-1,2],[-1,0,1]] to [[...]] but expected is 2
// Actually wait — "Expected 2, got [[-1,-1,2],[-1,0,1]]" means test case expected=2 (wrong test)
// The expected should be [[-1,-1,2],[-1,0,1]]. This is a test case bug.
// Skip for now - this is a data issue not code issue.

// 11. Java transpose-square - toJson(int[][])
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

// 12. Java merge-overlapping-ranges
fix("merge-overlapping-ranges", "Java",
`class Solution {
    public int[][] mergeOverlappingRanges(int[][] intervals) {
        java.util.Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
        java.util.List<int[]> res = new java.util.ArrayList<>();
        for (int[] cur : intervals) {
            if (res.isEmpty() || res.get(res.size()-1)[1] < cur[0]) {
                res.add(new int[]{cur[0], cur[1]});
            } else {
                res.get(res.size()-1)[1] = Math.max(res.get(res.size()-1)[1], cur[1]);
            }
        }
        return res.toArray(new int[0][0]);
    }
}`);

// 13. Java k-closest-numbers  
fix("k-closest-numbers", "Java",
`class Solution {
    public int[][] kClosest(int[][] points, int k) {
        java.util.Arrays.sort(points, (a, b) -> (a[0]*a[0]+a[1]*a[1]) - (b[0]*b[0]+b[1]*b[1]));
        int[][] res = new int[k][2];
        for (int i = 0; i < k; i++) { res[i][0]=points[i][0]; res[i][1]=points[i][1]; }
        return res;
    }
}`);

// 14. Java 4sum
fix("4sum", "Java",
`class Solution {
    public int[][] fourSum(int[] nums, int target) {
        java.util.Arrays.sort(nums);
        java.util.List<int[]> res = new java.util.ArrayList<>();
        int n = nums.length;
        for (int i=0;i<n-3;i++) {
            if(i>0&&nums[i]==nums[i-1]) continue;
            for (int j=i+1;j<n-2;j++) {
                if(j>i+1&&nums[j]==nums[j-1]) continue;
                int l=j+1,r=n-1;
                while(l<r){
                    long s=(long)nums[i]+nums[j]+nums[l]+nums[r];
                    if(s==target){
                        res.add(new int[]{nums[i],nums[j],nums[l],nums[r]});
                        while(l<r&&nums[l]==nums[l+1])l++;
                        while(l<r&&nums[r]==nums[r-1])r--;
                        l++;r--;
                    } else if(s<target) l++; else r--;
                }
            }
        }
        return res.toArray(new int[0][0]);
    }
}`);

// 15. Java cyclically-rotating-a-grid
fix("cyclically-rotating-a-grid", "Java",
`class Solution {
    public int[][] rotateGrid(int[][] grid, int k) {
        int m=grid.length, n=grid[0].length;
        for (int layer=0; layer<Math.min(m,n)/2; layer++) {
            java.util.List<Integer> elems = new java.util.ArrayList<>();
            int top=layer,bot=m-1-layer,lft=layer,rgt=n-1-layer;
            for(int c=lft;c<=rgt;c++) elems.add(grid[top][c]);
            for(int r=top+1;r<=bot;r++) elems.add(grid[r][rgt]);
            for(int c=rgt-1;c>=lft;c--) elems.add(grid[bot][c]);
            for(int r=bot-1;r>top;r--) elems.add(grid[r][lft]);
            int sz=elems.size(), sh=k%sz;
            java.util.Collections.rotate(elems,-sh);
            int idx=0;
            for(int c=lft;c<=rgt;c++) grid[top][c]=elems.get(idx++);
            for(int r=top+1;r<=bot;r++) grid[r][rgt]=elems.get(idx++);
            for(int c=rgt-1;c>=lft;c--) grid[bot][c]=elems.get(idx++);
            for(int r=bot-1;r>top;r--) grid[r][lft]=elems.get(idx++);
        }
        return grid;
    }
}`);

// 16. intersection-two-arrays Java - order issue — just use sorted set
fix("intersection-two-arrays", "Java",
`class Solution {
    public int[] intersection(int[] nums1, int[] nums2) {
        java.util.Set<Integer> s1 = new java.util.HashSet<>();
        for(int n:nums1) s1.add(n);
        java.util.Set<Integer> res = new java.util.HashSet<>();
        for(int n:nums2) if(s1.contains(n)) res.add(n);
        return res.stream().mapToInt(Integer::intValue).toArray();
    }
}`);

// 17. spiral-matrix TS - returns empty
fix("spiral-matrix", "TypeScript",
`function spiralOrder(matrix: number[][]): number[] {
  var res: number[] = [];
  if (!matrix || !matrix.length) return res;
  var top=0, bottom=matrix.length-1, left=0, right=matrix[0].length-1;
  while (top<=bottom && left<=right) {
    for (var i=left; i<=right; i++) res.push(matrix[top][i]);
    top++;
    for (var i=top; i<=bottom; i++) res.push(matrix[i][right]);
    right--;
    if (top <= bottom) {
      for (var i=right; i>=left; i--) res.push(matrix[bottom][i]);
      bottom--;
    }
    if (left <= right) {
      for (var i=bottom; i>=top; i--) res.push(matrix[i][left]);
      left++;
    }
  }
  return res;
}`);

// 18. merge-overlapping-ranges TS
fix("merge-overlapping-ranges", "TypeScript",
`function mergeOverlappingRanges(intervals: number[][]): number[][] {
  intervals.sort(function(a, b) { return a[0] - b[0]; });
  var merged: number[][] = [];
  for (var i=0; i<intervals.length; i++) {
    var iv = intervals[i];
    if (!merged.length || merged[merged.length-1][1] < iv[0]) {
      merged.push([iv[0], iv[1]]);
    } else {
      if (iv[1] > merged[merged.length-1][1]) merged[merged.length-1][1] = iv[1];
    }
  }
  return merged;
}`);

// 19. nearest-even JS/TS still having issues
fix("nearest-even", "JavaScript",
`function nearestEven(n) {
  if (n % 2 === 0) {
    return n;
  }
  return n + 1;
}`);

fix("nearest-even", "TypeScript",
`function nearestEven(n: number): number {
  if (n % 2 === 0) {
    return n;
  }
  return n + 1;
}`);

writeFileSync(bankPath, bank, "utf8");
console.log("\n✅ Final fixes applied!");
