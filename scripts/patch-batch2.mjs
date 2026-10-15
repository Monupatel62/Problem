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
let n = 0;
function patch(slug, patchObj) {
  const idx = src.indexOf(`"slug": "${slug}"`);
  if(idx<0){console.log(`NOT FOUND: ${slug}`);return;}
  const start = src.lastIndexOf('\n  {', idx);
  const ne1 = src.indexOf('\n  },\n  {', idx);
  const objEnd = ne1>=0 ? ne1+4 : src.lastIndexOf('\n  }')+4;
  const raw = src.substring(start+1, objEnd);
  let obj;
  try{obj=JSON.parse(stripLineComments(raw).replace(/,(\s*[}\]])/g,'$1'));}catch(e){console.log(`ERR ${slug}: ${e.message}`);return;}
  Object.assign(obj, patchObj);
  const tc=ne1>=0?',':'';
  src=src.substring(0,start+1)+'  '+JSON.stringify(obj,null,2).replace(/\n/g,'\n  ')+tc+src.substring(objEnd);
  n++;console.log('Patched: '+slug);
}

patch("count-balanced-prefixes",{
  judgeReady:true,
  constraints:[
    "1 <= nums.length <= 10^5",
    "Each element of nums is either 1 or -1.",
    "A prefix of length k is the subarray nums[0..k-1].",
    "A balanced prefix has a sum of exactly zero.",
    "Return the count of such balanced prefixes."
  ],
  examples:[
    {input:"nums = [1,-1,1,-1,-1]",output:"2",explanation:"Prefix [1,-1] sums to 0 (length 2). Prefix [1,-1,1,-1] sums to 0 (length 4). Two balanced prefixes."},
    {input:"nums = [1,1,-1,-1]",output:"1",explanation:"Only prefix [1,1,-1,-1] (full array, sum = 0) is balanced. The prefix [1,1] sums to 2, not 0."}
  ],
  description:"Given an array `nums` containing only `1` and `-1`, count the number of prefixes whose sum equals exactly zero. A prefix of length `k` is the subarray `nums[0..k-1]`. A prefix is balanced if it contains an equal number of `1`s and `-1`s, making its sum zero.\n\nFor example, in `[1, -1, 1, -1, -1]`, the prefix `[1, -1]` (length 2) has sum 0, and the prefix `[1, -1, 1, -1]` (length 4) has sum 0. The full array `[1, -1, 1, -1, -1]` has sum -1, not 0. So there are 2 balanced prefixes.\n\nThe solution maintains a running prefix sum as it scans left to right. Whenever the running sum equals 0, the current prefix (from index 0 to the current index) is balanced, so increment a counter. Return the counter after the full scan.\n\nThis runs in O(n) time and O(1) space. No hash map is needed because the only target value to check is 0.\n\nThis problem is simpler than the general subarray-sum-equals-target variant because we only care about prefixes starting at index 0, not arbitrary subarrays. For arbitrary subarrays, a hash map of prefix sums would be needed.\n\nEdge cases: empty array has no prefixes, return 0; if the first element is -1, the prefix `[-1]` has sum -1, not 0; an all-balanced array like `[1,-1,1,-1]` has 2 balanced prefixes of lengths 2 and 4.",
  hints:[
    "Maintain a running prefix sum. For each index i, add nums[i] to the sum. If the sum equals 0, increment the balanced count.",
    "You do not need a hash map here because you are only counting prefixes starting at index 0 (not arbitrary subarrays). Just check if the running sum equals 0 after each element.",
    "The prefix sum equals 0 when the count of 1s equals the count of -1s seen so far."
  ],
  sampleCases:[
    {input:[[1,-1,1,-1,-1]],expected:2},
    {input:[[1,1,-1,-1]],expected:1}
  ],
  hiddenCases:[
    {input:[[1,-1]],expected:1},
    {input:[[1,1,1]],expected:0},
    {input:[[1,-1,1,-1,1,-1]],expected:3},
    {input:[[-1,1,-1,1]],expected:2}
  ],
  editorial:[
    "Algorithm: initialise prefixSum = 0, count = 0. For each value in nums: add value to prefixSum. If prefixSum == 0, increment count. Return count. O(n) time, O(1) space.",
    "Why only check for zero: we want the sum of the prefix from index 0 to i to be zero. The running sum after processing index i is exactly that prefix sum. Checking it against zero directly is all that is needed.",
    "No hash map required: unlike the subarray-sum-equals-k problem (arbitrary start), here the start is always index 0. The hash map technique is needed for arbitrary subarrays to count pairs (i,j) where prefix[j]-prefix[i]=k, but that generalisation is not required here.",
    "Relation to subarray-sum-equals-target: if the target were any value k instead of 0, and we allowed arbitrary subarrays instead of only prefixes, the solution would need a hash map counting how many times each prefix sum has been seen. This is the harder generalisation.",
    "Edge case empty array: the loop never executes, count stays 0. Return 0. Correct.",
    "Edge case all 1s: prefix sum strictly increases and never returns to 0. Count stays 0. Return 0.",
    "Balanced prefix definition check: prefix of length 2 has indices 0 and 1, so sum = nums[0] + nums[1]. Prefix of length k is nums[0..k-1]. The problem asks to count how many lengths k produce sum 0 — this is equivalent to counting how many times the running sum hits 0 during the scan."
  ]
});

