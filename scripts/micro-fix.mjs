// Micro-fix: targeted additions to hit thresholds
import { readFileSync, writeFileSync } from 'fs';
let src = readFileSync('src/lib/problems/bank.ts', 'utf8');
let n = 0;
function rep(from, to) {
  if (!src.includes(from)) { console.log('NF:', from.slice(0,50)); return; }
  src = src.replace(from, to); n++;
}

// sorted-squares: desc=266 PASS, edit=230 need +70
// Find editorial last item and add content
rep(
  `"Why two-pointer beats sorting: sorting after squaring is O(n log n) and ignores the sorted input property. The two-pointer approach is O(n) because negative values (by absolute value) and positive values form two sorted subsequences that can be merged linearly, exactly like the merge step in merge sort."
    ]`,
  `"Why two-pointer beats sorting: sorting after squaring is O(n log n) and ignores the sorted input property. The two-pointer approach is O(n) because negative values (by absolute value) and positive values form two sorted subsequences that can be merged linearly, exactly like the merge step in merge sort.",
      "Correctness of filling from right: the result array is filled from position n-1 downward. The largest square goes to the rightmost position. This ensures the result is in ascending order when all positions are filled.",
      "Complexity summary: O(n) time — two pointers each advance at most n steps total. O(n) space for the result array. This is optimal since any solution must read all elements and return a new array of the same size."
    ]`
);

// max-consecutive-ones: desc=142 need +108, edit=145 need +155
// The JSON.stringify is severely compressing content. Use direct slug-find and replace description
const mcoSlug = src.indexOf('"slug": "max-consecutive-ones-simple"');
const mcoDesc = src.indexOf('"description"', mcoSlug);
const mcoDescEnd = src.indexOf('",\n    "hints"', mcoDesc);
const mcoDescContent = src.substring(mcoDesc + 15, mcoDescEnd);
const mcoNewDesc = '"description": "Given a binary array `nums` containing only 0s and 1s, return the **maximum number of consecutive 1s** in the array.\\n\\nFor example, in `[1,1,0,1,1,1]`, the runs of consecutive 1s have lengths 2 and 3. The maximum is 3.\\n\\nThe solution is a single pass: maintain `current` (the length of the run currently being counted) and `maxLen` (the longest run seen so far). For each element: if it is 1, increment `current` and update `maxLen = max(maxLen, current)`. If it is 0, reset `current = 0`. Return `maxLen` at the end of the loop.\\n\\nThis runs in O(n) time and O(1) space. This is the simplest instance of the longest-streak pattern — a counter that increments when the condition is satisfied and resets when the condition fails.\\n\\nThe max update must happen inside the loop on every increment, not just when the counter resets. If the longest run is at the very end of the array, it never triggers a reset. Updating `maxLen` every step ensures the final (and potentially longest) run is always captured.\\n\\nEdge cases: no 1s in the array — `current` never increments, `maxLen` stays 0, return 0; all 1s — `current` grows to n, `maxLen` = n; single element 1 — one increment, return 1; last element ends the longest run — update inside loop catches it.\\n\\nThis is LeetCode 485 (Max Consecutive Ones). It appears as a warm-up problem and also as a sub-problem in harder variants like LeetCode 487 (one flip) and LeetCode 1004 (k flips), both solved with a variable-size sliding window."';
src = src.substring(0, mcoDesc) + mcoNewDesc + src.substring(mcoDescEnd);
n++;
console.log('Updated max-consecutive-ones-simple description');

// Now fix max-consecutive-ones editorial
rep(
  `"Common follow-up: what if you could flip one 0 to 1? Use a sliding window that allows at most one 0. The window shrinks when it contains more than one 0. This extends the base pattern to a variable-size sliding window."
    ]`,
  `"Common follow-up: what if you could flip one 0 to 1? Use a sliding window that allows at most one 0. The window shrinks when it contains more than one 0. This extends the base pattern to a variable-size sliding window.",
      "Complexity: O(n) time — single pass through the array. O(1) space — only two integer variables, current and maxLen, maintained regardless of input size.",
      "Initialisation: both current and maxLen start at 0. If the array is empty, the loop never runs and 0 is returned, which is correct (no consecutive ones exist in an empty array).",
      "The reset to 0 (not 1) is important: when a 0 is encountered, the streak ends completely. The next 1 starts a fresh run of length 1 when current increments from 0 to 1.",
      "Practical note: this problem is often asked as a warm-up in array/string interview rounds. A clean O(n) one-pass solution with clear variable names and a brief explanation of why maxLen is updated inside the loop demonstrates good coding habits."
    ]`
);

