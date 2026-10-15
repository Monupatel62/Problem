class Solution:
    def pairTargetIndices(self, nums, target):
        seen = {}
        for i, value in enumerate(nums):
            need = target - value
            if need in seen:
                return [seen[need], i]
            if value not in seen:
                seen[value] = i
        return []
