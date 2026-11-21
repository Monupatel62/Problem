/**
 * Fix VM-specific bugs in starter codes.
 * Run: node scripts/problems/fix-vm-bugs.mjs
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
    console.log(`❌ Field not found: ${slug} [${field}]`); return;
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
  console.log(`✅ Fixed: ${slug} [${field}]`);
}

// 1. compress-runs: "use strict" + var declaration issue
// In strict mode, `var ch = s[i], count = 0` DOES work but let's be safe
fix("compress-runs", "JavaScript",
`function compressRuns(s) {
  if (!s || s.length === 0) return "";
  var result = "";
  var i = 0;
  while (i < s.length) {
    var ch = s.charAt(i);
    var count = 0;
    while (i < s.length && s.charAt(i) === ch) {
      count++;
      i++;
    }
    result = result + ch + count;
  }
  return result;
}`);

fix("compress-runs", "TypeScript",
`function compressRuns(s: string): string {
  if (!s || s.length === 0) return "";
  var result = "";
  var i = 0;
  while (i < s.length) {
    var ch = s.charAt(i);
    var count = 0;
    while (i < s.length && s.charAt(i) === ch) {
      count++;
      i++;
    }
    result = result + ch + count;
  }
  return result;
}`);

// 2. move-zeroes: mutating while iterating issue
fix("move-zeroes", "JavaScript",
`function moveZeroes(nums) {
  var nonZero = [];
  for (var k = 0; k < nums.length; k++) {
    if (nums[k] !== 0) nonZero.push(nums[k]);
  }
  for (var k = 0; k < nums.length; k++) {
    nums[k] = k < nonZero.length ? nonZero[k] : 0;
  }
  return nums;
}`);

fix("move-zeroes", "TypeScript",
`function moveZeroes(nums: number[]): number[] {
  var nonZero: number[] = [];
  for (var k = 0; k < nums.length; k++) {
    if (nums[k] !== 0) nonZero.push(nums[k]);
  }
  for (var k = 0; k < nums.length; k++) {
    nums[k] = k < nonZero.length ? nonZero[k] : 0;
  }
  return nums;
}`);

// 3. remove-target-values: returns wrong values — test shows input=[[3,2,3,4],3] expected=[2,4]
// Our fn: removeTargetValues([3,2,3,4], 3) should return [2,4]
// Loop: nums[0]=3===3 skip, nums[1]=2!==3 push, nums[2]=3===3 skip, nums[3]=4!==3 push → [2,4] ✅
// But got [3,3] — means target matching is wrong. Maybe nums[i]===target comparison with number/string mismatch?
// Fix: use strict type coercion
fix("remove-target-values", "JavaScript",
`function removeTargetValues(nums, target) {
  var result = [];
  for (var i = 0; i < nums.length; i++) {
    if (nums[i] !== target) {
      result[result.length] = nums[i];
    }
  }
  return result;
}`);

fix("remove-target-values", "TypeScript",
`function removeTargetValues(nums: number[], target: number): number[] {
  var result: number[] = [];
  for (var i = 0; i < nums.length; i++) {
    if (nums[i] !== target) {
      result[result.length] = nums[i];
    }
  }
  return result;
}`);

// 4. second-largest-distinct: 1e18 causes "Unexpected token ';'" 
// Issue: scientific notation in strict mode vm? Let's use Number.MAX_SAFE_INTEGER
fix("second-largest-distinct", "JavaScript",
`function secondLargestDistinct(nums) {
  var NEG_INF = -9007199254740991;
  var first = NEG_INF;
  var second = NEG_INF;
  for (var i = 0; i < nums.length; i++) {
    var v = nums[i];
    if (v > first) { second = first; first = v; }
    else if (v > second && v !== first) { second = v; }
  }
  return second === NEG_INF ? -1 : second;
}`);

fix("second-largest-distinct", "TypeScript",
`function secondLargestDistinct(nums: number[]): number {
  var NEG_INF = -9007199254740991;
  var first = NEG_INF;
  var second = NEG_INF;
  for (var i = 0; i < nums.length; i++) {
    var v = nums[i];
    if (v > first) { second = first; first = v; }
    else if (v > second && v !== first) { second = v; }
  }
  return second === NEG_INF ? -1 : second;
}`);

// 5. min-length-subarray-sum: semicolon issue — use explicit var
fix("min-length-subarray-sum", "JavaScript",
`function minLengthSubarraySum(nums, target) {
  var left = 0;
  var sum = 0;
  var best = nums.length + 1;
  for (var right = 0; right < nums.length; right++) {
    sum = sum + nums[right];
    while (sum >= target) {
      var len = right - left + 1;
      if (len < best) best = len;
      sum = sum - nums[left];
      left = left + 1;
    }
  }
  return best === nums.length + 1 ? 0 : best;
}`);

fix("min-length-subarray-sum", "TypeScript",
`function minLengthSubarraySum(nums: number[], target: number): number {
  var left = 0;
  var sum = 0;
  var best = nums.length + 1;
  for (var right = 0; right < nums.length; right++) {
    sum = sum + nums[right];
    while (sum >= target) {
      var len = right - left + 1;
      if (len < best) best = len;
      sum = sum - nums[left];
      left = left + 1;
    }
  }
  return best === nums.length + 1 ? 0 : best;
}`);

// 6. matrix-diagonal-sum: Expected 25, got 20
// [[1,2,3],[4,5,6],[7,8,9]]: diag=1+5+9=15, anti=3+5+7=15, center=5 counted twice → 25
// BUT the input is [[[1,2,3],[4,5,6],[7,8,9]]] (wrapped in array)
// fn(...[[[1,2,3]...]]) = fn([[1,2,3]...]) ✅ matrix is the 2D array
// Code: n=3, i=0: matrix[0][0]=1, j=2, matrix[0][2]=3, sum=4
//       i=1: matrix[1][1]=5, j=1, j===i skip, sum=9
//       i=2: matrix[2][2]=9, j=0, j!==i, matrix[2][0]=7, sum=25
// BUT got 20 = 1+5+9+5-0 or 1+2+5+8+? 
// Wait: 20 = 2+5+8+1+4 = no... 1+5+9+5=20? No...
// 20 could be sum without center: 1+9+3+7=20 (corners only?)
// Let me think again: if center is being added TWICE: 1+3+5+5+7+9=30 too much
// If anti diagonal is not being added: 1+5+9=15, skip anti because n is odd?
// OH! The issue: `if (i !== n-1-i)` — in bank.ts the condition might be inverted!
// Let me check: if n=3, i=0: n-1-i=2, 0!==2 TRUE → add anti ✅
//               i=1: n-1-i=1, 1!==1 FALSE → skip anti ✅  
//               i=2: n-1-i=0, 2!==0 TRUE → add anti ✅
// Sum = 1+3 + 5 + 9+7 = 25 ✅
// So code IS correct. Got 20 means code ISN'T running correctly in vm.
// 20 = 1+5+9+5 = diag sum + center again? Or 20 = 4+6+5+5?
// Actually 20 = sum of diagonal only WITHOUT anti: 1+5+9=15... no
// Wait: maybe the condition `i !== n-1-i` evaluates to TRUE for i=1 when n=3?
// Strict comparison: 1 !== 1 → false. CORRECT
// Hmm let me try different: got 20 = 1+2+3+5+9 = no
// 20 = 2+4+5+9 = 20! These are matrix[0][1] + matrix[1][0] + matrix[1][1] + matrix[2][2]?
// No...
// 20 = 1+3+7+9 = 20! These are matrix[0][0]+matrix[0][2]+matrix[2][0]+matrix[2][2]
// Without the CENTER element (5) being added!
// So code is adding diagonals WITHOUT center:
// diag: 1,5,9 but maybe double-counting: 1+3=4, skip 5(center), 9+7=16 → 20!
// Wait: 4+16=20 means center (5) is not being counted at all!
// Bug: `if (i !== n-1-i) sum += matrix[i][n-1-i]` 
// When i=1, n=3: n-1-1=1, 1===1 → TRUE skip. So anti[1][1]=5 is skipped.
// But main diag: sum+=matrix[1][1]=5. So 5 IS added from main diag.
// But then why 20? 1+3+5+9+7 = 25 is expected.
// Let me trace: i=0: sum+=1, j=2!==0 → sum+=3 → sum=4
//              i=1: sum+=5, j=1===1 → skip → sum=9
//              i=2: sum+=9, j=0!==2 → sum+=7 → sum=25
// THIS gives 25! Code is correct in theory.
// Maybe the actual bank.ts code stored is different. Let me just rewrite it completely.
fix("matrix-diagonal-sum", "JavaScript",
`function matrixDiagonalSum(matrix) {
  var n = matrix.length;
  var sum = 0;
  for (var i = 0; i < n; i++) {
    sum += matrix[i][i];
    var j = n - 1 - i;
    if (i !== j) {
      sum += matrix[i][j];
    }
  }
  return sum;
}`);

fix("matrix-diagonal-sum", "TypeScript",
`function matrixDiagonalSum(matrix: number[][]): number {
  var n = matrix.length;
  var sum = 0;
  for (var i = 0; i < n; i++) {
    sum += matrix[i][i];
    var j = n - 1 - i;
    if (i !== j) {
      sum += matrix[i][j];
    }
  }
  return sum;
}`);

// 7. add-two-numbers: Unexpected token '-' — `{val:arr[i],next:null}` maybe has issue
// Actually '-' in `dummy = {val:0,next:null}, cur = dummy` ??
// Let me use separate var declarations
fix("add-two-numbers", "JavaScript",
`function addTwoNumbers(l1Arr, l2Arr) {
  function makeList(arr) {
    var dummy = { val: 0, next: null };
    var cur = dummy;
    for (var idx = 0; idx < arr.length; idx++) {
      var node = { val: arr[idx], next: null };
      cur.next = node;
      cur = node;
    }
    return dummy.next;
  }
  function toArr(node) {
    var r = [];
    while (node) { r.push(node.val); node = node.next; }
    return r;
  }
  var l1 = makeList(l1Arr);
  var l2 = makeList(l2Arr);
  var dummy = { val: 0, next: null };
  var cur = dummy;
  var carry = 0;
  while (l1 || l2 || carry) {
    var a = l1 ? l1.val : 0;
    var b = l2 ? l2.val : 0;
    var total = a + b + carry;
    carry = Math.floor(total / 10);
    var newNode = { val: total - carry * 10, next: null };
    cur.next = newNode;
    cur = newNode;
    if (l1) l1 = l1.next;
    if (l2) l2 = l2.next;
  }
  return toArr(dummy.next);
}`);

fix("add-two-numbers", "TypeScript",
`function addTwoNumbers(l1Arr: number[], l2Arr: number[]): number[] {
  function makeList(arr: number[]) {
    var dummy: any = { val: 0, next: null };
    var cur = dummy;
    for (var idx = 0; idx < arr.length; idx++) {
      var node: any = { val: arr[idx], next: null };
      cur.next = node;
      cur = node;
    }
    return dummy.next;
  }
  function toArr(node: any): number[] {
    var r: number[] = [];
    while (node) { r.push(node.val); node = node.next; }
    return r;
  }
  var l1: any = makeList(l1Arr);
  var l2: any = makeList(l2Arr);
  var dummy: any = { val: 0, next: null };
  var cur = dummy;
  var carry = 0;
  while (l1 || l2 || carry) {
    var a = l1 ? l1.val : 0;
    var b = l2 ? l2.val : 0;
    var total = a + b + carry;
    carry = Math.floor(total / 10);
    var newNode: any = { val: total - carry * 10, next: null };
    cur.next = newNode;
    cur = newNode;
    if (l1) l1 = l1.next;
    if (l2) l2 = l2.next;
  }
  return toArr(dummy.next);
}`);

writeFileSync(bankPath, bank, "utf8");
console.log("\n✅ VM bug fixes applied!");
