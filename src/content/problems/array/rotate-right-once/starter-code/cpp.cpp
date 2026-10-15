class Solution {
public:
    vector<int> rotateRightOnce(vector<int>& nums) {
        if (nums.size() <= 1) return nums;
        vector<int> ans{nums.back()};
        for (int i = 0; i + 1 < (int)nums.size(); i++) ans.push_back(nums[i]);
        return ans;
    }
};
