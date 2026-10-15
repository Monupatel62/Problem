import { readFileSync, writeFileSync } from 'fs';

function stripLineComments(text) {
  let r='',inStr=false,i=0;
  while(i<text.length){
    if(inStr){if(text[i]==='\\'){r+=text[i]+(text[i+1]||'');i+=2;}else if(text[i]==='"'){r+=text[i++];inStr=false;}else{r+=text[i++];}}
    else{if(text[i]==='"'){inStr=true;r+=text[i++];}else if(text[i]==='/'&&text[i+1]==='/'){while(i<text.length&&text[i]!=='\n')i++;}else{r+=text[i++];}}
  }
  return r;
}

let src = readFileSync('src/lib/problems/bank.ts', 'utf8');
let patchCount = 0;

function patch(slug, patchObj) {
  const idx = src.indexOf(`"slug": "${slug}"`);
  if(idx<0){console.log(`NOT FOUND: ${slug}`);return;}
  const start = src.lastIndexOf('\n  {', idx);
  const nextEntry = src.indexOf('\n  },\n  {', idx);
  const objEnd = nextEntry>=0 ? nextEntry+4 : src.lastIndexOf('\n  }')+4;
  const raw = src.substring(start+1, objEnd);
  const cleaned = stripLineComments(raw).replace(/,(\s*[}\]])/g,'$1');
  let obj;
  try{obj=JSON.parse(cleaned);}catch(e){console.log(`PARSE ERR ${slug}: ${e.message}`);return;}
  Object.assign(obj, patchObj);
  const tc = nextEntry>=0?',':'';
  const ne = JSON.stringify(obj,null,2);
  const rep = '  '+ne.replace(/\n/g,'\n  ')+tc;
  src = src.substring(0,start+1)+rep+src.substring(objEnd);
  patchCount++;
  console.log('Patched: '+slug);
}

patch("running-total",{editorial:[
  "Algorithm: initialise sum = 0 and result = empty array. For each value in nums, add value to sum and push sum into result. After processing all elements, return result. Time complexity O(n), space O(n) for the output.",
  "In-place variant: for i from 1 to n-1, set nums[i] = nums[i] + nums[i-1]. After this loop, nums itself holds the prefix sums. This saves the output allocation but modifies the original array, so only use it when in-place mutation is acceptable.",
  "Range sum query with prefix array: once result is built, the sum of any subarray from index l to r equals result[r] minus (l > 0 ? result[l-1] : 0). This formula works because result[r] accumulates all elements from 0 to r, and subtracting result[l-1] removes the contribution of elements 0 to l-1.",
  "Edge case single element: the loop runs once, sum = nums[0], result = [nums[0]]. The only element is both the first and last, so the prefix sum is just that element itself.",
  "Edge case all zeros: the running sum stays 0 at every step because adding 0 does not change the accumulator. The result is an array of n zeros, which correctly represents all prefix sums of an all-zero input.",
  "Edge case negative values: the running sum can be negative or can decrease when a negative value is added. No special handling is needed because the addition operation works identically for positive, zero, and negative integers.",
  "Why prefix sums matter in interviews: this is the preprocessing step for range-sum-query-immutable, subarray-sum-equals-target (check if prefix[j] minus prefix[i] equals target using a hash map), and many sliding window problems. Mastering prefix sum construction and the range query formula is essential for efficient array problem solving."
]});

patch("count-strictly-greater",{editorial:[
  "Single-pass count: initialise count = 0. For each element x in nums, check if x > threshold. If true, increment count. After the loop, return count. This is O(n) time and O(1) space with no auxiliary data structures required.",
  "Strict vs non-strict inequality: always use > not >=. An element exactly equal to threshold must be excluded. This is the most common off-by-one error in counting problems, and the problem statement uses the word 'strictly' to emphasize this.",
  "Edge case empty array: the loop body never executes since there are no elements to iterate. The count stays 0 and is correctly returned without any special handling.",
  "Edge case all elements equal threshold: not a single element satisfies x > threshold because equality is excluded. The count stays 0 throughout the entire loop and the function correctly returns 0.",
  "Edge case negative threshold: the comparison x > threshold works correctly for all integer values. If threshold = -2 and nums = [-3, -2, -1, 0, 1], the elements satisfying x > -2 are -1, 0, and 1, giving count = 3.",
  "Binary search optimisation for sorted arrays: if nums is already sorted, find the upper bound — the first index i where nums[i] > threshold — using binary search in O(log n). The count is then n minus that index. This is only worth doing when many queries run on the same pre-sorted array.",
  "General pattern: replace the threshold comparison with any predicate P(x) to count elements satisfying that property. The same single-pass counter structure handles count even numbers, count positives, count multiples of k, and many other variations at O(n) time and O(1) space."
]});

patch("first-unique-number",{editorial:[
  "Two-pass approach: in pass 1, build a hash map (or object) mapping each value to its occurrence count by iterating through all of nums. In pass 2, scan nums from left to right and return the first value whose count equals exactly 1. If no such value is found, return -1.",
  "Why two passes are necessary: on a single left-to-right scan you cannot determine whether the current element will appear again later in the array. The full frequency map from pass 1 is required before the uniqueness check in pass 2 can be performed correctly.",
  "OrderedDict or insertion-ordered map approach: maintain a map that preserves insertion order. On first encounter of value x, add x with value true. On any subsequent encounter, update x to false. After iterating, scan the map in insertion order and return the first key whose value is still true. This is O(n) time and O(n) space.",
  "Edge case single element array: the frequency map contains only nums[0] with count 1. Pass 2 immediately finds it and returns nums[0]. Correct without special handling.",
  "Edge case all duplicates: every value in nums appears at least twice, so every frequency count is >= 2. Pass 2 finds no element with count exactly 1 and falls through to return -1.",
  "Edge case all unique values: every value appears exactly once so every frequency count is 1. Pass 2 returns nums[0], the leftmost element, on the very first iteration.",
  "Relation to character problems: this is the integer analogue of first-non-repeating-character in a string. The same two-pass hash map approach applies to both. For single-character strings or character arrays, a fixed-size frequency array of 26 or 256 entries can replace the hash map, achieving true O(1) space."
]});

