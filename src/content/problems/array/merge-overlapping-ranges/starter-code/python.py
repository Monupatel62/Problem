class Solution:
    def mergeOverlappingRanges(self, intervals):
        intervals = sorted([row[:] for row in intervals])
        ans = []
        for start, end in intervals:
            if not ans or ans[-1][1] < start:
                ans.append([start, end])
            else:
                ans[-1][1] = max(ans[-1][1], end)
        return ans
