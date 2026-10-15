class Solution:
    def singleNumber(self, nums):
        from functools import reduce
        import operator
        return reduce(operator.xor, nums)
