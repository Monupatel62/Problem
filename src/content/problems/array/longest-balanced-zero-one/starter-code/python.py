class Solution:
    def longestBalancedZeroOne(self, nums):
        first = {0: -1}
        prefix = best = 0
        for i, value in enumerate(nums):
            prefix += 1 if value == 1 else -1
            if prefix in first:
                best = max(best, i - first[prefix])
            else:
                first[prefix] = i
        return best
