class Solution {
public:
    int longestBalancedZeroOne(vector<int>& nums) {
        unordered_map<int, int> first;
        first[0] = -1;
        int prefix = 0, best = 0;
        for (int i = 0; i < (int)nums.size(); i++) {
            prefix += nums[i] == 1 ? 1 : -1;
            if (first.count(prefix)) best = max(best, i - first[prefix]); else first[prefix] = i;
        }
        return best;
    }
};