patch("rotate-right-once",{
  judgeReady:true,
  constraints:[
    "0 <= nums.length <= 10^5",
    "Rotate the array to the right by exactly one position.",
    "The last element wraps around to become the first element.",
    "Modify the array in-place and return it.",
    "-10^9 <= nums[i] <= 10^9"
  ],
  examples:[
    {input:"nums = [1,2,3,4]",output:"[4,1,2,3]",explanation:"The last element 4 moves to the front. All others shift one position to the right."},
    {input:"nums = [7]",output:"[7]",explanation:"A single-element array is unchanged after any rotation."}
  ],
  description:"Given an integer array `nums`, rotate it to the **right by one position** and return the modified array. A right rotation by one step moves the last element to the front: `[1, 2, 3, 4]` becomes `[4, 1, 2, 3]`. All other elements shift one index to the right.\n\nFor a two-element array `[a, b]`, the result is `[b, a]`. For a single-element or empty array, the result is unchanged.\n\nThis is a special case of the general rotate-array problem with `k = 1`. Because `k` is fixed at 1, several simple approaches exist.\n\nThe most readable approach: save the last element `last = nums[n-1]`, shift all other elements one position to the right (move `nums[i]` to `nums[i+1]` for `i` from `n-2` down to `0`), then write `last` to `nums[0]`. This is O(n) time and O(1) extra space.\n\nAn alternative: create a new array with the last element first, then append the first `n-1` elements. This is O(n) time and O(n) space — simpler to write but uses more memory.\n\nThe three-reversal trick also works: reverse the full array, then reverse `nums[0..0]` (a no-op), then reverse `nums[1..n-1]`. This reduces to a single reversal of `nums[1..n-1]` after swapping `nums[0]` with the last element. For k=1 specifically, this simplifies to just saving the last, shifting right, and placing at front.\n\nEdge cases: empty array — nothing to rotate, return immediately; single-element array — rotation has no effect; two-element array — equivalent to swapping the two elements.",
  hints:[
    "Save the last element. Shift all elements one step to the right (nums[i] = nums[i-1] for i from n-1 down to 1). Place the saved last element at nums[0].",
    "Alternatively, use array concatenation: return [nums[n-1], ...nums.slice(0, n-1)]. This is O(n) space but very readable.",
    "For empty or single-element arrays, return nums immediately without any operations."
  ],
  sampleCases:[
    {input:[[1,2,3,4]],expected:[4,1,2,3]},
    {input:[[7]],expected:[7]}
  ],
  hiddenCases:[
    {input:[[1,2]],expected:[2,1]},
    {input:[[1,2,3]],expected:[3,1,2]},
    {input:[[5,4,3,2,1]],expected:[1,5,4,3,2]},
    {input:[[]], expected:[]}
  ],
  editorial:[
    "In-place shift: save last = nums[n-1]. For i from n-1 down to 1: nums[i] = nums[i-1]. Set nums[0] = last. O(n) time, O(1) space.",
    "Why shift from right to left: if you shift from left to right (nums[i+1] = nums[i]), you overwrite nums[i+1] before it is saved, losing data. Shifting from right to left copies each element into its new position before that position gets overwritten.",
    "Concatenation approach: [nums[n-1]].concat(nums.slice(0, n-1)) in JavaScript. Array allocation makes this O(n) space but the code is clearer.",
    "Edge case empty array: n = 0, the loop body never executes. Nothing changes. Correct.",
    "Edge case single element: n = 1, last = nums[0], the loop runs 0 times, nums[0] = last (unchanged). Correct.",
    "Relation to rotate-array: this problem is rotate-array with k=1. The general solution with k = k % n followed by three reversals also works here, producing the same O(n) time O(1) space result.",
    "Connection to queues and cyclic buffers: right-rotation-by-one is equivalent to dequeue from the back and enqueue at the front. This operation appears in circular buffer implementations, scheduler round-robin algorithms, and string rotation detection."
  ]
});

