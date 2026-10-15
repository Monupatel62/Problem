class Solution {
    public int threeNumberZero(int[] nums) {
        Arrays.sort(nums);
        int count = 0;
        for (int i = 0; i + 2 < nums.length; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int left = i + 1, right = nums.length - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum == 0) { count++; left++; right--; while (left < right && nums[left] == nums[left - 1]) left++; while (left < right && nums[right] == nums[right + 1]) right--; }
                else if (sum < 0) left++; else right--;
            }
        }
        return count;
    }
}
