class Solution {
public:
    vector<int> runningTotal(vector<int>& nums) {
        vector<int> ans;
        int total = 0;
        for (int value : nums) { total += value; ans.push_back(total); }
        return ans;
    }
};
