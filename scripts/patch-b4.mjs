import { createPatcher } from './patcher-core.mjs';
const { patch, save } = createPatcher('src/lib/problems/bank.ts');

patch("is-power-of-two-simple", {
  judgeReady: true,
  constraints: ["1 <= n <= 10^9", "Return true if n is a power of two (n = 2^k for some non-negative integer k), false otherwise.", "n is always a positive integer — no need to handle zero or negatives."],
  examples: [
    { input: "n = 1", output: "true", explanation: "1 = 2^0." },
    { input: "n = 6", output: "false", explanation: "6 is not a power of 2." }
  ],
  description: "Given a positive integer `n`, return `true` if it is a power of two, and `false` otherwise. A power of two is any integer of the form 2^k where k is a non-negative integer: 1, 2, 4, 8, 16, 32, ...\n\nFor example, `n = 16` is a power of 2 (2^4), but `n = 6` is not.\n\nThe most elegant solution uses the bit manipulation trick `n & (n - 1) == 0`. Every power of two has exactly one bit set in its binary representation: 1 is 0001, 2 is 0010, 4 is 0100, 8 is 1000. For any power of two `p`, `p - 1` has all bits set below the single bit of `p`. Therefore `p & (p-1)` clears that single bit, producing 0. For any non-power-of-two, at least two bits are set, and `n & (n-1)` removes only the lowest set bit, leaving a non-zero result.\n\nAn alternative checks iteratively: while `n > 1`, if `n % 2 != 0` return false, otherwise `n = n // 2`. If the loop ends with `n == 1`, return true. This is O(log n) time.\n\nA third approach uses logarithms: `math.log2(n)` should be an integer. Due to floating-point imprecision, compare `2 ** round(math.log2(n)) == n` rather than checking if the log is exactly an integer.\n\nEdge cases: n = 1 is 2^0, return true; n = 2 is the smallest power of two greater than 1; any odd number greater than 1 is not a power of two.",
  hints: [
    "Bit trick: n is a power of two if and only if n > 0 and (n & (n-1)) == 0. Powers of two have exactly one bit set; n-1 has all bits below that set, so their AND is 0.",
    "Iterative: while n > 1 and n % 2 == 0: n //= 2. Return n == 1 after the loop.",
    "n = 1 (which is 2^0) must return true. The bit trick handles this correctly: 1 & 0 = 0."
  ],
  sampleCases: [{ input: [1], expected: true }, { input: [6], expected: false }],
  hiddenCases: [
    { input: [2], expected: true },
    { input: [16], expected: true },
    { input: [3], expected: false },
    { input: [1024], expected: true }
  ],
  editorial: [
    "Bit trick: return n > 0 and (n & (n-1)) == 0. Powers of two have exactly one bit set. n-1 has all bits below that set to 1. ANDing them clears the single set bit to 0. Any non-power has two or more bits set, so ANDing with n-1 only clears the lowest, leaving non-zero.",
    "Why n > 0 guard: n=0 would pass (n-1 = -1 in two's complement, but 0 & (-1) = 0). Since the problem guarantees n >= 1, this guard is defensive but good practice.",
    "Iterative approach: while n > 1: if n % 2 != 0: return false; n //= 2. Return True. Divides by 2 repeatedly. If n reaches 1, it was a power. If any odd intermediate value is found, it was not. O(log n) time.",
    "Logarithm approach: import math; return math.log2(n).is_integer(). Caution: floating-point precision can cause errors for large values. Safer: round the log and check 2**k == n.",
    "Binary representation insight: powers of two in binary are 1, 10, 100, 1000, ... exactly one 1-bit. Non-powers have at least two 1-bits. The popcount (number of set bits) equals 1 for all powers of two.",
    "Edge case n=1: 1 is 2^0. Binary: 0001. 1-1=0, 1&0=0. Return true. Correct.",
    "Edge case n=2: 2 is 2^1. Binary: 0010. 2-1=1=0001. 2&1=0. Return true.",
    "Relation to other problems: this bit trick (n & n-1) also appears in 'count set bits' (Brian Kernighan's algorithm removes one set bit per step) and 'find if power of four' (power of 4 must be power of 2 with the set bit at an even position)."
  ]
});

