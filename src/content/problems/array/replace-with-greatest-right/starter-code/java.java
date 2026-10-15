class Solution {
    public int[] replaceWithGreatestRight(int[] nums) {
        int[] ans = new int[nums.length];
        int best = -1;
        for (int i = nums.length - 1; i >= 0; i--) { ans[i] = best; best = Math.max(best, nums[i]); }
        return ans;
    }
}
