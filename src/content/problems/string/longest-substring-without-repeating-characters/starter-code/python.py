class Solution:
    def lengthOfLongestSubstring(self, s):
        left = 0
        best = 0
        seen = {}
        for right, ch in enumerate(s):
            if ch in seen and seen[ch] >= left:
                left = seen[ch] + 1
            seen[ch] = right
            best = max(best, right - left + 1)
        return best
