class Solution {
    public int maximumNeighborGap(int[] nums) {
        int best = 0;
        for (int i = 1; i < nums.length; i++) best = Math.max(best, Math.abs(nums[i] - nums[i - 1]));
        return best;
    }
}
