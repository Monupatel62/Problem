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

// Fix three-number-zero — was returning count instead of array
fix("three-number-zero", "JavaScript",
`function threeNumberZero(nums) {
  nums.sort(function(a, b) { return a - b; });
  var res = [];
  for (var i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i-1]) continue;
    var l = i + 1, r = nums.length - 1;
    while (l < r) {
      var s = nums[i] + nums[l] + nums[r];
      if (s === 0) {
        res.push([nums[i], nums[l], nums[r]]);
        while (l < r && nums[l] === nums[l+1]) l++;
        while (l < r && nums[r] === nums[r-1]) r--;
        l++; r--;
      } else if (s < 0) l++;
      else r--;
    }
  }
  return res;
}`);

fix("three-number-zero", "Python",
`class Solution:
    def threeNumberZero(self, nums):
        nums.sort()
        res = []
        for i in range(len(nums) - 2):
            if i > 0 and nums[i] == nums[i-1]:
                continue
            l, r = i + 1, len(nums) - 1
            while l < r:
                s = nums[i] + nums[l] + nums[r]
                if s == 0:
                    res.append([nums[i], nums[l], nums[r]])
                    while l < r and nums[l] == nums[l+1]: l += 1
                    while l < r and nums[r] == nums[r-1]: r -= 1
                    l += 1; r -= 1
                elif s < 0:
                    l += 1
                else:
                    r -= 1
        return res`);

fix("three-number-zero", "Java",
`class Solution {
    public int[][] threeNumberZero(int[] nums) {
        java.util.Arrays.sort(nums);
        java.util.List<int[]> res = new java.util.ArrayList<>();
        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i-1]) continue;
            int l = i+1, r = nums.length-1;
            while (l < r) {
                int s = nums[i] + nums[l] + nums[r];
                if (s == 0) {
                    res.add(new int[]{nums[i], nums[l], nums[r]});
                    while (l < r && nums[l] == nums[l+1]) l++;
                    while (l < r && nums[r] == nums[r-1]) r--;
                    l++; r--;
                } else if (s < 0) l++; else r--;
            }
        }
        return res.toArray(new int[0][0]);
    }
}`);

fix("three-number-zero", "TypeScript",
`function threeNumberZero(nums: number[]): number[][] {
  nums.sort(function(a, b) { return a - b; });
  var res: number[][] = [];
  for (var i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i-1]) continue;
    var l = i + 1, r = nums.length - 1;
    while (l < r) {
      var s = nums[i] + nums[l] + nums[r];
      if (s === 0) {
        res.push([nums[i], nums[l], nums[r]]);
        while (l < r && nums[l] === nums[l+1]) l++;
        while (l < r && nums[r] === nums[r-1]) r--;
        l++; r--;
      } else if (s < 0) l++; else r--;
    }
  }
  return res;
}`);

// Also fix longest-balanced-zero-one TS — missing ) after argument list
fix("longest-balanced-zero-one", "TypeScript",
`function longestBalancedZeroOne(nums: number[]): number {
  var map: Record<number, number> = {};
  map[0] = -1;
  var sum = 0, best = 0;
  for (var i = 0; i < nums.length; i++) {
    sum += nums[i] === 0 ? -1 : 1;
    if (map[sum] !== undefined) {
      var len = i - map[sum];
      if (len > best) best = len;
    } else {
      map[sum] = i;
    }
  }
  return best;
}`);

writeFileSync(bankPath, bank, "utf8");
console.log("✅ Done!");
