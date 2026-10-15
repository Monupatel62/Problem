class Solution {
public:
    vector<int> moveNegativesLeft(vector<int>& nums) {
        vector<int> ans;
        for (int value : nums) if (value < 0) ans.push_back(value);
        for (int value : nums) if (value >= 0) ans.push_back(value);
        return ans;
    }
};
