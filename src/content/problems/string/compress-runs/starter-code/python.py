class Solution:
    def compressRuns(self, s):
        if not s:
            return ''
        out = []
        count = 1
        for i in range(1, len(s) + 1):
            if i < len(s) and s[i] == s[i - 1]:
                count += 1
            else:
                out.append(s[i - 1] + str(count))
                count = 1
        return ''.join(out)
