class Solution {
    public int maxSumWindow(int[] nums, int k) {
        int current = 0;
        for (int i = 0; i < k; i++) current += nums[i];
        int best = current;
        for (int i = k; i < nums.length; i++) { current += nums[i] - nums[i - k]; best = Math.max(best, current); }
        return best;
    }
}