patch("gcd-of-two", {
  judgeReady: true,
  constraints: ["1 <= a, b <= 10^9", "Return the greatest common divisor of a and b.", "GCD is the largest integer that divides both a and b without remainder."],
  examples: [
    { input: "a = 48, b = 18", output: "6", explanation: "Divisors of 48: 1,2,3,4,6,8,12,16,24,48. Divisors of 18: 1,2,3,6,9,18. Greatest common: 6." },
    { input: "a = 7, b = 5", output: "1", explanation: "7 and 5 are coprime. Their only common divisor is 1." }
  ],
  description: "Given two positive integers `a` and `b`, return their **greatest common divisor (GCD)** — the largest integer that divides both `a` and `b` without leaving a remainder.\n\nFor example, GCD(48, 18) = 6 because 6 divides both 48 (48/6=8) and 18 (18/6=3), and no larger number divides both.\n\nThe standard algorithm is the **Euclidean algorithm**: repeatedly replace the larger number with the remainder of dividing the larger by the smaller. When one number becomes 0, the other is the GCD. In code: while `b != 0`: `a, b = b, a % b`. Return `a`.\n\nFor example, GCD(48, 18): 48 % 18 = 12, so (18, 12). 18 % 12 = 6, so (12, 6). 12 % 6 = 0, so (6, 0). Return 6.\n\nThe Euclidean algorithm runs in O(log(min(a,b))) time. This is because each step reduces the larger number by at least half in two iterations, so the number of steps is logarithmic.\n\nIn Python 3.5+: `math.gcd(a, b)` is the standard library function. In most interview settings, implementing the Euclidean algorithm from scratch is expected.\n\nApplications: GCD is used in fraction simplification (reduce a/b by dividing both by GCD), LCM computation (LCM(a,b) = a*b / GCD(a,b)), modular arithmetic, and cryptography (RSA key generation relies on finding coprime numbers).\n\nEdge cases: GCD(n, 0) = n by convention (any number divides 0); GCD(a, a) = a; coprime numbers have GCD = 1.",
  hints: [
    "Euclidean algorithm: while b != 0: a, b = b, a % b. Return a. The key insight: GCD(a, b) = GCD(b, a % b).",
    "In Python: import math; return math.gcd(a, b). For interviews, implement it from scratch to show understanding.",
    "LCM relationship: LCM(a, b) = a * b // gcd(a, b). Use integer division to avoid overflow."
  ],
  sampleCases: [{ input: [48, 18], expected: 6 }, { input: [7, 5], expected: 1 }],
  hiddenCases: [
    { input: [1, 1], expected: 1 },
    { input: [100, 25], expected: 25 },
    { input: [13, 17], expected: 1 },
    { input: [1000000000, 500000000], expected: 500000000 }
  ],
  editorial: [
    "Euclidean algorithm: while b != 0: a, b = b, a % b. Return a. At each step, GCD(a, b) = GCD(b, a % b). The algorithm terminates because a % b < b, so b strictly decreases.",
    "Why GCD(a,b) = GCD(b, a%b): any divisor of both a and b also divides a % b (since a = q*b + (a%b), so a%b = a - q*b is a linear combination of a and b). Conversely, any divisor of both b and a%b also divides a = q*b + (a%b). The set of common divisors is identical.",
    "Time complexity: O(log(min(a,b))). After two steps, a reduces by at least half. Proof: if b <= a/2, then a%b < b <= a/2. If b > a/2, then a%b = a-b < a/2. Either way, a is halved in at most 2 steps.",
    "Iterative vs recursive: both are correct. Iterative is preferred in production to avoid stack overflow for very large inputs, though the depth is at most O(log(min(a,b))) so recursion is safe in practice.",
    "Edge case GCD(n, n) = n: first iteration a,b = n, 0. Return n. Correct.",
    "Edge case GCD(1, n) = 1: any number modulo 1 is 0. After one step: a,b = n, 0. Return n... wait — GCD(1, n): a=1, b=n. But usually we pass them in any order since GCD is symmetric. If a=1: a % b if a < b would give a. The algorithm handles both orderings.",
    "LCM application: LCM(a,b) = a*b / GCD(a,b). For large a,b compute a // GCD(a,b) * b to avoid intermediate overflow."
  ]
});

