class Solution:
    def maxSumWindow(self, nums, k):
        current = sum(nums[:k])
        best = current
        for i in range(k, len(nums)):
            current += nums[i] - nums[i - k]
            best = max(best, current)
        return best
