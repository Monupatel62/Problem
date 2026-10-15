class Solution {
public:
    int maxSumWindow(vector<int>& nums, int k) {
        int current = 0;
        for (int i = 0; i < k; i++) current += nums[i];
        int best = current;
        for (int i = k; i < (int)nums.size(); i++) { current += nums[i] - nums[i - k]; best = max(best, current); }
        return best;
    }
};
