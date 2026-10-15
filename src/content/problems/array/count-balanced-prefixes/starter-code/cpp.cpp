class Solution {
public:
    int countBalancedPrefixes(vector<int>& nums) {
        int sum = 0, count = 0;
        for (int value : nums) { sum += value; if (sum == 0) count++; }
        return count;
    }
};
