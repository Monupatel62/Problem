// Second expansion pass - add content directly to descriptions and editorials
import { readFileSync, writeFileSync } from 'fs';
let src = readFileSync('src/lib/problems/bank.ts', 'utf8');
let n = 0;

function rep(from, to) {
  if (!src.includes(from)) { console.log('NF:', from.slice(0,60)); return; }
  src = src.replace(from, to); n++;
}

// Add extra paragraphs to descriptions by extending their last sentence
// and add editorial items before closing ]

// sorted-squares-values
rep(
  `contains zero — zero has square 0, which is the smallest possible square value and always ends up at position 0 in the sorted result. The two-pointer approach handles all these cases cleanly in one pass without any special-case branches."`,
  `contains zero — zero has square 0, which is the smallest possible square value and always ends up at position 0 in the sorted result. The two-pointer approach handles all these cases cleanly in one pass without any special-case branches.\n\nUnderstanding why two-pointer beats sorting here: sorting after squaring is O(n log n). The two-pointer approach is O(n) because it exploits the fact that the original array is sorted — negative values form one sorted (by absolute value) decreasing subsequence on the left, and positive values form another sorted increasing subsequence on the right. Two pointers merge these two sorted subsequences from largest to smallest, exactly like the merge step in merge sort. This connection to merge sort is the conceptual key that explains why the approach works and why it is optimal."`
);

rep(
  `contains zero — zero has square 0, which is the smallest possible square value and always ends up at position 0 in the sorted result. The two-pointer approach handles all these cases cleanly in one pass without any special-case branches.",
      "Time and space: O(n) time — each element processed once. O(n) space for the output array (unavoidable since we return a new array)."
    ]`,
  `contains zero — zero has square 0, which is the smallest possible square value and always ends up at position 0 in the sorted result. The two-pointer approach handles all these cases cleanly in one pass without any special-case branches.",
      "Time and space: O(n) time — each element processed once. O(n) space for the output array (unavoidable since we return a new array).",
      "Why two-pointer beats sorting: sorting after squaring is O(n log n) and ignores the sorted input property. The two-pointer approach is O(n) because negative values (by absolute value) and positive values form two sorted subsequences that can be merged linearly, exactly like the merge step in merge sort."
    ]`
);

// max-consecutive-ones-simple
rep(
  `The max-consecutive-ones pattern is fundamental and appears as a sub-step in many harder problems like 'max consecutive ones with one flip' (LeetCode 487)."`,
  `The max-consecutive-ones pattern is fundamental and appears as a sub-step in many harder problems like 'max consecutive ones with one flip' (LeetCode 487) and 'max consecutive ones with k flips' (LeetCode 1004), both solved with a sliding window.\n\nThe O(n) single-pass approach with O(1) space is optimal: you cannot determine the maximum streak without examining every element, so O(n) time is a lower bound. The constant-space O(1) bound holds because only two counters are maintained regardless of the input size."`
);

rep(
  `Complexity: O(n) time, O(1) space. Single scan with no backtracking. The update inside the loop is critical — always update maxLen on every increment, not only on reset."
    ]`,
  `Complexity: O(n) time, O(1) space. Single scan with no backtracking. The update inside the loop is critical — always update maxLen on every increment, not only on reset.",
      "Common follow-up: what if you could flip one 0 to 1? Use a sliding window that allows at most one 0. The window shrinks when it contains more than one 0. This extends the base pattern to a variable-size sliding window."
    ]`
);

// find-pivot-index-simple
rep(
  `For an array of one element, both left and right sums are 0 by definition, making index 0 always valid as a pivot."`,
  `For an array of one element, both left and right sums are 0 by definition, making index 0 always valid as a pivot. This is a special case worth mentioning in interviews to show you have considered boundary conditions.\n\nThe prefix-sum approach runs in O(n) time and O(1) space — superior to the naive O(n^2) approach of computing sums from scratch for each index. The key algebraic insight is that rightSum can be derived from totalSum and leftSum without a separate computation, reducing the problem to a single running variable check."`
);

