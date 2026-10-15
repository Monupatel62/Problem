class Solution {
public:
    vector<int> sortedSquaresValues(vector<int>& nums) {
        vector<int> ans(nums.size());
        int left = 0, right = nums.size() - 1;
        for (int index = nums.size() - 1; index >= 0; index--) {
            if (abs(nums[left]) > abs(nums[right])) { ans[index] = nums[left] * nums[left]; left++; }
            else { ans[index] = nums[right] * nums[right]; right--; }
        }
        return ans;
    }
};
