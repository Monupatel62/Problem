class Solution:
    def findPivotIndexSimple(self, nums):
        total = sum(nums)
        left = 0
        for i, value in enumerate(nums):
            if left == total - left - value:
                return i
            left += value
        return -1
