class Solution {
    public int[][] rotateGrid(int[][] grid, int k) {
        int m = grid.length;
        int n = grid[0].length;
        int[][] ans = new int[m][n];
        for (int row = 0; row < m; row++) ans[row] = grid[row].clone();

        for (int top = 0; top < Math.min(m, n) / 2; top++) {
            int left = top;
            int bottom = m - 1 - top;
            int right = n - 1 - left;
            ArrayList<Integer> values = new ArrayList<>();

            for (int col = left; col <= right; col++) values.add(grid[top][col]);
            for (int row = top + 1; row <= bottom; row++) values.add(grid[row][right]);
            for (int col = right - 1; col >= left; col--) values.add(grid[bottom][col]);
            for (int row = bottom - 1; row > top; row--) values.add(grid[row][left]);

            int shift = k % values.size();
            ArrayList<Integer> rotated = new ArrayList<>();
            for (int i = shift; i < values.size(); i++) rotated.add(values.get(i));
            for (int i = 0; i < shift; i++) rotated.add(values.get(i));
            int index = 0;

            for (int col = left; col <= right; col++) ans[top][col] = rotated.get(index++);
            for (int row = top + 1; row <= bottom; row++) ans[row][right] = rotated.get(index++);
            for (int col = right - 1; col >= left; col--) ans[bottom][col] = rotated.get(index++);
            for (int row = bottom - 1; row > top; row--) ans[row][left] = rotated.get(index++);
        }

        return ans;
    }
}
