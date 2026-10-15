class Solution:
    def isSoftPalindrome(self, s):
        cleaned = s.lower().replace(' ', '')
        return cleaned == cleaned[::-1]
