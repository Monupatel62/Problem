class Solution {
public:
    int missingZeroToN(vector<int>& nums) {
        int n = nums.size();
        long long expected = 1LL * n * (n + 1) / 2;
        long long actual = 0;
        for (int value : nums) actual += value;
        return (int)(expected - actual);
    }
};