patch("nearest-even", {
  judgeReady: true,
  constraints: ["n is any integer (positive, negative, or zero).", "Return the nearest even integer to n.", "If n is already even, return n.", "If n is odd, return either n-1 or n+1 — whichever is even (both are equidistant, choose consistently)."],
  examples: [
    { input: "n = 3", output: "2 or 4", explanation: "3 is odd. The nearest even numbers are 2 (3-1) and 4 (3+1). Both are distance 1." },
    { input: "n = 7", output: "6 or 8", explanation: "7 is odd. Return 6 or 8." }
  ],
  description: "Given an integer `n`, return the **nearest even integer** to `n`. If `n` is already even, return `n`. If `n` is odd, both `n - 1` and `n + 1` are even and equidistant; return either one consistently (most implementations return `n - 1`, rounding down).\n\nFor example, `n = 3` is odd. The nearest even numbers are 2 (distance 1) and 4 (distance 1). Returning `n - 1 = 2` is the conventional floor-rounding choice.\n\nThe bit manipulation approach: `n & ~1` clears the lowest bit, rounding down to the nearest even. For any even n, `n & ~1 = n` (no change). For any odd n, `n & ~1 = n - 1` (clears the set bit 0).\n\nThe arithmetic approach: `n - (n % 2)` subtracts the remainder when divided by 2. For even n, `n % 2 = 0` so result is n. For odd n, `n % 2 = 1` so result is n - 1.\n\nIn Python, `round(n / 2) * 2` also works by rounding to the nearest even half, but the modulo and bit approaches are cleaner.\n\nFor negative odd numbers: -3 % 2 in Python is 1 (Python always returns non-negative remainder), so -3 - 1 = -4, which is even. For -3 in arithmetic: nearest evens are -4 and -2, returning -4 (rounding toward negative infinity). Some implementations may choose -2 instead — clarify the rounding direction with the interviewer.\n\nEdge cases: n = 0 is already even, return 0; very large or very small odd integers work the same way.",
  hints: [
    "Arithmetic: return n - (n % 2). This subtracts 0 for even n and 1 for odd n, rounding down to the nearest even.",
    "Bit manipulation: return n & ~1 (also written n & -2). Clears the lowest bit, which is equivalent to rounding down to the nearest even number.",
    "For negative odd numbers, check what n % 2 returns in your language — Python guarantees non-negative remainder, while C++ and Java may return negative remainder for negative operands."
  ],
  sampleCases: [{ input: [3], expected: 2 }, { input: [7], expected: 6 }],
  hiddenCases: [
    { input: [4], expected: 4 },
    { input: [0], expected: 0 },
    { input: [-3], expected: -4 },
    { input: [1000000001], expected: 1000000000 }
  ],
  editorial: [
    "Arithmetic approach: return n - (n % 2). For even n: n % 2 = 0, result = n. For odd n: n % 2 = 1, result = n - 1 (next smaller even). O(1) time, O(1) space.",
    "Bit manipulation approach: return n & ~1 (or n & -2 in two's complement). ~1 = ...11111110 in binary — all bits set except bit 0. ANDing with n clears bit 0, which is 1 only for odd numbers. Result is always even.",
    "Why n & ~1 equals n & -2: in two's complement, -2 is represented as ...11111110, which is identical to ~1. Both clear only the lowest bit.",
    "Rounding direction: both approaches round toward negative infinity (floor even). For positive odd n, this gives n-1. For negative odd n (like -3), this gives n-1 = -4, not -2. This is consistent with floor division semantics.",
    "round(n/2)*2 alternative: rounds to nearest integer then doubles. For n=3: round(1.5)=2, 2*2=4. This rounds up. For n=7: round(3.5)=4, 4*2=8. Rounds to higher even. Different from the floor approach.",
    "Edge case n=0: 0 is even. 0 % 2 = 0, return 0. 0 & ~1 = 0. Both correct.",
    "Application: nearest-even rounding (banker's rounding) is used in IEEE 754 floating-point arithmetic to reduce systematic bias when rounding half values. This integer variant is simpler but illustrates the same concept."
  ]
});