rep(
  `The condition 2*leftSum + nums[i] == total is derived by substituting rightSum = total - leftSum - nums[i] into leftSum == rightSum. This algebraic simplification avoids a separate right-sum computation."
    ]`,
  `The condition 2*leftSum + nums[i] == total is derived by substituting rightSum = total - leftSum - nums[i] into leftSum == rightSum. This algebraic simplification avoids a separate right-sum computation.",
      "Why O(n) time and O(1) space: one pass to compute total, one pass to find pivot. Each pass is O(n). Only two integer variables (total and leftSum) are maintained — no arrays needed."
    ]`
);

// range-sum-basic
rep(
  `All handled uniformly by the loop or the prefix formula without special casing."`,
  `All handled uniformly by the loop or the prefix formula without special casing.\n\nRange sum queries appear everywhere in computer science: cumulative statistics in analytics, rolling window computations in time-series data, segment coverage problems in geometry, and as a building block in more advanced data structures like Fenwick trees (Binary Indexed Trees) and segment trees. Mastering the O(1) prefix-sum query is a prerequisite for these advanced topics."`
);

rep(
  `Complexity of naive: O(right-left+1) time, O(1) space. Complexity of prefix: O(n) build + O(1) per query. This is a fundamental trade-off between pre-computation and per-query cost."
    ]`,
  `Complexity of naive: O(right-left+1) time, O(1) space. Complexity of prefix: O(n) build + O(1) per query. This is a fundamental trade-off between pre-computation and per-query cost.",
      "Break-even: prefix sum pays off when answering more than O(log n) queries — practically when answering 2 or more queries. For a single query the naive O(n) loop is both simpler and sufficient."
    ]`
);

// unique-intersection-values
rep(
  `All edge cases handled correctly by the set intersection approach without special casing."`,
  `All edge cases handled correctly by the set intersection approach without special casing.\n\nThe hash set approach runs in O(m+n) time: O(m) to build set1, O(n) to iterate nums2 checking membership. Converting to a result set for deduplication is O(k) where k is intersection size. Total O(m+n). This is asymptotically optimal since any correct solution must read all elements of both input arrays."`
);

rep(
  `Interview tip: always clarify whether duplicates in the result are allowed. This problem wants unique values; intersection-two-arrays-II wants multiset intersection (count duplicates)."
    ]`,
  `Interview tip: always clarify whether duplicates in the result are allowed. This problem wants unique values; intersection-two-arrays-II wants multiset intersection (count duplicates).",
      "Space note: the smallest set should be the one checked, not the iterated one. If nums2 is very small, iterating it and checking against set(nums1) uses less memory than building two full sets."
    ]`
);

// max-sum-window
rep(
  `A common mistake is initialising maxSum to 0, which would return 0 instead of the correct (negative) maximum sum for negative-only arrays."`,
  `A common mistake is initialising maxSum to 0, which would return 0 instead of the correct (negative) maximum sum for negative-only arrays. Always initialise maxSum to the first window sum to correctly handle all-negative inputs.\n\nThe fixed-size sliding window is one of the two fundamental window patterns (the other being the variable-size window for min-length-subarray-sum). Recognising which pattern applies — fixed k for maximum/minimum sum, variable for length-constrained conditions — is a core algorithmic skill for array interval problems."`
);

rep(
  `Complexity: O(n) time — n-k+1 windows, each computed in O(1) with sliding. O(1) extra space beyond the output integer."
    ]`,
  `Complexity: O(n) time — n-k+1 windows, each computed in O(1) with sliding. O(1) extra space beyond the output integer.",
      "Initialisation correctness: always initialise maxSum to sum(nums[:k]) (the first window), not to 0 or -infinity. For an all-negative array, 0 would be wrong; -infinity requires a max comparison every step instead of just when the window moves."
    ]`
);

// min-length-subarray-sum
rep(
  `The variable-size sliding window is the canonical O(n) approach for minimum-length subarray problems with positive values."`,
  `The variable-size sliding window is the canonical O(n) approach for minimum-length subarray problems with positive values. It relies on the key property that adding elements increases the sum (positive values only) and removing elements decreases it — this monotonicity makes the two-pointer approach correct. For general (possibly negative) values, this property breaks and more advanced techniques like deque-based monotonic approaches or segment trees would be needed.\n\nThis is LeetCode 209 (Minimum Size Subarray Sum), a classic medium difficulty problem that frequently appears in sliding window interview rounds."`
);

