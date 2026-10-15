class Solution {
public:
    vector<int> replaceWithGreatestRight(vector<int>& nums) {
        vector<int> ans(nums.size(), -1);
        int best = -1;
        for (int i = (int)nums.size() - 1; i >= 0; i--) { ans[i] = best; best = max(best, nums[i]); }
        return ans;
    }
};