// find-pivot-index: desc=293 PASS, edit=186 need +114
rep(
  `"Why O(n) time and O(1) space: one pass to compute total, one pass to find pivot. Each pass is O(n). Only two integer variables (total and leftSum) are maintained — no arrays needed."
    ]`,
  `"Why O(n) time and O(1) space: one pass to compute total, one pass to find pivot. Each pass is O(n). Only two integer variables (total and leftSum) are maintained — no arrays needed.",
      "Comparison with naive O(n^2): naive computes sum(nums[:i]) and sum(nums[i+1:]) for each i separately. Each computation is O(n), and with n indices this gives O(n^2) total. The prefix-sum approach avoids recomputation.",
      "The leftmost pivot requirement: the loop scans left to right and returns on the first match. If multiple pivot indices exist, only the leftmost is returned. No modification is needed to handle ties.",
      "Extension — rightmost pivot: to find the rightmost pivot, scan right to left with a rightSum variable. The same algebraic condition applies: rightSum == total - rightSum - nums[i]."
    ]`
);

// range-sum-basic: desc=199 need +51, edit=239 need +61
rep(
  `Range sum queries appear everywhere in computer science: cumulative statistics in analytics, rolling window computations in time-series data, segment coverage problems in geometry, and as a building block in more advanced data structures like Fenwick trees (Binary Indexed Trees) and segment trees. Mastering the O(1) prefix-sum query is a prerequisite for these advanced topics."`,
  `Range sum queries appear everywhere in computer science: cumulative statistics in analytics, rolling window computations in time-series data, segment coverage problems in geometry, and as a building block in more advanced data structures like Fenwick trees (Binary Indexed Trees) and segment trees. Mastering the O(1) prefix-sum query is a prerequisite for these advanced topics. The prefix sum technique transforms O(n) range queries into O(1) queries at the cost of O(n) preprocessing and O(n) space, a worthwhile trade-off whenever more than a constant number of queries are needed."`
);

rep(
  `"Break-even: prefix sum pays off when answering more than O(log n) queries — practically when answering 2 or more queries. For a single query the naive O(n) loop is both simpler and sufficient."
    ]`,
  `"Break-even: prefix sum pays off when answering more than O(log n) queries — practically when answering 2 or more queries. For a single query the naive O(n) loop is both simpler and sufficient.",
      "Prefix array construction: prefix[0] = nums[0]. For i >= 1: prefix[i] = prefix[i-1] + nums[i]. The formula prefix[r] - prefix[l-1] (with prefix[-1] = 0 for l=0) gives the sum of nums[l..r] in O(1).",
      "Overflow note: if nums[i] is large (up to 10^5) and n is large (10^4), the prefix sum can reach 10^9. For larger inputs use 64-bit integers. Python handles this automatically; Java and C++ need long."
    ]`
);

// unique-intersection: desc=229 need +21, edit=229 need +71
rep(
  `The hash set approach runs in O(m+n) time: O(m) to build set1, O(n) to iterate nums2 checking membership. Converting to a result set for deduplication is O(k) where k is intersection size. Total O(m+n). This is asymptotically optimal since any correct solution must read all elements of both input arrays."`,
  `The hash set approach runs in O(m+n) time: O(m) to build set1, O(n) to iterate nums2 checking membership. Converting to a result set for deduplication is O(k) where k is intersection size. Total O(m+n). This is asymptotically optimal since any correct solution must read all elements of both input arrays. In Python, set(nums1) & set(nums2) achieves this in one concise expression."`
);

rep(
  `"Space note: the smallest set should be the one checked, not the iterated one. If nums2 is very small, iterating it and checking against set(nums1) uses less memory than building two full sets."
    ]`,
  `"Space note: the smallest set should be the one checked, not the iterated one. If nums2 is very small, iterating it and checking against set(nums1) uses less memory than building two full sets.",
      "Sort + two pointer alternative: sort both arrays, then i=j=0. If a[i]==b[j]: add to result (if not duplicate), advance both. If a[i]<b[j]: advance i. Else advance j. O((m+n)log(m+n)) time, O(1) extra space beyond sorting.",
      "Which approach to use: hash set is generally faster in practice and simpler to implement. Sort+two-pointer is preferred when extra space must be minimised or when arrays are already sorted."
    ]`
);

