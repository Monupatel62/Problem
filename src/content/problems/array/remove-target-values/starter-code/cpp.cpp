class Solution {
public:
    vector<int> removeTargetValues(vector<int>& nums, int target) {
        vector<int> ans;
        for (int value : nums) if (value != target) ans.push_back(value);
        return ans;
    }
};
