class Solution:
    def matrixDiagonalSum(self, matrix):
        n = len(matrix)
        total = 0
        for i in range(n):
            total += matrix[i][i]
            if i != n - 1 - i:
                total += matrix[i][n - 1 - i]
        return total