patch("matrix-diagonal-sum", {
  judgeReady: true,
  constraints: ["1 <= n <= 100 where n = mat.length", "mat is a square n×n matrix.", "mat[i][j] is an integer.", "Return the sum of all elements on the two main diagonals.", "If n is odd, the center element (at index n//2, n//2) lies on both diagonals — count it only once."],
  examples: [
    { input: "mat = [[1,2,3],[4,5,6],[7,8,9]]", output: "25", explanation: "Primary diagonal: 1+5+9=15. Secondary diagonal: 3+5+7=15. Center 5 counted once. Total = 25." },
    { input: "mat = [[1,1],[1,1]]", output: "4", explanation: "Primary: 1+1=2. Secondary: 1+1=2. No overlap (even n). Total = 4." }
  ],
  description: "Given an `n × n` square matrix `mat`, return the **sum of all elements on the two main diagonals**. The primary diagonal runs from top-left to bottom-right: elements `mat[i][i]` for `i` from 0 to n-1. The secondary diagonal runs from top-right to bottom-left: elements `mat[i][n-1-i]` for `i` from 0 to n-1.\n\nFor a 3×3 matrix `[[1,2,3],[4,5,6],[7,8,9]]`: primary diagonal is 1, 5, 9 (sum = 15); secondary diagonal is 3, 5, 7 (sum = 15). However, element 5 at position `[1][1]` lies on both diagonals. It must be counted only once, so the answer is 25, not 30.\n\nThe center element at `[n//2][n//2]` lies on both diagonals when `n` is odd. Subtract it once to correct the double-counting.\n\nThe solution iterates over row indices 0 to n-1, accumulating `mat[i][i]` and `mat[i][n-1-i]` at each step. If `n` is odd, subtract `mat[n//2][n//2]` once at the end. This is O(n) time and O(1) space.\n\nAlternatively, loop once: add both diagonal elements per row and check for overlap in a single pass.\n\nEdge cases: 1×1 matrix — the single element is on both diagonals (both share `[0][0]`), return that element once; 2×2 matrix — no overlap since `i` and `n-1-i` are different for all rows; large matrices with `n > 1` and odd `n` always have exactly one center overlap.",
  hints: [
    "Primary diagonal: mat[i][i] for i in range(n). Secondary diagonal: mat[i][n-1-i] for i in range(n). Sum both, then subtract mat[n//2][n//2] if n is odd (center counted twice).",
    "One-pass: for each i, add mat[i][i] + mat[i][n-1-i]. If i == n-1-i (center row of odd matrix), only add once — or subtract the duplicate after the loop.",
    "n is odd iff n % 2 == 1. In that case the center element is mat[n//2][n//2]. It appears as mat[i][i] when i = n//2 and as mat[i][n-1-i] when i = n//2 as well, so it is added twice."
  ],
  sampleCases: [
    { input: [[[1,2,3],[4,5,6],[7,8,9]]], expected: 25 },
    { input: [[[1,1],[1,1]]], expected: 4 }
  ],
  hiddenCases: [
    { input: [[[5]]], expected: 5 },
    { input: [[[1,2],[3,4]]], expected: 10 },
    { input: [[[1,0,0],[0,5,0],[0,0,1]]], expected: 7 },
    { input: [[[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]]], expected: 68 }
  ],
  editorial: [
    "Algorithm: n = len(mat). total = 0. For i from 0 to n-1: total += mat[i][i] + mat[i][n-1-i]. If n is odd: total -= mat[n//2][n//2]. Return total. O(n) time, O(1) space.",
    "Why subtract center: when n is odd, the center element at [n//2][n//2] satisfies both i == n//2 (primary) and n-1-i == n//2 (secondary), so it gets added twice in the loop. Subtracting once corrects the double-count.",
    "Even n has no overlap: when n is even, the primary and secondary diagonals never share a cell. For any row i, n-1-i != i because n-1 is odd, so i and n-1-i have different parities.",
    "One-pass with explicit check: for i in range(n): if i == n-1-i: total += mat[i][i] (center, add once); else: total += mat[i][i] + mat[i][n-1-i]. Avoids post-loop correction.",
    "1x1 matrix: n=1. Loop adds mat[0][0] + mat[0][0] (same element twice). n is odd, so subtract mat[0][0] once. Result: mat[0][0]. Correct.",
    "4x4 example: primary 1+6+11+16=34, secondary 4+7+10+13=34. No overlap (n even). Total = 68.",
    "Connection to trace: the primary diagonal sum is the matrix trace, a fundamental concept in linear algebra equal to the sum of eigenvalues. This problem extends the trace by also including the anti-diagonal."
  ]
});

