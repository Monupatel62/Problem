function transposeSquare(matrix) {
  const n = matrix.length;
  const ans = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) ans[j][i] = matrix[i][j];
  return ans;
}
