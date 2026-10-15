class Solution {
    public int[] moveNegativesLeft(int[] nums) {
        int[] ans = new int[nums.length];
        int index = 0;
        for (int value : nums) if (value < 0) ans[index++] = value;
        for (int value : nums) if (value >= 0) ans[index++] = value;
        return ans;
    }
}
