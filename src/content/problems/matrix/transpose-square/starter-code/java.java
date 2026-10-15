class Solution {
    public int[][] transposeSquare(int[][] matrix) {
        int n = matrix.length;
        int[][] ans = new int[n][n];
        for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) ans[j][i] = matrix[i][j];
        return ans;
    }
}
