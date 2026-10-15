class Solution:
    def countIslandCells(self, grid):
        return sum(cell == 1 for row in grid for cell in row)
