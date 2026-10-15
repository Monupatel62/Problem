class Solution {
public:
    vector<vector<int>> fourSum(vector<int>& nums, int target) {
        sort(nums.begin(),nums.end());
        vector<vector<int>> res;
        int n=nums.size();
        for(int i=0;i<n-3;i++){
            if(i>0&&nums[i]==nums[i-1])continue;
            for(int j=i+1;j<n-2;j++){
                if(j>i+1&&nums[j]==nums[j-1])continue;
                int l=j+1,r=n-1;
                while(l<r){
                    long long s=(long long)nums[i]+nums[j]+nums[l]+nums[r];
                    if(s==target){res.push_back({nums[i],nums[j],nums[l],nums[r]});while(l<r&&nums[l]==nums[l+1])l++;while(l<r&&nums[r]==nums[r-1])r--;l++;r--;}
                    else if(s<target)l++;else r--;
                }
            }
        }
        return res;
    }
};
