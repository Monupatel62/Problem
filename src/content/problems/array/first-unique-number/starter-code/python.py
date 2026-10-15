class Solution:
    def firstUniqueNumber(self, nums):
        freq = {}
        for value in nums:
            freq[value] = freq.get(value, 0) + 1
        for value in nums:
            if freq[value] == 1:
                return value
        return -1