rep(
  `LeetCode 209. The variable-size sliding window for 'minimum window satisfying a sum condition' is a classic pattern distinct from the fixed-size window."
    ]`,
  `LeetCode 209. The variable-size sliding window for 'minimum window satisfying a sum condition' is a classic pattern distinct from the fixed-size window.",
      "Key difference from fixed-size window: fixed-size slides by exactly 1 step per iteration. Variable-size contracts the left until the condition breaks, then expands the right. This gives O(n) total despite the nested while loop."
    ]`
);

// longest-balanced-zero-one
rep(
  `Recognising when to apply this transformation is a key skill for binary array problems.\n\nThis is LeetCode 525.`,
  `Recognising when to apply this transformation is a key skill for binary array problems. Other related problems using the same technique include: 'subarray sum equals zero' (direct prefix sum), 'find the longest subarray with equal number of letters and digits', and 'maximum size subarray sum equals k'.\n\nThis is LeetCode 525.`
);

rep(
  `Related problems: contiguous array (same as this), subarray sum equals zero (remove the transformation), longest subarray with equal a and b in any binary string. All use the same prefix-sum hash map technique."
    ]`,
  `Related problems: contiguous array (same as this), subarray sum equals zero (remove the transformation), longest subarray with equal a and b in any binary string. All use the same prefix-sum hash map technique.",
      "The transformation 0→-1 is a standard trick: it converts a counting constraint (equal zeros and ones) into an arithmetic constraint (sum = 0), enabling the prefix-sum approach. Keep this transformation in your toolkit for binary array problems."
    ]`
);

// next-greater-right
rep(
  `The solution correctly handles single-element and empty arrays."`,
  `The solution correctly handles single-element and empty arrays. The monotonic stack is one of the most powerful techniques for problems involving 'next/previous greater/smaller element' — a family of problems that includes daily-temperature-wait, largest-rectangle-in-histogram, and trapping-rain-water. Mastering the pattern of maintaining a decreasing stack and resolving elements when a larger value arrives unlocks all of these problems."`
);

rep(
  `Complexity: O(n) time and O(n) space. Each temperature is pushed once and popped at most once. Space for stack is O(n) in the worst case (all decreasing temperatures)."
    ]`,
  `Complexity: O(n) time and O(n) space. Each temperature is pushed once and popped at most once. Space for stack is O(n) in the worst case (all decreasing temperatures).",
      "Pattern connection: next-greater-right records the value nums[i] for each resolved index. Daily-temperature-wait records the distance i - popped_index. Both use the same stack mechanics — only the recorded information differs."
    ]`
);

// daily-temperature-wait
rep(
  `The daily-temperature pattern (next warmer day distance) is a slight variation of next-greater-right. Both use a monotonic decreasing stack; this problem records the index difference instead of the value."`,
  `The daily-temperature pattern (next warmer day distance) is a slight variation of next-greater-right. Both use a monotonic decreasing stack; this problem records the index difference instead of the value.\n\nLeetCode 739 is one of the first monotonic stack problems most developers encounter. Solving it cleanly — initialising a result array of zeros, using a stack of indices, and computing distances on pop — is a standard interview expectation for array/stack problems at medium difficulty level."`
);

rep(
  `Complexity: O(n) time and O(n) space. Each element is pushed once and popped at most once. Space for stack is O(n) in the worst case (all decreasing temperatures).",
      "Pattern connection: next-greater-right records the value nums[i] for each resolved index. Daily-temperature-wait records the distance i - popped_index. Both use the same stack mechanics — only the recorded information differs."
    ]`,
  `Complexity: O(n) time and O(n) space. Each element is pushed once and popped at most once. Space for stack is O(n) in the worst case (all decreasing temperatures).",
      "Pattern connection: next-greater-right records the value nums[i] for each resolved index. Daily-temperature-wait records the distance i - popped_index. Both use the same stack mechanics — only the recorded information differs.",
      "Initialisation: result = [0] * n (Python) or new int[n] (Java). Since 0 is the default and means 'no warmer day', remaining stack entries after the loop automatically have the correct answer without explicit cleanup."
    ]`
);

