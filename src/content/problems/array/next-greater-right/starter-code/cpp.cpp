class Solution {
public:
    vector<int> nextGreaterRight(vector<int>& nums) {
        vector<int> ans(nums.size(), -1), stack;
        for (int i = nums.size() - 1; i >= 0; i--) { while (!stack.empty() && stack.back() <= nums[i]) stack.pop_back(); if (!stack.empty()) ans[i] = stack.back(); stack.push_back(nums[i]); }
        return ans;
    }
};
