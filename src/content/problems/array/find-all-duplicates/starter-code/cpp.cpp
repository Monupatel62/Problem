class Solution {
public:
    vector<int> findDuplicates(vector<int>& nums) {
        vector<int> res;
        for (int n : nums) {
            int idx = abs(n) - 1;
            if (nums[idx] < 0) res.push_back(abs(n));
            else nums[idx] = -nums[idx];
        }
        return res;
    }
};
