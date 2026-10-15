class Solution {
public:
    vector<int> rangeSumQuery(vector<int>& nums, vector<vector<int>>& queries) {
        vector<int> prefix(nums.size()+1,0);
        for(int i=0;i<(int)nums.size();i++) prefix[i+1]=prefix[i]+nums[i];
        vector<int> result;
        for(auto& q:queries) result.push_back(prefix[q[1]+1]-prefix[q[0]]);
        return result;
    }
};