patch("missing-zero-to-n",{
  judgeReady:true,
  constraints:[
    "1 <= nums.length <= 10^5",
    "All values in nums are distinct integers in the range [0, n] where n = nums.length.",
    "Exactly one value from 0 to n is missing.",
    "Return the missing value.",
    "-nums[i] in range means no negative numbers appear."
  ],
  examples:[
    {input:"nums = [3,0,1]",output:"2",explanation:"n = 3. Values 0, 1, 3 are present. Value 2 is missing."},
    {input:"nums = [9,6,4,2,3,5,7,0,1]",output:"8",explanation:"n = 9. The range is 0..9. All values except 8 are present."}
  ],
  description:"Given an integer array `nums` of length `n` containing `n` distinct values from the range `[0, n]`, find and return the **one missing value** from that range. Since the range has `n+1` possible values (0 through n) and the array contains only `n` of them, exactly one value is always missing.\n\nFor example, `nums = [3, 0, 1]` has length 3, so the range is [0, 3]. The values 0, 1, and 3 are present; the missing value is 2.\n\nThe O(n) time O(1) space solution uses the **Gauss sum formula**: the expected sum of all integers from 0 to n is `n * (n+1) / 2`. The actual sum of the array elements is the same minus the missing value. So `missing = expectedSum - actualSum`.\n\nAn alternative O(n) time O(n) space approach uses a boolean visited array of size n+1: mark each value as seen, then scan for the unmarked index.\n\nA third approach uses XOR: XOR all values from 0 to n with all values in the array. Since `a XOR a = 0` for any value, every value that appears in both sets cancels out, leaving only the missing value.\n\nAll three approaches run in O(n) time. The sum approach and XOR approach use O(1) extra space, making them optimal for memory-constrained environments.\n\nEdge cases: if 0 is missing, the Gauss sum gives `n*(n+1)/2 - (sum of 1..n) = 0`; if n is missing, the sum gives n; single-element array `[0]` has n=1, expected sum = 1, actual sum = 0, missing = 1.",
  hints:[
    "Gauss sum: expected = n*(n+1)/2 where n = nums.length. Compute the actual sum of the array. The missing number is expected - actual.",
    "XOR approach: XOR all values 0..n with all nums[i]. Paired values cancel (a XOR a = 0), leaving only the unpaired missing value.",
    "Visited array: create a boolean array of size n+1, mark each nums[i] as true, then scan for the false index."
  ],
  sampleCases:[
    {input:[[3,0,1]],expected:2},
    {input:[[9,6,4,2,3,5,7,0,1]],expected:8}
  ],
  hiddenCases:[
    {input:[[0]],expected:1},
    {input:[[1]],expected:0},
    {input:[[0,1,2,3]],expected:4},
    {input:[[1,2,3,4,5]],expected:0}
  ],
  editorial:[
    "Gauss sum approach: expected = n*(n+1)/2 where n = nums.length. actual = sum of all nums[i]. Return expected - actual. O(n) time, O(1) space.",
    "Why Gauss sum works: the integers 0 through n sum to n*(n+1)/2 by the arithmetic series formula. Removing one value decreases the sum by exactly that value. So expectedSum - actualSum = missingValue.",
    "XOR approach: result = n. For i from 0 to n-1: result ^= i ^ nums[i]. Return result. Since XOR is commutative and associative, and a^a=0, every value that appears in both 0..n-1 and nums cancels out, leaving the missing value alone.",
    "Visited array approach: create visited[0..n] = false. For each x in nums, set visited[x] = true. Scan for the index i where visited[i] is false. O(n) time, O(n) space.",
    "Overflow consideration: if n = 10^5, then n*(n+1)/2 = about 5*10^9, which overflows a 32-bit signed integer. Use 64-bit arithmetic (long in Java, Python handles it natively, BigInt in JavaScript if needed).",
    "Edge case missing 0: actualSum = sum of 1..n = n*(n+1)/2. expectedSum - actualSum = 0. Correct.",
    "Edge case missing n: actualSum = sum of 0..n-1 = n*(n-1)/2. expectedSum - actualSum = n*(n+1)/2 - n*(n-1)/2 = n. Correct."
  ]
});

