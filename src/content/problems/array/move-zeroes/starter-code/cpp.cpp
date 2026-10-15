class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        int pos = 0;
        for (int n : nums) if (n != 0) nums[pos++] = n;
        while (pos < (int)nums.size()) nums[pos++] = 0;
    }
};
