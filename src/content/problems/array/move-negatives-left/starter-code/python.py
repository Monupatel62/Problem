class Solution:
    def moveNegativesLeft(self, nums):
        return [v for v in nums if v < 0] + [v for v in nums if v >= 0]
