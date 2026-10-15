class Solution:
    def subarraySumEqualsTarget(self, nums, target):
        counts = {0: 1}
        prefix = answer = 0
        for value in nums:
            prefix += value
            answer += counts.get(prefix - target, 0)
            counts[prefix] = counts.get(prefix, 0) + 1
        return answer
