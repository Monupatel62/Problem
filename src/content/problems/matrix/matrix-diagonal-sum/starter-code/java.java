class Solution {
    public int matrixDiagonalSum(int[][] matrix) {
        int n = matrix.length, total = 0;
        for (int i = 0; i < n; i++) { total += matrix[i][i]; if (i != n - 1 - i) total += matrix[i][n - 1 - i]; }
        return total;
    }
}
