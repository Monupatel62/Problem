class Solution:
    def majorityElement(self, nums):
        candidate, count = nums[0], 1
        for n in nums[1:]:
            if count == 0:
                candidate, count = n, 1
            elif n == candidate:
                count += 1
            else:
                count -= 1
        return candidate
