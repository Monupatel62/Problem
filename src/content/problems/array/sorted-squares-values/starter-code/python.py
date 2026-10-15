class Solution:
    def sortedSquaresValues(self, nums):
        ans = [0] * len(nums)
        left, right = 0, len(nums) - 1
        for index in range(len(nums) - 1, -1, -1):
            if abs(nums[left]) > abs(nums[right]):
                ans[index] = nums[left] * nums[left]; left += 1
            else:
                ans[index] = nums[right] * nums[right]; right -= 1
        return ans
