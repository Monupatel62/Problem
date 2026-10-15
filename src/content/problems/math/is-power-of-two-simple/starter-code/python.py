class Solution:
    def isPowerOfTwoSimple(self, n):
        return n > 0 and (n & (n - 1)) == 0
