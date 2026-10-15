class Solution {
public:
    int sumPositiveValues(vector<int>& nums) {
        int sum = 0;
        for (int value : nums) if (value > 0) sum += value;
        return sum;
    }
};
