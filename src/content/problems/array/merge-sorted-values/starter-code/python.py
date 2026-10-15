class Solution:
    def mergeSortedValues(self, a, b):
        ans = []
        i = j = 0
        while i < len(a) or j < len(b):
            if j == len(b) or (i < len(a) and a[i] <= b[j]):
                ans.append(a[i]); i += 1
            else:
                ans.append(b[j]); j += 1
        return ans