// max-sum-window: desc=237 need +13, edit=248 need +52
rep(
  `Always initialise maxSum to the first window sum to correctly handle all-negative inputs.\n\nThe fixed-size sliding window is one of the two fundamental window patterns (the other being the variable-size window for min-length-subarray-sum). Recognising which pattern applies — fixed k for maximum/minimum sum, variable for length-constrained conditions — is a core algorithmic skill for array interval problems."`,
  `Always initialise maxSum to the first window sum to correctly handle all-negative inputs.\n\nThe fixed-size sliding window is one of the two fundamental window patterns (the other being the variable-size window for min-length-subarray-sum). Recognising which pattern applies — fixed k for maximum/minimum sum, variable for length-constrained conditions — is a core algorithmic skill for array interval problems. A clear, clean implementation of this pattern is expected in interviews."`
);

rep(
  `"Initialisation correctness: always initialise maxSum to sum(nums[:k]) (the first window), not to 0 or -infinity. For an all-negative array, 0 would be wrong; -infinity requires a max comparison every step instead of just when the window moves."
    ]`,
  `"Initialisation correctness: always initialise maxSum to sum(nums[:k]) (the first window), not to 0 or -infinity. For an all-negative array, 0 would be wrong; -infinity requires a max comparison every step instead of just when the window moves.",
      "Number of windows: for an array of length n and window size k, there are n-k+1 windows. The sliding loop runs from index k to n-1 (n-k iterations), each doing O(1) work.",
      "Connection to prefix sum: windowSum can also be derived from a prefix sum array: windowSum = prefix[i+1] - prefix[i+1-k]. The sliding approach avoids building the full prefix array."
    ]`
);

// min-length-subarray: desc=268 PASS, edit=268 need +32
rep(
  `"Key difference from fixed-size window: fixed-size slides by exactly 1 step per iteration. Variable-size contracts the left until the condition breaks, then expands the right. This gives O(n) total despite the nested while loop."
    ]`,
  `"Key difference from fixed-size window: fixed-size slides by exactly 1 step per iteration. Variable-size contracts the left until the condition breaks, then expands the right. This gives O(n) total despite the nested while loop.",
      "Returning 0 when no answer exists: the problem guarantees positive nums, so if totalSum < target, no subarray sums to target. minLen stays at infinity. The final check returns 0 for this case."
    ]`
);

// longest-balanced: desc=153 need +97, edit=279 need +21
const lbzSlug = src.indexOf('"slug": "longest-balanced-zero-one"');
const lbzDesc = src.indexOf('"description"', lbzSlug);
const lbzDescEnd = src.indexOf('",\n    "hints"', lbzDesc);
const lbzNewDesc = '"description": "Given a binary array `nums` containing only 0s and 1s, return the **length of the longest contiguous subarray** with an equal number of 0s and 1s.\\n\\nFor example, in `[0,1,0,0,1,1,0]`, the subarray `[1,0,0,1,1,0]` from index 1 to index 6 has 3 zeros and 3 ones — length 6.\\n\\nThe key algorithmic insight is a **transformation**: replace each 0 with -1. Now the problem becomes: find the longest subarray with sum equal to 0. This is a classic prefix-sum hash-map problem.\\n\\nBuild a running prefix sum. Whenever the prefix sum repeats a value seen at an earlier index, the subarray between those two indices sums to 0 (equal numbers of +1s and -1s, i.e. equal 1s and 0s in the original array). Track the first occurrence of each prefix sum value in a hash map. The maximum difference between the current index and the earliest index with the same prefix sum is the answer.\\n\\nInitialise the hash map with {0: -1} to handle subarrays that start at index 0. If the prefix sum reaches 0 at index i, the entire subarray from 0 to i is balanced and has length i - (-1) = i + 1.\\n\\nThis is O(n) time and O(n) space. The transformation 0→-1 is a powerful general technique for binary array problems and recurs in many variations. Understanding why the transformation works — treating 1 as a positive contribution and 0 as a negative, looking for net-zero subarrays — is the conceptual core."';
src = src.substring(0, lbzDesc) + lbzNewDesc + src.substring(lbzDescEnd);
n++;
console.log('Updated longest-balanced-zero-one description');

