class Solution:
    def majorityVoteSimple(self, nums):
        candidate = 0
        count = 0
        for value in nums:
            if count == 0:
                candidate = value
            count += 1 if value == candidate else -1
        return candidate
