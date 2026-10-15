class Solution:
    def replaceWithGreatestRight(self, nums):
        ans = [-1] * len(nums)
        best = -1
        for i in range(len(nums) - 1, -1, -1):
            ans[i] = best
            best = max(best, nums[i])
        return ans