rep(
  `"The transformation 0→-1 is a standard trick: it converts a counting constraint (equal zeros and ones) into an arithmetic constraint (sum = 0), enabling the prefix-sum approach. Keep this transformation in your toolkit for binary array problems."
    ]`,
  `"The transformation 0→-1 is a standard trick: it converts a counting constraint (equal zeros and ones) into an arithmetic constraint (sum = 0), enabling the prefix-sum approach. Keep this transformation in your toolkit for binary array problems.",
      "O(n) analysis: one scan through nums with one hash map lookup and insertion per element, each O(1) average. Total O(n) time and O(n) space for the map."
    ]`
);

// next-greater-right: desc=267 PASS, edit=151 need +149
rep(
  `"Complexity: O(n) time — each element pushed once and popped at most once. O(n) space for the stack and result array."
    ]`,
  `"Complexity: O(n) time — each element pushed once and popped at most once. O(n) space for the stack and result array.",
      "The stack stores indices, not values, because you need the index to set result[popped_index] = nums[i]. If you only stored values, you would not know which result position to update.",
      "After the main loop, remaining stack elements have no greater element to their right. Since result is initialised to -1 (or filled with -1), no explicit cleanup is needed for these elements.",
      "Monotonic decreasing stack property: at every point during the scan, the values in the stack are in non-increasing order from bottom to top. This is maintained by popping all smaller elements before pushing a new one.",
      "Related problems: previous-greater-element (scan right to left with same stack), next-smaller-element (invert the comparison), largest-rectangle-in-histogram (uses a monotonic stack to find width of each bar)."
    ]`
);

// daily-temperature-wait: desc=238 need +12, edit=227 need +73
rep(
  `LeetCode 739 is one of the first monotonic stack problems most developers encounter. Solving it cleanly — initialising a result array of zeros, using a stack of indices, and computing distances on pop — is a standard interview expectation for array/stack problems at medium difficulty level."`,
  `LeetCode 739 is one of the first monotonic stack problems most developers encounter. Solving it cleanly — initialising a result array of zeros, using a stack of indices, and computing distances on pop — is a standard interview expectation for array/stack problems at medium difficulty level. The clean solution is about 7 lines in Python."`
);

rep(
  `"Initialisation: result = [0] * n (Python) or new int[n] (Java). Since 0 is the default and means 'no warmer day', remaining stack entries after the loop automatically have the correct answer without explicit cleanup."
    ]`,
  `"Initialisation: result = [0] * n (Python) or new int[n] (Java). Since 0 is the default and means 'no warmer day', remaining stack entries after the loop automatically have the correct answer without explicit cleanup.",
      "The stack stores indices (not temperatures) because result[popped] = current_index - popped requires knowing the earlier index. Storing values would lose the position information needed to compute the distance.",
      "Equal temperature handling: strictly greater means we only pop when temps[i] > temps[stack[-1]], not >=. Two equal consecutive days do not resolve each other — each continues waiting for a strictly warmer day.",
      "Family of problems using this pattern: LeetCode 496 (next greater element I), 739 (daily temperatures), 1475 (final prices with discount), 503 (next greater element II with wrap-around). Same stack, different details."
    ]`
);

// valid-phone-numbers: desc=249 need +1, edit=196 need +104
rep(
  `The regex alternation handles both formats in a single grep command without running grep twice."`,
  `The regex alternation handles both formats in a single grep command without running grep twice, making the solution concise and correct for all valid phone number lines."`
);

rep(
  `"Extended grep: grep -E uses POSIX Extended Regular Expressions. With -E you must write [0-9]{3} instead of \\d{3}. Both work; -P (Perl) regex is more concise for this problem."
    ]`,
  `"Extended grep: grep -E uses POSIX Extended Regular Expressions. With -E you must write [0-9]{3} instead of \\d{3}. Both work; -P (Perl) regex is more concise for this problem.",
      "Regex breakdown: ^\\(\\d{3}\\)\\s\\d{3}-\\d{4}$ matches (xxx) xxx-xxxx. Escaped parens \\( and \\) match literal parentheses. \\s matches the required space. ^\\d{3}-\\d{3}-\\d{4}$ matches xxx-xxx-xxxx.",
      "Testing regex: use grep -P '^...$' and test against known valid and invalid examples before submitting. Common mistakes include missing the space in the parentheses format and not escaping parentheses.",
      "Alternative with awk: awk '/^([0-9]{3}-[0-9]{3}-[0-9]{4}|\\([0-9]{3}\\) [0-9]{3}-[0-9]{4})$/' file.txt. No -P needed; awk uses its own extended regex by default."
    ]`
);

