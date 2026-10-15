class Solution:
    def sumPositiveValues(self, nums):
        return sum(value for value in nums if value > 0)
