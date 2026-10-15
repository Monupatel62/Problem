class Solution:
    def longestSameLetterRun(self, s):
        best = current = 0
        prev = None
        for ch in s:
            current = current + 1 if ch == prev else 1
            prev = ch
            best = max(best, current)
        return best