patch("reverse-clean-string",{
  judgeReady:true,
  constraints:[
    "0 <= s.length <= 10^5",
    "s contains printable ASCII characters.",
    "Return the string with all non-alphabetic characters removed and the remaining characters reversed.",
    "Preserve the case of each character.",
    "If no alphabetic characters remain, return an empty string."
  ],
  examples:[
    {input:'s = "a b c"',output:'"cba"',explanation:"Remove spaces, reverse the letters: a, b, c reversed is c, b, a."},
    {input:'s = "h3llo!"',output:'"ollh"',explanation:"Remove '3' and '!', keep 'h', 'l', 'l', 'o'. Reversed: 'o', 'l', 'l', 'h' = 'ollh'."}
  ],
  description:"Given a string `s`, return a new string formed by **removing all non-alphabetic characters** and then **reversing** the remaining letters. Preserve the original case of each letter.\n\nFor example, `'a b c'` removes the spaces to get `'abc'`, then reverses to produce `'cba'`. For `'h3llo!'`, remove the digit `'3'` and the `'!'` to get `'hllo'`, then reverse to produce `'ollh'`.\n\nThe two-step approach: first filter out all characters that are not letters (not in `a-z` or `A-Z`), collect the remaining letters, then reverse that collection and join them into a string.\n\nIn JavaScript: `s.replace(/[^a-zA-Z]/g, '').split('').reverse().join('')`. In Python: `''.join(reversed([c for c in s if c.isalpha()]))`.\n\nAlternatively, use a two-pointer approach on the cleaned string: collect letters into an array, then reverse in-place using left/right pointers swapping while left < right.\n\nThe check `c.isalpha()` in Python or `/[a-zA-Z]/.test(c)` in JavaScript correctly identifies letters. Digits, spaces, punctuation, and special characters are all excluded.\n\nEdge cases: empty string returns empty string; string with no letters (e.g. `'123'`) returns empty string; string with only letters behaves like a standard string reversal; mixed case is preserved — `'aBc'` reversed is `'cBa'`.",
  hints:[
    "Step 1: filter the string to keep only alphabetic characters. Step 2: reverse the filtered result.",
    "In Python: ''.join(reversed([c for c in s if c.isalpha()])). In JavaScript: s.replace(/[^a-zA-Z]/g, '').split('').reverse().join('').",
    "Two-pointer in-place: collect letters into array, then swap arr[left] and arr[right] while left < right."
  ],
  sampleCases:[
    {input:['a b c'],expected:'cba'},
    {input:['h3llo!'],expected:'ollh'}
  ],
  hiddenCases:[
    {input:[''],expected:''},
    {input:['123'],expected:''},
    {input:['Hello World'],expected:'dlroWolleH'},
    {input:['aBcDeF'],expected:'FeDcBa'}
  ],
  editorial:[
    "Two-step: filter = [c for c in s if c.isalpha()], return ''.join(reversed(filter)). O(n) time, O(n) space for the filtered array.",
    "Why filter first: reversing only the non-alphabetic-stripped characters is simpler than trying to track which positions to skip during reversal. The filter step clearly separates the two concerns.",
    "Two-pointer approach: letters = [c for c in s if c.isalpha()]. left = 0, right = len(letters)-1. While left < right: swap letters[left] and letters[right], left++, right--. Join and return. O(n) time, O(n) space.",
    "Case preservation: isalpha() and [a-zA-Z] both accept uppercase and lowercase without changing them. The filter keeps each character as-is, and reversal just changes order not case.",
    "Edge case empty string or no letters: the filter produces an empty array. Reversing an empty array gives an empty array. Joining gives ''. Return empty string. Correct.",
    "Edge case single letter: filter produces [c]. Reversal of a single-element is itself. Return that letter unchanged.",
    "Difference from reverse-string: standard reverse-string reverses all characters including spaces and punctuation. This problem removes non-letters first, then reverses. The two are different operations."
  ]
});

