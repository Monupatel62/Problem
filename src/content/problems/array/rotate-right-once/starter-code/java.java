class Solution {
    public int[] rotateRightOnce(int[] nums) {
        if (nums.length <= 1) return nums;
        int[] ans = new int[nums.length];
        ans[0] = nums[nums.length - 1];
        for (int i = 0; i < nums.length - 1; i++) ans[i + 1] = nums[i];
        return ans;
    }
}
