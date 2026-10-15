class Solution:
    def rangeSumBasic(self, nums, left, right):
        return sum(nums[left:right + 1])
