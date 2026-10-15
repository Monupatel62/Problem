class Solution:
    def secondLargestDistinct(self, nums):
        first = second = None
        for value in nums:
            if value == first or value == second:
                continue
            if first is None or value > first:
                second = first
                first = value
            elif second is None or value > second:
                second = value
        return -1 if second is None else second