// valid-phone-numbers
rep(
  `Using anchors is essential for exact-format validation in shell scripting."`,
  `Using anchors is essential for exact-format validation in shell scripting. Without ^ and $, the regex becomes a substring search that would match any line containing a valid-format phone number, even if surrounded by other characters. For phone number validation specifically, full-line anchoring ensures only properly formatted standalone phone numbers are accepted.\n\nTwo distinct valid formats exist: the parentheses format uses three-digit area code in parentheses followed by a space and then xxx-xxxx; the hyphenated format uses xxx-xxx-xxxx with three groups of digits separated by hyphens. The regex alternation handles both formats in one grep command without running grep twice."`
);

rep(
  `Performance: grep is implemented in C and uses Boyer-Moore or similar fast string matching. For large files it is significantly faster than awk or Python for pattern matching tasks."
    ]`,
  `Performance: grep is implemented in C and uses Boyer-Moore or similar fast string matching. For large files it is significantly faster than awk or Python for pattern matching tasks.",
      "Extended grep: grep -E uses POSIX Extended Regular Expressions. With -E you must write [0-9]{3} instead of \\d{3}. Both work; -P (Perl) regex is more concise for this problem."
    ]`
);

// transpose-file
rep(
  `single column — each line has one field, so NF=1 throughout. The END block prints one output row with NR values. This correctly transposes a single column into a single row."`,
  `single column — each line has one field, so NF=1 throughout. The END block prints NR values each on their own line (since the output has NR rows of 1 value). This correctly transposes a single column into a single row.\n\nThe awk solution stores the entire file in memory in a 2D array. This is acceptable for typical interview file sizes but would be problematic for gigabyte files. For streaming-compatible solutions, a different approach using cut and paste commands would be more memory-efficient."`
);

rep(
  `Alternative with Python: python3 -c 'import sys; rows=[l.split() for l in sys.stdin]; print(chr(10).join(\" \".join(c) for c in zip(*rows)))' < file.txt — uses zip(*rows) to transpose."
    ]`,
  `Alternative with Python: python3 -c 'import sys; rows=[l.split() for l in sys.stdin]; print(chr(10).join(\" \".join(c) for c in zip(*rows)))' < file.txt — uses zip(*rows) to transpose.",
      "zip(*rows) in Python is the idiomatic transpose: it takes the list of rows and returns an iterator of columns. Each column becomes a tuple of values from each row, which is joined with spaces."
    ]`
);

// tenth-line
rep(
  `The sed -n '10p' and awk 'NR==10' correctly handle this edge case by printing nothing."`,
  `The sed -n '10p' and awk 'NR==10' correctly handle this edge case by printing nothing. For production shell scripts, sed -n '10p' is the preferred one-liner because it is the most concise and standard tool for extracting a specific line number. The awk solution is slightly more verbose but equally correct and is preferred when combining with other awk processing.\n\nAll Unix systems ship with both sed and awk, making both solutions portable across Linux, macOS, and other POSIX-compatible environments without requiring any installation."`
);

rep(
  `Why head+tail can be wrong: head -n 10 | tail -n 1 would print line 9 if the file has exactly 9 lines (the tail sees 9 lines and prints the last). sed -n '10p' and awk 'NR==10' correctly handle this edge case by printing nothing."
    ]`,
  `Why head+tail can be wrong: head -n 10 | tail -n 1 would print line 9 if the file has exactly 9 lines (the tail sees 9 lines and prints the last). sed -n '10p' and awk 'NR==10' correctly handle this edge case by printing nothing.",
      "Portability note: on macOS, sed behaves slightly differently from GNU sed on Linux. The -n '10p' syntax works on both. Test on the target environment if portability matters."
    ]`
);

// count-lines-matching-pattern
rep(
  `The distinction between substring and whole-word matching is important in text processing tasks."`,
  `The distinction between substring and whole-word matching is important in text processing tasks. In software engineering roles, regular expression proficiency is expected for log analysis, data pipeline tasks, and deployment scripts — making shell scripting problems like this one directly relevant to real work.\n\nFor this problem specifically, 'leetcode' is the search term and the file is the input. Understanding that grep -c counts lines (not total occurrences) is crucial: a line with the word 'leetcode' appearing five times is still counted as 1. Use grep -c for line counting; use grep -o | wc -l for occurrence counting."`
);

