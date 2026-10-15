class Solution:
    def rotateRightOnce(self, nums):
        if len(nums) <= 1:
            return nums
        return [nums[-1]] + nums[:-1]
