class Solution {
public:
    vector<vector<int>> rotateGrid(vector<vector<int>>& grid, int k) {
        int m = grid.size();
        int n = grid[0].size();
        vector<vector<int>> ans = grid;

        for (int top = 0; top < min(m, n) / 2; top++) {
            int left = top;
            int bottom = m - 1 - top;
            int right = n - 1 - left;
            vector<int> values;

            for (int col = left; col <= right; col++) values.push_back(grid[top][col]);
            for (int row = top + 1; row <= bottom; row++) values.push_back(grid[row][right]);
            for (int col = right - 1; col >= left; col--) values.push_back(grid[bottom][col]);
            for (int row = bottom - 1; row > top; row--) values.push_back(grid[row][left]);

            int shift = k % values.size();
            rotate(values.begin(), values.begin() + shift, values.end());
            int index = 0;

            for (int col = left; col <= right; col++) ans[top][col] = values[index++];
            for (int row = top + 1; row <= bottom; row++) ans[row][right] = values[index++];
            for (int col = right - 1; col >= left; col--) ans[bottom][col] = values[index++];
            for (int row = bottom - 1; row > top; row--) ans[row][left] = values[index++];
        }

        return ans;
    }
};
