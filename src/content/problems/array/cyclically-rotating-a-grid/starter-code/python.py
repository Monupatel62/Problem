class Solution:
    def rotateGrid(self, grid, k):
        m, n = len(grid), len(grid[0])
        ans = [row[:] for row in grid]

        for top in range(min(m, n) // 2):
            left = top
            bottom = m - 1 - top
            right = n - 1 - left
            values = []

            for col in range(left, right + 1):
                values.append(grid[top][col])
            for row in range(top + 1, bottom + 1):
                values.append(grid[row][right])
            for col in range(right - 1, left - 1, -1):
                values.append(grid[bottom][col])
            for row in range(bottom - 1, top, -1):
                values.append(grid[row][left])

            shift = k % len(values)
            rotated = values[shift:] + values[:shift]
            index = 0

            for col in range(left, right + 1):
                ans[top][col] = rotated[index]
                index += 1
            for row in range(top + 1, bottom + 1):
                ans[row][right] = rotated[index]
                index += 1
            for col in range(right - 1, left - 1, -1):
                ans[bottom][col] = rotated[index]
                index += 1
            for row in range(bottom - 1, top, -1):
                ans[row][left] = rotated[index]
                index += 1

        return ans
