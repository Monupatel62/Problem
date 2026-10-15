class Solution:
    def findDuplicates(self, nums):
        result = []
        for n in nums:
            idx = abs(n) - 1
            if nums[idx] < 0:
                result.append(abs(n))
            else:
                nums[idx] = -nums[idx]
        return result