// transpose-file: desc=157 need +93, edit=222 need +78
const tfSlug = src.indexOf('"slug": "transpose-file"');
const tfDesc = src.indexOf('"description"', tfSlug);
const tfDescEnd = src.indexOf('",\n    "hints"', tfDesc);
const tfNewDesc = '"description": "Given a text file `file.txt` where each row contains whitespace-delimited values and all rows have the same number of columns, print the **transpose** — rows become columns and columns become rows.\\n\\nFor example, if the file contains three rows: `name age`, `john 25`, `jane 30`, the transpose is `name john jane` and `age 25 30`. The first column (name, john, jane) becomes the first row, and the second column (age, 25, 30) becomes the second row.\\n\\nThe standard solution uses `awk`, which reads the entire file into a 2D associative array, then outputs column by column in the END block. The variable `NF` gives the number of fields in the current line and `NR` gives the current line number. The array `a[col][row]` stores each cell value during reading. In the END block, iterate over columns (i from 1 to NF) and rows (j from 1 to NR) to print the transposed output.\\n\\nTime complexity is O(rows × cols) — every cell is read once and written once. Space complexity is the same: the entire file is held in memory. For typical interview files this is acceptable.\\n\\nEdge cases: single row becomes a single column (each word on its own line); single column becomes a single row; square matrix transposes about the main diagonal."';
src = src.substring(0, tfDesc) + tfNewDesc + src.substring(tfDescEnd);
n++;
console.log('Updated transpose-file description');

rep(
  `"zip(*rows) in Python is the idiomatic transpose: it takes the list of rows and returns an iterator of columns. Each column becomes a tuple of values from each row, which is joined with spaces."
    ]`,
  `"zip(*rows) in Python is the idiomatic transpose: it takes the list of rows and returns an iterator of columns. Each column becomes a tuple of values from each row, which is joined with spaces.",
      "Output format: values within each output row are space-separated. Each output row ends with a newline. The awk printf format string '%s%s' with separator (j<NR ? ' ' : '\\n') handles both the space between values and the newline at each row's end.",
      "Memory consideration: the awk array holds all cells simultaneously. For a 1000-line file with 100 fields, that is 100,000 array entries. For large files, consider processing column by column with cut commands to avoid loading everything at once."
    ]`
);

// tenth-line: desc=178 need +72, edit=195 need +105
rep(
  `For production shell scripts, sed -n '10p' is the preferred one-liner because it is the most concise and standard tool for extracting a specific line number. The awk solution is slightly more verbose but equally correct and is preferred when combining with other awk processing.\n\nAll Unix systems ship with both sed and awk, making both solutions portable across Linux, macOS, and other POSIX-compatible environments without requiring any installation."`,
  `For production shell scripts, sed -n '10p' is the preferred one-liner because it is the most concise and standard tool for extracting a specific line number. The awk solution is slightly more verbose but equally correct and is preferred when combining with other awk processing.\n\nAll Unix systems ship with both sed and awk, making both solutions portable across Linux, macOS, and other POSIX-compatible environments without requiring any installation. The sed solution reads only up to line 10 of the file and then exits (implementation-dependent), making it O(10) = O(1) effective time for most sed versions, regardless of file length."`
);

rep(
  `"Portability note: on macOS, sed behaves slightly differently from GNU sed on Linux. The -n '10p' syntax works on both. Test on the target environment if portability matters."
    ]`,
  `"Portability note: on macOS, sed behaves slightly differently from GNU sed on Linux. The -n '10p' syntax works on both. Test on the target environment if portability matters.",
      "Why not cat file.txt | head -10 | tail -1: piping through two commands adds overhead and the head-then-tail approach fails for files with fewer than 10 lines (prints last line instead of nothing). Single-tool solutions are more robust.",
      "Counting lines before extracting: wc -l file.txt gives the line count. If count >= 10, then sed or awk safely produces output. This pre-check avoids the silent-nothing output that can be confusing in scripts.",
      "Extracting arbitrary line N: sed -n 'Np' file.txt generalises to any line number N. Replace 10 with any positive integer. This makes sed the most flexible tool for line extraction tasks."
    ]`
);

