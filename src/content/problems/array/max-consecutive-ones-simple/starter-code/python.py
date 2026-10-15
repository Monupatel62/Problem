class Solution:
    def maxConsecutiveOnesSimple(self, nums):
        best = current = 0
        for value in nums:
            current = current + 1 if value == 1 else 0
            best = max(best, current)
        return best
