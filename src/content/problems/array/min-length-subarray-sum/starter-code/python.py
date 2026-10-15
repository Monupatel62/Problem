class Solution:
    def minLengthSubarraySum(self, nums, target):
        left = total = 0
        best = 10**18
        for right, value in enumerate(nums):
            total += value
            while total >= target:
                best = min(best, right - left + 1)
                total -= nums[left]
                left += 1
        return 0 if best == 10**18 else best