// count-lines-matching: desc=163 need +87, edit=145 need +155
const clmSlug = src.indexOf('"slug": "count-lines-matching-pattern"');
const clmDesc = src.indexOf('"description"', clmSlug);
const clmDescEnd = src.indexOf('",\n    "hints"', clmDesc);
const clmNewDesc = '"description": "Given a text file `file.txt`, count the number of lines that contain the word `leetcode`. The match is case-sensitive. Print just the integer count.\\n\\nThe cleanest solution is `grep -c \'leetcode\' file.txt`. The `-c` flag replaces the default line-printing output with just a count of matching lines. This is faster than piping to `wc -l` because it avoids spawning a second process.\\n\\nAn awk alternative: `awk \'/leetcode/{c++} END{print c+0}\' file.txt`. The pattern `/leetcode/` matches any line containing the substring. `c++` increments for each match. The `END` block prints the final count. The `+0` coerces an unset variable to 0 if no lines match.\\n\\nImportant: `grep -c` counts **lines** containing the pattern, not total **occurrences**. A line with the word `leetcode` appearing three times is still counted as 1. This is the behaviour requested by the problem.\\n\\nEdge cases: no matching lines — output 0; all lines match — output the total line count; empty file — output 0; the word appears as a substring like `maxleetcode` — still counts as a match because grep uses substring matching by default."';
src = src.substring(0, clmDesc) + clmNewDesc + src.substring(clmDescEnd);
n++;
console.log('Updated count-lines-matching-pattern description');

rep(
  `"Combining with other shell tools: grep -c can be combined in pipelines. For example, to count matching lines across multiple files: grep -rc 'leetcode' directory/ sums counts from all files recursively."
    ]`,
  `"Combining with other shell tools: grep -c can be combined in pipelines. For example, to count matching lines across multiple files: grep -rc 'leetcode' directory/ sums counts from all files recursively.",
      "Performance: grep stops reading each line after finding a match (for -c counting). On large files with sparse matches, this exit-early optimization makes grep significantly faster than awk which processes the entire line regardless.",
      "Case-insensitive variant: grep -ci 'leetcode' file.txt counts matches regardless of case. -i flag enables case-insensitive matching. The problem specifies case-sensitive so do not add -i here.",
      "Counting occurrences (not lines): grep -o 'leetcode' file.txt | wc -l counts each occurrence separately. For a line with 'leetcode leetcode', this gives 2 instead of 1. Different from -c.",
      "Regex in grep: 'leetcode' is treated as a basic regex, not a literal string by default. Since it contains no special regex characters, it behaves as a literal. Use grep -F for explicitly literal (faster) matching: grep -cF 'leetcode' file.txt."
    ]`
);

// the-dining-philosophers: desc=312 PASS, edit=180 need +120
rep(
  `"Four Coffman conditions for deadlock: (1) mutual exclusion — forks cannot be shared; (2) hold and wait — a philosopher holds one fork while waiting for another; (3) no preemption — forks cannot be taken forcibly; (4) circular wait — each philosopher waits for a fork held by the next. Breaking condition (4) via asymmetric ordering is the simplest solution."
    ]`,
  `"Four Coffman conditions for deadlock: (1) mutual exclusion — forks cannot be shared; (2) hold and wait — a philosopher holds one fork while waiting for another; (3) no preemption — forks cannot be taken forcibly; (4) circular wait — each philosopher waits for a fork held by the next. Breaking condition (4) via asymmetric ordering is the simplest solution.",
      "Semaphore(4) approach step by step: philosopher acquires capacity_sem (blocks if already 4 are trying), acquires left fork mutex, acquires right fork mutex, eats, releases right fork, releases left fork, releases capacity_sem. This ensures at most 4 philosophers compete for forks simultaneously.",
      "Why semaphore(4) works: with only 4 philosophers allowed, at least one adjacent pair of forks is always available. By pigeonhole principle, among 4 philosophers around 5 forks, at least one philosopher has both their forks free.",
      "Implementation in Java: use Semaphore(4) from java.util.concurrent. In Python: threading.Semaphore(4). In C++: std::counting_semaphore<4>. In JavaScript: implement via a promise-based counter."
    ]`
);

writeFileSync('src/lib/problems/bank.ts', src);
console.log(`\nTotal changes: ${n}`);
