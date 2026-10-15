class Solution:
    def rangeSumQuery(self, nums, queries):
        prefix = [0]
        for n in nums:
            prefix.append(prefix[-1] + n)
        return [prefix[r+1] - prefix[l] for l, r in queries]
