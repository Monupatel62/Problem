class Solution {
    public int countStrictlyGreater(int[] nums, int threshold) {
        int count = 0;
        for (int value : nums) if (value > threshold) count++;
        return count;
    }
}