rep(
  `Edge case empty file: grep -c 'pattern' /dev/null outputs 0. awk with empty input prints 0 (from +0). Both handle empty input correctly."
    ]`,
  `Edge case empty file: grep -c 'pattern' /dev/null outputs 0. awk with empty input prints 0 (from +0). Both handle empty input correctly.",
      "Combining with other shell tools: grep -c can be combined in pipelines. For example, to count matching lines across multiple files: grep -rc 'leetcode' directory/ sums counts from all files recursively."
    ]`
);

// the-dining-philosophers
rep(
  `Understanding this problem deepens intuition for lock ordering in real concurrent systems."`,
  `Understanding this problem deepens intuition for lock ordering in real concurrent systems. In production database systems, the same circular-wait problem occurs when transactions acquire row locks in different orders. Databases solve this using a lock ordering protocol — always acquire locks in increasing order of row ID — which is exactly the asymmetric approach applied to the dining philosophers.\n\nLeetCode 1226 uses callbacks (pickLeftFork, pickRightFork, eat, putLeftFork, putRightFork) that simulate the philosopher's actions. Your synchronisation code must ensure these callbacks execute in the correct order and without deadlock, regardless of thread scheduling."`
);

rep(
  `Starvation vs deadlock: this problem only requires deadlock-freedom. Starvation-freedom (every philosopher eventually eats) is a stronger requirement and may need fairness guarantees in the mutex/semaphore implementation."
    ]`,
  `Starvation vs deadlock: this problem only requires deadlock-freedom. Starvation-freedom (every philosopher eventually eats) is a stronger requirement and may need fairness guarantees in the mutex/semaphore implementation.",
      "Four Coffman conditions for deadlock: (1) mutual exclusion — forks cannot be shared; (2) hold and wait — a philosopher holds one fork while waiting for another; (3) no preemption — forks cannot be taken forcibly; (4) circular wait — each philosopher waits for a fork held by the next. Breaking condition (4) via asymmetric ordering is the simplest solution."
    ]`
);

// solutionApproaches for Shell and Concurrency problems
const addApproaches = (slug, approaches) => {
  const idx = src.indexOf(`"slug": "${slug}"`);
  if (idx < 0) { console.log('slug NF:', slug); return; }
  const funcIdx = src.indexOf('"functionName"', idx);
  if (funcIdx < 0) return;
  const approachJson = JSON.stringify(approaches, null, 2).replace(/\n/g, '\n    ');
  const insertStr = `"solutionApproaches": ${approachJson},\n    `;
  src = src.substring(0, funcIdx) + insertStr + src.substring(funcIdx);
  n++;
  console.log('Added approaches to:', slug);
};

addApproaches("valid-phone-numbers", [
  { title: "grep with regex", complexity: "O(n) time", explanation: "grep -P '^(\\d{3}-\\d{3}-\\d{4}|\\(\\d{3}\\) \\d{3}-\\d{4})$' file.txt. Pattern matches both formats with anchors." }
]);
addApproaches("transpose-file", [
  { title: "awk 2D array", complexity: "O(rows*cols) time and space", explanation: "Store all values in a[i][NR]=$i during reading. Print column-by-column in the END block." }
]);
addApproaches("tenth-line", [
  { title: "sed -n 10p", complexity: "O(n) reads up to line 10", explanation: "sed -n '10p' file.txt. Prints exactly line 10 or nothing if file is shorter." }
]);
addApproaches("count-lines-matching-pattern", [
  { title: "grep -c", complexity: "O(n) file scan", explanation: "grep -c 'leetcode' file.txt. -c flag counts matching lines instead of printing them." }
]);
addApproaches("the-dining-philosophers", [
  { title: "Asymmetric fork ordering", complexity: "O(1) per operation, deadlock-free", explanation: "Philosophers 0-3 pick left-then-right; philosopher 4 picks right-then-left. Breaks circular wait." },
  { title: "Semaphore limiting concurrency", complexity: "O(1) per operation, deadlock-free", explanation: "Semaphore(4) allows at most 4 philosophers to attempt eating simultaneously, guaranteeing at least one can complete." }
]);

writeFileSync('src/lib/problems/bank.ts', src);
console.log(`\nTotal replacements: ${n}`);
