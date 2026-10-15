class Solution {
public:
    int longestEvenStreak(vector<int>& nums) {
        int best = 0, current = 0;
        for (int value : nums) { current = value % 2 == 0 ? current + 1 : 0; best = max(best, current); }
        return best;
    }
};
