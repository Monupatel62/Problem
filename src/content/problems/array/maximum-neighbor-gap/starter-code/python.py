class Solution:
    def maximumNeighborGap(self, nums):
        best = 0
        for i in range(1, len(nums)):
            best = max(best, abs(nums[i] - nums[i - 1]))
        return best
