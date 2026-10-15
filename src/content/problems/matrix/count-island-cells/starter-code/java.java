class Solution {
    public int countIslandCells(int[][] grid) {
        int count = 0;
        for (int[] row : grid) for (int cell : row) if (cell == 1) count++;
        return count;
    }
}
