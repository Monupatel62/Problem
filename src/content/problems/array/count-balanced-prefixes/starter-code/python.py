class Solution:
    def countBalancedPrefixes(self, nums):
        total = count = 0
        for value in nums:
            total += value
            if total == 0:
                count += 1
        return count
