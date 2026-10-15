class Solution {
    public int missingZeroToN(int[] nums) {
        int n = nums.length;
        int expected = n * (n + 1) / 2;
        int actual = 0;
        for (int value : nums) actual += value;
        return expected - actual;
    }
}
