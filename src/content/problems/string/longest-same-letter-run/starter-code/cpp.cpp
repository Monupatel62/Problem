class Solution {
public:
    int longestSameLetterRun(string s) {
        int best = 0, current = 0;
        char prev = 0;
        for (char ch : s) { current = ch == prev ? current + 1 : 1; prev = ch; best = max(best, current); }
        return best;
    }
};
