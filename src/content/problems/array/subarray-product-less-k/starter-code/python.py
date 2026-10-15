class Solution:
    def numSubarrayProductLessThanK(self, nums, k):
        if k <= 1: return 0
        product, count, left = 1, 0, 0
        for right, val in enumerate(nums):
            product *= val
            while product >= k:
                product //= nums[left]
                left += 1
            count += right - left + 1
        return count