patch("count-vowels",{
  judgeReady:true,
  constraints:[
    "0 <= s.length <= 10^5",
    "s contains printable ASCII characters.",
    "Count only the vowels a, e, i, o, u (both lowercase and uppercase).",
    "Return the total count of vowel characters.",
    "Non-vowel alphabetic characters and non-alphabetic characters are not counted."
  ],
  examples:[
    {input:'s = "hello"',output:"2",explanation:"'e' and 'o' are vowels. 'h', 'l', 'l' are not. Count = 2."},
    {input:'s = "AEiou"',output:"5",explanation:"All 5 characters are vowels (case-insensitive). Count = 5."}
  ],
  description:"Given a string `s`, return the **count of vowel characters** in it. The vowels are `a`, `e`, `i`, `o`, `u` (both uppercase and lowercase).\n\nFor example, `'hello'` contains `'e'` and `'o'` as vowels, giving a count of 2. The string `'AEiou'` contains all 5 vowel characters, giving a count of 5.\n\nThe solution is a single pass through the string: maintain a counter initialised to 0. For each character, check if it belongs to the set `{'a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'}`. If yes, increment the counter. Return the counter after the full pass.\n\nThe membership test is O(1) if implemented with a set or string contains check. In Python: `'aeiouAEIOU'.__contains__(c)` or `c.lower() in 'aeiou'`. In JavaScript: `'aeiouAEIOU'.includes(c)`.\n\nAn alternative converts the entire string to lowercase first and then counts occurrences of each of the five vowel characters. This is also O(n) time and O(n) space for the lowercase copy.\n\nEdge cases: empty string returns 0; string with no vowels (like all consonants or all digits) returns 0; string consisting entirely of vowels returns the string length; counting is case-insensitive so both 'A' and 'a' contribute to the count.",
  hints:[
    "Use a set containing {'a','e','i','o','u','A','E','I','O','U'}. For each character in s, if it is in the set, increment count.",
    "Alternatively, convert each character to lowercase and check if it is in 'aeiou'. This avoids listing all 10 vowels explicitly.",
    "Functional: count = s.count('a') + s.count('e') + ... for each vowel (10 counts total). Less efficient but correct."
  ],
  sampleCases:[
    {input:['hello'],expected:2},
    {input:['AEiou'],expected:5}
  ],
  hiddenCases:[
    {input:[''],expected:0},
    {input:['bcdfg'],expected:0},
    {input:['aeiou'],expected:5},
    {input:['The quick brown fox'],expected:5}
  ],
  editorial:[
    "Single pass: vowels = set('aeiouAEIOU'), count = 0. For each c in s: if c in vowels, count++. Return count. O(n) time, O(1) space (set is fixed size 10).",
    "Set membership is O(1): using a hash set or a fixed 10-character lookup ensures each character check is constant time. String contains (like 'aeiou'.includes(c)) is O(k) where k = 5 or 10, still effectively O(1).",
    "Case normalisation: c.lower() in 'aeiou' checks both upper and lowercase by converting c first. This reduces the vowel set to 5 elements instead of 10, slightly simpler.",
    "Edge case empty string: loop never executes, count = 0. Return 0. Correct.",
    "Edge case all consonants or digits: no character passes the vowel test. Return 0.",
    "Edge case all vowels: every character increments count. Return len(s).",
    "Generalisation: replace the vowel set with any character set to count occurrences of specific characters. This pattern appears in character frequency problems, anagram checking, and text analysis tasks."
  ]
});

