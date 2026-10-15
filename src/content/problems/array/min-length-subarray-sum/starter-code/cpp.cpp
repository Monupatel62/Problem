class Solution {
public:
    int minLengthSubarraySum(vector<int>& nums, int target) {
        int left = 0, best = INT_MAX;
        long long sum = 0;
        for (int right = 0; right < (int)nums.size(); right++) {
            sum += nums[right];
            while (sum >= target) { best = min(best, right - left + 1); sum -= nums[left++]; }
        }
        return best == INT_MAX ? 0 : best;
    }
};
