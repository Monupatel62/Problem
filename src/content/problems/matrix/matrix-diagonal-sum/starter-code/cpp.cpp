class Solution {
public:
    int matrixDiagonalSum(vector<vector<int>>& matrix) {
        int n = matrix.size(), total = 0;
        for (int i = 0; i < n; i++) { total += matrix[i][i]; if (i != n - 1 - i) total += matrix[i][n - 1 - i]; }
        return total;
    }
};
