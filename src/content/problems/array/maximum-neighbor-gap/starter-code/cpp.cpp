class Solution {
public:
    int maximumNeighborGap(vector<int>& nums) {
        int best = 0;
        for (int i = 1; i < (int)nums.size(); i++) best = max(best, abs(nums[i] - nums[i - 1]));
        return best;
    }
};
