class Solution:
    def countVowels(self, s):
        return sum(1 for ch in s.lower() if ch in 'aeiou')
