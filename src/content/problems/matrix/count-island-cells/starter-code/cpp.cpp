class Solution {
public:
    int countIslandCells(vector<vector<int>>& grid) {
        int count = 0;
        for (auto& row : grid) for (int cell : row) if (cell == 1) count++;
        return count;
    }
};