patch("count-island-cells", {
  judgeReady: true,
  constraints: ["1 <= rows, cols <= 300", "grid[i][j] is 0 (water) or 1 (land).", "Return the total number of cells that are part of any island.", "An island is a group of 1s connected 4-directionally (up, down, left, right).", "This problem counts total land cells, not the number of islands."],
  examples: [
    { input: "grid = [[1,1,0],[1,0,0],[0,0,1]]", output: "4", explanation: "Three 1s form one island (top-left), one 1 forms a separate island (bottom-right). Total land cells = 4." },
    { input: "grid = [[0,0],[0,0]]", output: "0", explanation: "No land cells." }
  ],
  description: "Given a 2D binary grid where `1` represents land and `0` represents water, return the **total number of land cells** across all islands. An island is a group of 1s connected horizontally or vertically (4-directional connectivity). This problem simply counts all `1` cells in the grid, which equals the total island area.\n\nFor example, `[[1,1,0],[1,0,0],[0,0,1]]` has four `1` cells: three forming one island in the top-left and one isolated cell at bottom-right. The answer is 4.\n\nThe simplest correct solution: iterate over every cell with a nested loop. Sum up all cells equal to 1. Return the sum. Time O(m×n), space O(1).\n\nAlternatively, `sum(sum(row) for row in grid)` in Python works because 1 and 0 are integers.\n\nNote: this problem asks for the count of land cells, NOT the number of islands and NOT the area of the largest island. Those are different problems requiring BFS or DFS. This problem only needs counting.\n\nEdge cases: all-zero grid returns 0; all-one grid returns m×n; single-cell grid returns the value of that cell (0 or 1).",
  hints: [
    "Simple count: iterate all cells, return sum of all values equal to 1. This is O(m*n) time and O(1) space.",
    "In Python: return sum(sum(row) for row in grid) or sum(cell for row in grid for cell in row if cell == 1).",
    "This is simpler than number-of-islands. No BFS or DFS needed — just count all 1s."
  ],
  sampleCases: [
    { input: [[[1,1,0],[1,0,0],[0,0,1]]], expected: 4 },
    { input: [[[0,0],[0,0]]], expected: 0 }
  ],
  hiddenCases: [
    { input: [[[1]]], expected: 1 },
    { input: [[[1,1],[1,1]]], expected: 4 },
    { input: [[[0,1,0],[1,0,1],[0,1,0]]], expected: 4 },
    { input: [[[0,0,0],[0,0,0]]], expected: 0 }
  ],
  editorial: [
    "Simple nested loop: total = 0. For each row i from 0 to rows-1: for each col j from 0 to cols-1: if grid[i][j] == 1: total++. Return total. O(m*n) time, O(1) space.",
    "Python sum shorthand: return sum(cell for row in grid for cell in row). Since cells are 0 or 1, summing all cells gives the count of 1s directly. Equivalent to counting truthy values.",
    "Why no BFS/DFS: this problem asks for the total count of land cells, not properties of individual islands. BFS/DFS would be needed for 'number of islands', 'largest island area', or 'perimeter of islands'.",
    "Edge case all zeros: loop runs but never increments total. Return 0. Correct.",
    "Edge case all ones: every cell increments total. Return m*n. Correct.",
    "Relation to number-of-islands (LeetCode 200): that problem counts connected components. This problem counts total land cells. The former requires DFS/BFS, the latter only requires counting.",
    "Extension to 8-directional connectivity: does not change this problem since we are just counting individual cells, not groupings. It would matter for number-of-islands or island perimeter."
  ]
});

