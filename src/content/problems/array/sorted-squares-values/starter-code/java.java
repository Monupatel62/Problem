class Solution {
    public int[] sortedSquaresValues(int[] nums) {
        int[] ans = new int[nums.length];
        int left = 0, right = nums.length - 1;
        for (int index = nums.length - 1; index >= 0; index--) {
            if (Math.abs(nums[left]) > Math.abs(nums[right])) { ans[index] = nums[left] * nums[left]; left++; }
            else { ans[index] = nums[right] * nums[right]; right--; }
        }
        return ans;
    }
}
