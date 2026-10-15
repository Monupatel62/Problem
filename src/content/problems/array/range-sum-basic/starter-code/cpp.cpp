class Solution {
public:
    int rangeSumBasic(vector<int>& nums, int left, int right) {
        int sum = 0;
        for (int i = left; i <= right; i++) sum += nums[i];
        return sum;
    }
};
