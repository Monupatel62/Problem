class Solution:
    def productExceptSelfBasic(self, nums):
        ans = [1] * len(nums)
        prefix = 1
        for i, value in enumerate(nums):
            ans[i] = prefix
            prefix *= value
        suffix = 1
        for i in range(len(nums) - 1, -1, -1):
            ans[i] *= suffix
            suffix *= nums[i]
        return ans
