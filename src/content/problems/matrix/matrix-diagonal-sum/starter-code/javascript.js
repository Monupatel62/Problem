function matrixDiagonalSum(matrix) {
  const n = matrix.length;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += matrix[i][i];
    if (i !== n - 1 - i) sum += matrix[i][n - 1 - i];
  }
  return sum;
}
