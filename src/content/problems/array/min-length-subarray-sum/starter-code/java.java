class Solution {
    public int minLengthSubarraySum(int[] nums, int target) {
        int left = 0, best = Integer.MAX_VALUE;
        long sum = 0;
        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];
            while (sum >= target) { best = Math.min(best, right - left + 1); sum -= nums[left++]; }
        }
        return best == Integer.MAX_VALUE ? 0 : best;
    }
}
