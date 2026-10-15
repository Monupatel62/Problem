class Solution:
    def transposeSquare(self, matrix):
        n = len(matrix)
        return [[matrix[i][j] for i in range(n)] for j in range(n)]
