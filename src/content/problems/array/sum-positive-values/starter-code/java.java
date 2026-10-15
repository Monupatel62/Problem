class Solution {
    public int sumPositiveValues(int[] nums) {
        int sum = 0;
        for (int value : nums) if (value > 0) sum += value;
        return sum;
    }
}
