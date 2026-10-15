class Solution:
    def nearestEven(self, n):
        return n if n % 2 == 0 else n + 1