patch("is-soft-palindrome",{
  judgeReady:true,
  constraints:[
    "0 <= s.length <= 10^5",
    "s contains printable ASCII characters.",
    "A soft palindrome ignores non-alphanumeric characters and is case-insensitive.",
    "Return true if s is a palindrome after filtering and lowercasing, false otherwise.",
    "An empty string after filtering is considered a palindrome."
  ],
  examples:[
    {input:'s = "A man a plan a canal Panama"',output:"true",explanation:"After removing spaces and lowercasing: 'amanaplanacanalpanama'. This reads the same forwards and backwards."},
    {input:'s = "race a car"',output:"false",explanation:"After filtering: 'raceacar'. Reversed: 'racaecr'. They are not equal."}
  ],
  description:"Given a string `s`, determine whether it is a **palindrome** after ignoring non-alphanumeric characters and treating uppercase and lowercase letters as equal. A string is a palindrome if it reads the same forwards and backwards.\n\nFor example, `'A man a plan a canal Panama'` becomes `'amanaplanacanalpanama'` after removing spaces and lowercasing — which is a palindrome. The string `'race a car'` becomes `'raceacar'`, which is not a palindrome.\n\nThis variant is commonly called a soft or relaxed palindrome check because it tolerates punctuation, spaces, and capitalisation differences.\n\nThe standard approach: filter the string to keep only alphanumeric characters, convert to lowercase, then compare the filtered string with its reverse. This is O(n) time and O(n) space for the filtered copy.\n\nA space-optimised two-pointer approach: use left and right pointers starting at each end. Skip non-alphanumeric characters on each side. Compare the characters at left and right (case-insensitive). If they ever differ, return false. If pointers cross without mismatch, return true. This is O(n) time and O(1) extra space.\n\nEdge cases: empty string after filtering is a palindrome (vacuously true); single alphanumeric character is a palindrome; all same characters are a palindrome regardless of length.",
  hints:[
    "Filter and compare: extract only alphanumeric characters, lowercase them all, then check if the resulting string equals its reverse.",
    "Two-pointer (O(1) space): left = 0, right = n-1. Skip non-alphanumeric on each side. Compare lowercased characters. If mismatch, return false.",
    "Alphanumeric check: use c.isalnum() in Python, /[a-zA-Z0-9]/.test(c) in JavaScript."
  ],
  sampleCases:[
    {input:['A man a plan a canal Panama'],expected:true},
    {input:['race a car'],expected:false}
  ],
  hiddenCases:[
    {input:[''],expected:true},
    {input:['a'],expected:true},
    {input:['ab'],expected:false},
    {input:['0P'],expected:false}
  ],
  editorial:[
    "Filter approach: cleaned = [c.lower() for c in s if c.isalnum()]. Return cleaned == cleaned[::-1]. O(n) time, O(n) space for the cleaned array.",
    "Why filter first: spaces, punctuation, and capitalisation are irrelevant to this definition of palindrome. Filtering separates the concern of identifying relevant characters from the concern of checking symmetry.",
    "Two-pointer O(1) space: left = 0, right = len(s)-1. While left < right: skip s[left] if not alnum (left++); skip s[right] if not alnum (right--); if both alnum, compare s[left].lower() with s[right].lower() — if different, return false; otherwise both++, both--. After loop, return true.",
    "Edge case empty string: after filtering, cleaned = []. An empty array reversed is itself. Return true. Correct.",
    "Edge case single character: cleaned has one element. A single-element is its own reverse. Return true.",
    "Edge case all non-alphanumeric: cleaned is empty. Return true (vacuous palindrome). The two-pointer skips everything and the pointers cross without any comparison.",
    "Relation to valid-palindrome LeetCode 125: this is exactly that problem. It is one of the most common string interview questions because it tests understanding of string cleaning, two-pointer technique, and palindrome definition simultaneously."
  ]
});

src = src.replace(/\},\s*,/g, '},');
writeFileSync('src/lib/problems/bank.ts', src);
console.log(`Patched: ${n}`);