patch("move-negatives-left",{editorial:[
  "Two-pointer partition: initialise left = 0 and right = n-1. While left < right: if nums[left] is negative, it is already in the left partition so advance left; else if nums[right] is non-negative (>= 0), it is already in the right partition so decrement right; otherwise both pointers point to misplaced elements, swap them and advance both pointers.",
  "Loop invariant: at every step, all elements at indices strictly less than left are negative, and all elements at indices strictly greater than right are non-negative. When left >= right the invariant guarantees the full partition is complete.",
  "Zero placement: zero satisfies zero >= 0, so zeros belong to the non-negative right partition. This is the mathematically correct interpretation of negative vs non-negative and consistent with the constraint 'negative integers to the front'.",
  "Simple O(n) space approach: create a list of negatives by filtering for x < 0, then a list of non-negatives by filtering for x >= 0. Concatenate them and write back to nums. Correct but requires O(n) extra space for the intermediate lists.",
  "Edge case all negative input: every nums[left] < 0 satisfies the left condition, so left advances each iteration with no swaps. The loop exits when left reaches n. The array is unchanged. Correct.",
  "Edge case all non-negative input: every nums[right] >= 0 satisfies the right condition, so right decrements each iteration with no swaps. The loop exits when right reaches -1. The array is unchanged. Correct.",
  "Relation to quicksort partition: this is exactly the partition step from quicksort applied with a pivot value of 0. Elements strictly less than 0 go to the left partition and elements >= 0 go to the right. Extending to three groups — negative, zero, positive — produces the Dutch National Flag problem, which is the basis for sort-colors."
]});

patch("longest-even-streak",{editorial:[
  "Single pass algorithm: initialise current = 0 and maxStreak = 0. For each element x in nums: if x modulo 2 equals 0 (x is even), increment current and update maxStreak = max(maxStreak, current); otherwise x is odd, so reset current = 0. Return maxStreak after the loop completes.",
  "Why current must be reset to 0 on odd: the problem asks for a contiguous run of even integers. Any odd element breaks the streak, meaning the next potential even streak starts fresh from 0. Without this reset, the counter would accumulate non-contiguous even elements.",
  "Update maxStreak inside the even branch: updating every time an even element extends the streak ensures maxStreak captures the peak value correctly, even if the longest streak appears in the middle of the array and is followed by an odd number.",
  "Zero and negative even numbers: 0 modulo 2 == 0 and -4 modulo 2 == 0, so both zero and negative even integers correctly extend the streak. The modulo check treats all even integers uniformly regardless of sign.",
  "Edge case empty array: the loop body never executes. Both current and maxStreak remain at 0. Return 0. Correct without special handling.",
  "Edge case all even elements: current increments on every iteration, growing from 0 to n. maxStreak tracks this and reaches n. Return n — the entire array is one unbroken streak.",
  "Generalisation pattern: replace the evenness check with any predicate P(x) — for example P(x) = x > 0 for longest positive streak, P(x) = x % 3 == 0 for longest streak of multiples of 3. The increment-on-match, reset-on-mismatch structure is the universal pattern for longest-contiguous-streak problems."
]});

patch("maximum-neighbor-gap",{editorial:[
  "Single pass algorithm: initialise maxGap = 0. For i from 0 to n-2 inclusive, compute diff = abs(nums[i+1] - nums[i]) and update maxGap = max(maxGap, diff). Return maxGap after the loop. Time complexity O(n), space O(1).",
  "Why abs() is essential: the gap between two numbers is a magnitude, not a signed value. The pair (7, 1) and the pair (1, 7) both have the same absolute gap of 6. Without abs(), a descending pair like (7, 1) produces a negative difference that would be ignored or incorrectly compared with positive differences.",
  "Initialise maxGap to 0: the minimum possible adjacent gap is 0, which occurs when two consecutive elements are equal. Starting the maximum tracker at 0 is safe because any real gap is >= 0, and for an all-same array the correct answer is 0.",
  "Two-element edge case: the loop runs exactly once with i = 0, computing abs(nums[1] - nums[0]). This single pair is both the only and the maximum gap. Correct without special handling.",
  "All-same elements edge case: every diff is 0 because abs(a - a) = 0 for all a. maxGap stays at 0 throughout. Return 0. The function correctly reports no variation between neighbors.",
  "Overflow consideration: if nums contains values near the 32-bit signed integer boundaries, such as -10^9 and 10^9, the difference abs(a - b) can reach 2 times 10^9, which exceeds the 32-bit signed integer maximum of approximately 2.1 times 10^9. Use 64-bit integers in Java (long) and C++ (int64_t), or rely on Python and JavaScript which handle large integers natively without overflow.",
  "Distinction from overall array range: max(nums) - min(nums) gives the total span across all elements regardless of position. This problem asks specifically for the maximum gap between consecutive indices, which is always at most the total range but can be much smaller. For example, in [1, 10, 11, 12], the total range is 11 but the maximum adjacent gap is 9."
]});

src = src.replace(/\},\s*,/g, '},');
writeFileSync('src/lib/problems/bank.ts', src);
console.log(`Total patched: ${patchCount}`);
