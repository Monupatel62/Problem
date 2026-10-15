class Solution {
    public int longestBalancedZeroOne(int[] nums) {
        Map<Integer, Integer> first = new HashMap<>();
        first.put(0, -1);
        int prefix = 0, best = 0;
        for (int i = 0; i < nums.length; i++) {
            prefix += nums[i] == 1 ? 1 : -1;
            if (first.containsKey(prefix)) best = Math.max(best, i - first.get(prefix)); else first.put(prefix, i);
        }
        return best;
    }
}
