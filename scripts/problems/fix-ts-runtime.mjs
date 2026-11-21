import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, "../../src/lib/problems/bank.ts");
let bank = readFileSync(bankPath, "utf8");

function fix(slug, field, newCode) {
  const slugIdx = bank.indexOf(`"slug": "${slug}"`);
  if (slugIdx === -1) return;
  const scIdx = bank.indexOf('"starterCode":', slugIdx);
  const nextSlug = bank.indexOf('"slug":', slugIdx + 10);
  const fStr = `"${field}":`;
  const fIdx = bank.indexOf(fStr, scIdx);
  if (fIdx === -1 || fIdx > nextSlug) return;
  const openQ = bank.indexOf('"', fIdx + fStr.length);
  if (openQ === -1) return;
  let closeQ = openQ + 1;
  while (closeQ < bank.length) { if (bank[closeQ] === '"' && bank[closeQ-1] !== '\\') break; closeQ++; }
  const esc = newCode.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"");
  bank = bank.slice(0, openQ+1) + esc + bank.slice(closeQ);
  console.log(`✅ ${slug} [${field}]`);
}

// add-two-numbers TS - Runtime Error (object literal colon issue after stripping)
fix("add-two-numbers", "TypeScript",
`function addTwoNumbers(l1Arr: number[], l2Arr: number[]): number[] {
  function makeList(arr: number[]) {
    var dummy: any = {}; dummy.val = 0; dummy.next = null;
    var cur = dummy;
    for (var idx = 0; idx < arr.length; idx++) {
      var node: any = {}; node.val = arr[idx]; node.next = null;
      cur.next = node; cur = node;
    }
    return dummy.next;
  }
  function toArr(node: any): number[] {
    var r: number[] = [];
    while (node) { r.push(node.val); node = node.next; }
    return r;
  }
  var l1: any = makeList(l1Arr), l2: any = makeList(l2Arr);
  var dummy: any = {}; dummy.val = 0; dummy.next = null;
  var cur = dummy, carry = 0;
  while (l1 || l2 || carry) {
    var a = l1 ? l1.val : 0, b = l2 ? l2.val : 0;
    var total = a + b + carry;
    carry = Math.floor(total / 10);
    var newNode: any = {}; newNode.val = total - carry * 10; newNode.next = null;
    cur.next = newNode; cur = newNode;
    if (l1) l1 = l1.next;
    if (l2) l2 = l2.next;
  }
  return toArr(dummy.next);
}`);

// compress-runs TS
fix("compress-runs", "TypeScript",
`function compressRuns(s: string): string {
  if (!s || s.length === 0) return "";
  var result = "";
  var i = 0;
  while (i < s.length) {
    var ch = s.charAt(i);
    var count = 0;
    while (i < s.length && s.charAt(i) === ch) { count++; i++; }
    result = result + ch + count;
  }
  return result;
}`);

// merge-overlapping-ranges TS - Runtime Error
fix("merge-overlapping-ranges", "TypeScript",
`function mergeOverlappingRanges(intervals: number[][]): number[][] {
  intervals.sort(function(a, b) { return a[0] - b[0]; });
  var merged: number[][] = [];
  for (var i = 0; i < intervals.length; i++) {
    var iv = intervals[i];
    var last = merged.length > 0 ? merged[merged.length - 1] : null;
    if (last === null || last[1] < iv[0]) {
      merged.push([iv[0], iv[1]]);
    } else if (iv[1] > last[1]) {
      last[1] = iv[1];
    }
  }
  return merged;
}`);

// spiral-matrix TS - Wrong Answer got []
fix("spiral-matrix", "TypeScript",
`function spiralOrder(matrix: number[][]): number[] {
  var res: number[] = [];
  if (matrix.length === 0 || matrix[0].length === 0) return res;
  var top = 0, bottom = matrix.length - 1;
  var left = 0, right = matrix[0].length - 1;
  while (top <= bottom && left <= right) {
    for (var c = left; c <= right; c++) res.push(matrix[top][c]);
    top++;
    for (var r = top; r <= bottom; r++) res.push(matrix[r][right]);
    right--;
    if (top <= bottom) {
      for (var c = right; c >= left; c--) res.push(matrix[bottom][c]);
      bottom--;
    }
    if (left <= right) {
      for (var r = bottom; r >= top; r--) res.push(matrix[r][left]);
      left++;
    }
  }
  return res;
}`);

// intersection-two-arrays Java - order mismatch
// Expected [9,4] but got [4,9] — test case expects specific order
// Fix: return in insertion order (not sorted)
fix("intersection-two-arrays", "Java",
`class Solution {
    public int[] intersection(int[] nums1, int[] nums2) {
        java.util.Set<Integer> s1 = new java.util.HashSet<>();
        for (int n : nums1) s1.add(n);
        java.util.LinkedHashSet<Integer> res = new java.util.LinkedHashSet<>();
        for (int n : nums2) if (s1.contains(n)) res.add(n);
        return res.stream().mapToInt(Integer::intValue).toArray();
    }
}`);

writeFileSync(bankPath, bank, "utf8");
console.log("\n✅ TS runtime fixes done!");