patch("transpose-square", {
  judgeReady: true,
  constraints: ["1 <= n <= 100 where n = mat.length", "mat is a square n×n matrix.", "mat[i][j] is an integer.", "Transpose in-place: swap mat[i][j] and mat[j][i] for all i < j.", "Return the transposed matrix."],
  examples: [
    { input: "mat = [[1,2,3],[4,5,6],[7,8,9]]", output: "[[1,4,7],[2,5,8],[3,6,9]]", explanation: "Row 0 becomes column 0, row 1 becomes column 1, row 2 becomes column 2." },
    { input: "mat = [[1,2],[3,4]]", output: "[[1,3],[2,4]]", explanation: "Elements above the diagonal swap with elements below." }
  ],
  description: "Given an `n × n` square matrix `mat`, return its **transpose**. The transpose of a matrix is obtained by reflecting it over the main diagonal: element `mat[i][j]` goes to position `[j][i]`. In other words, rows become columns and columns become rows.\n\nFor example, transposing `[[1,2,3],[4,5,6],[7,8,9]]` gives `[[1,4,7],[2,5,8],[3,6,9]]`. Row 0 `(1,2,3)` becomes column 0, row 1 `(4,5,6)` becomes column 1, and so on.\n\nFor a square matrix, the transpose can be computed **in-place** by swapping elements across the main diagonal. Iterate over all `(i, j)` pairs where `i < j` (the upper triangle) and swap `mat[i][j]` with `mat[j][i]`. Elements on the diagonal `(i == j)` do not change.\n\nThis is O(n^2) time and O(1) extra space — only a temporary variable for the swap.\n\nFor a non-square matrix (m × n), the transpose produces an n × m matrix and cannot be done purely in-place with the same dimensions. This problem specifies a square matrix to enable the in-place swap approach.\n\nEdge cases: 1×1 matrix — no swaps needed, return as-is; 2×2 matrix — one swap of the two off-diagonal elements; diagonal matrix — all off-diagonal elements are 0, swapping 0s is a no-op.",
  hints: [
    "In-place for square matrix: for i from 0 to n-1: for j from i+1 to n-1: swap mat[i][j] and mat[j][i]. Iterate upper triangle only (j starts at i+1).",
    "The swap formula: temp = mat[i][j]; mat[i][j] = mat[j][i]; mat[j][i] = temp. In Python: mat[i][j], mat[j][i] = mat[j][i], mat[i][j].",
    "Why j starts at i+1 (not 0): starting at j=0 would swap each pair twice (once when processing [i][j] and again when processing [j][i]), returning to the original matrix."
  ],
  sampleCases: [
    { input: [[[1,2,3],[4,5,6],[7,8,9]]], expected: [[1,4,7],[2,5,8],[3,6,9]] },
    { input: [[[1,2],[3,4]]], expected: [[1,3],[2,4]] }
  ],
  hiddenCases: [
    { input: [[[5]]], expected: [[5]] },
    { input: [[[1,0],[0,1]]], expected: [[1,0],[0,1]] },
    { input: [[[1,2,3],[0,4,5],[0,0,6]]], expected: [[1,0,0],[2,4,0],[3,5,6]] },
    { input: [[[1,0,0,0],[2,1,0,0],[3,2,1,0],[4,3,2,1]]], expected: [[1,2,3,4],[0,1,2,3],[0,0,1,2],[0,0,0,1]] }
  ],
  editorial: [
    "In-place transpose for square matrix: for i in range(n): for j in range(i+1, n): mat[i][j], mat[j][i] = mat[j][i], mat[i][j]. O(n^2) time, O(1) space. Iterates upper triangle only.",
    "Why upper triangle only (j starts at i+1): if j ranged from 0 to n-1, each pair (i,j) and (j,i) would be swapped twice, undoing the first swap. Starting j at i+1 ensures each off-diagonal pair is swapped exactly once.",
    "Diagonal elements are unchanged: when i==j, mat[i][j] == mat[j][i] (same cell). No swap needed. The loop condition j = i+1 automatically skips diagonal elements.",
    "Out-of-place alternative: result = [[mat[j][i] for j in range(n)] for i in range(n)]. Creates a new n×n matrix. O(n^2) time and space. Simpler code but uses extra memory.",
    "Symmetric matrix check: if mat == mat.transposed, the matrix is symmetric. You can verify by checking mat[i][j] == mat[j][i] for all i < j.",
    "1×1 edge case: n=1. Inner loop range(1, 1) is empty. No swaps. Matrix unchanged. Correct.",
    "Connection to linear algebra: the transpose is a fundamental matrix operation. (AB)^T = B^T * A^T, and A is symmetric iff A = A^T. The in-place square transpose is useful in low-level matrix libraries to avoid memory allocation."
  ]
});

save();
