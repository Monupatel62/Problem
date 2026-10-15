class Solution {
    public int countLocalPeaks(int[] nums) {
        int count = 0;
        for (int i = 1; i + 1 < nums.length; i++) if (nums[i] > nums[i - 1] && nums[i] > nums[i + 1]) count++;
        return count;
    }
}
