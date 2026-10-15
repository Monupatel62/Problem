class Solution:
    def removeTargetValues(self, nums, target):
        return [value for value in nums if value != target]
