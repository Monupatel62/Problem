class Solution {
public:
    vector<vector<int>> transposeSquare(vector<vector<int>>& matrix) {
        int n = matrix.size();
        vector<vector<int>> ans(n, vector<int>(n));
        for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) ans[j][i] = matrix[i][j];
        return ans;
    }
};
