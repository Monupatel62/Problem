class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> seen;
        int left = 0;
        int best = 0;
        for (int right = 0; right < s.size(); right++) {
            char ch = s[right];
            if (seen.count(ch) && seen[ch] >= left) left = seen[ch] + 1;
            seen[ch] = right;
            best = max(best, right - left + 1);
        }
        return best;
    }
};
