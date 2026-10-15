class Solution {
public:
    vector<int> productExceptSelfBasic(vector<int>& nums) {
        vector<int> ans(nums.size(), 1);
        int prefix = 1;
        for (int i = 0; i < (int)nums.size(); i++) { ans[i] = prefix; prefix *= nums[i]; }
        int suffix = 1;
        for (int i = nums.size() - 1; i >= 0; i--) { ans[i] *= suffix; suffix *= nums[i]; }
        return ans;
    }
};
