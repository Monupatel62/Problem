class Solution:
    def runningTotal(self, nums):
        total = 0
        ans = []
        for value in nums:
            total += value
            ans.append(total)
        return ans
